import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import initI18n from '../i18n/i18n';

// 导入屏幕
import BrowseScreen from '../screens/BrowseScreen';
import ExamScreen from '../screens/ExamScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import HomeScreen from '../screens/HomeScreen';
import MistakesScreen from '../screens/MistakesScreen';
import QuestionDetailScreen from '../screens/QuestionDetailScreen';
import ResultScreen from '../screens/ResultScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StudyProgressScreen from '../screens/StudyProgressScreen';

// 创建导航器
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 主标签导航
function MainTabNavigator() {
  const { t } = useTranslation();
  
  // 配置屏幕选项的函数，避免依赖问题
  const getScreenOptions = () => {
    return ({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Browse') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Exam') {
          iconName = focused ? 'school' : 'school-outline';
        } else if (route.name === 'Favorites') {
          iconName = focused ? 'heart' : 'heart-outline';
        } else if (route.name === 'Mistakes') {
          iconName = focused ? 'close-circle' : 'close-circle-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0066cc',
      tabBarInactiveTintColor: 'gray',
      headerShown: false
    });
  };
  
  // 获取屏幕标签文本的函数
  const getTabLabel = (key) => {
    return t(`navigation.${key.toLowerCase()}`);
  };
  
  return (
    <Tab.Navigator 
      screenOptions={getScreenOptions()}
      style={{ pointerEvents: 'auto' }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: getTabLabel('home') }}
      />
      <Tab.Screen 
        name="Browse" 
        component={BrowseScreen} 
        options={{ tabBarLabel: getTabLabel('browse') }}
      />
      <Tab.Screen 
        name="Exam" 
        component={ExamScreen} 
        options={{ tabBarLabel: getTabLabel('exam') }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ tabBarLabel: getTabLabel('favorites') }}
      />
      <Tab.Screen 
        name="Mistakes" 
        component={MistakesScreen} 
        options={{ tabBarLabel: getTabLabel('mistakes') }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarLabel: getTabLabel('settings') }}
      />
    </Tab.Navigator>
  );
}

// 应用导航器
export default function AppNavigator() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  
  // 初始化i18n
  useEffect(() => {
    const setupI18n = async () => {
      try {
        await initI18n();
        setIsI18nInitialized(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      }
    };
    
    setupI18n();
  }, []);
  
  // 显示加载状态
  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>加载中...</Text>
      </View>
    );
  }
  
  return <RootNavigator />;
}

// 将根导航器拆分为单独的组件
function RootNavigator() {
  const { t } = useTranslation();
  
  // 获取屏幕标题的函数
  const getScreenTitle = (key) => {
    return t(`navigation.${key}`);
  };
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTintColor: '#0066cc',
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="QuestionDetail" 
        component={QuestionDetailScreen} 
        options={{ title: getScreenTitle('question_detail') }}
      />
      <Stack.Screen 
        name="ExamResult" 
        component={ResultScreen} 
        options={{ 
          title: getScreenTitle('exam_result'),
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="StudyProgress" 
        component={StudyProgressScreen} 
        options={{ title: getScreenTitle('study_progress') }}
      />
    </Stack.Navigator>
  );
} 