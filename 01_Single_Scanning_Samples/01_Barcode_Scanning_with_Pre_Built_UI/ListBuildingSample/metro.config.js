const os = require('os');
const path = require('path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Ensure the function exists
if (!os.availableParallelism) {
  os.availableParallelism = function () {
    return os.cpus().length;
  };
}

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
    // Samples import .svg files as React components (e.g. MatrixScanBubbles'
    // Freeze/Unfreeze buttons). Without this the default asset pipeline turns
    // them into numeric asset ids and rendering one throws "Element type is
    // invalid: ... got: number" (SDC-33218). Mirrors DebugApp/metro.config.js.
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  // Explicitly set maxWorkers
  maxWorkers: os.cpus().length,
};
module.exports = mergeConfig(defaultConfig, config);
