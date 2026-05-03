<template>
  <a-modal
    v-model:open="visible"
    title="数据导出"
    :footer="null"
    width="480px"
    data-marker="数据导出配置弹窗"
  >
    <div class="export-content">
      <div class="export-options">
        <a-checkbox 
          v-model:checked="selectAll"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
          data-marker="全选/取消全选导出选项"
        >
          全选
        </a-checkbox>
        <a-divider />
        <a-space direction="vertical" :size="12">
          <a-checkbox 
            :checked="selectedItems.includes('summary')"
            @change="handleItemChange('summary', $event)"
            data-marker="选择导出指标摘要"
          >
            指标摘要
          </a-checkbox>
          <a-checkbox 
            :checked="selectedItems.includes('chart')"
            @change="handleItemChange('chart', $event)"
            data-marker="选择导出图表数据"
          >
            图表数据
          </a-checkbox>
          <a-checkbox 
            :checked="selectedItems.includes('detail')"
            @change="handleItemChange('detail', $event)"
            data-marker="选择导出明细表格"
          >
            明细表格
          </a-checkbox>
        </a-space>
      </div>
      <div class="export-footer">
        <a-button 
          @click="handleCancel"
          data-marker="取消导出"
        >
          取消
        </a-button>
        <a-button 
          type="primary"
          :loading="exporting"
          :disabled="selectedItems.length === 0"
          @click="handleExport"
          data-marker="确认导出选中内容"
        >
          {{ exporting ? '生成中...' : '导出' }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const visible = ref(false)
const exporting = ref(false)
const selectedItems = ref([])

const selectAll = computed({
  get: () => selectedItems.value.length === 3,
  set: (val) => {
    selectedItems.value = val ? ['summary', 'chart', 'detail'] : []
  }
})

const isIndeterminate = computed(() => {
  return selectedItems.value.length > 0 && selectedItems.value.length < 3
})

const handleSelectAll = (e) => {
  selectedItems.value = e.target.checked ? ['summary', 'chart', 'detail'] : []
}

const handleItemChange = (item, e) => {
  if (e.target.checked) {
    selectedItems.value.push(item)
  } else {
    const index = selectedItems.value.indexOf(item)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
  }
}

const handleExport = async () => {
  if (selectedItems.value.length === 0) {
    message.warning('请至少选择一项导出内容')
    return
  }
  
  exporting.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const dateStr = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')
  const fileName = `销售数据分析_全国_${dateStr}.xlsx`
  
  const blob = new Blob(['导出内容模拟数据'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  exporting.value = false
  visible.value = false
  message.success(`导出成功：${fileName}`)
}

const handleCancel = () => {
  visible.value = false
  selectedItems.value = []
}

const open = () => {
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped>
.export-content {
  padding: 16px 0;
}

.export-options {
  margin-bottom: 24px;
}

.export-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>