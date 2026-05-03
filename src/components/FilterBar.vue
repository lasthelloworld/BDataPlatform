<template>
  <div class="filter-bar">
    <div class="header-section">
      <h1 class="page-title">销售数据分析看板</h1>
      <a-button 
        type="primary" 
        @click="$emit('open-export')"
        data-marker="打开数据导出配置弹窗"
      >
        <template #icon>📥</template>
        导出数据
      </a-button>
    </div>
    <div class="filter-section">
      <a-space :size="16">
        <a-range-picker
          v-model="dateRange"
          :placeholder="['开始日期', '结束日期']"
          format="YYYY-MM-DD"
          @change="handleFilterChange"
          data-marker="选择时间范围筛选数据"
        />
        <a-cascader
          v-model="regionPath"
          :options="regionOptions"
          :placeholder="'请选择区域'"
          :show-search="true"
          :disabled="regionLoading"
          @change="handleFilterChange"
          data-marker="选择省/市二级联动区域筛选数据"
        />
        <a-button 
          @click="handleReset"
          data-marker="重置筛选条件恢复默认值"
        >
          重置
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { regionOptions as mockRegions } from '@/services/mockData'

const emit = defineEmits(['filter-change', 'open-export'])

const dateRange = ref([
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])
const regionPath = ref([])
const regionOptions = ref([])
const regionLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    regionOptions.value = mockRegions
    regionLoading.value = false
  }, 500)
})

const handleFilterChange = () => {
  emit('filter-change', {
    dateRange: dateRange.value,
    regionPath: regionPath.value
  })
}

const handleReset = () => {
  dateRange.value = [
    dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ]
  regionPath.value = []
  handleFilterChange()
}
</script>

<style scoped>
.filter-bar {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0;
}

.filter-section {
  display: flex;
  align-items: center;
}

@media (max-width: 1366px) {
  .filter-section {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>