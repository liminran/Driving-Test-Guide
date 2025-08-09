import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getFavoriteQuestions, removeFromFavorites } from '../utils/database';

// 模拟收藏数据
const DUMMY_FAVORITES = [
  {
    id: '1',
    category: '交通规则',
    question: '在捷克，汽车应该在道路的哪一侧行驶？',
    dateAdded: new Date('2023-05-10')
  },
  {
    id: '5',
    category: '交通标志',
    question: '红色三角形内有感叹号的标志表示什么？',
    dateAdded: new Date('2023-05-15')
  },
  {
    id: '9',
    category: '优先通行权',
    question: '在没有交通信号灯的十字路口，谁有优先通行权？',
    dateAdded: new Date('2023-05-20')
  }
];

const FavoritesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // 加载收藏数据的函数
  const loadFavorites = async () => {
    try {
      setLoading(true);
      console.log('Loading favorites...');
      const data = await getFavoriteQuestions();
      console.log(`Loaded ${data.length} favorite items`);
      
      // 处理日期格式
      const processedData = data.map(item => {
        // 确保dateAdded是Date对象
        let dateAdded;
        try {
          dateAdded = item.dateAdded instanceof Date ? 
            item.dateAdded : 
            new Date(item.dateAdded || item.timestamp || Date.now());
        } catch (e) {
          console.error('Error parsing date:', e);
          dateAdded = new Date();
        }
        
        return {
          ...item,
          dateAdded: dateAdded
        };
      });
      
      setFavorites(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setLoading(false);
      setFavorites([]); // 出错时设置为空数组
    }
  };

  useEffect(() => {
    loadFavorites();
    
    // 添加监听器，以便在从问题详情页返回时刷新数据
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

  // 进入/退出编辑模式
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setSelectedItems([]);
  };
  
  // 选择/取消选择项目
  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  // 删除选中的收藏
  const deleteSelected = async () => {
    try {
      // 从收藏列表中移除选中项目
      for (const itemId of selectedItems) {
        await removeFromFavorites(itemId);
      }
      // 重新加载收藏数据
      await loadFavorites();
      setSelectedItems([]);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to delete selected favorites:', error);
    }
  };
  
  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.length === favorites.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(favorites.map(item => item.id));
    }
  };

  const handleQuestionPress = (question) => {
    navigation.navigate('QuestionDetail', { questionId: question.id });
  };

  const renderFavoriteItem = ({ item }) => {
    // 确保日期格式化正确
    let dateString = '';
    try {
      dateString = item.dateAdded instanceof Date ? 
        item.dateAdded.toLocaleDateString() : 
        new Date(item.dateAdded || Date.now()).toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      dateString = new Date().toLocaleDateString();
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.favoriteItem,
          isEditing && selectedItems.includes(item.id) && styles.selectedItem
        ]}
        onPress={() => {
          if (isEditing) {
            toggleSelectItem(item.id);
          } else {
            handleQuestionPress(item);
          }
        }}
        onLongPress={toggleEditMode}
      >
        {isEditing && (
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => toggleSelectItem(item.id)}
          >
            <Ionicons 
              name={selectedItems.includes(item.id) ? "checkbox" : "square-outline"} 
              size={24} 
              color={selectedItems.includes(item.id) ? "#0066cc" : "#ccc"} 
            />
          </TouchableOpacity>
        )}
        <View style={styles.favoriteContent}>
          <View style={styles.favoriteHeader}>
            <Text style={styles.favoriteCategory}>{item.category}</Text>
            <Text style={styles.favoriteDate}>{dateString}</Text>
          </View>
          <Text style={styles.favoriteQuestion}>{item.question}</Text>
          <View style={styles.favoriteActions}>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => handleQuestionPress(item)}
            >
              <Text style={styles.viewButtonText}>查看详情</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('favorites.title')}</Text>
          <Text style={styles.subtitle}>已收藏 {favorites.length} 个题目</Text>
        </View>
        {favorites.length > 0 && (
          <View style={styles.headerButtons}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={styles.headerButton} 
                  onPress={toggleSelectAll}
                >
                  <Text style={styles.headerButtonText}>
                    {selectedItems.length === favorites.length ? '取消全选' : '全选'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.headerButton, styles.deleteButton]} 
                  onPress={deleteSelected}
                  disabled={selectedItems.length === 0}
                >
                  <Text style={[styles.headerButtonText, styles.deleteButtonText]}>
                    删除
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerButton} 
                  onPress={toggleEditMode}
                >
                  <Text style={styles.headerButtonText}>取消</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={toggleEditMode}
              >
                <Text style={styles.headerButtonText}>编辑</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#bdbdbd" />
          <Text style={styles.emptyText}>{t('favorites.noFavorites')}</Text>
        </View>
      )}
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 10,
    padding: 5,
  },
  headerButtonText: {
    color: '#0066cc',
    fontWeight: '500',
    fontSize: 15,
  },
  deleteButton: {
    marginHorizontal: 10,
  },
  deleteButtonText: {
    color: '#F44336',
  },
  listContainer: {
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  checkboxContainer: {
    marginRight: 10,
    justifyContent: 'center',
  },
  favoriteContent: {
    flex: 1,
    marginRight: 8,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  favoriteCategory: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
  favoriteDate: {
    color: '#999',
    fontSize: 14,
  },
  favoriteQuestion: {
    fontSize: 16,
    color: '#333',
  },
  favoriteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#0066cc',
    fontWeight: '500',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default FavoritesScreen; 