const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async (env, argv) => {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // 确保 output 存在后再设置 publicPath
  config.output = config.output || {};
  // 使用相对路径，适配 GitHub Pages 子路径部署
  config.output.publicPath = './';
  return config;
}; 