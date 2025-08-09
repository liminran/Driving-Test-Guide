import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { recordStudyProgress } from '../utils/database';

export default function ResultScreen({ route, navigation }) {
  const { results, examType, timeSpent } = route.params;
  
  const [isPassed, setIsPassed] = useState(false);
  const [score, setScore] = useState(0);
  const [percentageScore, setPercentageScore] = useState(0);
  
  // 计算成绩
  useEffect(() => {
    if (results) {
      const correctAnswers = results.filter(item => item.isCorrect).length;
      const totalQuestions = results.length;
      
      const calculatedScore = Math.round(correctAnswers / totalQuestions * 100);
      setScore(calculatedScore);
      setPercentageScore(correctAnswers / totalQuestions);
      
      // 考试通过标准：80%以上
      setIsPassed(calculatedScore >= 80);
      
      // 记录学习进度
      recordStudyProgress({
        questionsAnswered: totalQuestions,
        correctCount: correctAnswers,
        examType: examType || 'unknown'
      }).catch(error => {
        console.error('Failed to record study progress:', error);
      });
    }
  }, [results, examType]);
  
  // 返回首页
  const goToHome = () => {
    navigation.navigate('Main');
  };
  
  // 重新考试
  const retryExam = () => {
    navigation.navigate('Exam');
  };
  
  // 查看错题
  const viewMistakes = () => {
    navigation.navigate('Mistakes');
  };
  
  // 渲染得分圆环
  const renderScoreCircle = () => {
    return (
      <View style={styles.scoreCircleContainer}>
        <View style={[
          styles.scoreCircle,
          {borderColor: isPassed ? '#4CAF50' : '#F44336'}
        ]}>
          <Text style={[
            styles.scoreText,
            {color: isPassed ? '#4CAF50' : '#F44336'}
          ]}>{score}%</Text>
          <Text style={styles.scoreSubtext}>
            {results.filter(item => item.isCorrect).length} / {results.length} 题正确
          </Text>
        </View>
        <Text style={[
          styles.resultText,
          {color: isPassed ? '#4CAF50' : '#F44336'}
        ]}>
          {isPassed ? '恭喜，考试通过！' : '很遗憾，考试未通过'}
        </Text>
      </View>
    );
  };
  
  // 渲染每题结果
  const renderQuestionResult = ({ item, index }) => {
    return (
      <TouchableOpacity 
        style={styles.questionItem}
        onPress={() => navigation.navigate('QuestionDetail', { questionId: item.questionId })}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>题目 #{index + 1}</Text>
          {item.isCorrect ? (
            <View style={styles.correctBadge}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.badgeText}>正确</Text>
            </View>
          ) : (
            <View style={styles.incorrectBadge}>
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.badgeText}>错误</Text>
            </View>
          )}
        </View>
        <Text style={styles.questionText} numberOfLines={2}>{item.question}</Text>
        <View style={styles.answerInfo}>
          <Text style={styles.answerLabel}>
            您的回答: <Text style={item.isCorrect ? styles.correctText : styles.incorrectText}>{item.selectedOption}</Text>
          </Text>
          {!item.isCorrect && (
            <Text style={styles.answerLabel}>
              正确答案: <Text style={styles.correctText}>{item.correctOption}</Text>
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  // 渲染统计信息
  const renderStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={22} color="#666" />
          <Text style={styles.statLabel}>用时</Text>
          <Text style={styles.statValue}>
            {Math.floor(timeSpent / 60)}分{timeSpent % 60}秒
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#666" />
          <Text style={styles.statLabel}>正确</Text>
          <Text style={styles.statValue}>{results.filter(item => item.isCorrect).length}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="close-circle-outline" size={22} color="#666" />
          <Text style={styles.statLabel}>错误</Text>
          <Text style={styles.statValue}>{results.filter(item => !item.isCorrect).length}</Text>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>考试结果</Text>
          <Text style={styles.subtitle}>
            {examType === 'full' ? '完整模拟考试' : examType === 'practice' ? '练习模式' : '快速测试'}
          </Text>
        </View>
        
        {renderScoreCircle()}
        {renderStats()}
        
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>题目详情</Text>
          <FlatList
            data={results}
            renderItem={renderQuestionResult}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          {!isPassed ? (
            <TouchableOpacity style={styles.button} onPress={retryExam}>
              <Ionicons name="reload" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>重新考试</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={goToHome}>
              <Ionicons name="home" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>返回首页</Text>
            </TouchableOpacity>
          )}
          
          {results.filter(item => !item.isCorrect).length > 0 && (
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={viewMistakes}>
              <Ionicons name="list" size={20} color="#0066cc" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>查看错题</Text>
            </TouchableOpacity>
          )}
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
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreSubtext: {
    fontSize: 14,
    color: '#666',
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginHorizontal: 20,
    marginTop: 25,
  },
  resultsContainer: {
    marginBottom: 20,
  },
  questionItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
  },
  correctBadge: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  incorrectBadge: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 2,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  answerInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  correctText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  incorrectText: {
    color: '#F44336',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#0066cc',
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 