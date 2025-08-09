import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import cs from './translations/cs';
import en from './translations/en';
import es from './translations/es';
import zh from './translations/zh';

// 标记初始化状态
let isInitialized = false;

// 初始化i18n
const initI18n = async () => {
  if (isInitialized) {
    console.log('i18n already initialized, skipping');
    return;
  }

  // 尝试从存储中获取用户语言设置
  let userLanguage = 'zh'; // 默认语言
  try {
    const storedLanguage = await AsyncStorage.getItem('userLanguage');
    if (storedLanguage) {
      userLanguage = storedLanguage;
    }
  } catch (error) {
    console.error('Failed to load language setting', error);
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        zh: { translation: zh },
        cs: { translation: cs },
        es: { translation: es }
      },
      lng: userLanguage,
      fallbackLng: 'zh',
      interpolation: {
        escapeValue: false
      },
      compatibilityJSON: 'v3'
    });

  // 标记为已初始化
  isInitialized = true;
  return i18n;
};

/**
 * 检查i18n是否已初始化
 * @returns {boolean}
 */
export const isI18nInitialized = () => {
  return isInitialized;
};

// 导出已经初始化的i18n实例，方便直接使用
export { i18n };

export default initI18n; 