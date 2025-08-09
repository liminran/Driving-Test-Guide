import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QuestionLanguageSwitcher from '../components/QuestionLanguageSwitcher';
import assetDataService from '../utils/assetDataService';
import { recordMistake, saveExamResult, updateStudyProgress } from '../utils/database';
import { recordMistakesBatch } from '../utils/database';
import { getImageProps } from '../utils/styleUtils';

// 获取设备尺寸
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;

// 响应式尺寸工具函数
const responsiveWidth = percentage => (width * percentage) / 100;
const responsiveHeight = percentage => (height * percentage) / 100;
const responsiveFontSize = size => {
  const baseFactor = Math.min(width, height) / 375;
  // 针对小屏幕设备额外缩小字体
  const scaleFactor = isSmallDevice ? baseFactor * 0.85 : 
                      isMediumDevice ? baseFactor * 0.9 : baseFactor;
  return Math.round(size * scaleFactor);
};

// 考试配置
const EXAM_CONFIG = {
  TOTAL_QUESTIONS: 20,           // 考试总题数
  TIME_LIMIT: 45 * 60,           // 考试时间限制（秒）
  PASS_SCORE_PERCENTAGE: 70,     // 通过分数线(百分比)
};

const ExamScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(EXAM_CONFIG.TIME_LIMIT);
  const [results, setResults] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'zh');
  const timerRef = useRef(null);

  // 加载题目
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        
        // 加载所有题目数据，使用当前语言
        const allQuestions = await assetDataService.loadAllQuestionSets(currentLanguage);
        
        // 获取所有类别
        const allCategories = await assetDataService.getAllCategories();
        
        // 构建类别选项
        const categoryItems = [
          { id: 'all', title: '所有题目' },
          ...allCategories.map(cat => ({
            id: cat,
            title: assetDataService.getChineseCategoryName(cat)
          }))
        ];
        
        setCategories(categoryItems);
        setQuestions(allQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading exam questions:', error);
        setLoading(false);
      }
    };
    
    loadQuestions();
    
    // 组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentLanguage]); // 添加currentLanguage作为依赖，当语言改变时重新加载题目

  // 处理语言切换
  const handleLanguageChange = async (language) => {
    // 更新当前语言
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    
    // 如果正在考试中，仅重新加载当前题目的翻译
    if (examStarted && !examFinished) {
      try {
        setLoading(true);
        
        // 获取当前考试题目的翻译版本
        const updatedQuestions = questions.map(q => {
          // 使用assetDataService获取对应语言的题目
          if (q.translations && q.translations[language]) {
            const translation = q.translations[language];
            return {
              ...q,
              question: translation.question,
              answers: translation.answers,
              options: translation.answers.map((ans, idx) => ({
                id: String.fromCharCode(65 + idx), // A, B, C...
                text: ans.text,
                isCorrect: ans.correct
              }))
            };
          }
          // 如果没有对应语言的翻译，保持原样
          return q;
        });
        
        setQuestions(updatedQuestions);
      } catch (error) {
        console.error('Error updating question translations:', error);
        Alert.alert(
          '语言切换失败',
          '更新题目翻译时出现错误，请重试。',
          [{ text: '确定', style: 'cancel' }]
        );
      } finally {
        setLoading(false);
      }
    } else {
      // 如果不在考试中，重新加载所有题目
      try {
        setLoading(true);
        const allQuestions = await assetDataService.loadAllQuestionSets(language);
        setQuestions(allQuestions);
      } catch (error) {
        console.error('Error loading questions for new language:', error);
        Alert.alert(
          '加载失败',
          '加载新语言的题目时出现错误，请重试。',
          [{ text: '确定', style: 'cancel' }]
        );
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 开始考试
  const startExam = async () => {
    // 根据类别筛选题目
    let filteredQuestions = questions;
    if (selectedCategory !== 'all') {
      filteredQuestions = questions.filter(q => q.category === selectedCategory);
    }
    
    // 随机选择题目
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, EXAM_CONFIG.TOTAL_QUESTIONS);
    
    // 格式化题目数据
    const formattedQuestions = selected.map((q, index) => ({
      ...q,
      examId: index + 1,
      options: q.answers.map((ans, idx) => ({
        id: String.fromCharCode(65 + idx), // A, B, C...
        text: ans.text,
        isCorrect: ans.correct
      }))
    }));
    
    // 如果题目不足，提示错误
    if (formattedQuestions.length < EXAM_CONFIG.TOTAL_QUESTIONS) {
      Alert.alert(
        '题目不足',
        `当前类别下只有 ${formattedQuestions.length} 道题目，无法开始考试。`,
        [{ text: '确定', style: 'cancel' }]
      );
      return;
    }
    
    // 初始化考试
    setQuestions(formattedQuestions);
    setCurrentIndex(0);
      setAnswers({});
    setRemainingTime(EXAM_CONFIG.TIME_LIMIT);
    setExamStarted(true);
      setExamFinished(false);
    
    // 开始计时器
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // 时间到，结束考试
          clearInterval(timerRef.current);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 选择答案
  const selectAnswer = (questionId, optionId) => {
    const newAnswers = {
      ...answers,
      [questionId]: optionId
    };
    setAnswers(newAnswers);
  };

  // 完成考试
  const finishExam = async () => {
    try {
      console.log('Finishing exam...');
      
      if (!questions || questions.length === 0) {
        console.error('No questions available');
        Alert.alert('错误', '没有加载到题目数据，无法提交考试');
        return;
      }
      
      // 先设置状态，立即开始转换到结果界面
      setExamFinished(true);
      setExamStarted(false);
      
      // 停止计时
      if (timerRef.current) {
        clearInterval(timerRef.current);
        console.log('Timer stopped');
      }
      
      // 计算结果
      const answeredQuestions = Object.keys(answers).length;
      let correctCount = 0;
      let mistakesCount = 0;
      const questionResults = {};
      
      // 创建一个批量处理错题的数组
      const mistakesToRecord = [];
      
      questions.forEach((question, index) => {
        if (!question || !question.id) {
          console.warn(`Invalid question at index ${index}:`, question);
          return;
        }
        
        const userAnswer = answers[question.id];
        let correctAnswer = 'A'; // 默认值
        
        // 检查题目选项是否存在
        if (question.options && Array.isArray(question.options)) {
          const correctOption = question.options.find(opt => opt.isCorrect);
          if (correctOption) {
            correctAnswer = correctOption.id;
          } else {
            console.warn(`No correct answer found for question ${question.id}`);
          }
        } else {
          console.warn(`Question ${question.id} has invalid options`);
        }
        
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
          correctCount++;
        } else {
          // 包含未作答（userAnswer 为空）的情况
          mistakesCount++;
          mistakesToRecord.push({
            id: question.id,
            userAnswer: userAnswer ?? null
          });
        }
        
        questionResults[question.id] = {
          userAnswer,
          correctAnswer,
          isCorrect
        };
      });
      
      // 记录错题（批量，避免并发写入遗漏）
      if (mistakesToRecord.length > 0) {
        console.log(`Recording ${mistakesToRecord.length} mistakes (batch)...`);
        try {
          await recordMistakesBatch(mistakesToRecord);
          console.log('All mistakes recorded successfully');
        } catch (e) {
          console.error('Error batch recording mistakes:', e);
          // 回退到逐条写入
          try {
            await Promise.all(mistakesToRecord.map(m => recordMistake(m.id, m.userAnswer)));
          } catch (e2) {
            console.error('Fallback single record also failed:', e2);
          }
        }
      }
      
      const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
      const timeSpent = EXAM_CONFIG.TIME_LIMIT - remainingTime;
      const isPassed = score >= EXAM_CONFIG.PASS_SCORE_PERCENTAGE;
      
      // 保存结果
      const examResult = {
        date: new Date().toISOString(),
      score,
        timeSpent,
        totalQuestions: questions.length,
        correctCount,
        incorrectCount: mistakesCount,
        answeredQuestions,
        unansweredQuestions: questions.length - answeredQuestions,
        isPassed,
        questionResults
      };
      
      console.log('Exam result calculated');
      
      // 设置结果状态
      setResults(examResult);
      
      // 保存到数据库
      try {
        await saveExamResult(examResult);
        console.log('Exam result saved to database');
      } catch (error) {
        console.error('Failed to save exam result:', error);
        // 即使保存失败也继续显示结果
      }
      
      // 更新学习进度
      try {
        await updateStudyProgress(answeredQuestions, correctCount, timeSpent);
        console.log('Study progress updated');
      } catch (error) {
        console.error('Failed to update study progress:', error);
      }
        
      console.log('Exam finished successfully, showing results');
    } catch (error) {
      console.error('Error in finishExam:', error);
      Alert.alert(
        '错误',
        '提交考试结果时发生错误，请重试: ' + error.message,
        [{ text: '确定', style: 'default' }]
      );
    }
  };

  // 返回首页
  const goToHome = () => {
    // 导航到首页并传递考试结果参数
    if (results) {
      navigation.navigate('Home', {
        examCompleted: true,
        examResults: {
          score: Math.round(results.score),
          correctCount: results.correctCount,
          incorrectCount: results.incorrectCount,
          date: new Date().toISOString()
        }
      });
    } else {
      navigation.navigate('Home');
    }
  };

  // 查看错题
  const viewMistakes = () => {
    navigation.navigate('Mistakes');
  };

  // 重新考试
  const restartExam = () => {
    setExamStarted(false);
    setExamFinished(false);
    setAnswers({});
    setResults(null);
  };

  // 格式化时间
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 渲染当前题目
  const renderCurrentQuestion = () => {
    const question = questions[currentIndex];
    if (!question) return null;
    
    const userAnswer = answers[question.id];
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            题目 {currentIndex + 1}/{questions.length}
            </Text>
            <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={responsiveFontSize(18)} color="#f57c00" />
            <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
            </View>
          </View>
          
        {/* 添加语言切换器 */}
        <QuestionLanguageSwitcher 
          currentLanguage={currentLanguage} 
          onChangeLanguage={handleLanguageChange} 
        />
        
        <ScrollView style={styles.questionScrollView} showsVerticalScrollIndicator={true}>
          <Text style={styles.questionText}>{question.question}</Text>
          
          {question.signalImage && (
            <View style={styles.imageContainer}>
              <Image 
                source={question.signalImage} 
                {...getImageProps({
                  ...styles.questionImage,
                  resizeMode: 'contain'
                })}
              />
            </View>
          )}
          
          <View style={styles.optionsContainer}>
            {question.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  userAnswer === option.id && styles.selectedOption,
                  examFinished && option.isCorrect && styles.correctOption,
                  examFinished && userAnswer === option.id && !option.isCorrect && styles.incorrectOption
                ]}
                onPress={() => !examFinished && selectAnswer(question.id, option.id)}
                disabled={examFinished}
              >
                <Text style={styles.optionLetter}>{option.id}</Text>
                <Text style={styles.optionText}>{option.text}</Text>
                
                {examFinished && (
                  option.isCorrect ? (
                    <Ionicons name="checkmark-circle" size={responsiveFontSize(20)} color="#4caf50" style={styles.resultIcon} />
                  ) : (
                    userAnswer === option.id && (
                      <Ionicons name="close-circle" size={responsiveFontSize(20)} color="#f44336" style={styles.resultIcon} />
                    )
                  )
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.disabledButton]} 
              onPress={() => {
                if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
              }}
              disabled={currentIndex === 0}
            >
              <Ionicons name="chevron-back" size={responsiveFontSize(22)} color="#4c669f" />
              <Text style={styles.navButtonText}>
                上一题
              </Text>
            </TouchableOpacity>
            
            {currentIndex < questions.length - 1 ? (
              <TouchableOpacity
                style={styles.navButton} 
                onPress={() => setCurrentIndex(currentIndex + 1)}
              >
                <Text style={styles.navButtonText}>下一题</Text>
                <Ionicons name="chevron-forward" size={responsiveFontSize(22)} color="#4c669f" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.submitButton]} 
                onPress={finishExam}
              >
                <Text style={styles.submitButtonText}>交卷</Text>
                <Ionicons name="checkmark-circle" size={responsiveFontSize(22)} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* 添加足够的底部间距，确保按钮完全可见 */}
          <View style={{ height: 100 }} />
        </ScrollView>
        
        <View style={styles.progressContainer}>
          <FlatList
            horizontal
            data={questions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={[
                  styles.progressItem, 
                  index === currentIndex && styles.activeProgressItem,
                  answers[item.id] && styles.answeredProgressItem
                ]}
                onPress={() => setCurrentIndex(index)}
              >
                <Text 
                  style={[
                    styles.progressItemText,
                    index === currentIndex && styles.activeProgressItemText,
                    answers[item.id] && styles.answeredProgressItemText
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.progressList}
          />
        </View>
      </View>
    );
  };
  
  // 渲染考试结果
  const renderExamResults = () => {
    if (!results) {
      console.error('No results available to render');
    return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={responsiveFontSize(50)} color="#F44336" />
          <Text style={styles.errorText}>考试结果加载失败</Text>
          <TouchableOpacity style={styles.actionButton} onPress={goToHome}>
            <Text style={styles.actionButtonText}>返回首页</Text>
          </TouchableOpacity>
      </View>
    );
  }
    
    const {
      score,
      timeSpent,
      totalQuestions,
      correctCount,
      incorrectCount,
      answeredQuestions,
      unansweredQuestions,
      isPassed
    } = results;
    
    console.log('Rendering exam results:', { score, isPassed });
  
  return (
      <ScrollView style={styles.resultsScrollView} contentContainerStyle={styles.resultsContent}>
        <View style={styles.examFinishedBanner}>
          <Ionicons name="checkmark-circle" size={responsiveFontSize(30)} color="#fff" />
          <Text style={styles.examFinishedText}>考试已完成</Text>
        </View>
        
        <View style={styles.resultHeader}>
          <LinearGradient
            colors={isPassed ? ['#43a047', '#2e7d32'] : ['#e53935', '#c62828']}
            style={styles.resultBanner}
          >
            <Text style={styles.resultText}>
              {isPassed ? '考试通过' : '考试未通过'}
            </Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{Math.round(score)}%</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.resultStats}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
                <Text style={styles.statLabel}>耗时</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalQuestions}</Text>
                <Text style={styles.statLabel}>总题数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{answeredQuestions}</Text>
                <Text style={styles.statLabel}>已答题</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>{correctCount}</Text>
                <Text style={styles.statLabel}>答对</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#F44336' }]}>{incorrectCount}</Text>
                <Text style={styles.statLabel}>答错</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FFC107' }]}>{unansweredQuestions}</Text>
                <Text style={styles.statLabel}>未答</Text>
              </View>
            </View>
          </View>
            </View>
            
        <View style={styles.resultMessage}>
          <Text style={styles.messageText}>
            {isPassed 
              ? '恭喜您通过了考试！您可以查看错题，继续练习提高成绩。' 
              : '很遗憾，您未通过考试。建议查看错题，继续练习，再次尝试。'}
          </Text>
        </View>
        
        {incorrectCount > 0 && (
          <View style={styles.mistakesInfoCard}>
            <View style={styles.mistakesInfoHeader}>
              <Ionicons name="information-circle" size={responsiveFontSize(22)} color="#1976D2" />
              <Text style={styles.mistakesInfoTitle}>错题已自动收录</Text>
            </View>
            <Text style={styles.mistakesInfoText}>
              本次考试中的 {incorrectCount} 道错题已被自动收录到错题本，您可以随时通过"错题本"进行复习和练习。
            </Text>
          </View>
        )}
        
        <View style={styles.resultActions}>
              <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonWide]} 
            onPress={viewMistakes}
              >
            <Ionicons name="alert-circle" size={responsiveFontSize(20)} color="#F57C00" />
            <Text style={styles.actionButtonText}>查看错题</Text>
              </TouchableOpacity>
          
              <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonWide]} 
            onPress={restartExam}
          >
            <Ionicons name="refresh" size={responsiveFontSize(20)} color="#4CAF50" />
            <Text style={styles.actionButtonText}>再考一次</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonWide, styles.primaryButton]} 
            onPress={goToHome}
          >
            <Ionicons name="home" size={responsiveFontSize(20)} color="#fff" />
            <Text style={[styles.actionButtonText, { color: '#fff' }]}>返回首页</Text>
              </TouchableOpacity>
            </View>
      </ScrollView>
    );
  };

  // 渲染类别选择
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text 
        style={[
          styles.categoryButtonText,
          selectedCategory === item.id && styles.categoryButtonTextActive
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  // 渲染考试准备界面
  const renderExamPreparation = () => {
    return (
      <View style={styles.prepContainer}>
        <View style={styles.examInfoCard}>
          <Text style={styles.examTitle}>驾照理论考试</Text>
          <Text style={styles.examDescription}>
            本次考试共{EXAM_CONFIG.TOTAL_QUESTIONS}道题，时间限制{Math.floor(EXAM_CONFIG.TIME_LIMIT / 60)}分钟，
            通过分数线为{EXAM_CONFIG.PASS_SCORE_PERCENTAGE}%。请选择考试类别，准备好后点击"开始考试"按钮。
          </Text>
          
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>选择考试类别</Text>
            <FlatList
              horizontal
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
          
          <View style={styles.examRules}>
            <Text style={styles.ruleTitle}>考试须知：</Text>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark" size={responsiveFontSize(16)} color="#4CAF50" />
              <Text style={styles.ruleText}>题目为随机选择，每次考试题目不同</Text>
        </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark" size={responsiveFontSize(16)} color="#4CAF50" />
              <Text style={styles.ruleText}>可任意切换题目顺序作答</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark" size={responsiveFontSize(16)} color="#4CAF50" />
              <Text style={styles.ruleText}>达到时间限制后将自动交卷</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark" size={responsiveFontSize(16)} color="#4CAF50" />
              <Text style={styles.ruleText}>考试记录将被保存，可在首页查看</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={startExam}
        >
          <Text style={styles.startButtonText}>开始考试</Text>
          <Ionicons name="arrow-forward-circle" size={responsiveFontSize(20)} color="#fff" />
        </TouchableOpacity>
    </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
        <Text style={styles.loadingText}>加载考试中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {!examStarted && !examFinished && renderExamPreparation()}
      {examStarted && !examFinished && renderCurrentQuestion()}
      {examFinished && renderExamResults()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  prepContainer: {
    flex: 1,
    padding: responsiveWidth(5),
    justifyContent: 'center',
  },
  examInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: responsiveWidth(5),
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
      },
      android: {
        elevation: 3
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
      }
    }),
  },
  examTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: responsiveHeight(2),
  },
  examDescription: {
    fontSize: responsiveFontSize(14),
    color: '#666',
    marginBottom: responsiveHeight(3),
    lineHeight: responsiveFontSize(20),
    textAlign: 'center',
  },
  categoriesContainer: {
    marginVertical: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: responsiveHeight(1.5),
  },
  categoriesList: {
    paddingVertical: responsiveHeight(1),
  },
  categoryButton: {
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1),
    marginRight: responsiveWidth(2),
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#4c669f',
  },
  categoryButtonText: {
    fontSize: responsiveFontSize(14),
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  examRules: {
    marginTop: responsiveHeight(2),
  },
  ruleTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: responsiveHeight(1.5),
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  ruleText: {
    fontSize: responsiveFontSize(14),
    color: '#555',
    marginLeft: responsiveWidth(2),
  },
  startButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveHeight(1.8),
    borderRadius: 10,
    marginTop: responsiveHeight(4),
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
      },
      android: {
        elevation: 4
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
      }
    }),
  },
  startButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    marginRight: responsiveWidth(2),
  },
  // 考试界面样式
  questionContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  questionHeader: {
    backgroundColor: '#4c669f',
    padding: responsiveWidth(4),
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight + responsiveHeight(1)) : responsiveHeight(1),
    paddingBottom: responsiveHeight(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionNumber: {
    color: '#fff',
    fontSize: responsiveFontSize(15),
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 20,
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: responsiveWidth(1),
    fontSize: responsiveFontSize(14),
  },
  questionText: {
    fontSize: responsiveFontSize(16),
    color: '#333',
    fontWeight: '500',
    lineHeight: responsiveFontSize(24),
    padding: responsiveWidth(4),
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
    backgroundColor: '#f9f9f9',
    margin: responsiveWidth(4),
    padding: responsiveWidth(2),
    borderRadius: 8,
  },
  questionImage: {
    width: responsiveWidth(65),
    height: responsiveWidth(65),
  },
  optionsContainer: {
    padding: responsiveWidth(4),
    paddingTop: 0,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: responsiveWidth(3.5),
    borderRadius: 10,
    marginBottom: responsiveHeight(1.5),
    ...Platform.select({
      ios: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
      }
    }),
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4c669f',
    borderWidth: 1,
  },
  correctOption: {
    backgroundColor: '#d3f2d3',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  incorrectOption: {
    backgroundColor: '#f2d3d3',
    borderColor: '#f44336',
    borderWidth: 1,
  },
  optionLetter: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#666',
    marginRight: responsiveWidth(3),
  },
  optionText: {
    fontSize: responsiveFontSize(15),
    color: '#333',
    flex: 1,
    lineHeight: responsiveFontSize(22),
  },
  resultIcon: {
    marginLeft: responsiveWidth(2),
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1),
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
  },
  navButtonText: {
    color: '#4c669f',
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#ccc',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: responsiveWidth(5),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    marginRight: responsiveWidth(2),
  },
  progressContainer: {
    paddingHorizontal: responsiveWidth(5),
    paddingBottom: responsiveHeight(2),
  },
  progressList: {
    paddingVertical: responsiveHeight(1),
  },
  progressItem: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveWidth(2),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeProgressItem: {
    backgroundColor: '#4c669f',
    borderColor: '#3b5998',
  },
  answeredProgressItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4c669f',
  },
  progressItemText: {
    fontSize: responsiveFontSize(12),
    fontWeight: '500',
    color: '#666',
  },
  activeProgressItemText: {
    color: '#fff',
  },
  answeredProgressItemText: {
    color: '#4c669f',
  },
  // 结果页样式
  resultsContainer: {
    flex: 1,
    padding: responsiveWidth(5),
  },
  resultsScrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  resultsContent: {
    padding: responsiveWidth(5),
    paddingBottom: responsiveHeight(5),
  },
  resultHeader: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: responsiveHeight(3),
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
      },
      android: {
        elevation: 3
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
      }
    }),
  },
  resultBanner: {
    padding: responsiveHeight(3),
    alignItems: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
    textAlign: 'center',
  },
  scoreCircle: {
    width: responsiveWidth(25),
    height: responsiveWidth(25),
    borderRadius: responsiveWidth(12.5),
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    color: '#fff',
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
  },
  resultStats: {
    padding: responsiveWidth(5),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(2),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: responsiveFontSize(12),
    color: '#666',
    marginTop: responsiveHeight(0.5),
  },
  resultMessage: {
    padding: responsiveWidth(5),
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: responsiveHeight(3),
    ...Platform.select({
      ios: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
      }
    }),
  },
  messageText: {
    fontSize: responsiveFontSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: responsiveFontSize(24),
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: responsiveHeight(1.5),
    borderRadius: 10,
    margin: responsiveWidth(1),
    ...Platform.select({
      ios: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
      }
    }),
    minWidth: responsiveWidth(28),
  },
  actionButtonWide: {
    minWidth: responsiveWidth(42),
    marginVertical: responsiveHeight(1),
  },
  actionButtonText: {
    color: '#4c669f',
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    marginLeft: responsiveWidth(2),
  },
  questionScrollView: {
    flex: 1,
    width: '100%',
    paddingHorizontal: responsiveWidth(4),
    marginBottom: 10,
  },
  bottomPadding: {
    height: responsiveHeight(2),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginBottom: responsiveHeight(2),
    fontSize: responsiveFontSize(16),
    color: '#666',
  },
  mistakesInfoCard: {
    padding: responsiveWidth(5),
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: responsiveHeight(3),
    ...Platform.select({
      ios: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0,0,0,0.1)'
      }
    }),
  },
  mistakesInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  mistakesInfoTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: responsiveWidth(2),
  },
  mistakesInfoText: {
    fontSize: responsiveFontSize(14),
    color: '#666',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
      },
      android: {
        elevation: 4
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
      }
    }),
  },
  examFinishedBanner: {
    padding: responsiveHeight(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4c669f',
    borderRadius: 10,
    marginBottom: responsiveHeight(2),
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
      },
      android: {
        elevation: 3
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
      }
    }),
  },
  examFinishedText: {
    color: '#fff',
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    marginLeft: responsiveWidth(2),
  },
});

export default ExamScreen; 