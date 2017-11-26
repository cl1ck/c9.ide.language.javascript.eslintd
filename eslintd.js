/**
 *
 */
define(function(require, exports, module) {
    main.consumes = ["language"];
    main.provides = [];

    function main(options, imports, register) {
        imports.language.registerLanguageHandler("plugins/c9.ide.language.javascript.eslintd/worker/eslintd_worker");

        register(null, {});
    }

    return main;
});
