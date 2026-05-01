const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Le decimos a Metro que trate los archivos .wasm como recursos (assets) válidos
config.resolver.assetExts.push('wasm');

module.exports = config;