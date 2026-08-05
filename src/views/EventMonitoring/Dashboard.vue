<template>
  <div class="em-dashboard">
    <div class="page-header">
      <div>
        <div class="page-title">监控概览-暂无</div>
        <div class="page-desc">实时监控事件吞吐量与异常趋势，快速掌握系统运行状态</div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card" data-marker="监控规则总数KPI卡片">
        <div class="label">监控规则总数</div>
        <div class="value">48<span class="unit">条</span></div>
        <div class="trend up">↑ 本周新增 6 条</div>
      </div>
      <div class="kpi-card" data-marker="今日告警数KPI卡片">
        <div class="label">今日告警数</div>
        <div class="value">23<span class="unit">条</span></div>
        <div class="sub"><span class="badge badge-danger">8 条未处理</span></div>
      </div>
      <div class="kpi-card" data-marker="事件吞吐量KPI卡片">
        <div class="label">事件吞吐量（近1小时）</div>
        <div class="value">128.6<span class="unit">万</span></div>
        <div class="trend up">↑ 12.3% vs 昨日同期</div>
      </div>
      <div class="kpi-card" data-marker="异常率KPI卡片">
        <div class="label">异常率（近1小时）</div>
        <div class="value">2.34<span class="unit">%</span></div>
        <div class="trend down">↓ 0.52pct vs 昨日</div>
      </div>
    </div>

    <div class="grid-2-1">
      <div class="chart-box">
        <div class="card-title">
          <span>异常事件趋势（近1小时，每5分钟聚合）</span>
          <div class="legend">
            <div class="legend-item"><span class="legend-dot primary"></span>异常事件数</div>
            <div class="legend-item"><span class="legend-dot danger"></span>阈值参考线</div>
          </div>
        </div>
        <div ref="trendChartRef" class="chart"></div>
      </div>
      <div class="chart-box">
        <div class="card-title">
          <span>最新告警</span>
          <a @click="$router.push('/event-monitoring/alerts')" class="view-all">查看全部 →</a>
        </div>
        <ul class="alert-list">
          <li v-for="a in latestAlerts" :key="a.name" class="alert-item" :data-marker="'最新告警-' + a.name">
            <span class="severity" :class="a.severity"></span>
            <div class="alert-info">
              <div class="alert-name">{{ a.name }}</div>
              <div class="alert-meta">{{ a.project }} · {{ a.time }}</div>
            </div>
            <div class="alert-time">{{ a.time }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const trendChartRef = ref(null)
let chartInstance = null

const latestAlerts = [
  { name: 'Ecpm低值监控', time: '2分钟前', project: '广告聚合', severity: 'critical' },
  { name: '事件顺序异常', time: '8分钟前', project: '用户增长', severity: 'warning' },
  { name: '高延迟告警', time: '15分钟前', project: '内容中台', severity: 'critical' },
  { name: '转化漏斗异常', time: '22分钟前', project: '广告聚合', severity: 'info' },
  { name: '重复事件检测', time: '35分钟前', project: '内容中台', severity: 'warning' }
]

const initChart = () => {
  if (!trendChartRef.value) return
  chartInstance = echarts.init(trendChartRef.value)
  const times = []
  const values = []
  for (let i = 0; i < 12; i++) {
    const m = 30 + i * 5
    times.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
    values.push(Math.floor(Math.random() * 300 + 100))
  }
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: times, axisLine: { lineStyle: { color: '#E2E8F0' }}, axisLabel: { color: '#64748B' }},
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#F1F5F9' }}, axisLabel: { color: '#64748B' }},
    series: [
      { name: '异常事件数', type: 'line', data: values, smooth: true, lineStyle: { color: '#4F46E5', width: 2 }, areaStyle: { color: 'rgba(79,70,229,0.15)' }, itemStyle: { color: '#4F46E5' }, symbol: 'circle', symbolSize: 6 },
      { name: '阈值', type: 'line', data: Array(12).fill(250), lineStyle: { color: '#EF4444', type: 'dashed', width: 1.5 }, itemStyle: { color: '#EF4444' }, symbol: 'none' }
    ]
  })
}

const handleResize = () => chartInstance?.resize()

onMounted(() => {
  nextTick(initChart)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.em-dashboard {
  padding: 0;
}
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1E293B; }
.page-desc { font-size: 13px; color: #64748B; margin-top: 4px; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.kpi-card { background: #fff; border-radius: 8px; border: 1px solid #E2E8F0; padding: 20px; transition: box-shadow 0.2s; cursor: pointer; }
.kpi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.label { font-size: 13px; color: #64748B; margin-bottom: 10px; }
.value { font-size: 28px; font-weight: 700; color: #1E293B; }
.unit { font-size: 14px; color: #64748B; font-weight: 400; margin-left: 4px; }
.trend { font-size: 12px; margin-top: 8px; display: flex; align-items: center; gap: 4px; }
.trend.up { color: #10B981; }
.trend.down { color: #EF4444; }
.sub { font-size: 12px; color: #64748B; margin-top: 6px; }
.badge { background: #FEF2F2; color: #EF4444; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
.chart-box { background: #fff; border-radius: 8px; border: 1px solid #E2E8F0; padding: 20px; }
.card-title { font-size: 15px; font-weight: 600; color: #1E293B; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
.chart { width: 100%; height: 320px; }
.legend { display: flex; gap: 16px; font-size: 12px; color: #64748B; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; }
.legend-dot.primary { background: #4F46E5; }
.legend-dot.danger { background: #EF4444; }
.alert-list { list-style: none; }
.alert-item { padding: 12px 0; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; gap: 12px; }
.alert-item:last-child { border-bottom: none; }
.severity { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.severity.critical { background: #EF4444; }
.severity.warning { background: #F59E0B; }
.severity.info { background: #3B82F6; }
.alert-info { flex: 1; min-width: 0; }
.alert-name { font-size: 13px; font-weight: 500; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alert-meta { font-size: 12px; color: #64748B; margin-top: 2px; }
.alert-time { font-size: 12px; color: #94A3B8; white-space: nowrap; }
.view-all { color: #4F46E5; font-size: 13px; cursor: pointer; }
.view-all:hover { text-decoration: underline; }
</style>
