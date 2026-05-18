<template>
  <div class="ai-task-container">
    <div class="page-header">
      <h2 class="page-title">AI Analyses Task</h2>
      <p class="page-subtitle">AI辅助分析任务列表</p>
    </div>

    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索任务名称"
          style="width: 300px"
          @search="handleSearch"
          data-marker="ai_task_search"
        />
        <a-range-picker
          v-model:value="dateRange"
          :placeholder="['start date', 'end date']"
          data-marker="ai_task_date_filter"
        />
        <a-button type="primary" @click="handleSearch" data-marker="ai_task_search_btn">
          搜索
        </a-button>
        <a-button @click="handleReset" data-marker="ai_task_reset_btn">
          重置
        </a-button>
      </div>
    </a-card>

    <a-card :bordered="false" class="table-card">
      <a-table
        :columns="columns"
        :data-source="filteredTasks"
        :row-selection="rowSelection"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        data-marker="ai_task_table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <a @click="viewTaskDetail(record)" data-marker="ai_task_title_link">
              {{ record.title }}
            </a>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'completed' ? 'success' : 'processing'">
              {{ record.status === 'completed' ? '已完成' : '进行中' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="viewTaskDetail(record)" data-marker="ai_task_view_btn">
                查看详情
              </a-button>
              <a-popconfirm
                title="确定要删除此任务吗？"
                @confirm="handleDeleteTask(record.id)"
                ok-text="确定"
                cancel-text="取消"
              >
                <a-button type="link" danger data-marker="ai_task_delete_btn">
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <div class="batch-actions" v-if="selectedRowKeys.length > 0">
        <a-space>
          <span>已选择 {{ selectedRowKeys.length }} 项</span>
          <a-popconfirm
            title="确定要删除选中的任务吗？"
            @confirm="handleBatchDelete"
            ok-text="确定"
            cancel-text="取消"
          >
            <a-button danger data-marker="ai_task_batch_delete_btn">
              批量删除
            </a-button>
          </a-popconfirm>
          <a-button @click="handleExportList" data-marker="ai_task_export_btn">
            导出清单
          </a-button>
        </a-space>
      </div>
    </a-card>

    <a-collapse :bordered="false" class="interaction-guide">
      <a-collapse-panel key="guide" header="📌 交互说明">
        <table class="guide-table">
          <thead>
            <tr>
              <th>元素</th>
              <th>标注说明</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>搜索框</td><td>按任务名称模糊搜索</td></tr>
            <tr><td>日期筛选</td><td>按创建时间范围筛选</td></tr>
            <tr><td>任务名称</td><td>点击查看任务详情</td></tr>
            <tr><td>查看详情</td><td>进入任务详情页面</td></tr>
            <tr><td>删除</td><td>删除单个任务</td></tr>
            <tr><td>批量删除</td><td>删除选中的多个任务</td></tr>
            <tr><td>导出清单</td><td>导出任务列表为Excel</td></tr>
          </tbody>
        </table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAITaskStore } from '../../stores/aiTaskStore'
import dayjs from 'dayjs'

const router = useRouter()
const aiTaskStore = useAITaskStore()

const loading = ref(false)
const searchText = ref('')
const dateRange = ref([])
const selectedRowKeys = ref([])

const columns = [
  {
    title: '任务名称',
    dataIndex: 'title',
    key: 'title',
    width: 300
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right'
  }
]

const pagination = reactive({
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => `共 ${total} 条`
})

const filteredTasks = computed(() => {
  let result = aiTaskStore.taskList

  if (searchText.value) {
    result = result.filter(task => 
      task.title.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(task => {
      const taskDate = dayjs(task.createdAt)
      return taskDate.isAfter(start) && taskDate.isBefore(end.add(1, 'day'))
    })
  }

  return result
})

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
}))

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

const handleSearch = () => {
  pagination.current = 1
}

const handleReset = () => {
  searchText.value = ''
  dateRange.value = []
  pagination.current = 1
}

const viewTaskDetail = (record) => {
  router.push(`/ai-analyses-task/${record.id}`)
}

const handleDeleteTask = (id) => {
  aiTaskStore.deleteTask(id)
  message.success('任务已删除')
}

const handleBatchDelete = () => {
  aiTaskStore.deleteTasks(selectedRowKeys.value)
  selectedRowKeys.value = []
  message.success('批量删除成功')
}

const handleExportList = () => {
  message.info('正在导出任务清单...')
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.ai-task-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.table-card {
  margin-bottom: 16px;
}

.batch-actions {
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.interaction-guide {
  margin-top: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.guide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.guide-table th,
.guide-table td {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  text-align: left;
}

.guide-table th {
  background: #fafafa;
  font-weight: 500;
}
</style>
