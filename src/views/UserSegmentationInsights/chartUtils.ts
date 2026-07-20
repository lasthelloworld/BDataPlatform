import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const generateDates = (): string[] => {
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return dates;
};

export const genRetention = (base: number, variance: number): number[] => {
  const dates = generateDates();
  return dates.map(() => +(base + (Math.random() - 0.5) * variance).toFixed(1));
};

export const renderMemberPie = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const option: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
      data: [
        { value: 82624, name: '非会员', itemStyle: { color: '#9ca3af' } },
        { value: 23120, name: 'Lite会员', itemStyle: { color: '#3b82f6' } },
        { value: 15680, name: 'Pro会员', itemStyle: { color: '#8b5cf6' } },
        { value: 7032, name: 'Max会员', itemStyle: { color: '#f59e0b' } }
      ]
    }]
  };
  chart.setOption(option);
  return chart;
};

export const renderContentBar = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: ['L0', 'L2', 'L3'], axisLabel: { fontSize: 12 } },
    yAxis: [
      { type: 'value', name: '人数占比(%)', max: 100, axisLabel: { fontSize: 11 } },
      { type: 'value', name: '会员占比(%)', max: 60, axisLabel: { fontSize: 11 } }
    ],
    series: [
      { name: '触达用户占比', type: 'bar', barWidth: 24, data: [85.2, 62.3, 38.7], itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
      { name: '其中会员占比', type: 'bar', barWidth: 24, yAxisIndex: 1, data: [32.5, 41.8, 52.1], itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] } }
    ]
  };
  chart.setOption(option);
  return chart;
};

export const renderRegisterPie = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const option: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['50%', '45%'],
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
      data: [
        { value: 8, name: '注册0天', itemStyle: { color: '#ef4444' } },
        { value: 18, name: '注册1-3天', itemStyle: { color: '#f59e0b' } },
        { value: 22, name: '注册4-7天', itemStyle: { color: '#eab308' } },
        { value: 32, name: '注册8-30天', itemStyle: { color: '#3b82f6' } },
        { value: 20, name: '注册31天+', itemStyle: { color: '#10b981' } }
      ]
    }]
  };
  chart.setOption(option);
  return chart;
};

export const renderRegisterStack = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 11 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
    xAxis: { type: 'category', data: ['L0', 'L2', 'L3'], axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '占比(%)', max: 100, axisLabel: { fontSize: 11 } },
    series: [
      { name: '注册0天', type: 'bar', stack: 'total', data: [10, 7, 5], itemStyle: { color: '#ef4444' } },
      { name: '注册1-3天', type: 'bar', stack: 'total', data: [20, 17, 14], itemStyle: { color: '#f59e0b' } },
      { name: '注册4-7天', type: 'bar', stack: 'total', data: [24, 22, 20], itemStyle: { color: '#eab308' } },
      { name: '注册8-30天', type: 'bar', stack: 'total', data: [30, 34, 36], itemStyle: { color: '#3b82f6' } },
      { name: '注册31天+', type: 'bar', stack: 'total', data: [16, 20, 25], itemStyle: { color: '#10b981' } }
    ]
  };
  chart.setOption(option);
  return chart;
};

export const renderRetentionLine = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const dates = generateDates();
  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, itemWidth: 16, itemHeight: 8, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates, axisLabel: { fontSize: 11, interval: 3 } },
    yAxis: { type: 'value', name: '留存率(%)', axisLabel: { fontSize: 11 } },
    series: [
      { name: '次留', type: 'line', smooth: true, data: genRetention(42.5, 3), lineStyle: { width: 2 }, itemStyle: { color: '#3b82f6' }, areaStyle: { opacity: 0.1 } },
      { name: '7留', type: 'line', smooth: true, data: genRetention(21.3, 2), lineStyle: { width: 2 }, itemStyle: { color: '#10b981' }, areaStyle: { opacity: 0.1 } },
      { name: '14留', type: 'line', smooth: true, data: genRetention(14.2, 1.5), lineStyle: { width: 2 }, itemStyle: { color: '#f59e0b' }, areaStyle: { opacity: 0.1 } },
      { name: '30留', type: 'line', smooth: true, data: genRetention(8.6, 1), lineStyle: { width: 2 }, itemStyle: { color: '#8b5cf6' }, areaStyle: { opacity: 0.1 } }
    ]
  };
  chart.setOption(option);
  return chart;
};

export const renderFuncPenetration = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}%' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: { type: 'value', name: '渗透率(%)', max: 50, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'category', data: ['AI生成', '模版制作', '滤镜编辑', '素材拼接', '导出分享', '社区发布'], axisLabel: { fontSize: 12 } },
    series: [{
      type: 'bar',
      barWidth: 18,
      data: [42.5, 35.8, 28.3, 19.6, 45.2, 12.4],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#93c5fd' },
          { offset: 1, color: '#3b82f6' }
        ]),
        borderRadius: [0, 4, 4, 0]
      },
      label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
    }]
  };
  chart.setOption(option);
  return chart;
};

export const renderFuncDepth = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: ['AI生成', '模版制作', '滤镜编辑', '素材拼接', '导出分享'], axisLabel: { fontSize: 11 } },
    yAxis: [
      { type: 'value', name: '人均次数', axisLabel: { fontSize: 11 } },
      { type: 'value', name: '人均金币', axisLabel: { fontSize: 11 } }
    ],
    series: [
      { name: '人均使用次数', type: 'bar', barWidth: 20, data: [5.2, 3.8, 4.5, 2.3, 1.8], itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
      { name: '人均消耗金币', type: 'line', yAxisIndex: 1, data: [120, 85, 45, 30, 0], itemStyle: { color: '#f59e0b' }, lineStyle: { width: 2 }, symbol: 'circle', symbolSize: 8 }
    ]
  };
  chart.setOption(option);
  return chart;
};

export const renderTemplateFunnel = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const option: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    series: [{
      type: 'funnel',
      left: '10%',
      top: 20,
      bottom: 40,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '30%',
      maxSize: '100%',
      sort: 'descending',
      gap: 4,
      label: { show: true, position: 'inside', formatter: '{b}\n{c}%', fontSize: 12, color: '#fff' },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: 100, name: '模版曝光', itemStyle: { color: '#3b82f6' } },
        { value: 65.2, name: '模版预览', itemStyle: { color: '#8b5cf6' } },
        { value: 28.5, name: '模版制作', itemStyle: { color: '#10b981' } },
        { value: 18.7, name: '制作完成', itemStyle: { color: '#f59e0b' } }
      ]
    }]
  };
  chart.setOption(option);
  return chart;
};

export const renderTemplateTrend = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const dates = generateDates();
  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates, axisLabel: { fontSize: 11, interval: 4 } },
    yAxis: { type: 'value', name: '人均次数', axisLabel: { fontSize: 11 } },
    series: [
      { name: '人均预览次数', type: 'line', smooth: true, data: genRetention(8.5, 1.2), lineStyle: { width: 2 }, itemStyle: { color: '#3b82f6' }, areaStyle: { opacity: 0.15 } },
      { name: '人均制作次数', type: 'line', smooth: true, data: genRetention(2.3, 0.5), lineStyle: { width: 2 }, itemStyle: { color: '#10b981' }, areaStyle: { opacity: 0.15 } }
    ]
  };
  chart.setOption(option);
  return chart;
};

export const renderTemplateLevel = (container: HTMLElement) => {
  const chart = echarts.init(container);
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '6%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['L0', 'L2', 'L3'], axisLabel: { fontSize: 13 } },
    yAxis: [
      { type: 'value', name: '比率(%)', max: 100, axisLabel: { fontSize: 11 } },
      { type: 'value', name: '人均次数', axisLabel: { fontSize: 11 } }
    ],
    series: [
      { name: '模版预览率', type: 'bar', barWidth: 20, data: [72.5, 65.3, 52.8], itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
      { name: '模版制作率', type: 'bar', barWidth: 20, data: [22.3, 19.8, 15.2], itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] } },
      { name: '人均预览次数', type: 'line', yAxisIndex: 1, data: [9.8, 7.5, 5.2], itemStyle: { color: '#f59e0b' }, lineStyle: { width: 2 }, symbol: 'circle', symbolSize: 10 },
      { name: '人均制作次数', type: 'line', yAxisIndex: 1, data: [2.8, 2.1, 1.5], itemStyle: { color: '#8b5cf6' }, lineStyle: { width: 2 }, symbol: 'circle', symbolSize: 10 }
    ]
  };
  chart.setOption(option);
  return chart;
};

export type ChartType = 
  | 'memberPie' 
  | 'contentBar' 
  | 'registerPie' 
  | 'registerStack' 
  | 'retentionLine'
  | 'funcPenetration'
  | 'funcDepth'
  | 'templateFunnel'
  | 'templateTrend'
  | 'templateLevel';

export const chartRenderers: Record<ChartType, (container: HTMLElement) => echarts.ECharts> = {
  memberPie: renderMemberPie,
  contentBar: renderContentBar,
  registerPie: renderRegisterPie,
  registerStack: renderRegisterStack,
  retentionLine: renderRetentionLine,
  funcPenetration: renderFuncPenetration,
  funcDepth: renderFuncDepth,
  templateFunnel: renderTemplateFunnel,
  templateTrend: renderTemplateTrend,
  templateLevel: renderTemplateLevel
};
