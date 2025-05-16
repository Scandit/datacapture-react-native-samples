const os = require('os');
const path = require('path');

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// Ensure the function exists
if (!os.availableParallelism) {
  os.availableParallelism = function() {
    return os.cpus().length;
  };
}

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  // Explicitly set maxWorkers
  maxWorkers: os.cpus().length,
};
module.exports = mergeConfig(getDefaultConfig(__dirname), config);
