import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 题目语言切换组件
 * @param {Object} props
 * @param {string} props.currentLanguage - 当前选择的语言代码
 * @param {Function} props.onChangeLanguage - 切换语言的回调函数
 */
const QuestionLanguageSwitcher = ({ currentLanguage, onChangeLanguage }) => {
  const { t } = useTranslation();
  
  const languages = [
    { code: 'zh', name: '中文', icon: 'language-outline' },
    { code: 'en', name: 'EN', icon: 'language-outline' },
    { code: 'cs', name: 'CZ', icon: 'language-outline' },
    { code: 'es', name: 'ES', icon: 'language-outline' }
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageButton,
            currentLanguage === lang.code && styles.activeLanguageButton
          ]}
          onPress={() => onChangeLanguage(lang.code)}
        >
          <Text
            style={[
              styles.languageText,
              currentLanguage === lang.code && styles.activeLanguageText
            ]}
          >
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  activeLanguageButton: {
    backgroundColor: '#4c669f',
  },
  languageText: {
    fontSize: 14,
    color: '#666',
  },
  activeLanguageText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default QuestionLanguageSwitcher; 