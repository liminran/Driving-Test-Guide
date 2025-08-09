import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFavoriteQuestions, getMistakes, getStudyProgressStats } from '../utils/database';
import { createShadow } from '../utils/styleUtils';

// 获取设备尺寸
const { width, height } = Dimensions.get('window');

// 计算响应式尺寸
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const responsiveFontSize = (size) => {
  const scaleFactor = Math.min(width, height) / 375; // 基于iPhone 8尺寸计算比例
  return Math.round(size * scaleFactor);
};

export default function HomeScreen({ navigation }) {
  // 确保所有hooks在顶层，并且顺序固定
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    averageAccuracy: 0
  });
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  // 主要功能入口 - 不使用t函数的方式定义，避免hooks依赖问题
  const features = [
    {
      id: 'browse',
      icon: 'list',
      screen: 'Browse',
      color: '#4286f4'
    },
    {
      id: 'exam',
      icon: 'school',
      screen: 'Exam',
      color: '#2ecc71'
    },
    {
      id: 'favorites',
      icon: 'heart',
      screen: 'Favorites',
      color: '#e74c3c',
      badge: favoritesCount
    },
    {
      id: 'mistakes',
      icon: 'close-circle',
      screen: 'Mistakes',
      color: '#f39c12',
      badge: mistakesCount
    }
  ];

  // 加载学习统计数据
  useEffect(() => {
    let isMounted = true;
    
    const loadStats = async () => {
      try {
        const progressStats = await getStudyProgressStats();
        if (isMounted) {
          setStats({
            totalExams: progressStats.totalExams,
            totalQuestions: progressStats.totalQuestions,
            averageAccuracy: progressStats.averageAccuracy
          });
        }
      } catch (error) {
        console.error('Failed to load study stats:', error);
      }
    };
    
    const loadFavoritesCount = async () => {
      try {
        const favorites = await getFavoriteQuestions();
        if (isMounted) {
          setFavoritesCount(favorites.length);
        }
      } catch (error) {
        console.error('Failed to load favorites count:', error);
      }
    };
    
    const loadMistakesCount = async () => {
      try {
        const mistakes = await getMistakes();
        if (isMounted) {
          setMistakesCount(mistakes.length);
        }
      } catch (error) {
        console.error('Failed to load mistakes count:', error);
      }
    };
    
    // 调用函数
    loadStats();
    loadFavoritesCount();
    loadMistakesCount();

    // 添加导航监听器，返回此页面时刷新数据
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
      loadFavoritesCount();
      loadMistakesCount();
    });

    // 清理函数
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigation]); // 稳定的依赖数组
  
  // 检查是否从考试页面返回并带有考试结果
  useEffect(() => {
    const checkExamResults = () => {
      const route = navigation.getState().routes.find(r => r.name === 'Home');
      if (route?.params?.examCompleted) {
        const examResults = route.params.examResults;
        
        // 显示成绩通知
        setTimeout(() => {
          Alert.alert(
            '考试已完成',
            `您的考试成绩: ${examResults.score}%\n` +
            `答对: ${examResults.correctCount} 题\n` +
            `答错: ${examResults.incorrectCount} 题\n\n` +
            `${examResults.incorrectCount > 0 ? 
              '所有错题已自动收录至错题本，可随时复习。' : 
              '恭喜您全部答对！'}`,
            [
              { text: '我知道了', style: 'default' },
              { 
                text: examResults.incorrectCount > 0 ? '查看错题' : '继续练习', 
                onPress: () => examResults.incorrectCount > 0 ? 
                  navigation.navigate('Mistakes') : 
                  navigation.navigate('Browse'),
                style: 'default'
              }
            ]
          );
        }, 500);
        
        // 清除参数，避免重复显示
        navigation.setParams({ examCompleted: undefined, examResults: undefined });
      }
    };
    
    checkExamResults();
  }, [navigation]);

  const getFeatureTitle = (id) => {
    switch (id) {
      case 'browse': return t('home.browseTopic');
      case 'exam': return t('home.startExam');
      case 'favorites': return t('home.favorites');
      case 'mistakes': return t('home.reviewMistakes');
      default: return '';
    }
  };
  
  const getFeatureDescription = (id) => {
    switch (id) {
      case 'browse': return t('home.browseDescription');
      case 'exam': return t('home.examDescription');
      case 'favorites': return t('home.favoritesDescription');
      case 'mistakes': return t('home.mistakesDescription');
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 顶部头部区域 */}
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('home.title')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
            <Image 
              source={require('../../assets/images/react-logo.png')} 
              style={styles.headerImage} 
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* 功能卡片区 */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>主要功能</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureCard, { backgroundColor: feature.color }]}
                onPress={() => navigation.navigate(feature.screen)}
                activeOpacity={0.8}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={responsiveFontSize(28)} color="#fff" />
                  {feature.badge > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{feature.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.featureTitle}>
                  {getFeatureTitle(feature.id)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 统计数据卡片 */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>{t('home.studyStats')}</Text>
          <TouchableOpacity
            style={styles.statsCard}
            onPress={() => navigation.navigate('StudyProgress')}
            activeOpacity={0.7}
          >
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalExams}</Text>
                <Text style={styles.statLabel}>{t('home.examsTaken')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalQuestions}</Text>
                <Text style={styles.statLabel}>{t('home.questionsAnswered')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.averageAccuracy !== undefined && !isNaN(stats.averageAccuracy) 
                    ? `${Math.round(stats.averageAccuracy * 100)}%` 
                    : '0%'}
                </Text>
                <Text style={styles.statLabel}>{t('home.accuracy')}</Text>
              </View>
            </View>
            <View style={styles.statsFooter}>
              <Text style={styles.viewMoreText}>查看详细统计</Text>
              <Ionicons name="chevron-forward" size={responsiveFontSize(18)} color="#4c669f" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 考试信息卡片 */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>考试须知</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={responsiveFontSize(24)} color="#4c669f" />
              <Text style={styles.infoTitle}>{t('exam.examInfo')}</Text>
            </View>
            <Text style={styles.infoText}>
              • {t('exam.examInfoLine1')}{"\n"}
              • {t('exam.examInfoLine2')}{"\n"}
              • {t('exam.examInfoLine3')}{"\n"}
              • {t('exam.examInfoLine4')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: responsiveHeight(5),
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: responsiveHeight(4),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    padding: responsiveWidth(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: responsiveFontSize(28),
    fontWeight: 'bold',
    color: '#fff',
    marginTop: responsiveHeight(1),
  },
  subtitle: {
    fontSize: responsiveFontSize(16),
    color: '#e0e0e0',
    marginTop: responsiveHeight(1),
  },
  headerImage: {
    width: responsiveWidth(30),
    height: responsiveHeight(10),
    marginTop: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: responsiveWidth(5),
    marginBottom: responsiveHeight(1.5),
  },
  cardSection: {
    marginTop: responsiveHeight(2),
  },
  featuresContainer: {
    padding: responsiveWidth(3),
    marginTop: responsiveHeight(2),
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: responsiveWidth(2),
  },
  featureCard: {
    width: '48%',
    height: responsiveHeight(15),
    backgroundColor: '#4c669f',
    borderRadius: 16,
    padding: responsiveWidth(3),
    marginBottom: responsiveHeight(2),
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow({
      offset: { width: 0, height: 2 },
      opacity: 0.1,
      radius: 4,
      elevation: 3
    }),
  },
  featureIconContainer: {
    marginBottom: responsiveHeight(1),
  },
  featureTitle: {
    fontSize: responsiveFontSize(16),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: responsiveWidth(5),
    borderRadius: 12,
    ...createShadow({
      offset: { width: 0, height: 2 },
      opacity: 0.1,
      radius: 4,
      elevation: 3
    }),
  },
  statsContent: {
    flexDirection: 'row',
    padding: responsiveWidth(4),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#4c669f',
    marginBottom: responsiveHeight(0.5),
  },
  statLabel: {
    fontSize: responsiveFontSize(12),
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: responsiveHeight(1.5),
  },
  viewMoreText: {
    fontSize: responsiveFontSize(14),
    color: '#4c669f',
    marginRight: responsiveWidth(1),
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: responsiveWidth(5),
    padding: responsiveWidth(4),
    borderRadius: 12,
    ...createShadow({
      offset: { width: 0, height: 2 },
      opacity: 0.1,
      radius: 4,
      elevation: 3
    }),
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  infoTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    marginLeft: responsiveWidth(2),
  },
  infoText: {
    lineHeight: responsiveFontSize(20),
    color: '#444',
    fontSize: responsiveFontSize(14),
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    minWidth: 20,
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
    color: '#fff',
  },
}); 