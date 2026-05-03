<template>
  <div class="metric-cards">
    <div 
      v-for="metric in metrics" 
      :key="metric.key" 
      class="metric-card"
    >
      <div class="metric-header">
        <span class="metric-name">{{ metric.name }}</span>
        <a-tooltip :title="metric.tooltip">
          <span class="metric-help">?</span>
        </a-tooltip>
      </div>
      <div class="metric-value">
        <span class="value-number">{{ metric.formattedValue }}</span>
        <span v-if="metric.unit" class="value-unit">{{ metric.unit }}</span>
      </div>
      <div v-if="metric.trend !== undefined" :class="['metric-trend', metric.trendClass]">
        <span class="trend-icon">{{ metric.trendIcon }}</span>
        <span class="trend-value">{{ metric.trend }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { metricData } from '@/services/mockData'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const metrics = computed(() => [
  {
    key: 'totalSales',
    name: '总销售额',
    value: metricData.totalSales,
    unit: '万元',
    formattedValue: metricData.totalSales.toFixed(2),
    tooltip: '数据来源：ODS订单事实表，每日02:00更新',
    trend: metricData.growthRate,
    trendClass: metricData.growthRate >= 0 ? 'positive' : 'negative',
    trendIcon: metricData.growthRate >= 0 ? '↑' : '↓'
  },
  {
    key: 'orderCount',
    name: '订单量',
    value: metricData.orderCount,
    formattedValue: metricData.orderCount.toLocaleString(),
    tooltip: '数据来源：ODS订单事实表，每日02:00更新',
    trend: 8.3,
    trendClass: 'positive',
    trendIcon: '↑'
  },
  {
    key: 'avgOrderValue',
    name: '客单价',
    value: metricData.avgOrderValue,
    unit: '万元',
    formattedValue: metricData.avgOrderValue.toFixed(2),
    tooltip: '计算逻辑：总销售额/订单量',
    trend: 3.8,
    trendClass: 'positive',
    trendIcon: '↑'
  },
  {
    key: 'growthRate',
    name: '同比增长率',
    value: metricData.growthRate,
    unit: '%',
    formattedValue: metricData.growthRate.toFixed(1),
    tooltip: '计算逻辑：(本期值-去年同期值)/去年同期值*100%',
    trend: undefined
  }
])
</script>

<style scoped>
.metric-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1366px) {
  .metric-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

.metric-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-name {
  font-size: 14px;
  color: #666;
}

.metric-help {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}

.metric-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.value-number {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
}

.value-unit {
  font-size: 14px;
  color: #999;
  margin-left: 4px;
}

.metric-trend {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.trend-icon {
  margin-right: 4px;
}

.metric-trend.positive {
  color: #52C41A;
}

.metric-trend.negative {
  color: #FF4D4F;
}
</style>