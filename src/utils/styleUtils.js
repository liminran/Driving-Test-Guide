/**
 * 样式工具函数
 * 
 * 这个文件提供了帮助处理样式相关问题的工具函数
 */


/**
 * 创建跨平台兼容的阴影样式
 * @param {Object} options - 阴影选项
 * @param {string} options.color - 阴影颜色
 * @param {Object} options.offset - 阴影偏移 { width, height }
 * @param {number} options.opacity - 阴影不透明度
 * @param {number} options.radius - 阴影半径
 * @param {number} options.elevation - Android 高度 (可选)
 * @returns {Object} 跨平台兼容的样式对象
 */
export const createShadow = ({
  color = '#000',
  offset = { width: 0, height: 2 },
  opacity = 0.1,
  radius = 3,
  elevation = 3
} = {}) => {
  // 使用boxShadow，不再区分平台
  const { width, height } = offset;
  return {
    // 对于所有平台都使用boxShadow
    boxShadow: `${width}px ${height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    // 对于Android仍保留elevation
    elevation: elevation
  };
};

/**
 * 根据平台返回正确的图像props
 * 解决了style.resizeMode和style.tintColor废弃的警告
 * 
 * @param {Object} imageStyle 原始图像样式对象
 * @returns {Object} 处理后的样式和props对象
 */
export const getImageProps = (imageStyle = {}) => {
  const { resizeMode, tintColor, ...otherStyles } = imageStyle;
  
  // 创建一个新的props对象
  const imageProps = {
    style: otherStyles,
  };
  
  // 如果存在resizeMode，将其提升为组件的props
  if (resizeMode) {
    imageProps.resizeMode = resizeMode;
  }
  
  // 如果存在tintColor，将其提升为组件的props
  if (tintColor) {
    imageProps.tintColor = tintColor;
  }
  
  return imageProps;
};

/**
 * 修复带shadow属性的样式对象，将其转换为boxShadow
 * @param {Object} styles - 原始样式对象
 * @returns {Object} - 修复后的样式对象
 */
export const fixDeprecatedShadow = (styles = {}) => {
  const { shadowColor, shadowOffset, shadowOpacity, shadowRadius, ...otherStyles } = styles;
  
  // 如果没有shadow相关属性，直接返回原样式
  if (!shadowColor && !shadowOffset && !shadowOpacity && !shadowRadius) {
    return styles;
  }
  
  // 提取shadow属性值，设置默认值
  const color = shadowColor || '#000';
  const offset = shadowOffset || { width: 0, height: 2 };
  const opacity = shadowOpacity || 0.1;
  const radius = shadowRadius || 3;
  const { width, height } = offset;
  
  // 创建boxShadow
  const boxShadow = `${width}px ${height}px ${radius}px rgba(0, 0, 0, ${opacity})`;
  
  // 返回修复后的样式
  return {
    ...otherStyles,
    boxShadow
  };
};

export default {
  getImageProps,
  createShadow,
  fixDeprecatedShadow
};