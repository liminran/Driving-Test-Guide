import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { clearExamHistory, clearMistakes, clearStudyProgress, resetDatabase } from '../utils/database';
import { fixAllIssues } from '../utils/fixFavorites';
import { runAllFixes } from '../utils/fixJson';

// 应用信息
const APP_INFO = {
  version: '1.0.0',
  author: '驾考团队',
  copyright: '© 2025 捷克驾考宝典',
  website: 'https://driving.example.com'
};

// 支持的语言
const LANGUAGES = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    // 加载用户语言设置
    const loadLanguageSettings = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language settings:', error);
      }
    };

    loadLanguageSettings();
  }, []);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationsValue = await AsyncStorage.getItem('notificationsEnabled');
        setNotificationsEnabled(notificationsValue === 'true');
        
        const darkModeValue = await AsyncStorage.getItem('darkModeEnabled');
        setDarkModeEnabled(darkModeValue === 'true');
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    
    loadSettings();
  }, []);

  // 更改语言
  const changeLanguage = async (langCode) => {
    try {
      await AsyncStorage.setItem('user-language', langCode);
      i18n.changeLanguage(langCode);
      setSelectedLanguage(langCode);
      
      // 提示用户需要重启应用
      Alert.alert(
        '语言已更改',
        '请重启应用以完成语言切换',
        [{ text: '确定', style: 'default' }]
      );
    } catch (error) {
      console.error('Error saving language setting:', error);
    }
  };

  // 切换通知
  const toggleNotifications = async (value) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
      setNotificationsEnabled(value);
      
      if (value) {
        Alert.alert('通知已启用', '你将会收到每日学习提醒');
      } else {
        Alert.alert('通知已禁用', '你将不会收到学习提醒');
      }
    } catch (error) {
      console.error('Failed to save notification setting', error);
    }
  };
  
  // 切换暗黑模式
  const toggleDarkMode = async (value) => {
    try {
      await AsyncStorage.setItem('darkModeEnabled', value.toString());
      setDarkModeEnabled(value);
      
      Alert.alert(
        value ? '暗黑模式已启用' : '暗黑模式已禁用',
        value ? '界面将切换为暗色主题，重启应用后生效' : '界面将切换为亮色主题，重启应用后生效'
      );
    } catch (error) {
      console.error('Failed to save dark mode setting', error);
    }
  };

  // 清除收藏数据
  const clearFavorites = async () => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify([]));
      Alert.alert('收藏已清空', '所有收藏记录已被清除');
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      Alert.alert('操作失败', '清空收藏记录失败，请稍后重试');
    }
  };
  
  // 清除错题记录
  const clearMistakeRecords = async () => {
    try {
      await clearMistakes();
      Alert.alert('错题已清空', '所有错题记录已被清除');
    } catch (error) {
      console.error('Failed to clear mistakes:', error);
      Alert.alert('操作失败', '清空错题记录失败，请稍后重试');
    }
  };
  
  // 清除考试历史
  const clearExamRecords = async () => {
    try {
      await clearExamHistory();
      await clearStudyProgress();
      Alert.alert('考试记录已清空', '所有考试历史和学习进度已被清除');
    } catch (error) {
      console.error('Failed to clear exam history:', error);
      Alert.alert('操作失败', '清空考试记录失败，请稍后重试');
    }
  };

  // 重置所有数据
  const handleResetData = () => {
    Alert.alert(
      t('settings.resetData'),
      t('settings.resetConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              // 重置所有数据库
              await resetDatabase();
              // 清空学习进度和考试记录
              await clearStudyProgress();
              await clearExamHistory();
              
              Alert.alert(t('common.success'), '应用数据已重置，重启应用后生效');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert(t('common.error'), error.message);
            }
          }
        }
      ]
    );
  };
  
  // 显示应用信息
  const showAppInfo = () => {
    Alert.alert(
      '应用信息',
      `捷克驾考宝典\n版本: ${APP_INFO.version}\n${APP_INFO.copyright}\n\n这是一款帮助用户备考捷克驾照考试的应用。提供模拟考试、题库浏览、错题收集等功能。`,
      [{ text: '确定', style: 'default' }]
    );
  };
  
  // 前往评分
  const goToRating = () => {
    Alert.alert(
      '评分应用',
      '感谢您的使用！您的评分和反馈是我们改进的动力。',
      [
        { text: '稍后再说', style: 'cancel' },
        { text: '去评分', onPress: () => {
          // 这里应替换为实际应用商店链接
          Linking.openURL('https://play.google.com/store');
        }}
      ]
    );
  };
  
  // 查看隐私政策
  const viewPrivacyPolicy = () => {
    Alert.alert(
      '隐私政策',
      '我们重视用户隐私。应用收集的所有数据仅用于提升使用体验，不会与第三方共享。详见完整隐私政策。',
      [
        { text: '取消', style: 'cancel' },
        { text: '查看完整政策', onPress: () => {
          // 这里替换为实际政策网址
          Linking.openURL('https://example.com/privacy');
        }}
      ]
    );
  };

  // 添加修复应用功能
  const handleFixApp = () => {
    Alert.alert(
      '应用修复',
      '此功能将尝试修复应用中的已知问题，包括收藏、错题和JSON数据等。是否继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'default',
          onPress: async () => {
            try {
              // 运行全部修复
              await Promise.all([
                fixAllIssues(), // 修复收藏和错题
                runAllFixes()   // 修复JSON错误
              ]);
              
              // 通知用户
              Alert.alert('修复完成', '应用已完成所有可能的修复，建议重启应用以确保所有更改生效。');
            } catch (error) {
              console.error('修复应用时出错:', error);
              Alert.alert('修复失败', `修复过程中出现错误: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  // 渲染语言选项
  const renderLanguageOption = (language) => {
    const isSelected = selectedLanguage === language.code;
    
    return (
      <TouchableOpacity 
        key={language.code} 
        style={[styles.settingOption, isSelected && styles.selectedOption]}
        onPress={() => changeLanguage(language.code)}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.languageFlag}>{language.flag}</Text>
          <Text style={styles.languageName}>{language.name}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#2196F3" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.sectionContent}>
            {LANGUAGES.map(language => renderLanguageOption(language))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>应用设置</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={24} color="#555" style={styles.settingIcon} />
                <View>
                  <Text style={styles.settingTitle}>每日提醒</Text>
                  <Text style={styles.settingDescription}>接收每日学习提醒</Text>
                </View>
              </View>
              <Switch 
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#d9d9d9', true: '#4CAF50' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={24} color="#555" style={styles.settingIcon} />
                <View>
                  <Text style={styles.settingTitle}>暗黑模式</Text>
                  <Text style={styles.settingDescription}>使用夜间模式保护眼睛</Text>
                </View>
              </View>
              <Switch 
                value={darkModeEnabled}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#d9d9d9', true: '#0066cc' }}
                thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle-outline" size={24} color="#555" style={styles.settingIcon} />
                <Text style={styles.settingTitle}>应用信息</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="star-outline" size={24} color="#555" style={styles.settingIcon} />
                <Text style={styles.settingTitle}>评分应用</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="lock-closed-outline" size={24} color="#555" style={styles.settingIcon} />
                <Text style={styles.settingTitle}>隐私政策</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>捷克驾考宝典 v1.0.0</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>开发者选项</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.optionItem} onPress={handleFixApp}>
              <View style={styles.settingInfo}>
                <Ionicons name="construct-outline" size={24} color="#555" style={styles.settingIcon} />
                <Text style={styles.settingTitle}>修复应用问题</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleResetData}>
            <Text style={styles.dangerButtonText}>{t('settings.resetData')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    margin: 16,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#757575',
  },
  dangerSection: {
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 22,
    marginRight: 15,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 3,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  }
});

export default SettingsScreen; 