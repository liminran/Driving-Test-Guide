import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QuestionLanguageSwitcher from '../components/QuestionLanguageSwitcher';
import assetDataService from '../utils/assetDataService';
import { getImageProps } from '../utils/styleUtils';

// 获取设备尺寸
const { width, height } = Dimensions.get('window');
const responsiveWidth = (percentage) => (width * percentage) / 100;
const responsiveHeight = (percentage) => (height * percentage) / 100;
const responsiveFontSize = (size) => {
  const scaleFactor = Math.min(width, height) / 375;
  return Math.round(size * scaleFactor);
};

const BrowseScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'zh');
  const [error, setError] = useState('');

  // 提取fetchData为组件级函数
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 加载所有题目集
      let allQuestions = await assetDataService.loadAllQuestionSets(currentLanguage);
      
      // 数据验证，确保即使返回无效数据也不崩溃
      if (!Array.isArray(allQuestions)) {
        console.error('题目数据无效，返回空数组');
        allQuestions = [];
      }
      
      // 确保所有题目都有一个有效的ID
      allQuestions = allQuestions
        .filter(q => q && q.id) // 过滤掉没有id的题目
        .map(q => ({
          ...q,
          id: q.id.toString() // 确保ID是字符串类型
        }));
      
      // 记录加载信息
      console.log(`成功加载 ${allQuestions.length} 道题目`);
      setQuestions(allQuestions);
      
      try {
        // 获取所有类别
        const allCategories = await assetDataService.getAllCategories();
        
        // 转换类别格式
        const formattedCategories = [
          { id: 'all', title: '所有题目' },
          ...allCategories.map(cat => ({
            id: cat,
            title: assetDataService.getChineseCategoryName(cat)
          }))
        ];
        
        setCategories(formattedCategories);
      } catch (categoryError) {
        console.error('加载类别失败:', categoryError);
        // 添加默认类别避免崩溃
        setCategories([{ id: 'all', title: '所有题目' }]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('加载题目时出错:', error);
      // 显示用户友好的错误消息
      setError('加载题库失败，请尝试重新启动应用');
      setLoading(false);
    }
  };

  // 语言切换处理函数
  const handleLanguageChange = async (language) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    // 重新加载题目
    fetchData();
  };

  // 加载数据
  useEffect(() => {
    fetchData();
  }, [t]);

  // 过滤题目
  const getFilteredQuestions = () => {
    let filtered = selectedCategory === 'all'
      ? questions
      : questions.filter(q => q.category === selectedCategory);
    
    // 应用搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(query) || 
        (q.id && q.id.toString().includes(query))
      );
    }
    
    return filtered;
  };

  const handleQuestionPress = (question) => {
    if (!question || !question.id) {
      console.error('Cannot navigate: Question or question ID is missing', question);
      Alert.alert('错误', '无法查看题目详情，题目ID不存在');
      return;
    }
    navigation.navigate('QuestionDetail', { questionId: question.id });
  };

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

  const renderQuestionItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.questionCard}
        onPress={() => handleQuestionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.questionHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons name="bookmark-outline" size={14} color="#4c669f" style={{marginRight: 4}} />
            <Text style={styles.categoryLabel}>
              {assetDataService.getChineseCategoryName(item.category)}
            </Text>
          </View>
          <View style={styles.idContainer}>
            <Ionicons name="id-card-outline" size={14} color="#666" style={{marginRight: 4}} />
            <Text style={styles.questionId}>#{item.id}</Text>
          </View>
        </View>
        
        <Text style={styles.questionText}>{item.question}</Text>
        
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
        
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={22} color="#666" />
          </TouchableOpacity>
          <View style={styles.footerRight}>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => handleQuestionPress(item)}
            >
              <Text style={styles.viewButtonText}>查看详情</Text>
              <Ionicons name="chevron-forward" size={16} color="#4c669f" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
        <Text style={styles.loadingText}>加载题库中...</Text>
      </View>
    );
  }
  
  // 添加错误处理界面
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#e74c3c" />
        <Text style={styles.errorTitle}>加载失败</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError('');
            setLoading(true);
            fetchData();
          }}
        >
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredQuestions = getFilteredQuestions();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>浏览题库</Text>
        <Text style={styles.subtitle}>共 {questions.length} 道题目</Text>
      </View>

      <QuestionLanguageSwitcher 
        currentLanguage={currentLanguage} 
        onChangeLanguage={handleLanguageChange} 
      />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索题目关键词..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>分类筛选</Text>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultCount}>
          {filteredQuestions.length} 道{selectedCategory !== 'all' ? assetDataService.getChineseCategoryName(selectedCategory) : ''}题目
        </Text>
      </View>

      <FlatList
        data={filteredQuestions}
        renderItem={renderQuestionItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.questionsList}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={responsiveFontSize(50)} color="#ddd" />
            <Text style={styles.emptyText}>
              没有找到符合条件的题目
            </Text>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetButtonText}>重置筛选条件</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
  header: {
    padding: responsiveWidth(5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: responsiveFontSize(14),
    color: '#666',
    marginTop: responsiveHeight(0.5),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: responsiveWidth(3),
    marginTop: responsiveHeight(1),
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: responsiveWidth(2),
  },
  searchInput: {
    flex: 1,
    height: responsiveHeight(5),
    fontSize: responsiveFontSize(16),
    color: '#333',
  },
  clearButton: {
    padding: responsiveWidth(1),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: responsiveWidth(4),
    marginBottom: responsiveHeight(1),
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoriesList: {
    paddingHorizontal: responsiveWidth(3),
  },
  categoryButton: {
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1),
    marginHorizontal: responsiveWidth(1),
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
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    backgroundColor: '#f8f9fa',
  },
  resultCount: {
    fontSize: responsiveFontSize(14),
    color: '#666',
  },
  questionsList: {
    padding: responsiveWidth(3),
  },
  questionCard: {
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  categoryBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.3),
    borderRadius: 12,
  },
  categoryLabel: {
    color: '#4c669f',
    fontWeight: '500',
    fontSize: responsiveFontSize(12),
  },
  questionId: {
    color: '#999',
    fontSize: responsiveFontSize(12),
  },
  questionText: {
    fontSize: responsiveFontSize(16),
    color: '#333',
    marginVertical: responsiveHeight(1.5),
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    paddingTop: responsiveHeight(1),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  iconButton: {
    padding: responsiveWidth(1),
  },
  footerRight: {
    flexDirection: 'row',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 15,
  },
  viewButtonText: {
    color: '#4c669f',
    fontWeight: '500',
    fontSize: responsiveFontSize(12),
    marginRight: responsiveWidth(1),
  },
  emptyContainer: {
    flex: 1,
    padding: responsiveWidth(5),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveHeight(10),
  },
  emptyText: {
    fontSize: responsiveFontSize(16),
    color: '#999',
    textAlign: 'center',
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(3),
  },
  resetButton: {
    backgroundColor: '#4c669f',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1),
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(5),
  },
  errorTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: responsiveHeight(2),
  },
  errorMessage: {
    fontSize: responsiveFontSize(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: responsiveHeight(3),
  },
  retryButton: {
    backgroundColor: '#4c669f',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1),
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default BrowseScreen; 