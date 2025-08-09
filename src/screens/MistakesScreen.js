import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import assetDataService from '../utils/assetDataService';
import { clearMistakes, getMistakes, removeMistake } from '../utils/database';
import { getImageProps } from '../utils/styleUtils';

// 获取设备尺寸
const { width, height } = Dimensions.get('window');
const responsiveWidth = percentage => (width * percentage) / 100;
const responsiveHeight = percentage => (height * percentage) / 100;
const responsiveFontSize = size => {
  const scaleFactor = Math.min(width, height) / 375;
  return Math.round(size * scaleFactor);
};

const MistakesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [mistakes, setMistakes] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  
  // 加载错题数据
  useEffect(() => {
    const loadMistakes = async () => {
      try {
        setLoading(true);
        
        // 加载所有题目
        const questions = await assetDataService.loadAllQuestionSets();
        setAllQuestions(questions);
        console.log('Loaded questions:', questions.length);
        
        // 加载错题记录
        console.log('Fetching mistake records...');
        const mistakeRecords = await getMistakes();
        console.log('Mistake records loaded:', mistakeRecords ? mistakeRecords.length : 'none');
        
        if (!mistakeRecords || mistakeRecords.length === 0) {
          console.log('No mistakes found');
          setMistakes([]);
          setLoading(false);
          return;
        }
        
        // 合并错题记录和题目详情
        const mistakesWithDetails = mistakeRecords.map(mistake => {
          if (!mistake || !mistake.questionId) {
            console.warn('Invalid mistake record:', mistake);
            return null;
          }
          
          const questionDetail = questions.find(q => q.id && q.id.toString() === mistake.questionId.toString());
          
          if (questionDetail) {
            return {
              ...mistake,
              question: questionDetail.question,
              category: questionDetail.category,
              chineseCategory: assetDataService.getChineseCategoryName(questionDetail.category),
              answers: questionDetail.answers,
              correctAnswer: questionDetail.answers.findIndex(ans => ans.correct) >= 0 
                ? String.fromCharCode(65 + questionDetail.answers.findIndex(ans => ans.correct))
                : 'A',
              signalImage: questionDetail.signalImage,
              date: new Date(mistake.timestamp || Date.now()).toLocaleDateString()
            };
          }
          console.warn('Could not find question details for mistake:', mistake.questionId);
          return null;
        }).filter(m => m && m.question); // 过滤掉找不到详情的记录
        
        console.log('Processed mistakes with details:', mistakesWithDetails.length);
        
        // 按日期排序，最新的在前面
        mistakesWithDetails.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        setMistakes(mistakesWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error loading mistakes:', error);
        setLoading(false);
        Alert.alert(
          '加载错误',
          '加载错题数据失败: ' + error.message,
          [{ text: '确定', style: 'default' }]
        );
      }
    };

    loadMistakes();
    
    // 添加导航监听器，返回此页面时刷新
    const unsubscribe = navigation.addListener('focus', loadMistakes);
    return () => unsubscribe();
  }, [navigation]);

  // 删除单个错题
  const handleRemoveMistake = (questionId) => {
    if (!questionId) {
      console.error('Missing questionId for removal');
      return;
    }
    const doRemove = async () => {
      try {
        setLoading(true);
        console.log(`Removing mistake with ID: ${questionId}`);
        const result = await removeMistake(questionId);
        console.log('Remove result:', result);
        if (result) {
          const updatedRecords = await getMistakes();
          const updatedMistakes = await processMistakes(updatedRecords);
          setMistakes(updatedMistakes);
          console.log(`Reloaded mistakes after removal: ${updatedMistakes.length}`);
        } else {
          console.warn('Failed to remove mistake, reloading data...');
          const updatedMistakes = await getMistakes();
          const mistakesWithDetails = await processMistakes(updatedMistakes);
          setMistakes(mistakesWithDetails);
        }
      } catch (error) {
        console.error('Error removing mistake:', error);
        if (Platform.OS !== 'web') {
          Alert.alert('错误', '删除错题失败，请稍后重试。');
        }
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm('确定要从错题列表中删除此题目吗？');
      if (ok) doRemove();
      return;
    }

    Alert.alert('删除错题','确定要从错题列表中删除此题目吗？',[
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: doRemove }
    ]);
  };

  // 添加处理错题数据的辅助函数
  const processMistakes = async (mistakeRecords) => {
    // 加载所有题目
    const questions = await assetDataService.loadAllQuestionSets();
    
    // 合并错题记录和题目详情
    const mistakesWithDetails = mistakeRecords.map(mistake => {
      if (!mistake || !mistake.questionId) {
        console.warn('Invalid mistake record:', mistake);
        return null;
      }
      
      const questionDetail = questions.find(q => q.id && q.id.toString() === mistake.questionId.toString());
      
      if (questionDetail) {
        return {
          ...mistake,
          question: questionDetail.question,
          category: questionDetail.category,
          chineseCategory: assetDataService.getChineseCategoryName(questionDetail.category),
          answers: questionDetail.answers,
          correctAnswer: questionDetail.answers.findIndex(ans => ans.correct) >= 0 
            ? String.fromCharCode(65 + questionDetail.answers.findIndex(ans => ans.correct))
            : 'A',
          signalImage: questionDetail.signalImage,
          date: new Date(mistake.timestamp || Date.now()).toLocaleDateString()
        };
      }
      console.warn('Could not find question details for mistake:', mistake.questionId);
      return null;
    }).filter(m => m && m.question); // 过滤掉找不到详情的记录
    
    // 按日期排序，最新的在前面
    mistakesWithDetails.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    return mistakesWithDetails;
  };

  // 修改清空所有错题函数
  const handleClearAllMistakes = () => {
    if (mistakes.length === 0) {
      console.log('No mistakes to clear');
      return;
    }
    const doClear = async () => {
      try {
        setLoading(true);
        console.log('Clearing all mistakes');
        await clearMistakes();
        setMistakes([]);
        if (Platform.OS !== 'web') {
          Alert.alert('操作成功', '所有错题记录已清空');
        }
      } catch (error) {
        console.error('Error clearing mistakes:', error);
        try {
          await AsyncStorage.setItem('mistakes', JSON.stringify([]));
          setMistakes([]);
          if (Platform.OS !== 'web') {
            Alert.alert('操作成功', '所有错题记录已清空');
          }
        } catch (backupError) {
          console.error('Backup clear method also failed:', backupError);
          if (Platform.OS !== 'web') {
            Alert.alert('错误', '清空错题失败，请稍后重试。');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm('确定要清空所有错题记录吗？此操作不可恢复。');
      if (ok) doClear();
      return;
    }

    Alert.alert('清空错题','确定要清空所有错题记录吗？此操作不可恢复。',[
      { text: '取消', style: 'cancel' },
      { text: '确定', style: 'destructive', onPress: doClear }
    ]);
  };

  // 查看错题详情
  const handleViewMistakeDetail = (mistake) => {
    navigation.navigate('QuestionDetail', { questionId: mistake.questionId });
  };

  // 渲染错题项
  const renderMistakeItem = ({ item }) => {
    // 找出用户选择的答案
    const userAnswerIndex = item.userAnswer ? item.userAnswer.charCodeAt(0) - 65 : -1;
    const userAnswerText = userAnswerIndex >= 0 && item.answers[userAnswerIndex] 
      ? item.answers[userAnswerIndex].text 
      : '未作答';
    
    // 找出正确答案
    const correctAnswerIndex = item.answers.findIndex(ans => ans.correct);
    const correctAnswerText = correctAnswerIndex >= 0 
      ? `${String.fromCharCode(65 + correctAnswerIndex)}: ${item.answers[correctAnswerIndex].text}` 
      : '未知';
    
    return (
      <View style={styles.mistakeItem}>
        <View style={styles.mistakeHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.chineseCategory || item.category}</Text>
          </View>
          <Text style={styles.mistakeDate}>{item.date}</Text>
        </View>
        
        <Text style={styles.mistakeQuestion}>{item.question}</Text>
        
        {item.signalImage && (
          <View style={styles.imageContainer}>
            <Image 
              source={item.signalImage}
              {...getImageProps({
                ...styles.questionImage,
                resizeMode: "contain"
              })}
            />
          </View>
        )}
        
        <View style={styles.answerContainer}>
          <View style={styles.answerRow}>
            <View style={[styles.answerBadge, styles.wrongBadge]}>
              <Text style={styles.answerBadgeText}>您的答案</Text>
            </View>
            <Text style={styles.answerText}>{item.userAnswer}: {userAnswerText}</Text>
          </View>
          
          <View style={styles.answerRow}>
            <View style={[styles.answerBadge, styles.correctBadge]}>
              <Text style={styles.answerBadgeText}>正确答案</Text>
            </View>
            <Text style={styles.answerText}>{correctAnswerText}</Text>
          </View>
        </View>
        
        <View style={styles.mistakeActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewMistakeDetail(item)}
          >
            <Ionicons name="eye" size={responsiveFontSize(16)} color="#4c669f" />
            <Text style={styles.viewButtonText}>查看详情</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleRemoveMistake(item.questionId)}
          >
            <Ionicons name="trash-bin" size={responsiveFontSize(16)} color="#e74c3c" />
            <Text style={styles.deleteButtonText}>移除</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>错题本</Text>
        <Text style={styles.subtitle}>共{mistakes.length}道错题</Text>
        
        {mistakes.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearAllMistakes}
          >
            <Ionicons name="trash" size={responsiveFontSize(18)} color="#e74c3c" />
            <Text style={styles.clearButtonText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4c669f" />
          <Text style={styles.loadingText}>加载错题中...</Text>
        </View>
      ) : (
        <FlatList
          data={mistakes}
          renderItem={renderMistakeItem}
          keyExtractor={(item) => item.questionId.toString()}
          contentContainerStyle={styles.mistakesList}
          showsVerticalScrollIndicator={true}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={responsiveFontSize(80)} color="#e0e0e0" />
              <Text style={styles.emptyText}>您还没有错题记录</Text>
              <Text style={styles.emptySubText}>答错的题目会自动记录在这里</Text>
              
              <TouchableOpacity 
                style={styles.startExamButton}
                onPress={() => navigation.navigate('Exam')}
              >
                <Text style={styles.startExamText}>开始模拟考试</Text>
                <Ionicons name="arrow-forward" size={responsiveFontSize(16)} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: responsiveWidth(5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: responsiveFontSize(14),
    color: '#666',
    marginLeft: responsiveWidth(2),
    alignSelf: 'flex-end',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#e74c3c',
    fontSize: responsiveFontSize(14),
    marginLeft: responsiveWidth(1),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(16),
    color: '#666',
  },
  mistakesList: {
    padding: responsiveWidth(3),
  },
  mistakeItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: responsiveHeight(2),
    padding: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mistakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  categoryBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.3),
    borderRadius: 12,
  },
  categoryText: {
    color: '#4c669f',
    fontWeight: '500',
    fontSize: responsiveFontSize(12),
  },
  mistakeDate: {
    color: '#999',
    fontSize: responsiveFontSize(12),
  },
  mistakeQuestion: {
    fontSize: responsiveFontSize(16),
    color: '#333',
    marginBottom: responsiveHeight(1.5),
    lineHeight: responsiveFontSize(22),
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: responsiveWidth(2),
  },
  questionImage: {
    width: responsiveWidth(40),
    height: responsiveWidth(40),
  },
  answerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: responsiveWidth(3),
    marginBottom: responsiveHeight(1.5),
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  answerBadge: {
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.2),
    borderRadius: 12,
    marginRight: responsiveWidth(2),
  },
  wrongBadge: {
    backgroundColor: '#ffebee',
  },
  correctBadge: {
    backgroundColor: '#e8f5e9',
  },
  answerBadgeText: {
    fontSize: responsiveFontSize(11),
    fontWeight: '500',
  },
  answerText: {
    flex: 1,
    fontSize: responsiveFontSize(14),
    color: '#444',
  },
  mistakeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: responsiveHeight(1.5),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.8),
    borderRadius: 20,
    marginLeft: responsiveWidth(2),
  },
  viewButton: {
    backgroundColor: '#f0f5ff',
  },
  deleteButton: {
    backgroundColor: '#fff0f0',
  },
  viewButtonText: {
    color: '#4c669f',
    fontSize: responsiveFontSize(14),
    marginLeft: responsiveWidth(1),
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: responsiveFontSize(14),
    marginLeft: responsiveWidth(1),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveWidth(5),
    marginTop: responsiveHeight(10),
  },
  emptyText: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#666',
    marginTop: responsiveHeight(3),
  },
  emptySubText: {
    fontSize: responsiveFontSize(14),
    color: '#999',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(5),
    textAlign: 'center',
  },
  startExamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4c669f',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: 25,
  },
  startExamText: {
    color: '#fff',
    fontSize: responsiveFontSize(16),
    fontWeight: '500',
    marginRight: responsiveWidth(2),
  }
});

export default MistakesScreen; 