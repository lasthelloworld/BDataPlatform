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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Sidebar from './components/Sidebar.vue'
import FilterBar from './components/FilterBar.vue'
import MetricCards from './components/MetricCards.vue'
import SalesCharts from './components/SalesCharts.vue'
import OrderTable from './components/OrderTable.vue'
import ExportDialog from './components/ExportDialog.vue'
import InteractionGuide from './components/InteractionGuide.vue'

const exportDialogRef = ref(null)

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

defineExpose({
  openExportDialog: () => {
    exportDialogRef.value?.open()
  }
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
</style>