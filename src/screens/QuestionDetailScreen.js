import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QuestionLanguageSwitcher from '../components/QuestionLanguageSwitcher';
import assetDataService from '../utils/assetDataService';
import { addToFavorites, isQuestionFavorited, recordMistake, removeFromFavorites } from '../utils/database';

// 获取设备尺寸
const { width, height } = Dimensions.get('window');
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const responsiveFontSize = (size) => {
  const scaleFactor = Math.min(width, height) / 375;
  return Math.round(size * scaleFactor);
};

const QuestionDetailScreen = ({ route, navigation }) => {
  const { questionId } = route.params;
  const { t, i18n } = useTranslation();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'zh');

  // 语言切换处理函数
  const handleLanguageChange = async (language) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    // 重新加载题目
    await loadQuestion(language);
  };

  // 加载题目详情
  const loadQuestion = async (language = currentLanguage) => {
    try {
      // 检查questionId是否存在
      if (!questionId) {
        console.error('Question ID is undefined');
        setLoading(false);
        return;
      }
      
      // 首先尝试从asset数据中加载题目
      const allQuestions = await assetDataService.loadAllQuestionSets(language);
      const assetQuestion = allQuestions.find(q => q.id && q.id.toString() === questionId.toString());
      
      if (assetQuestion) {
        // 转换题目格式以适应UI
        const formattedQuestion = {
          ...assetQuestion,
          options: assetQuestion.answers.map((ans, index) => ({
            id: String.fromCharCode(65 + index), // 转换为A, B, C...
            text: ans.text,
            isCorrect: ans.correct
          })),
          correctAnswer: assetQuestion.answers.findIndex(ans => ans.correct) >= 0 
            ? String.fromCharCode(65 + assetQuestion.answers.findIndex(ans => ans.correct))
            : 'A',
          explanation: assetQuestion.explanation || '暂无解析',
          category: assetDataService.getChineseCategoryName(assetQuestion.category)
        };
        
        // 使用signalImage属性
        if (assetQuestion.signalImage) {
          formattedQuestion.signalImage = assetQuestion.signalImage;
        }
        
        setQuestion(formattedQuestion);
        
        // 检查是否已收藏
        const favoriteStatus = await isQuestionFavorited(questionId);
        setIsFavorite(favoriteStatus);
      } else {
        // 如果在asset数据中找不到，则提示错误
        console.error('Question not found in asset data:', questionId);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading question:', error);
      setLoading(false);
    }
  };
  
  // 加载数据
  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  // 选择答案
  const selectOption = (optionId) => {
    if (!showAnswer) {
      setSelectedOption(optionId);
    }
  };

  // 检查答案
  const checkAnswer = () => {
    if (selectedOption) {
      setShowAnswer(true);
      const isCorrect = selectedOption === question.correctAnswer;
      setIsAnswerCorrect(isCorrect);
      
      // 如果回答错误，记录错题
      if (!isCorrect) {
        recordMistake(questionId, selectedOption);
      }
    }
  };

  // 下一题
  const nextQuestion = () => {
    // 这里应该加载下一道题，这里简单模拟返回列表
    navigation.goBack();
  };

  // 切换收藏状态
  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(question.id);
      } else {
        await addToFavorites(question.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // 渲染选项
  const renderOption = (option) => {
    const isSelected = selectedOption === option.id;
    const isCorrect = question.correctAnswer === option.id;
    
    let optionStyle = styles.option;
    let textStyle = styles.optionText;
    let iconName = 'ellipse-outline';
    let iconColor = '#999';
    
    if (showAnswer) {
      if (isCorrect) {
        optionStyle = [styles.option, styles.correctOption];
        textStyle = [styles.optionText, styles.correctOptionText];
        iconName = 'checkmark-circle';
        iconColor = '#4CAF50';
      } else if (isSelected && !isCorrect) {
        optionStyle = [styles.option, styles.incorrectOption];
        textStyle = [styles.optionText, styles.incorrectOptionText];
        iconName = 'close-circle';
        iconColor = '#F44336';
      }
    } else if (isSelected) {
      optionStyle = [styles.option, styles.selectedOption];
      textStyle = [styles.optionText, styles.selectedOptionText];
      iconName = 'radio-button-on';
      iconColor = '#4c669f';
    }
    
    return (
      <TouchableOpacity 
        key={option.id} 
        style={optionStyle}
        onPress={() => selectOption(option.id)}
        disabled={showAnswer}
        activeOpacity={0.8}
      >
        <Ionicons name={iconName} size={responsiveFontSize(24)} color={iconColor} style={styles.optionIcon} />
        <Text style={textStyle}>
          {option.id}. {option.text}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
        <Text style={styles.loadingText}>加载题目中...</Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={responsiveFontSize(60)} color="#F44336" />
        <Text style={styles.errorText}>题目加载失败</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>返回上一页</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4c669f" />
      
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={responsiveFontSize(22)} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={responsiveFontSize(22)} 
                color={isFavorite ? '#ff6b6b' : '#fff'} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.categoryText}>{question.category}</Text>
            <Text style={styles.questionIdText}>题目 #{question.id}</Text>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.languageSwitcherContainer}>
          <QuestionLanguageSwitcher 
            currentLanguage={currentLanguage} 
            onChangeLanguage={handleLanguageChange}
          />
        </View>
        
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          
          {question.signalImage && (
            <View style={styles.imageContainer}>
              <Image 
                source={question.signalImage} 
                style={styles.questionImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
        
        <View style={styles.optionsContainer}>
          {question.options.map(option => renderOption(option))}
        </View>
        
        {showAnswer && (
          <View style={styles.resultContainer}>
            <View style={[
              styles.resultBanner,
              isAnswerCorrect ? styles.correctBanner : styles.incorrectBanner
            ]}>
              <Ionicons 
                name={isAnswerCorrect ? 'checkmark-circle' : 'close-circle'} 
                size={responsiveFontSize(24)} 
                color="#fff" 
                style={styles.resultIcon}
              />
              <Text style={styles.resultText}>
                {isAnswerCorrect ? '回答正确！' : '回答错误！'}
              </Text>
            </View>
            
            <View style={styles.explanationContainer}>
              <View style={styles.explanationHeader}>
                <Ionicons name="information-circle" size={responsiveFontSize(20)} color="#F57C00" />
                <Text style={styles.explanationTitle}>解析</Text>
              </View>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          {!showAnswer ? (
            <TouchableOpacity 
              style={[styles.button, !selectedOption && styles.buttonDisabled]} 
              onPress={checkAnswer}
              disabled={!selectedOption}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>提交答案</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.nextButton]} 
              onPress={nextQuestion}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>下一题</Text>
              <Ionicons name="arrow-forward" size={responsiveFontSize(18)} color="#fff" />
            </TouchableOpacity>
          )}
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
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: responsiveWidth(5),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  backBtn: {
    padding: responsiveWidth(1),
  },
  headerInfo: {
    marginTop: responsiveHeight(1),
  },
  categoryText: {
    fontSize: responsiveFontSize(14),
    color: '#e0e0e0',
  },
  questionIdText: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#fff',
    marginTop: responsiveWidth(1),
  },
  favoriteButton: {
    padding: responsiveWidth(1),
  },
  scrollContent: {
    paddingBottom: responsiveHeight(5),
  },
  languageSwitcherContainer: {
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(0.5),
    alignItems: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(5),
  },
  errorText: {
    fontSize: responsiveFontSize(18),
    color: '#F44336',
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(3),
  },
  backButton: {
    backgroundColor: '#4c669f',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1),
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: responsiveFontSize(14),
  },
  questionContainer: {
    padding: responsiveWidth(5),
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: responsiveWidth(3),
    marginTop: responsiveHeight(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: responsiveFontSize(18),
    color: '#333',
    fontWeight: '500',
    lineHeight: responsiveFontSize(26),
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: responsiveHeight(2),
    backgroundColor: '#f9f9f9',
    padding: responsiveWidth(3),
    borderRadius: 8,
  },
  questionImage: {
    width: responsiveWidth(70),
    height: responsiveWidth(70),
  },
  optionsContainer: {
    padding: responsiveWidth(3),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    borderRadius: 10,
    marginBottom: responsiveHeight(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4c669f',
    borderWidth: 1,
  },
  correctOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  incorrectOption: {
    backgroundColor: '#ffebee',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  optionIcon: {
    marginRight: responsiveWidth(3),
  },
  optionText: {
    fontSize: responsiveFontSize(16),
    color: '#333',
    flex: 1,
    lineHeight: responsiveFontSize(22),
  },
  selectedOptionText: {
    color: '#4c669f',
    fontWeight: '500',
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: '#F44336',
    fontWeight: '500',
  },
  resultContainer: {
    marginHorizontal: responsiveWidth(3),
    marginTop: responsiveHeight(2),
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveWidth(3),
    borderRadius: 10,
    marginBottom: responsiveHeight(2),
  },
  correctBanner: {
    backgroundColor: '#4CAF50',
  },
  incorrectBanner: {
    backgroundColor: '#F44336',
  },
  resultIcon: {
    marginRight: responsiveWidth(2),
  },
  resultText: {
    color: '#fff',
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
  },
  explanationContainer: {
    backgroundColor: '#fff8e1',
    borderRadius: 10,
    padding: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  explanationTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: responsiveWidth(2),
  },
  explanationText: {
    fontSize: responsiveFontSize(15),
    color: '#5D4037',
    lineHeight: responsiveFontSize(22),
  },
  buttonContainer: {
    padding: responsiveWidth(5),
    paddingTop: responsiveHeight(3),
  },
  button: {
    backgroundColor: '#4c669f',
    padding: responsiveHeight(1.8),
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    marginRight: responsiveWidth(2),
  }
});

export default QuestionDetailScreen; 