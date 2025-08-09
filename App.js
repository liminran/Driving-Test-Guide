import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 导入本地组件
import initI18n, { isI18nInitialized } from './src/i18n/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/utils/database';

// 保持启动画面可见直到我们准备好渲染
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  // 状态管理
  const [appIsReady, setAppIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  // 初始化应用
  useEffect(() => {
    async function prepare() {
      try {
        console.log('App initializing...');
        
        // 初始化国际化
        if (!isI18nInitialized()) {
          await initI18n();
          console.log('i18n initialized');
        }
        
        // 初始化数据库
        await initDatabase();
        console.log('Database initialized');
        
        // 预加载其他任何资源或数据...
      } catch (error) {
        console.error('Error during app initialization:', error);
        setInitError(error);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // 渲染发生错误的界面
  if (initError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>应用初始化失败</Text>
        <Text style={styles.errorDetails}>{initError.message}</Text>
      </View>
    );
  }

  // 渲染加载界面
  if (!appIsReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4c669f" />
        <Text style={styles.loadingText}>应用加载中...</Text>
      </View>
    );
  }

  // 渲染主应用
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
  },
  errorDetails: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});
