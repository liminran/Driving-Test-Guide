import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import assetDataService from './assetDataService';

// 模拟数据
import { questions } from '../data/mockData';

// 判断是否是Web平台
const isWeb = Platform.OS === 'web';

// 获取数据库连接
const getDatabase = () => {
  if (isWeb) {
    // Web平台使用AsyncStorage模拟数据库
    return null;
  } else {
    // 原生平台使用SQLite
    return SQLite.openDatabase('driving_license.db');
  }
};

// 初始化数据库
export const initDatabase = async () => {
  if (isWeb) {
    // Web平台使用AsyncStorage存储数据
    try {
      const storedQuestions = await AsyncStorage.getItem('questions');
      if (!storedQuestions) {
        // 如果没有存储过题目数据，则存储模拟数据
        await AsyncStorage.setItem('questions', JSON.stringify(questions));
      }
      
      // 初始化收藏和错题记录
      const favorites = await AsyncStorage.getItem('favorites');
      if (!favorites) {
        await AsyncStorage.setItem('favorites', JSON.stringify([]));
      }
      
      const mistakes = await AsyncStorage.getItem('mistakes');
      if (!mistakes) {
        await AsyncStorage.setItem('mistakes', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Failed to initialize web database:', error);
    }
  } else {
    // 原生平台使用SQLite
    const db = getDatabase();
    
    // 创建题目表
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          category TEXT,
          question TEXT,
          options TEXT,
          correctAnswer TEXT,
          explanation TEXT,
          imageUrl TEXT,
          difficulty TEXT
        );`
      );
      
      // 创建收藏表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          questionId TEXT UNIQUE,
          timestamp INTEGER
        );`
      );
      
      // 创建错题表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS mistakes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          questionId TEXT,
          userAnswer TEXT,
          timestamp INTEGER,
          UNIQUE(questionId)
        );`
      );
      
      // 创建考试记录表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS exam_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          score REAL,
          timeSpent INTEGER,
          totalQuestions INTEGER,
          correctCount INTEGER,
          incorrectCount INTEGER,
          answeredQuestions INTEGER,
          unansweredQuestions INTEGER,
          isPassed INTEGER,
          details TEXT
        );`
      );
      
      // 创建学习进度表
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS study_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          questionsAnswered INTEGER,
          correctAnswers INTEGER,
          timeSpent INTEGER
        );`
      );
    }, error => {
      console.error('Error creating tables:', error);
    }, () => {
      // 检查是否需要插入初始数据
      checkAndInsertInitialData(db);
    });
  }
};

// 检查并插入初始数据
const checkAndInsertInitialData = (db) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT COUNT(*) as count FROM questions;',
      [],
      (_, { rows }) => {
        const count = rows._array[0].count;
        if (count === 0) {
          // 如果没有数据，插入模拟数据
          insertMockData(db);
        }
      }
    );
  }, error => {
    console.error('Error checking initial data:', error);
  });
};

// 插入模拟数据
const insertMockData = (db) => {
  db.transaction(tx => {
    questions.forEach(question => {
      tx.executeSql(
        `INSERT INTO questions (id, category, question, options, correctAnswer, explanation, imageUrl, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          question.id,
          question.category,
          question.question,
          JSON.stringify(question.options),
          question.correctAnswer,
          question.explanation,
          question.imageUrl,
          question.difficulty
        ]
      );
    });
  }, error => {
    console.error('Error inserting mock data:', error);
  }, () => {
    console.log('Mock data inserted successfully');
  });
};

// 获取所有题目
export const getAllQuestions = async () => {
  if (isWeb) {
    try {
      const storedQuestions = await AsyncStorage.getItem('questions');
      return storedQuestions ? JSON.parse(storedQuestions) : [];
    } catch (error) {
      console.error('Failed to get questions from web storage:', error);
      return [];
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM questions;',
          [],
          (_, { rows }) => {
            const questions = rows._array.map(item => ({
              ...item,
              options: JSON.parse(item.options)
            }));
            resolve(questions);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 按类别获取题目
export const getQuestionsByCategory = async (category) => {
  if (isWeb) {
    try {
      const storedQuestions = await AsyncStorage.getItem('questions');
      const allQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
      return category === 'all' 
        ? allQuestions 
        : allQuestions.filter(q => q.category === category);
    } catch (error) {
      console.error('Failed to get questions by category from web storage:', error);
      return [];
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const query = category === 'all' 
        ? 'SELECT * FROM questions;' 
        : 'SELECT * FROM questions WHERE category = ?;';
      const params = category === 'all' ? [] : [category];
      
      db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const questions = rows._array.map(item => ({
              ...item,
              options: JSON.parse(item.options)
            }));
            resolve(questions);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 获取随机题目
export const getRandomQuestions = async (count = 25) => {
  const allQuestions = await getAllQuestions();
  
  // 随机打乱题目顺序
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  
  // 返回指定数量的题目
  return shuffled.slice(0, count);
};

// 获取题目详情
export const getQuestionById = async (id) => {
  if (isWeb) {
    try {
      const storedQuestions = await AsyncStorage.getItem('questions');
      const allQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
      return allQuestions.find(q => q.id === id) || null;
    } catch (error) {
      console.error('Failed to get question by id from web storage:', error);
      return null;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM questions WHERE id = ?;',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const question = rows._array[0];
              question.options = JSON.parse(question.options);
              resolve(question);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 获取完整题目信息（包括收藏状态和错题记录）
export const getCompleteQuestion = async (id) => {
  try {
    // 从所有题目中找到匹配的题目
    const allQuestions = await assetDataService.loadAllQuestionSets();
    const question = allQuestions.find(q => q.id.toString() === id.toString());
    
    if (!question) {
      return null;
    }
    
    // 获取收藏状态
    const isFavorite = await isQuestionFavorited(id);
    
    // 转换答案格式
    const formattedQuestion = {
      ...question,
      options: question.answers.map((ans, index) => ({
        id: String.fromCharCode(65 + index), // 转换为A, B, C...
        text: ans.text,
        isCorrect: ans.correct
      })),
      isFavorite: isFavorite
    };
    
    return formattedQuestion;
  } catch (error) {
    console.error('Error getting complete question:', error);
    return null;
  }
};

// 添加收藏
export const addToFavorites = async (questionId) => {
  if (!questionId) {
    console.error('addToFavorites: No questionId provided');
    return false;
  }
  
  const now = Date.now();
  console.log(`Adding question ID ${questionId} to favorites`);
  
  if (isWeb) {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      // 检查是否已收藏
      const existingIndex = favorites.findIndex(f => {
        const fId = f.questionId?.toString() || f.id?.toString() || '';
        const qId = questionId.toString();
        return fId === qId;
      });
      
      if (existingIndex >= 0) {
        console.log(`Question ${questionId} already in favorites`);
        return true;
      }
      
      // 添加新收藏
      favorites.push({
        id: `fav_${questionId}_${now}`,
        questionId: questionId.toString(),
        dateAdded: now,
        timestamp: now
      });
      
      console.log(`Saving favorites with new item: ${favorites.length} items total`);
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Failed to add to favorites in web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        // 检查是否已收藏
        tx.executeSql(
          'SELECT * FROM favorites WHERE questionId = ?;',
          [questionId],
          (_, { rows }) => {
            if (rows.length === 0) {
              // 如果未收藏，则添加
              tx.executeSql(
                'INSERT INTO favorites (questionId, timestamp) VALUES (?, ?);',
                [questionId.toString(), now],
                () => resolve(true),
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            } else {
              // 已收藏，直接返回成功
              resolve(true);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 移除收藏
export const removeFromFavorites = async (questionId) => {
  if (!questionId) {
    console.error('removeFromFavorites: No questionId provided');
    return false;
  }
  
  console.log(`Removing question ID ${questionId} from favorites`);
  
  if (isWeb) {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      // 过滤掉指定的收藏
      const updatedFavorites = favorites.filter(f => {
        const fId = f.questionId?.toString() || f.id?.toString() || '';
        const qId = questionId.toString();
        const result = fId !== qId;
        if (!result) {
          console.log(`Found favorite to remove: ${fId} = ${qId}`);
        }
        return result;
      });
      
      console.log(`Updated favorites: from ${favorites.length} to ${updatedFavorites.length}`);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites in web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM favorites WHERE questionId = ?;',
          [questionId],
          () => resolve(true),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 检查是否已收藏
export const isQuestionFavorited = async (questionId) => {
  if (!questionId) {
    console.error('isQuestionFavorited: No questionId provided');
    return false;
  }
  
  if (isWeb) {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      // 检查是否存在匹配的收藏
      const found = favorites.some(f => {
        const fId = f.questionId?.toString() || f.id?.toString() || '';
        const qId = questionId.toString();
        return fId === qId;
      });
      
      console.log(`Question ${questionId} is${found ? '' : ' not'} favorited`);
      return found;
    } catch (error) {
      console.error('Failed to check favorite status in web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM favorites WHERE questionId = ?;',
          [questionId],
          (_, { rows }) => {
            resolve(rows.length > 0);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 获取所有收藏题目
export const getFavoriteQuestions = async () => {
  console.log('Getting favorite questions');
  
  if (isWeb) {
    try {
      // 1. 获取收藏列表
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      console.log(`Found ${favorites.length} favorites in storage`);
      
      // 没有收藏，直接返回空数组
      if (favorites.length === 0) {
        return [];
      }
      
      // 2. 加载所有题目
      const allQuestions = await assetDataService.loadAllQuestionSets();
      console.log(`Loaded ${allQuestions.length} questions to match with favorites`);
      
      // 3. 匹配收藏的题目
      const favoriteQuestions = [];
      
      for (const favorite of favorites) {
        const questionId = favorite.questionId || favorite.id;
        if (!questionId) continue;
        
        // 查找对应的题目
        const question = allQuestions.find(q => {
          return q.id && q.id.toString() === questionId.toString();
        });
        
        if (question) {
          // 处理日期
          let dateAdded;
          try {
            dateAdded = new Date(favorite.dateAdded || favorite.timestamp || Date.now());
          } catch (e) {
            dateAdded = new Date();
          }
          
          favoriteQuestions.push({
            ...question,
            id: question.id,
            question: question.question,
            category: question.category,
            dateAdded: dateAdded,
            timestamp: favorite.timestamp || Date.now()
          });
        }
      }
      
      console.log(`Returning ${favoriteQuestions.length} matched favorite questions`);
      return favoriteQuestions;
    } catch (error) {
      console.error('Failed to get favorite questions from web storage:', error);
      return [];
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          `SELECT q.*, f.timestamp as dateAdded 
          FROM questions q
          INNER JOIN favorites f ON q.id = f.questionId
          ORDER BY f.timestamp DESC;`,
          [],
          (_, { rows }) => {
            const questions = rows._array.map(item => {
              // 转换日期
              let dateAdded;
              try {
                dateAdded = new Date(item.dateAdded);
              } catch (e) {
                dateAdded = new Date();
              }
              
              return {
                ...item,
                options: item.options ? JSON.parse(item.options) : [],
                dateAdded: dateAdded
              };
            });
            resolve(questions);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 记录错题
export const recordMistake = async (questionId, userAnswer) => {
  const nowIso = new Date().toISOString();
  const nowTs = Date.now();
  const mistakeId = `mistake_${questionId}_${nowTs}`;
  
  if (isWeb) {
    try {
      const storedMistakes = await AsyncStorage.getItem('mistakes');
      const mistakes = storedMistakes ? JSON.parse(storedMistakes) : [];
      
      // 统一用字符串比较，避免类型不一致导致查找失败
      const existingIndex = mistakes.findIndex(m => (m.questionId?.toString() || '') === questionId.toString());
      
      if (existingIndex >= 0) {
        // 更新已有错题记录，并刷新排序时间戳
        mistakes[existingIndex].attempts = (mistakes[existingIndex].attempts || 0) + 1;
        mistakes[existingIndex].lastAttempt = nowIso;
        mistakes[existingIndex].userAnswer = userAnswer ?? mistakes[existingIndex].userAnswer ?? null;
        mistakes[existingIndex].timestamp = nowTs;
      } else {
        // 添加新错题记录
        mistakes.push({
          id: mistakeId,
          questionId: questionId?.toString(),
          attempts: 1,
          lastAttempt: nowIso,
          userAnswer: userAnswer ?? null,
          timestamp: nowTs
        });
      }
      
      await AsyncStorage.setItem('mistakes', JSON.stringify(mistakes));
      return true;
    } catch (error) {
      console.error('Failed to record mistake in web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        // 确保表结构包含需要的列
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS mistakes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            questionId TEXT UNIQUE,
            userAnswer TEXT,
            timestamp INTEGER
          );`
        );
        
        // 查询是否已存在该错题
        tx.executeSql(
          'SELECT * FROM mistakes WHERE questionId = ?;',
          [questionId.toString()],
          (_, { rows }) => {
            if (rows.length === 0) {
              // 插入新记录
              tx.executeSql(
                'INSERT INTO mistakes (questionId, userAnswer, timestamp) VALUES (?, ?, ?);',
                [questionId.toString(), userAnswer ?? null, nowTs],
                () => resolve(true),
                (_, error) => { reject(error); return false; }
              );
            } else {
              // 更新已有记录（刷新时间戳以便最新排序）
              tx.executeSql(
                'UPDATE mistakes SET userAnswer = ?, timestamp = ? WHERE questionId = ?;',
                [userAnswer ?? rows._array[0].userAnswer ?? null, nowTs, questionId.toString()],
                () => resolve(true),
                (_, error) => { reject(error); return false; }
              );
            }
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  }
};

// 批量记录错题
export const recordMistakesBatch = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return true;
  const nowTs = Date.now();
  const nowIso = new Date(nowTs).toISOString();

  if (isWeb) {
    try {
      const stored = await AsyncStorage.getItem('mistakes');
      const mistakes = stored ? JSON.parse(stored) : [];

      const byId = new Map(mistakes.map(m => [ (m.questionId?.toString() || ''), m ]));
      for (const it of items) {
        const qid = it.id?.toString() || it.questionId?.toString();
        if (!qid) continue;
        const existing = byId.get(qid);
        if (existing) {
          existing.attempts = (existing.attempts || 0) + 1;
          existing.lastAttempt = nowIso;
          if (it.userAnswer !== undefined) existing.userAnswer = it.userAnswer;
          existing.timestamp = nowTs;
        } else {
          byId.set(qid, {
            id: `mistake_${qid}_${nowTs}`,
            questionId: qid,
            attempts: 1,
            lastAttempt: nowIso,
            userAnswer: it.userAnswer ?? null,
            timestamp: nowTs
          });
        }
      }
      const merged = Array.from(byId.values());
      await AsyncStorage.setItem('mistakes', JSON.stringify(merged));
      return true;
    } catch (e) {
      console.error('Failed to batch record mistakes (web):', e);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        // ensure table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS mistakes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            questionId TEXT UNIQUE,
            userAnswer TEXT,
            timestamp INTEGER
          );`
        );
        for (const it of items) {
          const qid = (it.id ?? it.questionId)?.toString();
          if (!qid) continue;
          const ua = it.userAnswer ?? null;
          tx.executeSql(
            'INSERT OR REPLACE INTO mistakes (questionId, userAnswer, timestamp) VALUES (?, ?, ?);',
            [qid, ua, nowTs]
          );
        }
      }, error => {
        console.error('Batch record mistakes failed (native):', error);
        reject(error);
      }, () => resolve(true));
    });
  }
};

// 将getMistakes函数定义放在前面，确保正确导出
export const getMistakes = async () => {
  if (isWeb) {
    try {
      const mistakesData = await AsyncStorage.getItem('mistakes');
      const list = mistakesData ? JSON.parse(mistakesData) : [];
      // 保证按时间倒序返回
      return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (error) {
      console.error('Failed to get mistake questions from web storage:', error);
      return [];
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          `SELECT m.questionId, m.userAnswer, m.timestamp FROM mistakes m 
           ORDER BY m.timestamp DESC;`,
          [],
          (_, { rows }) => { resolve(rows._array); },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  }
};

// 获取错题记录 (保留此函数作为兼容)
export const getMistakeQuestions = getMistakes;

/**
 * 删除单个错题记录
 * @param {string} questionId - 题目ID
 * @returns {Promise}
 */
export const removeMistake = async (questionId) => {
  if (!questionId) {
    console.error('removeMistake: No questionId provided');
    return false;
  }
  
  console.log(`Attempting to remove mistake with ID: ${questionId}`);
  
  if (isWeb) {
    try {
      const storedMistakes = await AsyncStorage.getItem('mistakes');
      const mistakes = storedMistakes ? JSON.parse(storedMistakes) : [];
      console.log(`Current mistakes count: ${mistakes.length}`);
      
      // 过滤掉指定的错题
      const updatedMistakes = mistakes.filter(m => {
        // 确保正确比较字符串形式的ID
        const mId = m.questionId?.toString() || '';
        const qId = questionId.toString();
        const result = mId !== qId;
        if (!result) {
          console.log(`Found mistake to remove: ${mId} = ${qId}`);
        }
        return result;
      });
      
      console.log(`Updated mistakes count: ${updatedMistakes.length}`);
      
      // 更新存储
      await AsyncStorage.setItem('mistakes', JSON.stringify(updatedMistakes));
      return true;
    } catch (error) {
      console.error('Failed to remove mistake in web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM mistakes WHERE questionId = ?;',
          [questionId.toString()],
          (_, { rowsAffected }) => {
            console.log(`Removed ${rowsAffected} mistake records for ID: ${questionId}`);
            resolve(rowsAffected > 0);
          },
          (_, error) => {
            console.error(`SQL error removing mistake ${questionId}:`, error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

/**
 * 清空所有错题记录
 * @returns {Promise}
 */
export const clearMistakes = async () => {
  console.log('清空所有错题记录');
  
  if (isWeb) {
    try {
      // 获取现有错题数量以便记录
      const storedMistakes = await AsyncStorage.getItem('mistakes');
      const mistakes = storedMistakes ? JSON.parse(storedMistakes) : [];
      console.log(`Clearing ${mistakes.length} mistakes from web storage`);
      
      // 清空错题
      await AsyncStorage.setItem('mistakes', JSON.stringify([]));
      
      // 验证是否成功清空
      const afterClear = await AsyncStorage.getItem('mistakes');
      const afterMistakes = afterClear ? JSON.parse(afterClear) : null;
      console.log('After clear:', afterMistakes);
      
      return true;
    } catch (error) {
      console.error('Failed to clear mistakes in web storage:', error);
      throw error; // 抛出错误以便上层处理
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // 首先获取当前错题数量
      db.transaction(tx => {
        tx.executeSql('SELECT COUNT(*) as count FROM mistakes;', [], (_, { rows }) => {
          const count = rows._array[0].count;
          console.log(`Clearing ${count} mistakes from database`);
          
          // 然后清空错题表
          db.transaction(innerTx => {
            innerTx.executeSql(
              'DELETE FROM mistakes;',
              [],
              (_, { rowsAffected }) => {
                console.log(`Deleted ${rowsAffected} mistake records`);
                resolve(true);
              },
              (_, error) => {
                console.error('Error clearing mistakes:', error);
                reject(error);
                return false;
              }
            );
          });
        });
      });
    });
  }
};

// 清空所有数据（用于重置应用）
export const resetDatabase = async () => {
  if (isWeb) {
    try {
      // 保留题目数据，但清空收藏和错题记录
      await AsyncStorage.setItem('favorites', JSON.stringify([]));
      await AsyncStorage.setItem('mistakes', JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Failed to reset web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.transaction(tx => {
        // 清空收藏和错题表
        tx.executeSql('DELETE FROM favorites;');
        tx.executeSql('DELETE FROM mistakes;');
      }, error => {
        console.error('Error resetting database:', error);
        reject(error);
      }, () => {
        resolve(true);
      });
    });
  }
};

// 记录学习进度
export const recordStudyProgress = async (data) => {
  const { questionsAnswered, correctCount, examType, date = new Date().toISOString() } = data;
  
  if (isWeb) {
    try {
      // 获取现有进度记录
      const progressData = await AsyncStorage.getItem('studyProgress');
      let progress = progressData ? JSON.parse(progressData) : [];
      
      // 添加新记录
      progress.push({
        id: Date.now().toString(),
        date,
        questionsAnswered,
        correctCount,
        examType,
        accuracy: questionsAnswered > 0 ? (correctCount / questionsAnswered) : 0
      });
      
      // 保存更新后的进度记录
      await AsyncStorage.setItem('studyProgress', JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Failed to record study progress in web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // 检查表是否存在，不存在则创建
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS study_progress (
            id TEXT PRIMARY KEY,
            date TEXT,
            questionsAnswered INTEGER,
            correctCount INTEGER,
            examType TEXT,
            accuracy REAL
          );`
        );
      }, error => {
        console.error('Error creating study_progress table:', error);
        reject(error);
      }, () => {
        // 插入新记录
        db.transaction(tx => {
          const id = Date.now().toString();
          const accuracy = questionsAnswered > 0 ? (correctCount / questionsAnswered) : 0;
          
          tx.executeSql(
            `INSERT INTO study_progress (id, date, questionsAnswered, correctCount, examType, accuracy)
            VALUES (?, ?, ?, ?, ?, ?);`,
            [id, date, questionsAnswered, correctCount, examType, accuracy],
            (_, result) => {
              resolve(true);
            },
            (_, error) => {
              console.error('Error inserting study progress:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    });
  }
};

// 获取学习进度统计
export const getStudyProgressStats = async () => {
  if (isWeb) {
    try {
      const progressData = await AsyncStorage.getItem('studyProgress');
      const progress = progressData ? JSON.parse(progressData) : [];
      
      // 获取考试记录
      const examResultsData = await AsyncStorage.getItem('examResults');
      const examResults = examResultsData ? JSON.parse(examResultsData) : [];
      
      // 计算总计数据
      const totalExams = examResults.length;
      const totalQuestions = examResults.reduce((sum, item) => sum + (item.totalQuestions || 0), 0);
      const totalCorrect = examResults.reduce((sum, item) => sum + (item.correctCount || 0), 0);
      const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) : 0;
      
      return {
        totalExams,
        totalQuestions,
        totalCorrect,
        averageAccuracy,
        progressHistory: progress.slice(-7) // 最近7条记录
      };
    } catch (error) {
      console.error('Failed to get study progress from web storage:', error);
      return {
        totalExams: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        averageAccuracy: 0,
        progressHistory: []
      };
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        // 获取考试记录总计
        tx.executeSql(
          `SELECT 
            COUNT(*) as totalExams,
            SUM(totalQuestions) as totalQuestions,
            SUM(correctCount) as totalCorrect
          FROM exam_results;`,
          [],
          (_, { rows }) => {
            const stats = rows._array[0];
            const totalExams = stats.totalExams || 0;
            const totalQuestions = stats.totalQuestions || 0;
            const totalCorrect = stats.totalCorrect || 0;
            const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) : 0;
            
            // 获取最近的7条学习记录
            tx.executeSql(
              `SELECT * FROM study_progress ORDER BY date DESC LIMIT 7;`,
              [],
              (_, { rows }) => {
                resolve({
                  totalExams,
                  totalQuestions,
                  totalCorrect,
                  averageAccuracy,
                  progressHistory: rows._array
                });
              },
              (_, error) => {
                console.error('Error getting study progress history:', error);
                resolve({
                  totalExams,
                  totalQuestions,
                  totalCorrect,
                  averageAccuracy,
                  progressHistory: []
                });
              }
            );
          },
          (_, error) => {
            console.error('Error getting study stats:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 清除学习进度记录
export const clearStudyProgress = async () => {
  if (isWeb) {
    try {
      await AsyncStorage.setItem('studyProgress', JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Failed to clear study progress in web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM study_progress;',
          [],
          (_, result) => {
            resolve(true);
          },
          (_, error) => {
            console.error('Error clearing study progress:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// 保存考试结果
export const saveExamResult = (examResult) => {
  if (isWeb) {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取现有的考试结果
        let examResults = [];
        try {
          const storedResults = await AsyncStorage.getItem('examResults');
          if (storedResults) {
            examResults = JSON.parse(storedResults);
          }
        } catch (error) {
          console.warn('Failed to retrieve existing exam results:', error);
        }
        
        // 添加新的考试结果
        const newExamResult = {
          ...examResult,
          id: Date.now() // 生成唯一ID
        };
        examResults.push(newExamResult);
        
        // 保存更新后的结果
        await AsyncStorage.setItem('examResults', JSON.stringify(examResults));
        
        // 更新学习进度
        await updateStudyProgress(
          examResult.answeredQuestions,
          examResult.correctCount,
          examResult.timeSpent
        );
        
        resolve({ insertId: Date.now() });
      } catch (error) {
        console.error('Failed to save exam result to web storage:', error);
        reject(error);
      }
    });
  } else {
    return new Promise((resolve, reject) => {
      const {
        date,
        score,
        timeSpent,
        totalQuestions,
        correctCount,
        incorrectCount,
        answeredQuestions,
        unansweredQuestions,
        isPassed,
        questionResults
      } = examResult;
      
      // 将详细题目结果序列化为JSON字符串
      const detailsJson = JSON.stringify(questionResults || {});
      
      const db = getDatabase();
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO exam_results (
            date, score, timeSpent, totalQuestions, correctCount, 
            incorrectCount, answeredQuestions, unansweredQuestions, 
            isPassed, details
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            date, 
            score, 
            timeSpent, 
            totalQuestions, 
            correctCount, 
            incorrectCount, 
            answeredQuestions, 
            unansweredQuestions, 
            isPassed ? 1 : 0, 
            detailsJson
          ],
          (_, result) => {
            // 同时更新学习进度表
            updateStudyProgress(
              answeredQuestions, 
              correctCount,
              timeSpent
            );
            resolve(result);
          },
          (_, error) => { reject(error); }
        );
      });
    });
  }
};

// 获取所有考试记录
export const getExamResults = () => {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM exam_results ORDER BY date DESC',
        [],
        (_, { rows }) => {
          // 将结果转换为JavaScript对象
          const results = rows._array.map(row => ({
            ...row,
            isPassed: row.isPassed === 1,
            details: JSON.parse(row.details || '{}')
          }));
          resolve(results);
        },
        (_, error) => { reject(error); }
      );
    });
  });
};

// 更新学习进度
export const updateStudyProgress = (questionsAnswered, correctAnswers, timeSpent) => {
  if (isWeb) {
    return new Promise(async (resolve, reject) => {
      try {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // 获取现有的学习进度
        let studyProgress = [];
        try {
          const storedProgress = await AsyncStorage.getItem('studyProgress');
          if (storedProgress) {
            studyProgress = JSON.parse(storedProgress);
          }
        } catch (error) {
          console.warn('Failed to retrieve existing study progress:', error);
        }
        
        // 查找当天的记录
        const todayIndex = studyProgress.findIndex(item => item.date === date);
        
        if (todayIndex >= 0) {
          // 更新现有记录
          studyProgress[todayIndex].questionsAnswered += questionsAnswered;
          studyProgress[todayIndex].correctAnswers += correctAnswers;
          studyProgress[todayIndex].timeSpent += timeSpent;
        } else {
          // 添加新记录
          studyProgress.push({
            date,
            questionsAnswered,
            correctAnswers,
            timeSpent,
            id: Date.now()
          });
        }
        
        // 保存更新后的进度
        await AsyncStorage.setItem('studyProgress', JSON.stringify(studyProgress));
        resolve({ rowsAffected: 1 });
      } catch (error) {
        console.error('Failed to update study progress in web storage:', error);
        reject(error);
      }
    });
  } else {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // 首先尝试更新当天的记录
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE study_progress SET 
            questionsAnswered = questionsAnswered + ?,
            correctAnswers = correctAnswers + ?,
            timeSpent = timeSpent + ?
            WHERE date = ?`,
          [questionsAnswered, correctAnswers, timeSpent, date],
          (_, result) => {
            // 如果没有更新任何记录，则插入新记录
            if (result.rowsAffected === 0) {
              tx.executeSql(
                `INSERT INTO study_progress (
                  date, questionsAnswered, correctAnswers, timeSpent
                ) VALUES (?, ?, ?, ?)`,
                [date, questionsAnswered, correctAnswers, timeSpent],
                (_, insertResult) => { resolve(insertResult); },
                (_, error) => { reject(error); }
              );
            } else {
              resolve(result);
            }
          },
          (_, error) => { reject(error); }
        );
      });
    });
  }
};

// 清空所有考试记录
export const clearExamHistory = async () => {
  console.log('清空所有考试历史记录');
  
  if (isWeb) {
    try {
      // 获取现有考试记录以便记录日志
      const storedResults = await AsyncStorage.getItem('examResults');
      const examResults = storedResults ? JSON.parse(storedResults) : [];
      console.log(`Clearing ${examResults.length} exam results from web storage`);
      
      // 清空考试记录
      await AsyncStorage.setItem('examResults', JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Failed to clear exam history in web storage:', error);
      return false;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // 首先获取当前记录数量
      db.transaction(tx => {
        tx.executeSql('SELECT COUNT(*) as count FROM exam_results;', [], (_, { rows }) => {
          const count = rows._array[0].count;
          console.log(`Clearing ${count} exam records from database`);
          
          // 然后清空表
          db.transaction(innerTx => {
            innerTx.executeSql(
              'DELETE FROM exam_results;',
              [],
              (_, { rowsAffected }) => {
                console.log(`Deleted ${rowsAffected} exam records`);
                resolve(true);
              },
              (_, error) => {
                console.error('Error clearing exam history:', error);
                reject(error);
                return false;
              }
            );
          });
        });
      });
    });
  }
}; 