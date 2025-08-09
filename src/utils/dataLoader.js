import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { importQuestions } from './database';

// 静态导入所有JSON文件
// 使用try-catch包装每个导入，避免文件不存在时崩溃
let set0 = [], set1 = [], set2 = [], set3 = [], set4 = [], set5 = [];

// 尝试导入题库文件
try { set0 = require('../../assets/data/setofquestions0.json'); } catch (e) { console.log('题库0不存在'); }
try { set1 = require('../../assets/data/setofquestions1.json'); } catch (e) { console.log('题库1不存在'); }
try { set2 = require('../../assets/data/setofquestions2.json'); } catch (e) { console.log('题库2不存在'); }
try { set3 = require('../../assets/data/setofquestions3.json'); } catch (e) { console.log('题库3不存在'); }
// 加载本地JSON数据文件
export const loadLocalData = async () => {
  try {
    console.log('开始加载本地数据...');
    
    // 使用静态导入的JSON文件
    const questionSets = [
      set0,
      set1,
      set2,
      set3
    ];
    
    console.log(`成功加载${questionSets.length}个JSON文件`);
    
    // 处理和转换数据
    const processedQuestions = processQuestionSets(questionSets);
    console.log(`共处理${processedQuestions.length}道题目`);
    
    // 导入到数据库
    await importQuestions(processedQuestions);
    
    return true;
  } catch (error) {
    console.error('加载本地数据失败:', error);
    return false;
  }
};

// 处理题目集合
const processQuestionSets = (questionSets) => {
  let processedQuestions = [];
  let idCounter = 1;
  
  // 遍历每个题目集合
  questionSets.forEach((set, setIndex) => {
    console.log(`处理第${setIndex}组题目，包含${set.length}道题`);
    
    // 为每个题目添加唯一ID和类别
    const processedSet = set.map(question => {
      // 根据题目集合确定类别
      let category;
      switch (setIndex) {
        case 0:
          category = 'rules';
          break;
        case 1:
          category = 'traffic_signs';
          break;
        case 2:
          category = 'vehicle';
          break;
        case 3:
          category = 'emergency';
          break;
        case 4:
          category = 'safety';
          break;
        default:
          category = 'all';
      }
      
      return {
        ...question,
        id: idCounter++,
        category
      };
    });
    
    processedQuestions = [...processedQuestions, ...processedSet];
  });
  
  return processedQuestions;
};

// 获取题目类别列表
export const getCategories = () => {
  return [
    { id: 'all', name: 'categories.all' },
    { id: 'rules', name: 'categories.rules' },
    { id: 'traffic_signs', name: 'categories.traffic_signs' },
    { id: 'vehicle', name: 'categories.vehicle' },
    { id: 'emergency', name: 'categories.emergency' },
    { id: 'safety', name: 'categories.safety' }
  ];
};

// 随机选择指定数量的题目
export const getRandomQuestionsFromSet = (questions, count) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 从assets目录中加载题库数据
export const loadQuestionsFromAssets = async () => {
  try {
    // 合并所有题库数据
    let allQuestions = [];
    
    if (Platform.OS === 'web') {
      // Web平台直接使用导入的JSON
      allQuestions = [
        ...set0,
        ...set1,
        ...set2,
        ...set3
      ].filter(q => q); // 过滤掉null或undefined
    } else {
      // 原生平台使用FileSystem
      const questionSets = [
        { data: set0, index: 0 },
        { data: set1, index: 1 },
        { data: set2, index: 2 },
        { data: set3, index: 3 }
      ].filter(set => set.data && set.data.length > 0); // 过滤掉空数组
      
      for (const set of questionSets) {
        try {
          const fileUri = FileSystem.documentDirectory + `setofquestions${set.index}.json`;
          
          // 将JSON数据写入文件
          await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(set.data));
          
          // 添加到全部题库
          allQuestions = [...allQuestions, ...set.data];
        } catch (err) {
          console.log(`加载题库集 ${set.index} 失败: ${err.message}`);
        }
      }
    }
    
    // 如果没有加载到任何题目，提供一些示例题目
    if (allQuestions.length === 0) {
      console.log('未找到任何题库数据，加载示例题目');
      allQuestions = [
        {
          id: 1,
          question: "这是一个示例题目，请选择正确答案",
          category: "general",
          answers: [
            { text: "这是正确答案", correct: true },
            { text: "这是错误答案1", correct: false },
            { text: "这是错误答案2", correct: false }
          ]
        },
        {
          id: 2,
          question: "另一个示例题目，请选择正确答案",
          category: "general",
          answers: [
            { text: "这是错误答案1", correct: false },
            { text: "这是正确答案", correct: true },
            { text: "这是错误答案2", correct: false }
          ]
        }
      ];
    }
    
    console.log(`成功加载 ${allQuestions.length} 个题目`);
    return allQuestions;
  } catch (error) {
    console.error('加载题库数据失败:', error);
    // 加载失败时返回一个空数组，避免应用崩溃
    return [];
  }
};

// 返回带有随机选择题目的测试
export const generateRandomTest = (questions, questionCount = 30) => {
  // 如果题目总数少于所需数量，返回所有题目
  if (!questions || questions.length <= questionCount) {
    return questions || [];
  }
  
  // 随机选择指定数量的题目
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, questionCount);
};

// 按类别过滤题目
export const filterQuestionsByCategory = (questions, category) => {
  if (!questions) return [];
  if (!category || category === 'all') return questions;
  
  return questions.filter(q => q.category === category);
}; 