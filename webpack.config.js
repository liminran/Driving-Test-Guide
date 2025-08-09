const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        'expo-sqlite',
      ],
    },
  }, argv);

  // 添加fallback，解决wa-sqlite.wasm缺失问题
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'wa-sqlite/wa-sqlite.wasm': false,
  };

  return config;
}; 