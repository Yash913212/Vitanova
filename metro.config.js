const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add wasm to asset extensions
config.resolver.assetExts.push('wasm');

// Mappings for standard Node libraries to pure-JS package shims
config.resolver.extraNodeModules = {
  ws: path.resolve(__dirname, 'src/utils/mockWs.js'),
  stream: require.resolve('stream-browserify'),
  zlib: require.resolve('browserify-zlib'),
  crypto: require.resolve('crypto-browserify'),
  events: require.resolve('events'),
  util: require.resolve('util'),
  assert: require.resolve('assert'),
  http: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  https: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  net: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  tls: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  fs: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  path: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
  url: path.resolve(__dirname, 'src/utils/mockEmpty.js'),
};

module.exports = config;
