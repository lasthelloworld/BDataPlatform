<template>
  <div class="task-detail-container">
    <div class="page-header">
      <a-page-header
        :title="task?.title || '任务详情'"
        @back="goBack"
        data-marker="task_detail_header"
      >
        <template #extra>
          <a-space>
            <a-button @click="handleExport" data-marker="task_detail_export_btn">
              导出
            </a-button>
            <a-button type="primary" @click="handleContinueAnalysis" data-marker="task_detail_continue_btn">
              继续分析
            </a-button>
          </a-space>
        </template>
      </a-page-header>
    </div>

    <div class="task-content" v-if="task">
      <div class="left-panel" data-marker="task_detail_left_panel">
        <a-card :bordered="false" class="dashboard-card">
          <template #title>
            <span>分析结果仪表盘</span>
          </template>
          <div class="dashboard-content" ref="dashboardRef" v-html="task.htmlSnapshot || defaultDashboard" data-marker="task_detail_dashboard"></div>
        </a-card>
      </div>

      <div class="right-panel" data-marker="task_detail_right_panel">
        <a-card :bordered="false" class="context-card">
          <template #title>
            <span>任务上下文</span>
          </template>
          <div class="context-info">
            <div class="context-item">
              <span class="context-label">创建时间:</span>
              <span class="context-value">{{ formatDate(task.createdAt) }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">基准产品:</span>
              <span class="context-value">{{ task.baselineProduct || '无' }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">时间范围:</span>
              <span class="context-value">{{ task.context?.timeRange || '无' }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">筛选条件:</span>
              <span class="context-value">{{ task.context?.filters || '无' }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">分析指标:</span>
              <span class="context-value">{{ task.context?.metrics || '无' }}</span>
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="chat-card">
          <template #title>
            <span>历史对话</span>
          </template>
          <div class="chat-history" ref="chatHistoryRef">
            <div
              v-for="(msg, index) in task.messages"
              :key="index"
              :class="['message-item', msg.role]"
            >
              <div class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
              </div>
            </div>
          </div>

          <div class="input-area">
            <a-input
              v-model:value="newMessage"
              placeholder="输入追问..."
              @keyup.enter="sendNewMessage"
              data-marker="task_detail_input"
            >
              <template #suffix>
                <a-button
                  type="primary"
                  @click="sendNewMessage"
                  :disabled="!newMessage.trim()"
                  data-marker="task_detail_send_btn"
                >
                  发送
                </a-button>
              </template>
            </a-input>

            <div class="input-actions">
              <a-space :size="8">
                <a-button type="text" data-marker="task_detail_clear_context">
                  @清除上下文
                </a-button>
              </a-space>
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <a-empty v-else description="任务不存在" />

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
            <tr><td>左侧仪表盘</td><td>显示历史分析结果（图表、表格等）</td></tr>
            <tr><td>右侧对话区</td><td>显示历史对话记录，支持继续追问</td></tr>
            <tr><td>任务上下文</td><td>显示任务的基本信息和筛选条件</td></tr>
            <tr><td>继续分析</td><td>基于当前任务继续进行AI分析</td></tr>
            <tr><td>导出</td><td>导出分析结果</td></tr>
          </tbody>
        </table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAITaskStore } from '../../stores/aiTaskStore'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const aiTaskStore = useAITaskStore()

const task = ref(null)
const newMessage = ref('')
const dashboardRef = ref(null)
const chatHistoryRef = ref(null)

const defaultDashboard = `
  <div class="empty-dashboard">
    <div class="empty-icon">📊</div>
    <div class="empty-text">暂无分析结果</div>
  </div>
`

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

const goBack = () => {
  router.push('/ai-analyses-task')
}

const handleExport = () => {
  message.info('正在导出分析结果...')
}

const handleContinueAnalysis = () => {
  message.info('继续分析功能开发中...')
}

const sendNewMessage = () => {
  if (!newMessage.value.trim()) return
  
  if (task.value) {
    task.value.messages.push({
      role: 'user',
      content: newMessage.value.trim()
    })
    
    newMessage.value = ''
    
    nextTick(() => {
      if (chatHistoryRef.value) {
        chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
      }
    })
    
    setTimeout(() => {
      task.value.messages.push({
        role: 'ai',
        content: '基于历史分析结果，我继续为您分析...\n\n**新的分析结论：**\n数据趋势保持稳定，建议关注关键指标变化。'
      })
      
      nextTick(() => {
        if (chatHistoryRef.value) {
          chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
        }
      })
    }, 1000)
  }
}

onMounted(() => {
  const taskId = route.params.id
  if (taskId) {
    task.value = aiTaskStore.getTaskById(taskId)
  }
})
</script>

<style scoped>
.task-detail-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
}

.task-content {
  display: flex;
  gap: 16px;
  height: calc(100vh - 200px);
}

.left-panel {
  width: 80%;
  min-width: 0;
}

.right-panel {
  width: 20%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-card :deep(.ant-card-body) {
  flex: 1;
  overflow: auto;
}

.dashboard-content {
  height: 100%;
  overflow: auto;
}

.empty-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
}

.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.chat-card :deep(.ant-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 12px;
}

.message-item {
  display: flex;
  margin-bottom: 12px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: #1677ff;
  color: #fff;
}

.message-item.ai .message-avatar {
  background: #52c41a;
  color: #fff;
}

.message-content {
  max-width: 85%;
  margin: 0 8px;
}

.message-text {
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-item.user .message-text {
  background: #1677ff;
  color: #fff;
  border-radius: 16px 0 16px 16px;
}

.message-item.ai .message-text {
  background: #f5f5f5;
  color: #333;
  border-radius: 0 16px 16px 16px;
}

.input-area {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.input-actions {
  margin-top: 8px;
  text-align: right;
}

.context-card :deep(.ant-card-body) {
  max-height: 200px;
  overflow-y: auto;
}

.context-info {
  padding: 8px 0;
}

.context-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
}

.context-label {
  color: #666;
  min-width: 70px;
}

.context-value {
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 8px;
  word-break: break-all;
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
