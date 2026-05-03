<template>
  <div class="sales-charts">
    <div class="chart-container line-chart">
      <div class="chart-header">
        <h3 class="chart-title">月度销售趋势</h3>
        <span class="chart-subtitle">单位：万元</span>
      </div>
      <div ref="lineChartRef" class="chart-content"></div>
    </div>
    <div class="chart-container pie-chart">
      <div class="chart-header">
        <a-breadcrumb>
          <a-breadcrumb-item 
            v-for="(item, index) in breadcrumbItems" 
            :key="index"
            :class="{ active: index === breadcrumbItems.length - 1 }"
            @click="handleBreadcrumbClick(index)"
            data-marker="点击面包屑返回上级区域"
          >
            {{ item }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <h3 class="chart-title">{{ currentPieTitle }}</h3>
      </div>
      <div ref="pieChartRef" class="chart-content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { monthlyTrend, regionDistribution, cityDistribution } from '@/services/mockData'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null

const breadcrumbItems = ref(['全国'])
const selectedMonth = ref(null)
const selectedRegion = ref(null)

const currentPieTitle = computed(() => {
  const month = selectedMonth.value ? `(${selectedMonth.value})` : ''
  return `${breadcrumbItems.value[breadcrumbItems.value.length - 1]}区域销售占比${month}`
})

const initLineChart = () => {
  if (!lineChartRef.value) return
  lineChart = echarts.init(lineChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>销售额: {c} 万元'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: monthlyTrend.map(item => item.month),
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 万元'
      }
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 }
    ],
    series: [{
      name: '销售额',
      type: 'line',
      smooth: true,
      data: monthlyTrend.map(item => item.sales),
      lineStyle: {
        width: 3,
        color: '#1677ff'
      },
      itemStyle: {
        color: '#1677ff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(22, 119, 255, 0.3)' },
          { offset: 1, color: 'rgba(22, 119, 255, 0.05)' }
        ])
      }
    }]
  }
  
  lineChart.setOption(option)
  
  lineChart.on('click', (params) => {
    selectedMonth.value = params.name
    updatePieChart()
  })
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  updatePieChart()
}

const updatePieChart = () => {
  if (!pieChart) return
  
  let data = regionDistribution
  if (selectedRegion.value && cityDistribution[selectedRegion.value]) {
    data = cityDistribution[selectedRegion.value]
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>销售额: {c} 万元<br/>占比: {d}%'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [{
      name: '区域销售',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {d}%'
      },
      data: data.map(item => ({
        value: item.value,
        name: item.name
      }))
    }]
  }
  
  pieChart.setOption(option, true)
  
  pieChart.off('click')
  pieChart.on('click', (params) => {
    if (!selectedRegion.value && regionDistribution.find(r => r.name === params.name)) {
      const regionKey = regionDistribution.find(r => r.name === params.name)
      const regionMap = {
        '华东大区': 'east',
        '华南大区': 'south',
        '华北大区': 'north',
        '西部大区': 'west'
      }
      selectedRegion.value = regionMap[params.name]
      breadcrumbItems.value.push(params.name)
      updatePieChart()
    }
  })
}

const handleBreadcrumbClick = (index) => {
  if (index === breadcrumbItems.value.length - 1) return
  breadcrumbItems.value = breadcrumbItems.value.slice(0, index + 1)
  if (index === 0) {
    selectedRegion.value = null
  } else {
    const regionMap = {
      '华东大区': 'east',
      '华南大区': 'south',
      '华北大区': 'north',
      '西部大区': 'west'
    }
    selectedRegion.value = regionMap[breadcrumbItems.value[index]]
  }
  updatePieChart()
}

const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initLineChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})

watch(() => props.filters, () => {
  updatePieChart()
}, { deep: true })
</script>

<style scoped>
.sales-charts {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1366px) {
  .sales-charts {
    grid-template-columns: 1fr;
  }
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0;
}

.chart-subtitle {
  font-size: 12px;
  color: #999;
}

.chart-content {
  height: 350px;
}

.ant-breadcrumb-link.active {
  color: #1677ff;
  font-weight: 500;
}
</style>