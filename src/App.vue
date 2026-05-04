<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <FilterBar @filter-change="handleFilterChange" @open-export="handleOpenExport" />
      <MetricCards :filters="currentFilters" />
      <SalesCharts :filters="currentFilters" />
      <OrderTable :filters="currentFilters" />
      <ExportDialog ref="exportDialogRef" :filters="currentFilters" />
      <InteractionGuide />
    </main>
    <div class="annotation-panel" :class="{ visible: panelVisible }">
      <div class="panel-header">
        <span class="panel-icon">📌</span>
        <span class="panel-title">标注说明</span>
      </div>
      <div class="panel-content">
        {{ panelContent }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import Sidebar from './components/Sidebar.vue'
import FilterBar from './components/FilterBar.vue'
import MetricCards from './components/MetricCards.vue'
import SalesCharts from './components/SalesCharts.vue'
import OrderTable from './components/OrderTable.vue'
import ExportDialog from './components/ExportDialog.vue'
import InteractionGuide from './components/InteractionGuide.vue'

const exportDialogRef = ref(null)
const panelVisible = ref(false)
const panelContent = ref('点击任意带标注的元素，查看需求详情。')

const currentFilters = reactive({
  dateRange: [],
  regionPath: []
})

const handleFilterChange = (filters) => {
  Object.assign(currentFilters, filters)
}

const handleOpenExport = () => {
  exportDialogRef.value?.open()
}

const handleAnnotationClick = (e) => {
  const target = e.target.closest('[data-marker]')
  if (target) {
    panelContent.value = target.getAttribute('data-marker')
    panelVisible.value = true
  }
}

defineExpose({
  openExportDialog: () => {
    exportDialogRef.value?.open()
  }
})

onMounted(() => {
  nextTick(() => {
    document.querySelectorAll('[data-marker]').forEach(el => {
      el.addEventListener('click', handleAnnotationClick)
    })
  })
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 24px;
  overflow-y: auto;
}

.annotation-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 320px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
  z-index: 1000;
}

.annotation-panel.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-icon {
  margin-right: 6px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.panel-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-line;
}
</style>