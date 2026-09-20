<template>
  <div class="st-page" data-marker="scheduled-tasks-page">
    <!-- 顶部栏 -->
    <header class="st-header">
      <div class="st-header-left">
        <div class="st-title">定时任务</div>
        <div class="st-subtitle">让数据分析自动化运行，不用手动重复提问</div>
      </div>
      <button class="st-create-btn" data-marker="st-btn-create" @click="openCreateModal">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        新建任务
      </button>
    </header>

    <!-- 任务列表 -->
    <section class="st-section">
      <div class="st-section-head">
        <div class="st-section-title">任务列表</div>
        <div class="st-section-tools">
          <a-input-search
            v-model:value="taskKeyword"
            placeholder="按任务名称搜索"
            allow-clear
            style="width: 220px"
            data-marker="st-task-search"
          />
        </div>
      </div>
      <div v-if="pagedTasks.length" class="st-running-list">
        <div
          v-for="t in pagedTasks"
          :key="t.id"
          class="st-running-card"
          :data-marker="'st-running-' + t.id"
        >
          <div class="src-top">
            <span class="src-dot"></span>
            <span class="src-title">{{ t.name }}</span>
            <span class="src-status" :class="{ paused: !t.enabled }">{{ t.enabled ? '运行中' : '已暂停' }}</span>
          </div>
          <div class="src-desc">{{ t.desc }}</div>
          <div class="src-footer">
            <span class="src-cycle">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline></svg>
              {{ t.cycle }}
            </span>
            <span class="src-last">上次：{{ t.lastRun || '—' }}</span>
            <span class="src-next">下次：{{ t.nextRun || '—' }}</span>
          </div>
          <div class="src-actions">
            <a-switch
              :checked="t.enabled"
              size="small"
              :data-marker="'st-toggle-' + t.id"
              @change="(v) => toggleTask(t, v)"
            />
            <a-space size="small">
              <a-button size="small" type="link" data-marker="'st-edit-' + t.id" @click="editTask(t)">编辑</a-button>
              <a-button size="small" type="link" data-marker="'st-run-' + t.id" @click="runNow(t)">立即执行</a-button>
              <a-popconfirm title="确定删除该定时任务？" ok-text="删除" cancel-text="取消" @confirm="deleteTask(t)">
                <a-button size="small" type="link" danger :data-marker="'st-del-' + t.id">删除</a-button>
              </a-popconfirm>
            </a-space>
          </div>
        </div>
      </div>
      <div v-if="pagedTasks.length" class="st-pager">
        <a-pagination
          size="small"
          :current="taskPage"
          :page-size="taskPageSize"
          :total="filteredTasks.length"
          :show-size-changer="true"
          :page-size-options="[5, 10, 20]"
          :show-total="(total) => `共 ${total} 条任务`"
          @change="(p, s) => { taskPage = p; taskPageSize = s }"
          @show-size-change="(s) => { taskPageSize = s; taskPage = 1 }"
          data-marker="st-task-pagination"
        />
      </div>
      <div v-else class="st-empty">
        <div class="st-empty-text">{{ taskKeyword ? '没有匹配的任务' : '还没有定时任务，点击右上角「新建任务」开始' }}</div>
      </div>
    </section>

    <!-- 为你推荐（模板） -->
    <section class="st-section">
      <div class="st-section-title">为你推荐</div>
      <div class="st-template-grid">
        <div
          v-for="tpl in templates"
          :key="tpl.id"
          class="st-template-card"
          :data-marker="'st-tpl-' + tpl.id"
        >
          <div class="stpl-left">
            <div class="stpl-icon" :style="{ background: tpl.color }">
              <svg v-if="tpl.icon === 'chart'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="20" x2="21" y2="20"></line><rect x="7" y="12" width="3" height="8"></rect><rect x="12" y="6" width="3" height="14"></rect><rect x="17" y="10" width="3" height="10"></rect></svg>
              <svg v-else-if="tpl.icon === 'trend'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              <svg v-else-if="tpl.icon === 'alert'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div class="stpl-info">
              <div class="stpl-name">{{ tpl.name }}</div>
              <div class="stpl-desc">{{ tpl.desc }}</div>
            </div>
          </div>
          <button class="stpl-add" :data-marker="'st-tpl-use-' + tpl.id" @click="useTemplate(tpl)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- 新建/编辑任务弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalMode === 'edit' ? '编辑定时任务' : '新建定时任务'"
      :width="560"
      :footer="null"
      :destroy-on-close="true"
      data-marker="st-modal"
    >
      <a-form layout="vertical" class="st-form">
        <a-form-item label="任务名称" required>
          <a-input v-model:value="form.name" placeholder="如：每日 DAU 巡检" data-marker="st-form-name" />
        </a-form-item>

        <a-form-item label="执行内容" required>
          <a-textarea
            v-model:value="form.prompt"
            :rows="3"
            placeholder="描述需要定时执行的分析任务，如：监控近 7 天 DAU 趋势并标注异常"
            data-marker="st-form-prompt"
          />
        </a-form-item>

        <a-form-item label="执行频率" required>
          <a-radio-group v-model:value="form.frequency" data-marker="st-form-freq">
            <a-radio value="daily">每天</a-radio>
            <a-radio value="weekly">每周</a-radio>
            <a-radio value="monthly">每月</a-radio>
          </a-radio-group>
        </a-form-item>

        <div class="st-form-row">
          <a-form-item label="执行时间" required class="st-form-item-half">
            <a-time-picker v-model:value="form.time" format="HH:mm" data-marker="st-form-time" />
          </a-form-item>
          <a-form-item v-if="form.frequency === 'weekly'" label="星期" required class="st-form-item-half">
            <a-select v-model:value="form.weekday" data-marker="st-form-weekday">
              <a-select-option :value="1">周一</a-select-option>
              <a-select-option :value="2">周二</a-select-option>
              <a-select-option :value="3">周三</a-select-option>
              <a-select-option :value="4">周四</a-select-option>
              <a-select-option :value="5">周五</a-select-option>
              <a-select-option :value="6">周六</a-select-option>
              <a-select-option :value="7">周日</a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <a-form-item v-if="form.frequency === 'monthly'" label="日期" required>
          <a-input-number v-model:value="form.monthday" :min="1" :max="31" data-marker="st-form-monthday" />
        </a-form-item>

        <a-form-item label="启用状态">
          <a-switch v-model:checked="form.enabled" data-marker="st-form-enabled" />
        </a-form-item>

        <div class="st-form-foot">
          <a-button data-marker="st-form-cancel" @click="modalVisible = false">取消</a-button>
          <a-button type="primary" data-marker="st-form-submit" :disabled="!canSubmitForm" @click="submitForm">
            {{ modalMode === 'edit' ? '保存' : '创建' }}
          </a-button>
        </div>
      </a-form>
    </a-modal>

    <!-- 执行结果弹窗 -->
    <a-modal
      v-model:open="resultModal.visible"
      :title="resultModal.success ? '✓ 任务执行完成' : '✕ 任务执行失败'"
      :ok-text="'查看详情'"
      cancel-text="关闭"
      width="480px"
      :data-marker="'st-result-modal-' + resultModal.name"
      @ok="resultModal.visible = false"
    >
      <div class="st-result" :class="{ fail: !resultModal.success }">
        <div class="st-result-head">
          <span class="st-result-name">{{ resultModal.name }}</span>
          <span class="st-result-badge" :class="resultModal.success ? 'ok' : 'err'">
            {{ resultModal.success ? '执行成功' : '执行失败' }}
          </span>
        </div>
        <p class="st-result-summary">{{ resultModal.summary }}</p>
        <div v-if="resultModal.success" class="st-result-stats">
          <div v-for="s in resultModal.stats" :key="s.label" class="st-stat-item">
            <div class="st-stat-label">{{ s.label }}</div>
            <div class="st-stat-value">{{ s.value }}</div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 埋点清单 -->
    <details class="st-marker-list">
      <summary>📌 交互说明</summary>
      <table class="marker-table">
        <thead><tr><th>元素标识</th><th>标注说明（data-marker）</th><th>描述</th></tr></thead>
        <tbody>
          <tr><td>页面容器</td><td>scheduled-tasks-page</td><td>定时任务页面根容器</td></tr>
          <tr><td>新建任务按钮</td><td>st-btn-create</td><td>打开新建定时任务弹窗</td></tr>
          <tr><td>进行中任务卡片</td><td>st-running-{id}</td><td>每个运行中任务卡片；含开关、编辑、立即执行、删除</td></tr>
          <tr><td>任务启停开关</td><td>st-toggle-{id}</td><td>开启/关闭该定时任务</td></tr>
          <tr><td>任务编辑</td><td>st-edit-{id}</td><td>打开编辑弹窗</td></tr>
          <tr><td>立即执行</td><td>st-run-{id}</td><td>手动触发一次该任务</td></tr>
          <tr><td>任务删除</td><td>st-del-{id}</td><td>弹出二次确认后删除</td></tr>
          <tr><td>推荐模板卡片</td><td>st-tpl-{id}</td><td>预设定时任务模板，点击「+」快速创建</td></tr>
          <tr><td>模板使用按钮</td><td>st-tpl-use-{id}</td><td>基于该模板快速创建任务，带入默认参数</td></tr>
          <tr><td>新建/编辑弹窗</td><td>st-modal</td><td>任务表单：名称、内容、频率、时间、通知、启用</td></tr>
          <tr><td>表单字段</td><td>st-form-name/prompt/freq/time/weekday/monthday/cron/notify/enabled</td><td>表单各字段输入控件</td></tr>
          <tr><td>表单操作</td><td>st-form-cancel/submit</td><td>取消 / 提交创建或保存</td></tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

/* ---------- 进行中任务 mock ---------- */
const runningTasks = reactive([
  {
    id: 'task_1',
    name: '每日 DAU 巡检',
    desc: '监控 onedrama 近 7 天 DAU 趋势，标注异常波动并定位国家与渠道归因',
    cycle: '每天 09:00',
    lastRun: '2026-09-20 09:00 · 正常',
    nextRun: '2026-09-21 09:00',
    enabled: true,
    frequency: 'daily',
    time: null,
    prompt: '每日 DAU 巡检…'
  },
  {
    id: 'task_2',
    name: '每周 IAA 变现排查',
    desc: '每周一排查 Photo Recover IAA 广告链路（请求→填充→展示→点击→收入）的异常环节',
    cycle: '每周一 10:30',
    lastRun: '2026-09-15 10:32 · 正常',
    nextRun: '2026-09-22 10:30',
    enabled: true,
    frequency: 'weekly',
    weekday: 1,
    time: null,
    prompt: '每周 IAA 变现排查…'
  },
  {
    id: 'task_3',
    name: '每日 ROI 监控',
    desc: '每日输出 onedrama 各国家 × 渠道 ROI，低于 100% 高亮预警',
    cycle: '每天 18:00',
    lastRun: '2026-09-20 18:00 · 正常',
    nextRun: '2026-09-21 18:00',
    enabled: false,
    frequency: 'daily',
    time: null,
    prompt: '每日 ROI 监控…'
  }
])

/* ---------- 推荐模板 mock（4 个常用场景） ---------- */
/* 搜索 + 分页 */
const taskKeyword = ref('')
const taskPage = ref(1)
const taskPageSize = ref(5)
const filteredTasks = computed(() => {
  const kw = taskKeyword.value.trim().toLowerCase()
  if (!kw) return runningTasks
  return runningTasks.filter(t => (t.name || '').toLowerCase().includes(kw))
})
const pagedTasks = computed(() => {
  const start = (taskPage.value - 1) * taskPageSize.value
  return filteredTasks.value.slice(start, start + taskPageSize.value)
})

const templates = [
  {
    id: 'tpl_1', name: '同品类多产品对比',
    desc: '选定基准产品和对比产品，核心指标对比，箭头颜色标出涨跌',
    icon: 'chart', color: '#e6f4ff',
    prompt: '同品类多产品对比：选定基准产品和 N 个对比产品、对比时间范围，输出核心指标对比表格明细，使用箭头和颜色标出涨跌情况'
  },
  {
    id: 'tpl_2', name: '产品细分维度对比',
    desc: '按渠道/国家/优化师等细分维度对比核心指标',
    icon: 'chart', color: '#f9f0ff',
    prompt: '产品细分维度对比：指定品类、一批产品、细分到投放渠道/国家/投放优化师等维度，输出核心指标对比表格明细，使用箭头和颜色标出涨跌情况'
  },
  {
    id: 'tpl_3', name: '产品指标趋势对比',
    desc: '基准日环比近 X 天核心指标涨跌 + 分日趋势图',
    icon: 'trend', color: '#e6fffb',
    prompt: '产品指标趋势对比：指定品类、一批产品、基准日，环比近 X 天核心指标的涨跌变化情况，输出对比表格明细 + 多个指标分日趋势变化图'
  },
  {
    id: 'tpl_4', name: '产品版本对比',
    desc: '选定基准时间与发版时间，对比同一包不同版本核心指标增长',
    icon: 'trend', color: '#f6ffed',
    prompt: '产品版本对比：每个产品定义一个月参考指标标准，选定基准时间和发版时间，对比发版后与同期版本之前的核心指标增长变化情况，输出对比表格明细'
  }
]

/* ---------- 表单 ---------- */
const modalVisible = ref(false)
const modalMode = ref('create') // create | edit
const editingId = ref(null)

const form = reactive({
  name: '',
  prompt: '',
  frequency: 'daily',
  time: null,       // dayjs 对象，a-time-picker
  weekday: 1,
  monthday: 1,
  enabled: true
})

function resetForm() {
  form.name = ''
  form.prompt = ''
  form.frequency = 'daily'
  form.time = null
  form.weekday = 1
  form.monthday = 1
  form.enabled = true
}

const canSubmitForm = computed(() => {
  if (!form.name.trim() || !form.prompt.trim()) return false
  if (!form.time) return false
  return true
})

function openCreateModal() {
  modalMode.value = 'create'
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

function editTask(t) {
  modalMode.value = 'edit'
  editingId.value = t.id
  form.name = t.name
  form.prompt = t.prompt || ''
  form.frequency = t.frequency || 'daily'
  form.time = t.time || null
  form.weekday = t.weekday || 1
  form.monthday = t.monthday || 1
  form.enabled = t.enabled
  modalVisible.value = true
}

function toggleTask(t, v) {
  t.enabled = v
  message.success(v ? '任务已启用' : '任务已暂停')
}

/* 执行结果弹窗 */
const resultModal = reactive({ visible: false, name: '', success: true, summary: '', stats: [] })

function runNow(t) {
  message.loading({ content: `正在执行「${t.name}」…`, key: 'run-now' })
  setTimeout(() => {
    // mock 执行结果
    const ok = Math.random() > 0.15
    resultModal.name = t.name
    resultModal.success = ok
    resultModal.summary = ok
      ? `任务执行完成，输出 1 份对比表格明细，已按涨跌标注颜色；${Math.random() > 0.5 ? '趋势图已生成。' : ''}`
      : '任务执行失败：数据源连接超时，请检查配置后重试。'
    resultModal.stats = ok
      ? [
          { label: '对比维度', value: '8 个核心指标' },
          { label: '产品数量', value: '4 个产品' },
          { label: '时间范围', value: '近 30 天' },
          { label: '耗时', value: (Math.random() * 3 + 2).toFixed(1) + 's' }
        ]
      : []
    resultModal.visible = true
    message.destroy('run-now')
  }, 1200)
}

function deleteTask(t) {
  const i = runningTasks.findIndex(x => x.id === t.id)
  if (i >= 0) runningTasks.splice(i, 1)
  message.success('已删除')
}

function useTemplate(tpl) {
  modalMode.value = 'create'
  editingId.value = null
  resetForm()
  form.name = tpl.name
  form.prompt = tpl.desc
  modalVisible.value = true
}

function submitForm() {
  if (!canSubmitForm.value) return

  const timeStr = form.time ? form.time.format('HH:mm') : ''
  let cycleLabel = ''
  if (form.frequency === 'daily') cycleLabel = `每天 ${timeStr}`
  else if (form.frequency === 'weekly') {
    const weekdays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
    cycleLabel = `每周${weekdays[form.weekday]} ${timeStr}`
  } else if (form.frequency === 'monthly') cycleLabel = `每月 ${form.monthday} 日 ${timeStr}`

  if (modalMode.value === 'create') {
    const newTask = {
      id: 'task_' + Date.now(),
      name: form.name,
      desc: form.prompt.length > 50 ? form.prompt.slice(0, 50) + '…' : form.prompt,
      cycle: cycleLabel,
      lastRun: '—',
      nextRun: '按计划执行',
      enabled: form.enabled,
      frequency: form.frequency,
      time: form.time,
      weekday: form.weekday,
      monthday: form.monthday,
      prompt: form.prompt
    }
    runningTasks.unshift(newTask)
    message.success('定时任务创建成功')
  } else {
    const t = runningTasks.find(x => x.id === editingId.value)
    if (t) {
      t.name = form.name
      t.desc = form.prompt.length > 50 ? form.prompt.slice(0, 50) + '…' : form.prompt
      t.cycle = cycleLabel
      t.enabled = form.enabled
      t.frequency = form.frequency
      t.time = form.time
      t.weekday = form.weekday
      t.monthday = form.monthday
      t.prompt = form.prompt
      message.success('保存成功')
    }
  }
  modalVisible.value = false
}
</script>

<style scoped>
.st-page {
  height: 100%;
  padding: 20px 28px 32px;
  background: #f7f8fa;
  box-sizing: border-box;
  overflow-y: auto;
}

/* Header */
.st-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
}
.st-title { font-size: 22px; font-weight: 600; color: #1f2937; }
.st-subtitle { margin-top: 4px; font-size: 13px; color: #6b7280; }
.st-create-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 36px; padding: 0 16px;
  background: #1677ff; color: #fff;
  border: none; border-radius: 6px;
  font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.2s;
}
.st-create-btn:hover { background: #4096ff; }

/* Section */
.st-section { margin-bottom: 32px; }
.st-section-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px;
}
.st-section-title {
  font-size: 15px; font-weight: 600; color: #1f2937;
  padding-left: 4px;
  border-left: 3px solid #1677ff;
}
.st-section-tools { display: flex; gap: 12px; align-items: center; }

/* 任务列表卡片 */
.st-running-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 16px;
}
.st-running-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 10px;
  padding: 16px 18px 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.st-running-card:hover {
  border-color: #91caff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.1);
}
.src-top {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 8px;
}
.src-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.15);
}
.src-title { font-size: 15px; font-weight: 600; color: #1f2937; }
.src-status {
  margin-left: auto;
  font-size: 12px; color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px; padding: 1px 8px;
}
.src-status.paused {
  color: #8c8c8c; background: #f5f5f5; border-color: #d9d9d9;
}
.st-pager {
  display: flex; justify-content: flex-end; padding: 14px 4px 0;
}
.st-running-card :deep(.ant-switch-checked) { background: #52c41a; }
.st-running-card:not(.enabled) .src-dot { background: #bfbfbf; box-shadow: none; }

.src-desc { font-size: 13px; color: #6b7280; line-height: 1.55; margin-bottom: 12px; }

.src-footer {
  display: flex; align-items: center; gap: 16px;
  font-size: 12px; color: #8a94a6;
  padding-top: 10px; border-top: 1px dashed #eef0f5;
}
.src-footer svg { color: #1677ff; }
.src-cycle { display: inline-flex; align-items: center; gap: 4px; color: #1677ff; font-weight: 500; }
.src-last { margin-left: auto; }

.src-actions {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 12px;
}

/* 推荐模板 */
.st-template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.st-template-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 14px 14px 16px;
  background: #fff;
  border: 1px solid #eef0f5;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.st-template-card:hover {
  border-color: #1677ff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.08);
  transform: translateY(-1px);
}
.stpl-left { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; }
.stpl-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #1677ff; flex-shrink: 0;
}
.stpl-info { min-width: 0; }
.stpl-name { font-size: 14px; font-weight: 500; color: #1f2937; }
.stpl-desc { font-size: 12px; color: #8a94a6; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stpl-add {
  width: 28px; height: 28px; flex-shrink: 0;
  background: #f5f9ff; color: #1677ff;
  border: 1px solid #d6e7ff;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.st-template-card:hover .stpl-add {
  background: #1677ff; color: #fff; border-color: #1677ff;
}

/* 空态 */
.st-empty {
  padding: 40px; text-align: center;
  background: #fff; border: 1px dashed #e5e7eb; border-radius: 10px;
}
.st-empty-text { font-size: 13px; color: #9ca3af; }

/* 表单 */
.st-form :deep(.ant-form-item-label > label) { font-size: 13px; color: #374151; }
.st-form-row {
  display: flex; gap: 16px;
}
.st-form-item-half { flex: 1; }
.st-form-foot {
  display: flex; justify-content: flex-end; gap: 10px;
  margin-top: 8px; padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 埋点清单 */
.st-marker-list {
  margin-top: 40px; padding: 12px 16px;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
}
.st-marker-list summary {
  cursor: pointer; font-size: 13px; color: #6b7280; padding: 4px 0;
}
.marker-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
.marker-table th, .marker-table td {
  border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left;
}
.marker-table th { background: #f0f2f5; color: #374151; }
.marker-table td { color: #6b7280; }

/* 执行结果弹窗 */
.st-result { padding: 4px 0; }
.st-result.fail .st-result-name { color: #cf1322; }
.st-result-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.st-result-name { font-size: 15px; font-weight: 600; color: #1f2937; }
.st-result-badge {
  font-size: 12px; padding: 2px 10px; border-radius: 10px; font-weight: 500;
}
.st-result-badge.ok { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f; }
.st-result-badge.err { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
.st-result-summary { font-size: 13px; color: #374151; line-height: 1.6; margin: 0 0 14px; }
.st-result-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px;
  padding: 12px; background: #f7f8fa; border-radius: 6px;
}
.st-stat-item .st-stat-label { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
.st-stat-item .st-stat-value { font-size: 14px; color: #1f2937; font-weight: 600; }
</style>
