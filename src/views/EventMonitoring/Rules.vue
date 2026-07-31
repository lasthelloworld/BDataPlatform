<template>
  <div class="em-rules">
    <div class="page-header">
      <div>
        <div class="page-title">规则管理</div>
        <div class="page-desc">配置和管理所有监控规则，支持启用/停用、编辑、复制和删除</div>
      </div>
      <a-button type="primary" @click="openCreateModal" data-marker="新建规则按钮-规则管理页">+ 新建规则</a-button>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <a-select v-model:value="projectFilter" placeholder="全部项目组" style="width:160px" data-marker="规则管理-项目组筛选" allow-clear>
          <a-select-option value="">全部项目组</a-select-option>
          <a-select-option value="ad">广告聚合</a-select-option>
          <a-select-option value="growth">用户增长</a-select-option>
          <a-select-option value="content">内容中台</a-select-option>
        </a-select>
        <a-select v-model:value="statusFilter" placeholder="全部状态" style="width:130px" data-marker="规则管理-启用状态筛选" allow-clear>
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="on">已启用</a-select-option>
          <a-select-option value="off">已停用</a-select-option>
        </a-select>
      </div>
      <div class="toolbar-right">
        <a-input v-model:value="searchText" placeholder="按规则名称搜索..." style="width:220px" data-marker="规则管理-规则名称搜索" allow-clear />
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredRules"
      :pagination="pagination"
      :row-key="'id'"
      size="middle"
      bordered
      data-marker="规则列表表格"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span class="rule-name">
            <span class="toggle" :class="{ on: record.enabled }" @click="toggleRule(record.id)" :data-marker="'规则启停开关-' + record.name"></span>
            {{ record.name }}
          </span>
        </template>
        <template v-else-if="column.key === 'factor'">
          <code class="mono">{{ record.factor }}</code>
        </template>
        <template v-else-if="column.key === 'freq'">
          <a-tag color="blue">{{ record.freq }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" type="link" @click="openEditModal(record)" :data-marker="'编辑规则-' + record.name">编辑</a-button>
            <a-button size="small" type="link" @click="copyRule(record)">复制</a-button>
            <a-button size="small" type="link" :danger="!record.enabled" @click="toggleRule(record.id)">{{ record.enabled ? '停用' : '启用' }}</a-button>
            <a-popconfirm title="确定删除此规则？" @confirm="deleteRule(record.id)">
              <a-button size="small" type="link" danger :data-marker="'删除规则-' + record.name">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <RuleModal v-model:visible="modalVisible" :rule="editingRule" @saved="onRuleSaved" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import RuleModal from './RuleModal.vue'

const projectFilter = ref('')
const statusFilter = ref('')
const searchText = ref('')
const modalVisible = ref(false)
const editingRule = ref(null)

const pagination = reactive({ current: 1, pageSize: 20, total: 0 })

const rules = ref([
  { id: 1, name: 'Ecpm低值监控', project: '广告聚合', projectKey: 'ad', factor: 'AVG(params.ecpm)', condition: '< 0.5', window: '最近5分钟', freq: '每5分钟', freqKey: '5min', lastTrigger: '2026-07-31 14:35', enabled: true },
  { id: 2, name: '空值率监控', project: '广告聚合', projectKey: 'ad', factor: 'NULL_RATE(account_id)', condition: '> 5%', window: '昨日全天', freq: '每日 T+1', freqKey: 'daily', lastTrigger: '2026-07-31 01:00', enabled: true },
  { id: 3, name: '事件顺序异常', project: '用户增长', projectKey: 'growth', factor: 'SEQUENCE_MATCH', condition: '实时匹配', window: '逐条', freq: '实时', freqKey: 'realtime', lastTrigger: '2026-07-31 14:32', enabled: true },
  { id: 4, name: 'DAU骤降监控', project: '用户增长', projectKey: 'growth', factor: 'COUNT(DISTINCT user_id)', condition: '< 昨日-20%', window: '最近1小时', freq: '每小时', freqKey: 'hourly', lastTrigger: '2026-07-31 13:00', enabled: true },
  { id: 5, name: '高延迟告警', project: '内容中台', projectKey: 'content', factor: 'P99(delay)', condition: '> 5000ms', window: '最近10分钟', freq: '每5分钟', freqKey: '5min', lastTrigger: '2026-07-31 14:25', enabled: false },
  { id: 6, name: '转化漏斗异常', project: '广告聚合', projectKey: 'ad', factor: '转化率(40601→40605)', condition: '< 10%', window: '最近15分钟', freq: '每5分钟', freqKey: '5min', lastTrigger: '2026-07-31 14:30', enabled: true },
  { id: 7, name: '重复事件检测', project: '内容中台', projectKey: 'content', factor: 'COUNT(event_id)', condition: '> 1000/分钟', window: '逐条', freq: '实时', freqKey: 'realtime', lastTrigger: '2026-07-31 14:33', enabled: true },
  { id: 8, name: '用户留存异常', project: '用户增长', projectKey: 'growth', factor: '次日留存率', condition: '< 40%', window: '昨日全天', freq: '每日 T+1', freqKey: 'daily', lastTrigger: '2026-07-31 01:00', enabled: false }
])

const filteredRules = computed(() => {
  return rules.value.filter(r => {
    if (projectFilter.value && r.projectKey !== projectFilter.value) return false
    if (statusFilter.value === 'on' && !r.enabled) return false
    if (statusFilter.value === 'off' && r.enabled) return false
    if (searchText.value && !r.name.toLowerCase().includes(searchText.value.toLowerCase())) return false
    return true
  })
})

const columns = [
  { title: '规则名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '项目组', dataIndex: 'project', key: 'project' },
  { title: '计算因子', dataIndex: 'factor', key: 'factor' },
  { title: '触发条件', dataIndex: 'condition', key: 'condition' },
  { title: '时间窗口', dataIndex: 'window', key: 'window' },
  { title: '执行频率', dataIndex: 'freq', key: 'freq', width: 100 },
  { title: '最近触发', dataIndex: 'lastTrigger', key: 'lastTrigger' },
  { title: '操作', key: 'action', width: 240, fixed: 'right' }
]

const toggleRule = (id) => {
  const r = rules.value.find(x => x.id === id)
  if (r) r.enabled = !r.enabled
}

const openCreateModal = () => {
  editingRule.value = null
  modalVisible.value = true
}

const openEditModal = (record) => {
  editingRule.value = { ...record }
  modalVisible.value = true
}

const copyRule = (record) => {
  editingRule.value = { ...record, id: null, name: record.name + ' (副本)' }
  modalVisible.value = true
}

const deleteRule = (id) => {
  rules.value = rules.value.filter(r => r.id !== id)
  message.success('规则已删除')
}

const onRuleSaved = () => {
  modalVisible.value = false
  message.success('规则保存成功')
}
</script>

<style scoped>
.em-rules { padding: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1E293B; }
.page-desc { font-size: 13px; color: #64748B; margin-top: 4px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.toolbar-left { display: flex; gap: 12px; flex-wrap: wrap; }
.rule-name { display: flex; align-items: center; gap: 10px; }
.toggle { position: relative; width: 38px; height: 20px; background: #CBD5E1; border-radius: 20px; cursor: pointer; transition: background 0.2s; }
.toggle.on { background: #4F46E5; }
.toggle::after { content: ''; position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.on::after { transform: translateX(18px); }
.mono { font-family: monospace; font-size: 12px; color: #4F46E5; background: #EEF2FF; padding: 2px 6px; border-radius: 4px; }
</style>
