const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support .wasm assets (kept from original config)
config.resolver.assetExts.push('wasm');

// The COOP/COEP headers below are ONLY for local dev to allow SharedArrayBuffer.
// They are NOT needed in production (we migrated away from SQLite which required them).
// Vercel handles headers separately via vercel.json.
if (process.env.NODE_ENV !== 'production') {
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        return middleware(req, res, next);
      };
    },
  };
}

module.exports = config;