const fs = require('fs');
const path = require('path');

function fatal(message) {
    throw new Error(`cordova-plugin-injectview: ${message}`);
}

function createManifest(rootPath, platformName, manifestFilename) {
    let manifestDir = path.dirname(manifestFilename);
    if (!fs.existsSync(manifestDir)) {
        // The manifest's parent directory might not exist yet, e.g. after a cordova clean.
        // In this case, we do not create the manifest yet and let a future hook handle it.
        return;
    }

    // Load plugin info from platform configuration.
    let configFilename = path.join(rootPath, 'platforms', platformName, `${platformName}.json`);
    if (!fs.existsSync(configFilename)) {
        fatal(`platform configuration file does not exist for ${platformName}: ${configFilename}`);
    }

    let config = JSON.parse(fs.readFileSync(configFilename));
    let modules = (config && config.modules) || [];

    // Always include cordova.js and cordova_plugins.js
    // as part of the Cordova script manifest.
    let scriptFilenames = [
        path.posix.join('www', 'cordova.js'),
        path.posix.join('www', 'cordova_plugins.js')
    ];

    // Include each plugin as part of the manifest.
    for (let module of modules) {
        let filename = module.file;
        if (!filename) {
            continue;
        }

        scriptFilenames.push(path.posix.join('www', filename));
    }

    // Write script manifest to be included as an app resource.
    fs.writeFileSync(manifestFilename, JSON.stringify(scriptFilenames));
}

function removeManifest(manifestFilename) {
    if (!fs.existsSync(manifestFilename)) {
        return;
    }

    fs.unlinkSync(manifestFilename);
}

module.exports = function(context) {
    let rootPath = context.opts.projectRoot;
    if (!fs.existsSync(rootPath)) {
        fatal(`invalid project root: ${rootPath}`);
    }

    let platforms = (context.opts.cordova && context.opts.cordova.platforms) || [];
    if (platforms.length == 0) {
        platforms = context.opts.platforms || [];
    }

    for (let platformName of platforms) {
        if (platformName != 'android' && platformName != 'ios') {
            // Unsupported platform.
            continue;
        }

        let platformPaths = [path.join(rootPath, 'platforms', platformName, 'platform_www')];
        if (platformName == 'android') {
            platformPaths.push(path.join(rootPath, 'platforms', platformName, 'app', 'src', 'main', 'assets', 'www'));
        } else {
            platformPaths.push(path.join(rootPath, 'platforms', platformName, 'www'));
        }

        for (let platformPath of platformPaths) {
            let manifestFilename = path.join(platformPath, 'cordova-plugin-injectview.json');

            // Create or remove manifest file based on hook.
            if (context.hook == 'before_plugin_uninstall') {
                removeManifest(manifestFilename);
            } else {
                createManifest(rootPath, platformName, manifestFilename);
            }
        }
    }
};
