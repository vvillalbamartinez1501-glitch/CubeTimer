const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Limpieza de configuración para evitar errores de streaming y conflictos de headers
config.resolver.assetExts.push('wasm');

module.exports = config;