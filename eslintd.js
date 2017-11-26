/**
 *
 */
define(function(require, exports, module) {
    main.consumes = ["language"];
    main.provides = [];

    function main(options, imports, register) {
        var language = imports.language;

        language.registerLanguageHandler("plugins/javascript.eslintd/worker/eslintd_worker");

        register(null, {});
    }

    return main;
});
