define(function(require, exports, module) {

//
var baseLanguageHandler = require('plugins/c9.ide.language/base_handler');
var workerUtil = require('plugins/c9.ide.language/worker_util');
var handler = module.exports = Object.create(baseLanguageHandler);
var port, token;
var ready = false;

//
handler.init = function(callback) {
  console.log('[eslintd] init');
  workerUtil.execFile(
    "bash",
    {
        args: ["-c", "~/.c9/node_modules/.bin/eslint_d start"],
        mode: "stdin"
    },
    function(err, stdout, stderr) {
      if (err || stderr) {
        console.error('[eslintd] Unhandled Error', err || stderr);

        return callback(err);
      }

      workerUtil.readFile("~/.eslint_d", "utf-8", function (err, data) {
        if (err || stderr) {
          console.error('[eslintd] Unhandled Error', err);

          return callback(err);
        }

        var parts = data.split(' ');

        //
        port = parts[0];
        token = parts[1];

        //
        ready = true;

        callback();
      });
    }
  );
};

//
handler.getMaxFileSizeSupported = function() {
    return .5 * 10 * 1000 * 80;
};

//
handler.handlesLanguage = function(language) {
    return language === "javascript" || language == "jsx";
};

//
handler.analyze = function(value, ast, options, callback) {
    if (options.minimalAnalysis) return callback();

    handler.analyzer(value, options.path, function(markers) {
      callback(markers);
    });
};

//
handler.analyzer = function(value, path, callback) {
  var markers = [];

  //
  if (!workerUtil.isFeatureEnabled("hints")) {
    return callback(markers);
  }

  //
  if (!ready)  {
    return setTimeout(handler.analyzer.bind(this, value, path, callback), 250);
  }

  //
  var absolutePath = (this.workspaceDir + path).split('/').slice(0, -1).join('/');
  var base64 = window.btoa(token + " " + absolutePath + " -f json --stdin \n" + value);
  var command = "echo \"" + base64 + "\" | base64 -d | nc localhost " + port;

  //
  var startTime = Date.now();

  //
  workerUtil.execAnalysis(
    "bash",
    {
        args: ["-c", command],
        mode: "stdin"
    },
    function(err, stdout, stderr) {
      if (err || stderr) {
        console.error('[eslintd] Unhandled Error. Restarting eslint_d.', err || stderr);
        function noop() {}
        var error = err || stderr;
        if (error.message !== 'ENOENT: No linter installation found') {
          handler.init(noop);
        }
        return callback([{
            pos: {
              sl: 0,
              el: 0,
              sc: 1,
              ec: 1,
            },
            type: "warning",
            level: "warning",
            message: "[eslintd] " + error.message
          }]);
      }

      var response;

      if (typeof stdout === 'string') {
        try {
          response = JSON.parse(stdout.replace(/# exit 1$/m, ''));
        } catch (e) {
          console.error('[eslintd] Parsing Error', stdout);

          return callback(markers);
        }
      } else {
        response = stdout;
      }

      //
      var results = response ? response[0].messages : [];

      results.forEach(function (r) {
        if(!r.message) return;

        var level;

        if (r.severity === 2) {
          level = "error";
        } else if (r.severity === 1) {
          level = "warning";
        } else {
          level = "info";
        }

        markers.push({
          pos: {
            sl: (r.line - 1),
            el: (r.endLine - 1),
            sc: (r.column - 1),
            ec: (r.endColumn - 1),
          },
          type: level,
          level: level !== "info" && level,
          message: r.message + ' at line ' + r.line + ' col ' + r.column + (r.ruleId ? " (" + r.ruleId + ")" : "")
        });
      });

      // console.info('[eslintd] took ' + (Date.now() - startTime) + 'ms and found ' + markers.length + ' messages');

      callback(markers);
    }
  );
};

});
