import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

export const AccuracyLineChart = ({ progressHistory = [] }) => {
  const { t } = useTranslation();
  
  // 检查数据并确保至少有一个有效记录
  const validProgress = progressHistory.filter(
    record => record && typeof record.accuracy === 'number'
  );
  
  // 如果没有足够数据，显示提示信息
  if (validProgress.length < 1) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>{t('progress.notEnoughData')}</Text>
        <Text style={styles.noDataSubtext}>至少需要2次考试记录才能显示趋势图</Text>
      </View>
    );
  }

  // 准备数据 - 最多显示最近7条记录
  const recentProgress = validProgress.slice(0, 7).reverse();
  const labels = recentProgress.map((record, index) => `#${index + 1}`);
  
  // 确保accuracy值有效
  const accuracyData = recentProgress.map(record => {
    // 处理无效值的情况
    if (record.accuracy === undefined || record.accuracy === null || isNaN(record.accuracy)) {
      return 0;
    }
    return Math.round(record.accuracy * 100);
  });
  
  // 如果只有一条记录，复制一份以便显示图表
  if (accuracyData.length === 1) {
    labels.push('#2');
    accuracyData.push(accuracyData[0]);
  }

  const data = {
    labels: labels,
    datasets: [
      {
        data: accuracyData,  // 已经确保是有效数字
        color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: [t('progress.accuracy')]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#0066cc'
    }
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{t('progress.accuracyTrend')}</Text>
      <LineChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        yAxisSuffix="%"
      />
    </View>
  );
};

export const QuestionCountBarChart = ({ progressHistory = [] }) => {
  const { t } = useTranslation();
  
  // 过滤有效记录
  const validProgress = progressHistory.filter(
    record => record && typeof record.questionsAnswered === 'number'
  );
  
  // 如果没有数据，显示占位符
  if (validProgress.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>{t('progress.noData')}</Text>
        <Text style={styles.noDataSubtext}>完成考试后会显示题目统计</Text>
      </View>
    );
  }

  // 准备数据 - 最多显示最近5条记录
  const recentProgress = validProgress.slice(0, 5).reverse();
  const labels = recentProgress.map((record, index) => `#${index + 1}`);
  
  // 确保数据有效
  const questionCounts = recentProgress.map(record => {
    const count = record.questionsAnswered;
    return count !== undefined && !isNaN(count) ? count : 0;
  });
  
  const correctCounts = recentProgress.map(record => {
    const count = record.correctCount;
    return count !== undefined && !isNaN(count) ? count : 0;
  });

  const data = {
    labels: labels,
    datasets: [
      {
        data: questionCounts,
        color: (opacity = 1) => `rgba(31, 97, 141, ${opacity})`,
      },
      {
        data: correctCounts,
        color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
      }
    ],
    legend: [t('progress.totalQuestions'), t('progress.correct')]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    barPercentage: 0.7
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{t('progress.questionStats')}</Text>
      <BarChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        fromZero
        showValuesOnTopOfBars
        withInnerLines={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  noDataContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8
  },
  noDataSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center'
  }
}); 