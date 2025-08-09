/**
 * JSON修复工具
 * 
 * 用于处理并修复驾考应用中题库JSON文件的格式问题
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

/**
 * 处理JSON解析错误并创建修复后的文件
 * @returns {Promise<boolean>} 是否成功修复
 */
export const fixJsonErrors = async () => {
  try {
    console.log('开始尝试修复JSON错误...');
    
    // 如果当前是Web环境，则使用不同的方法
    if (Platform.OS === 'web') {
      // 在Web环境中，我们可以通过存储一个标记来优先使用fixed版本的JSON
      await AsyncStorage.setItem('useFixedJson', 'true');
      console.log('已设置Web环境优先使用fixed版本的JSON');
      return true;
    }
    
    // 在原生环境中，我们可以直接复制修复后的文件
    const hasFixedFiles = await checkAndCopyFixedFiles();
    
    if (hasFixedFiles) {
      Alert.alert(
        '修复完成',
        '已成功修复JSON文件格式问题，应用将正常加载所有题目。'
      );
      return true;
    } else {
      Alert.alert(
        '修复失败',
        '无法找到修复后的JSON文件或复制过程中出现错误。'
      );
      return false;
    }
  } catch (error) {
    console.error('修复JSON错误失败:', error);
    Alert.alert(
      '修复错误',
      `尝试修复JSON文件时出错: ${error.message}`
    );
    return false;
  }
};

/**
 * 检查并复制修复后的文件
 * @returns {Promise<boolean>} 是否成功复制
 */
const checkAndCopyFixedFiles = async () => {
  try {
    if (!FileSystem) {
      console.log('FileSystem API不可用');
      return false;
    }
    
    // 获取数据目录
    const dataDir = FileSystem.documentDirectory + 'assets/data/';
    
    // 创建目录（如果不存在）
    await FileSystem.makeDirectoryAsync(dataDir, { intermediates: true }).catch(() => {});
    
    // 检查是否存在已修复的文件
    const fixedFiles = [];
    for (let i = 0; i <= 5; i++) {
      const fixedFileName = `setofquestions${i}_fixed.json`;
      const fixedFilePath = `${dataDir}${fixedFileName}`;
      
      try {
        const info = await FileSystem.getInfoAsync(fixedFilePath);
        if (info.exists) {
          fixedFiles.push({
            setNumber: i,
            path: fixedFilePath
          });
        }
      } catch (e) {
        console.log(`检查修复文件 ${fixedFileName} 时出错:`, e);
      }
    }
    
    console.log(`找到 ${fixedFiles.length} 个修复后的文件`);
    
    // 如果没有找到任何修复后的文件，返回失败
    if (fixedFiles.length === 0) {
      return false;
    }
    
    // 复制修复后的文件
    for (const file of fixedFiles) {
      const originalFilePath = `${dataDir}setofquestions${file.setNumber}.json`;
      
      // 备份原始文件
      const backupPath = `${dataDir}setofquestions${file.setNumber}_backup.json`;
      try {
        await FileSystem.copyAsync({
          from: originalFilePath,
          to: backupPath
        });
        console.log(`已备份原始文件: ${originalFilePath} -> ${backupPath}`);
      } catch (e) {
        console.log(`备份文件 ${originalFilePath} 时出错:`, e);
      }
      
      // 复制修复后的文件到原始位置
      try {
        await FileSystem.copyAsync({
          from: file.path,
          to: originalFilePath
        });
        console.log(`已复制修复文件: ${file.path} -> ${originalFilePath}`);
      } catch (e) {
        console.error(`复制修复文件到 ${originalFilePath} 时出错:`, e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('检查和复制修复文件时出错:', error);
    return false;
  }
};

/**
 * 运行所有修复函数
 * @returns {Promise<boolean>} 是否所有修复都成功
 */
export const runAllFixes = async () => {
  try {
    console.log('开始运行所有修复...');
    
    // 修复JSON错误
    const jsonFixResult = await fixJsonErrors();
    console.log('JSON修复结果:', jsonFixResult);
    
    // 这里可以添加更多修复函数
    // ...
    
    return jsonFixResult;
  } catch (error) {
    console.error('执行修复时出错:', error);
    return false;
  }
};

export default {
  fixJsonErrors,
  runAllFixes
}; 