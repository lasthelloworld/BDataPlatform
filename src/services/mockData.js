export const regionOptions = [
  {
    value: 'east',
    label: '华东大区',
    children: [
      { value: 'shanghai', label: '上海市' },
      { value: 'jiangsu', label: '江苏省' },
      { value: 'zhejiang', label: '浙江省' },
      { value: 'anhui', label: '安徽省' }
    ]
  },
  {
    value: 'south',
    label: '华南大区',
    children: [
      { value: 'guangdong', label: '广东省' },
      { value: 'fujian', label: '福建省' },
      { value: 'hainan', label: '海南省' }
    ]
  },
  {
    value: 'north',
    label: '华北大区',
    children: [
      { value: 'beijing', label: '北京市' },
      { value: 'tianjin', label: '天津市' },
      { value: 'hebei', label: '河北省' },
      { value: 'shandong', label: '山东省' }
    ]
  },
  {
    value: 'west',
    label: '西部大区',
    children: [
      { value: 'sichuan', label: '四川省' },
      { value: 'chongqing', label: '重庆市' },
      { value: 'shaanxi', label: '陕西省' }
    ]
  }
]

export const metricData = {
  totalSales: 12580.67,
  orderCount: 3256,
  avgOrderValue: 3.86,
  growthRate: 12.5
}

export const monthlyTrend = [
  { month: '2026-01', sales: 3200 },
  { month: '2026-02', sales: 2800 },
  { month: '2026-03', sales: 3500 },
  { month: '2026-04', sales: 4100 },
  { month: '2026-05', sales: 3800 },
  { month: '2026-06', sales: 4500 },
  { month: '2026-07', sales: 4200 },
  { month: '2026-08', sales: 5100 },
  { month: '2026-09', sales: 4800 },
  { month: '2026-10', sales: 5600 },
  { month: '2026-11', sales: 6200 },
  { month: '2026-12', sales: 6800 }
]

export const regionDistribution = [
  { name: '华东大区', value: 3850, percentage: 30.6 },
  { name: '华南大区', value: 3200, percentage: 25.4 },
  { name: '华北大区', value: 2980, percentage: 23.7 },
  { name: '西部大区', value: 2550, percentage: 20.3 }
]

export const cityDistribution = {
  east: [
    { name: '上海市', value: 1500, percentage: 39.0 },
    { name: '江苏省', value: 1200, percentage: 31.2 },
    { name: '浙江省', value: 800, percentage: 20.8 },
    { name: '安徽省', value: 350, percentage: 9.0 }
  ],
  south: [
    { name: '广东省', value: 2100, percentage: 65.6 },
    { name: '福建省', value: 700, percentage: 21.9 },
    { name: '海南省', value: 400, percentage: 12.5 }
  ],
  north: [
    { name: '北京市', value: 1200, percentage: 40.3 },
    { name: '天津市', value: 680, percentage: 22.8 },
    { name: '河北省', value: 550, percentage: 18.5 },
    { name: '山东省', value: 550, percentage: 18.5 }
  ],
  west: [
    { name: '四川省', value: 1000, percentage: 39.2 },
    { name: '重庆市', value: 850, percentage: 33.3 },
    { name: '陕西省', value: 700, percentage: 27.5 }
  ]
}

export const orderList = [
  { id: 'ORD20260001', time: '2026-05-03 14:30:25', customer: '张三', amount: 12.50, region: '上海市' },
  { id: 'ORD20260002', time: '2026-05-03 14:25:10', customer: '李四', amount: 8.30, region: '北京市' },
  { id: 'ORD20260003', time: '2026-05-03 14:20:15', customer: '王五', amount: 15.80, region: '广东省' },
  { id: 'ORD20260004', time: '2026-05-03 14:15:30', customer: '赵六', amount: 5.20, region: '江苏省' },
  { id: 'ORD20260005', time: '2026-05-03 14:10:00', customer: '孙七', amount: 22.40, region: '浙江省' },
  { id: 'ORD20260006', time: '2026-05-03 14:05:45', customer: '周八', amount: 9.10, region: '四川省' },
  { id: 'ORD20260007', time: '2026-05-03 14:00:20', customer: '吴九', amount: 18.60, region: '广东省' },
  { id: 'ORD20260008', time: '2026-05-03 13:55:15', customer: '郑十', amount: 6.70, region: '山东省' },
  { id: 'ORD20260009', time: '2026-05-03 13:50:30', customer: '钱十一', amount: 14.20, region: '上海市' },
  { id: 'ORD20260010', time: '2026-05-03 13:45:00', customer: '陈十二', amount: 3.80, region: '安徽省' },
  { id: 'ORD20260011', time: '2026-05-03 13:40:25', customer: '杨十三', amount: 25.90, region: '重庆市' },
  { id: 'ORD20260012', time: '2026-05-03 13:35:10', customer: '黄十四', amount: 7.50, region: '天津市' },
  { id: 'ORD20260013', time: '2026-05-03 13:30:15', customer: '林十五', amount: 11.30, region: '河北省' },
  { id: 'ORD20260014', time: '2026-05-03 13:25:30', customer: '何十六', amount: 19.80, region: '福建省' },
  { id: 'ORD20260015', time: '2026-05-03 13:20:00', customer: '梁十七', amount: 4.60, region: '海南省' },
  { id: 'ORD20260016', time: '2026-05-03 13:15:45', customer: '谢十八', amount: 16.20, region: '陕西省' },
  { id: 'ORD20260017', time: '2026-05-03 13:10:20', customer: '宋十九', amount: 8.90, region: '江苏省' },
  { id: 'ORD20260018', time: '2026-05-03 13:05:15', customer: '唐二十', amount: 13.40, region: '浙江省' },
  { id: 'ORD20260019', time: '2026-05-03 13:00:30', customer: '邓二十一', amount: 6.10, region: '四川省' },
  { id: 'ORD20260020', time: '2026-05-03 12:55:00', customer: '冯二十二', amount: 21.70, region: '广东省' }
]