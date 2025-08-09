import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addToFavorites, isQuestionFavorited, recordMistake, removeFromFavorites } from '../utils/database';
import { getImageProps } from '../utils/styleUtils';

const QuestionItem = ({ 
  question, 
  showAnswers = true, 
  onAnswerSelected = null, 
  examMode = false,
  disableInteraction = false
}) => {
  const { t } = useTranslation();
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  
  // 检查题目是否已收藏
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const favorited = await isQuestionFavorited(question.id);
      setIsFavorite(favorited);
    };
    
    checkFavoriteStatus();
  }, [question.id]);
  
  // 处理答案选择
  const handleAnswerPress = (answerId, isCorrect) => {
    if (disableInteraction) return;
    
    setSelectedAnswerId(answerId);
    
    if (!examMode) {
      setShowCorrectAnswer(true);
      
      // 如果答案错误，记录错题（带上用户选择）
      if (!isCorrect) {
        recordMistake(question.id, answerId);
      }
    }
    
    if (onAnswerSelected) {
      onAnswerSelected(answerId, isCorrect);
    }
  };
  
  // 处理收藏/取消收藏
  const handleFavoriteToggle = async () => {
    if (isFavorite) {
      await removeFromFavorites(question.id);
    } else {
      await addToFavorites(question.id);
    }
    
    setIsFavorite(!isFavorite);
  };
  
  // 确定答案样式
  const getAnswerStyle = (answer) => {
    if (!selectedAnswerId) return styles.answerButton;
    
    if (answer.id === selectedAnswerId) {
      if (showCorrectAnswer) {
        return answer.correct ? styles.correctAnswerButton : styles.wrongAnswerButton;
      }
      return styles.selectedAnswerButton;
    }
    
    if (showCorrectAnswer && answer.correct) {
      return styles.correctAnswerButton;
    }
    
    return styles.answerButton;
  };
  
  // 确定答案文本样式
  const getAnswerTextStyle = (answer) => {
    if (!selectedAnswerId) return styles.answerText;
    
    if (answer.id === selectedAnswerId || (showCorrectAnswer && answer.correct)) {
      return styles.selectedAnswerText;
    }
    
    return styles.answerText;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{question.question_text}</Text>
        
        {!examMode && (
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Ionicons 
              name={isFavorite ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isFavorite ? '#e74c3c' : '#7f8c8d'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {question.picture && question.picture !== '//' && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: question.picture }} 
            {...getImageProps({
              ...styles.questionImage,
              resizeMode: "contain"
            })}
          />
        </View>
      )}
      
      {showAnswers && (
        <View style={styles.answersContainer}>
          {question.answers.map(answer => (
            <TouchableOpacity
              key={answer.id}
              style={getAnswerStyle(answer)}
              onPress={() => handleAnswerPress(answer.id, answer.correct)}
              disabled={selectedAnswerId !== null && !examMode}
            >
              <Text style={getAnswerTextStyle(answer)}>
                {answer.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  questionImage: {
    width: '100%',
    height: 150,
  },
  answersContainer: {
    marginTop: 12,
  },
  answerButton: {
    backgroundColor: '#f5f6fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  selectedAnswerButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  correctAnswerButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  wrongAnswerButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  selectedAnswerText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});

export default QuestionItem; 