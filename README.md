# c9.ide.language.javascript.eslintd

An ESLint plugin for Cloud9 IDE that makes use of [eslint_d](https://github.com/mantoni/eslint_d.js) for lightening fast full featured javascript linting.

The default linter in Cloud9 IDE uses a browser copy of eslint that does not support parsers or plug-ins in the way you might expect and does not work with the likes of the popular [airbnb config](https://github.com/airbnb/javascript). This plug-in uses [eslint_d](https://github.com/mantoni/eslint_d.js) to eliminate the node.js startup time along with the netcat abilities to lint your code in ~100ms on the Cloud9 server using the standard eslint cli for full feature support.

## Installation

Install the plug-in by adding it to your plug-in directory by running the following commands from the IDE terminal.

```sh
$ mkdir -p ~/.c9/plugins
$ cd ~/.c9/plugins
$ git clone https://github.com/michaelmitchell/c9.ide.language.javascript.eslintd.git
```

This plug-in expects [eslint_d](https://github.com/mantoni/eslint_d.js) to be installed in `~/.c9/node_modules`. Run the following commands in the IDE terminal to install it in the right place.

```sh
$ cd ~/.c9
$ npm install eslint_d
```

Load the plug-in from your Init Script from `Cloud9 > Open Your Init Script menu` inside of the IDE. Take a look at the [SDK docs](https://cloud9-sdk.readme.io/docs/customizing-cloud9#section-installing-packages) for more details.

```js
// You can access plugins via the 'services' global variable
/*global services, plugin*/

// to load plugins use
// services.pluginManager.loadPackage([
//     "https://<user>.github.io/<project>/build/package.<name>.js",
//     "~/.c9/plugins/<name>/package.json",
// ]);

services.pluginManager.loadPackage([
    "~/.c9/plugins/c9.ide.language.javascript.eslintd/package.json"
]);
```

## Usage

The plug-in starts [eslint_d](https://github.com/mantoni/eslint_d.js) when the IDE loads but can take a couple of seconds to initialize, after it is running you should see the correct linting errors according to your .eslintrc, .eslintrc.json or .eslintrc.yml configs as if you were to run it from the command line, proceeding changes to errors and warnings should be reflected quickly as you change your code.

The plugin will not function if no .eslintrc is present so be sure to add one even if it is blank.

This was a rather quick and basic implementation based on my very minimal knowledge of the Cloud9 SDK acquired while building the plug-in but it generally works quite well, I will improve it overtime as I use it myself as necessary and if you spot any problems feel free to open an issue or submit a pull request.

# License

MIT
