define(function(require, exports, module) {

module.exports = function(session, options) {
    session.install({
        "name": "eslint_d",
        "description": "Makes eslint the fastest linter on the planet",
        "cwd": "~/.c9",
        "optional": false
    }, {
        "npm": "eslint_d"
    });

    session.start();
};

module.exports.version = 1; 

});