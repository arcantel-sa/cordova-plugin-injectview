# cordova-plugin-injectview

Automatically inject Cordova platform and plugin scripts into your site.

This is a fork from https://github.com/formulateco/cordova-plugin-injectview

This fork add the following feature :
    - Add custom js files to the inject list

## Usage

For adding cutom js to the injected files list, you have to create the folder `injectview-custom-js` in the `www` source folder and inside a file named `cordova-plugin-injectview.json`.

The format of this file is similar to the `cordova-plugin-injectview.json` created by the plugin.

Example : 

```
["www/myScript1.js", "www/myScript2.js"]
```

Don't forget to add your scrpits as resourcfile in you config.xml :
```
    <!-- resources files -->
    <resource-file src="www/myScript1.js" target="platform_www/myScript1.js" />
    <resource-file src="www/myScript2.js" target="platform_www/myScript2.js" />
```
