import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccuracyLineChart, QuestionCountBarChart } from '../components/ProgressChart';
import { clearExamHistory, clearStudyProgress, getStudyProgressStats } from '../utils/database';

export default function StudyProgressScreen({ navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    averageAccuracy: 0,
    progressHistory: []
  });

  // 加载学习进度数据
  useEffect(() => {
    loadProgressData();
    
    // 添加导航监听器，返回此页面时刷新数据
    const unsubscribe = navigation.addListener('focus', loadProgressData);
    return () => unsubscribe();
  }, [navigation]);

  // 加载进度数据
  const loadProgressData = async () => {
    setLoading(true);
    try {
      const progressStats = await getStudyProgressStats();
      console.log('Loaded progress stats:', progressStats);
      setStats(progressStats);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 清除学习记录和考试历史
  const handleClearProgress = () => {
    Alert.alert(
      t('settings.resetConfirm'),
      t('progress.clearProgressConfirm'),
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
              setLoading(true);
              // 清空学习进度
              await clearStudyProgress();
              // 清空考试历史
              await clearExamHistory();
              // 重新加载数据
              await loadProgressData();
              Alert.alert(t('common.success'), t('progress.clearProgressSuccess'));
            } catch (error) {
              console.error('Failed to clear progress:', error);
              Alert.alert(t('common.error'), t('progress.clearProgressError'));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 格式化正确率显示
  const formatAccuracy = (accuracy) => {
    if (accuracy === undefined || accuracy === null || isNaN(accuracy)) {
      return '0%';
    }
    return `${Math.round(accuracy * 100)}%`;
  };

  // 渲染进度历史记录
  const renderProgressHistory = () => {
    if (stats.progressHistory.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={60} color="#ccc" />
          <Text style={styles.emptyStateText}>{t('progress.noHistory')}</Text>
          <Text style={styles.emptyStateSubtext}>{t('progress.startExam')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.historyContainer}>
        {stats.progressHistory.map((item, index) => {
          // 确保正确率值有效
          const accuracy = item.accuracy !== undefined && !isNaN(item.accuracy) 
            ? item.accuracy 
            : 0;
            
          return (
            <View key={item.id || index} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                <View style={[
                  styles.examTypeBadge,
                  { backgroundColor: getExamTypeColor(item.examType) }
                ]}>
                  <Text style={styles.examTypeText}>{getExamTypeLabel(item.examType)}</Text>
                </View>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatValue}>{item.questionsAnswered || 0}</Text>
                  <Text style={styles.historyStatLabel}>{t('progress.questions')}</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatValue}>{item.correctCount || 0}</Text>
                  <Text style={styles.historyStatLabel}>{t('progress.correct')}</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatValue}>{formatAccuracy(accuracy)}</Text>
                  <Text style={styles.historyStatLabel}>{t('progress.accuracy')}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // 获取考试类型颜色
  const getExamTypeColor = (examType) => {
    switch (examType) {
      case 'full':
        return '#4CAF50';
      case 'practice':
        return '#2196F3';
      case 'quick':
        return '#FF9800';
      case 'custom':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  // 获取考试类型标签
  const getExamTypeLabel = (examType) => {
    switch (examType) {
      case 'full':
        return t('exam.fullExam');
      case 'practice':
        return t('exam.practiceMode');
      case 'quick':
        return t('exam.quickTest');
      case 'custom':
        return t('exam.customExam');
      default:
        return t('exam.exam');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{t('progress.title')}</Text>
        </View>

        <View style={styles.statsOverviewContainer}>
          <View style={styles.statCard}>
            <Ionicons name="school-outline" size={24} color="#0066cc" />
            <Text style={styles.statValue}>{stats.totalExams}</Text>
            <Text style={styles.statLabel}>{t('progress.totalExams')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="help-circle-outline" size={24} color="#0066cc" />
            <Text style={styles.statValue}>{stats.totalQuestions}</Text>
            <Text style={styles.statLabel}>{t('progress.totalQuestions')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#0066cc" />
            <Text style={styles.statValue}>{formatAccuracy(stats.averageAccuracy)}</Text>
            <Text style={styles.statLabel}>{t('progress.averageAccuracy')}</Text>
          </View>
        </View>

        {/* 准确率趋势图 */}
        {stats.progressHistory.length > 0 && (
          <View style={styles.chartsContainer}>
            <AccuracyLineChart progressHistory={stats.progressHistory} />
            <QuestionCountBarChart progressHistory={stats.progressHistory} />
          </View>
        )}

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('progress.recentActivity')}</Text>
            {stats.progressHistory.length > 0 && (
              <TouchableOpacity onPress={handleClearProgress}>
                <Text style={styles.clearButton}>{t('progress.clearHistory')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {renderProgressHistory()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 5,
  },
  statsOverviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066cc',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#F44336',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#666',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  historyContainer: {
    marginBottom: 10,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  examTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  examTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStat: {
    flex: 1,
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyStatLabel: {
    fontSize: 12,
    color: '#666',
  }
}); 