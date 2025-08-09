import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import assetDataService from './assetDataService';

/**
 * 修复收藏数据结构问题
 * 会尝试重建收藏数据与题目之间的关联
 */
export const repairFavoritesData = async () => {
  try {
    console.log('开始修复收藏数据...');
    
    // 1. 获取现有收藏数据
    const storedFavorites = await AsyncStorage.getItem('favorites');
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    console.log('现有收藏数量:', favorites.length);
    
    // 2. 获取所有题目
    const allQuestions = await assetDataService.loadAllQuestionSets();
    console.log('题目总数:', allQuestions.length);
    
    // 3. 重新构建有效的收藏数据
    const validFavorites = [];
    let repaired = 0;
    
    for (const fav of favorites) {
      const questionId = fav.questionId || fav.id;
      
      if (!questionId) continue;
      
      const question = allQuestions.find(q => 
        q.id && (q.id.toString() === questionId.toString())
      );
      
      if (question) {
        // 添加有效格式的收藏
        validFavorites.push({
          id: `fav_${question.id}_${Date.now()}`,
          questionId: question.id.toString(),
          dateAdded: fav.dateAdded || Date.now(),
          timestamp: Date.now()
        });
        repaired++;
      }
    }
    
    // 4. 保存修复后的数据
    await AsyncStorage.setItem('favorites', JSON.stringify(validFavorites));
    console.log(`收藏数据修复完成，成功恢复 ${repaired} 个收藏`);
    
    return {
      success: true,
      message: `成功修复 ${repaired} 个收藏数据`
    };
  } catch (error) {
    console.error('修复收藏数据失败:', error);
    return {
      success: false,
      message: error.message 
    };
  }
};

/**
 * 修复错题本清空功能
 */
export const ensureCleanMistakes = async () => {
  try {
    console.log('尝试强制清空错题数据...');
    
    // 直接设置空数组到错题存储
    await AsyncStorage.setItem('mistakes', JSON.stringify([]));
    
    return {
      success: true,
      message: '成功清空错题数据'
    };
  } catch (error) {
    console.error('清空错题数据失败:', error);
    return {
      success: false, 
      message: error.message
    };
  }
};

/**
 * 一次性修复所有已知问题
 */
export const fixAllIssues = async () => {
  try {
    const results = [];
    
    // 1. 修复收藏功能
    const favResult = await repairFavoritesData();
    results.push(`收藏功能: ${favResult.success ? '已修复' : '修复失败'}`);
    
    // 2. 修复错题本
    const mistakeResult = await ensureCleanMistakes();
    results.push(`错题本: ${mistakeResult.success ? '已修复' : '修复失败'}`);
    
    // 3. 重置学习进度数据，修复NaN%问题
    await AsyncStorage.setItem('studyProgress', JSON.stringify([]));
    results.push('学习进度: 已重置');
    
    console.log('所有问题修复完成:', results);
    
    Alert.alert(
      '修复完成',
      results.join('\n'),
      [{ text: '确定', style: 'default' }]
    );
    
    return true;
  } catch (error) {
    console.error('修复问题失败:', error);
    
    Alert.alert(
      '修复失败',
      '修复应用问题时出错: ' + error.message,
      [{ text: '确定', style: 'default' }]
    );
    
    return false;
  }
}; 