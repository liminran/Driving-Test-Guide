// 驾照考试模拟数据
export const questions = [
  {
    id: '1',
    category: '交通法规',
    question: '在道路上驾驶机动车怎样选择行车道?',
    options: [
      { id: 'A', text: '根据交通标志、标线选择行车道' },
      { id: 'B', text: '根据车速选择行车道' },
      { id: 'C', text: '按照车型选择行车道' },
      { id: 'D', text: '按照自己习惯选择行车道' }
    ],
    correctAnswer: 'A',
    explanation: '在道路上驾驶机动车应根据交通标志、标线选择行车道，这样才能保证行车安全和道路通畅。',
    imageUrl: null,
    difficulty: '简单'
  },
  {
    id: '2',
    category: '交通法规',
    question: '驾驶机动车在进出隧道时应注意什么?',
    options: [
      { id: 'A', text: '开启前照灯' },
      { id: 'B', text: '关闭前照灯' },
      { id: 'C', text: '保持安全车距' },
      { id: 'D', text: '以上都是' }
    ],
    correctAnswer: 'D',
    explanation: '驾驶机动车在进出隧道时应开启前照灯，保持安全车距，注意行车安全。',
    imageUrl: null,
    difficulty: '中等'
  },
  {
    id: '3',
    category: '安全常识',
    question: '行车中遇到对向来车占道行驶时，应怎样做？',
    options: [
      { id: 'A', text: '紧靠道路中心行驶' },
      { id: 'B', text: '向右占道行驶' },
      { id: 'C', text: '靠右减速避让' },
      { id: 'D', text: '加速从左侧通过' }
    ],
    correctAnswer: 'C',
    explanation: '当遇到对向来车占道行驶时，应当靠右减速避让，确保行车安全。',
    imageUrl: null,
    difficulty: '中等'
  },
  {
    id: '4',
    category: '交通法规',
    question: '这个标志是何含义？',
    options: [
      { id: 'A', text: '禁止通行' },
      { id: 'B', text: '减速让行' },
      { id: 'C', text: '停车让行' },
      { id: 'D', text: '注意危险' }
    ],
    correctAnswer: 'B',
    explanation: '此标志为减速让行标志，提醒驾驶员减速慢行，注意让行。',
    imageUrl: 'https://example.com/signs/yield.jpg',
    difficulty: '简单'
  },
  {
    id: '5',
    category: '安全常识',
    question: '驾驶机动车遇到沙尘暴天气时应怎样做？',
    options: [
      { id: 'A', text: '加速驶离沙尘区' },
      { id: 'B', text: '开启前照灯行驶' },
      { id: 'C', text: '开启危险报警闪光灯，就近选择安全地点停车' },
      { id: 'D', text: '以正常速度行驶' }
    ],
    correctAnswer: 'C',
    explanation: '遇到沙尘暴天气时，能见度低，应开启危险报警闪光灯，就近选择安全地点停车，等天气好转后再行驶。',
    imageUrl: null,
    difficulty: '困难'
  }
]; 