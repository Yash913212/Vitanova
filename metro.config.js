const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add wasm to asset extensions
config.resolver.assetExts.push('wasm');

// Comprehensive node module shims for Metro static resolution
config.resolver.extraNodeModules = {
  ws: path.resolve(__dirname, 'src/utils/mockWs.js'),
  stream: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  zlib: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  http: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  https: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  crypto: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  buffer: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  util: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  net: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  tls: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  fs: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  path: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  url: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  events: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
};

module.exports = config;
