import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ExamResultScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  // 获取考试分数
  const { score } = route.params || { score: { correct: 0, total: 30 } };
  
  // 判断是否通过考试 (至少27题正确)
  const passed = score.correct >= 27;
  
  // 计算百分比
  const percentage = Math.round((score.correct / score.total) * 100);

  const handleRetakeExam = () => {
    navigation.navigate('Exam');
  };

  const handleGoHome = () => {
    navigation.navigate('Tabs', { screen: 'Home' });
  };

  const handleReviewIncorrect = () => {
    navigation.navigate('Mistakes');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.resultCard}>
          <View style={[styles.resultBadge, passed ? styles.passedBadge : styles.failedBadge]}>
            {passed ? (
              <Ionicons name="checkmark-circle" size={48} color="#fff" />
            ) : (
              <Ionicons name="close-circle" size={48} color="#fff" />
            )}
            <Text style={styles.resultBadgeText}>
              {passed ? t('result.passed') : t('result.failed')}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
              <Text style={styles.scoreFraction}>
                {score.correct}/{score.total}
              </Text>
            </View>
          </View>

          <Text style={styles.resultNote}>
            {t('result.requiredToPass')}
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t('result.details')}</Text>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>{t('result.correctAnswers')}</Text>
              <Text style={styles.statValue}>{score.correct}</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="close-circle" size={24} color="#F44336" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>{t('result.incorrectAnswers')}</Text>
              <Text style={styles.statValue}>{score.total - score.correct}</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={24} color="#2196F3" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>{t('result.timeTaken')}</Text>
              <Text style={styles.statValue}>12:30</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleReviewIncorrect}>
            <Text style={styles.actionButtonText}>{t('result.reviewIncorrect')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleRetakeExam}
          >
            <Text style={styles.actionButtonText}>{t('result.retakeExam')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleGoHome}>
            <Text style={styles.actionButtonText}>{t('result.backToHome')}</Text>
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
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  passedBadge: {
    backgroundColor: '#4CAF50',
  },
  failedBadge: {
    backgroundColor: '#F44336',
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#2196F3',
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  scoreFraction: {
    fontSize: 18,
    color: '#757575',
  },
  resultNote: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default ExamResultScreen; 