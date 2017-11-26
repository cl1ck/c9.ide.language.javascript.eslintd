/**
 *
 */
define(function(require, exports, module) {
    main.consumes = ["language", "Plugin"];
    main.provides = ["eslintd"];

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var language = imports.language;
        
        //
        var plugin = new Plugin("eslintd", main.consumes);
        
        plugin.on("load", function () {
            language.unregisterLanguageHandler("plugins/c9.ide.language.javascript.eslint/worker/eslint_worker");
            language.registerLanguageHandler("plugins/c9.ide.language.javascript.eslintd/worker/eslintd_worker");
        });
        plugin.on("unload", function () {
            language.unregisterLanguageHandler("plugins/c9.ide.language.javascript.eslintd/worker/eslintd_worker");
            language.registerLanguageHandler("plugins/c9.ide.language.javascript.eslint/worker/eslint_worker");
        });

        register(null, { eslintd: plugin });
    }

    return main;
});
