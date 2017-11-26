/**
 *
 */
define(function(require, exports, module) {

//
var lodash = require('plugins/c9.nodeapi/lodash');
var baseLanguageHandler = require('plugins/c9.ide.language/base_handler');
var workerUtil = require('plugins/c9.ide.language/worker_util');
var handler = module.exports = Object.create(baseLanguageHandler);
var port, token;

//
handler.init = function(callback) {
  workerUtil.execFile(
    "bash",
    {
        args: ["-c", "eslint_d start"],
        mode: "stdin"
    },
    function(err, stdout, stderr) {
      workerUtil.readFile("~/.eslint_d", "utf-8", function onResult(err, data) {
        var parts = data.split(' ');

        // netcat
        port = parts[0];
        token = parts[1];

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
  if (!workerUtil.isFeatureEnabled("hints")) {
    return markers;
  }

  //
  var absolutePath = (this.workspaceDir + path).split('/').slice(0, -1).join('/');
  var base64 = window.btoa(token + " " + absolutePath + " -f json --stdin " + value);
  var command = "echo \"" + base64 + "\" | base64 -d | nc localhost " + port;

  //
  workerUtil.execAnalysis(
    "bash",
    {
        args: ["-c", command],
        mode: "stdin"
    },
    function(err, stdout, stderr) {
      var response;

      if (typeof stdout === 'string') {
        try {
          response = JSON.parse(stdout.split('# exit 1')[0]);
        } catch (e) {
          response = [{ messages: [] }];
        }
      } else {
        response = stdout;
      }

      var results = response ? response[0].messages : [];
      var markers = [];

      //
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
            sl: r.line,
            el: r.endLine,
            sc: (r.column - 1),
            ec: (r.endColumn - 1),
          },
          type: level,
          level: level !== "info" && level,
          message: r.message + " (" + r.ruleId + ")"
        });
      });

      callback(markers);
    }
  );
};

});
