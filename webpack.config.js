const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = (env, argv) => {
  const config = require('@expo/webpack-config')(env, argv);
  config.output.publicPath = './';  // 避免输出为 '/'
  return config;
}; 