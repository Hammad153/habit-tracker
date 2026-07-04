const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

const nativeWindConfig = withNativeWind(config, { input: './global.css' })

if (nativeWindConfig.watcher) {
  delete nativeWindConfig.watcher.unstable_workerThreads
}

module.exports = nativeWindConfig
