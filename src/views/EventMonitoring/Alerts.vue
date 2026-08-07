<template>
  <div class="em-alerts">
    <div class="page-header">
      <div>
        <div class="page-title">告警历史</div>
        <div class="page-desc">查看所有历史告警记录，支持筛选、标记处理、查看命中明细与导出</div>
      </div>
      <div class="refresh-tip" data-marker="告警自动刷新提示">
        <span class="dot pulse"></span>
        每半小时系统自动刷新 · 上次刷新：{{ lastRefresh }}
      </div>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <a-select v-model:value="productGroupFilter" placeholder="全部产品组" style="width:160px" data-marker="告警历史-产品组筛选" allow-clear>
          <a-select-option value="">全部产品组</a-select-option>
          <a-select-option value="pg1">产品1组</a-select-option>
          <a-select-option value="pg2">产品2组</a-select-option>
          <a-select-option value="pg3">产品3组</a-select-option>
        </a-select>
        
        <a-select v-model:value="levelFilter" placeholder="全部等级" style="width:140px" data-marker="告警历史-监控等级筛选" allow-clear>
          <a-select-option value="">全部等级</a-select-option>
          <a-select-option value="P0">P0 致命</a-select-option>
          <a-select-option value="P1">P1 严重</a-select-option>
          <a-select-option value="P2">P2 一般</a-select-option>
        </a-select>

        <a-select v-model:value="statusFilter" placeholder="全部状态" style="width:140px" data-marker="告警历史-告警状态筛选" allow-clear>
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="pending">未处理</a-select-option>
          <a-select-option value="resolved">已处理</a-select-option>
        </a-select>
        <a-date-picker v-model:value="startDate" placeholder="开始日期" style="width:150px" data-marker="告警历史-开始日期" />
        <span style="color:#64748B">—</span>
        <a-date-picker v-model:value="endDate" placeholder="结束日期" style="width:150px" data-marker="告警历史-结束日期" />
      </div>
      <div class="toolbar-right">
        <a-input v-model:value="searchText" placeholder="按规则名称搜索..." style="width:220px" data-marker="告警历史-规则名称搜索" allow-clear />
        <a-button type="primary" data-marker="告警历史-导出明细">导出明细</a-button>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat" data-marker="当日总告警数卡片">
        <div class="val red">{{ stats.total }}</div>
        <div class="stat-lbl">总告警数</div>
      </div>
      <div class="stat" data-marker="当日未处理数卡片">
        <div class="val amber">{{ stats.pending }}</div>
        <div class="stat-lbl">未处理数</div>
      </div>
      <div class="stat" data-marker="当日已处理数卡片">
        <div class="val green">{{ stats.resolved }}</div>
        <div class="stat-lbl">已处理数</div>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredAlerts"
      :pagination="{ current: 1, pageSize: 20, total: filteredAlerts.length }"
      :row-key="'id'"
      size="middle"
      bordered
      data-marker="告警列表表格"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'level'">
          <a-tag :color="levelColorMap[record.level]">{{ levelLabelMap[record.level] || record.level }}</a-tag>
        </template>
        <template v-else-if="column.key === 'ruleDesc'">
          <a-button size="small" type="link" @click="openRuleModal(record)" :data-marker="'查看规则说明-' + record.rule">查看</a-button>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="statusColorMap[record.status]">{{ statusLabelMap[record.status] }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" type="link" @click="markResolved(record)" :disabled="record.status === 'resolved'" :data-marker="'标记处理-' + record.rule">标记处理</a-button>
            <a-button size="small" type="link" @click="openDetail(record)" :data-marker="'查看告警详情-' + record.rule">查看详情</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 规则说明弹窗（只读模式，复用 RuleModal） -->
    <RuleModal v-model:visible="ruleModalVisible" :rule="viewingRule" :readonly="true" />

    <!-- 告警日志明细侧滑 -->
    <a-drawer v-model:open="drawerVisible" title="告警日志明细" width="560" :body-style="{ padding: '16px 20px' }" :footer-style="{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }">
      <div v-if="currentAlert">
        <div class="drawer-section">
          <div class="drawer-section-title">命中规则及规则快照</div>
          <div class="kv"><span class="k">规则名称</span><span class="v">{{ currentAlert.rule }}</span></div>
          <div class="kv"><span class="k">监控维度</span><span class="v">{{ currentAlert.dimension }}</span></div>
          <div class="kv"><span class="k">计算因子</span><span class="v"><code class="mono">{{ currentAlert.factor }}</code></span></div>
          <div class="kv"><span class="k">触发条件</span><span class="v" style="color:#EF4444">{{ currentAlert.condition }}</span></div>
        </div>
        <div class="drawer-section">
          <div class="drawer-section-title">触发窗口期范围与数据条数</div>
          <div class="kv"><span class="k">触发执行时间</span><span class="v">{{ currentAlert.time }}</span></div>
          <div class="kv"><span class="k">窗口范围</span><span class="v">{{ currentAlert.window }}</span></div>
          <div class="kv"><span class="k">命中数据条数</span><span class="v" style="color:#EF4444;font-weight:600">{{ currentAlert.hitCount }} 条</span></div>
        </div>
        <div class="drawer-section">
          <div class="drawer-section-title">命中数据明细</div>
          <table class="sample-table" data-marker="命中数据明细表格">
            <thead><tr><th>event_id</th><th>user_id</th><th>country</th><th>命中值</th></tr></thead>
            <tbody>
              <tr v-for="(row, i) in currentAlert.hitData" :key="i">
                <td>{{ row.event_id }}</td><td>{{ row.user_id }}</td><td>{{ row.country }}</td><td>{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <a-space>
          <a-button @click="markResolved(currentAlert)" :disabled="currentAlert && currentAlert.status === 'resolved'" data-marker="告警详情-标记处理">标记处理</a-button>
          <a-button type="primary" @click="exportDetail" data-marker="告警详情-导出明细">导出明细 (CSV)</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import RuleModal from './RuleModal.vue'

const statusColorMap = { pending: 'red', resolved: 'green' }
const statusLabelMap = { pending: '未处理', resolved: '已处理' }
const levelLabelMap = { P0: 'P0 致命', P1: 'P1 严重', P2: 'P2 一般' }
const levelColorMap = { P0: 'red', P1: 'orange', P2: 'blue' }

const productGroupFilter = ref('')
const statusFilter = ref('')
const levelFilter = ref('')
const startDate = ref(null)
const endDate = ref(null)
const searchText = ref('')

const drawerVisible = ref(false)
const ruleModalVisible = ref(false)
const currentAlert = ref(null)
const viewingRule = ref(null)
const lastRefresh = ref('')

// 规则完整配置（与规则管理页一致），用于只读查看
const ruleConfigs = {
  'Ecpm低值监控': {
    name: 'Ecpm低值监控',
    description: '监控广告点击事件的 ECPM 平均值，低于阈值时告警',
    level: 'P2',
    productGroups: ['pg1'], apps: ['recover1'], appVersions: ['v1.0.0'], countries: [], channels: [],
    freqKey: 'hourly', window: '60min', dataWindowMode: undefined,
    alertChannels: ['wework'], receiver: 'ops@hopemobi.com', silencePeriod: 30, antiShake: true, recoverNotify: true,
    conditions: [{ logicOp: 'AND', fields: [{ fieldType: 'params', field: 'params.type1', aggFunc: 'AVG', aggTarget: '', calcOp: '' }], compareOp: '<', threshold: '0.5' }]
  },
  '空值率监控': {
    name: '空值率监控',
    description: '监控 account_id 字段空值率，超过阈值时告警',
    level: 'P1',
    productGroups: ['pg1'], apps: ['recover2'], appVersions: [], countries: [], channels: [],
    freqKey: 'daily', window: 'yesterday', dataWindowMode: undefined,
    alertChannels: ['wework'], receiver: 'ops@hopemobi.com', silencePeriod: 60, antiShake: true, recoverNotify: true,
    conditions: [{ logicOp: 'AND', fields: [{ fieldType: 'other', field: 'account_id', aggFunc: '', aggTarget: '', calcOp: '' }], compareOp: 'is null', threshold: '' }]
  },
  '事件顺序异常': {
    name: '事件顺序异常',
    description: '监控用户事件序列是否符合预期流程',
    level: 'P1',
    productGroups: ['pg2'], apps: [], appVersions: [], countries: [], channels: [],
    freqKey: 'hourly', window: '60min', dataWindowMode: undefined,
    alertChannels: ['wework'], receiver: 'dev@hopemobi.com', silencePeriod: 30, antiShake: true, recoverNotify: true,
    conditions: [{ logicOp: 'AND', fields: [{ fieldType: 'event_id', field: '', aggFunc: '', aggTarget: '', calcOp: '' }], compareOp: 'in', threshold: '40602' }]
  },
  '高延迟告警': {
    name: '高延迟告警',
    description: '监控事件上报延迟 P99 值，超过阈值时告警',
    level: 'P2',
    productGroups: ['pg3'], apps: [], appVersions: [], countries: [], channels: [],
    freqKey: 'hourly', window: '60min', dataWindowMode: undefined,
    alertChannels: ['wework'], receiver: 'dev@hopemobi.com', silencePeriod: 30, antiShake: true, recoverNotify: true,
    conditions: [{ logicOp: 'AND', fields: [{ fieldType: 'other', field: 'delay', aggFunc: 'Max', aggTarget: '', calcOp: '' }], compareOp: '>', threshold: '5000ms' }]
  },
  'DAU骤降监控': {
    name: 'DAU骤降监控',
    description: '监控日活跃用户数环比下降幅度',
    level: 'P0',
    productGroups: ['pg2'], apps: ['recover3'], appVersions: [], countries: ['us'], channels: [],
    freqKey: 'hourly', window: '60min', dataWindowMode: undefined,
    alertChannels: ['wework'], receiver: 'ops@hopemobi.com', silencePeriod: 60, antiShake: true, recoverNotify: true,
    conditions: [{ logicOp: 'AND', fields: [{ fieldType: 'user_pseudo_id', field: '', aggFunc: 'Count', aggTarget: '', calcOp: '' }], compareOp: '<', threshold: '昨日-20%' }]
  },
  '转化漏斗异常': {
    name: '转化漏斗异常',
    description: '监控 40601→40605 转化漏斗转化率',
    level: 'P0',
    productGroups: ['pg1'], apps: ['recover1'], appVersions: [], countries: [], channels: ['FB'],
    freqKey: 'hourly', window: '60min', dataWindowMode: undefined,
    alertChannels: ['wework'], receiver: 'ops@hopemobi.com', silencePeriod: 30, antiShake: true, recoverNotify: true,
    conditions: [{ logicOp: 'AND', fields: [{ fieldType: 'event_id', field: '', aggFunc: 'Count', aggTarget: '', calcOp: '/' }, { fieldType: 'event_id', field: '', aggFunc: 'Count', aggTarget: '', calcOp: '' }], compareOp: '<', threshold: '10%' }]
  },
  '重复事件检测': {
    name: '重复事件检测',
    description: '监控同一事件高频重复触发',
    level: 'P2',
    productGroups: ['pg3'], apps: [], appVersions: [], countries: [], channels: ['Tiktok'],
    freqKey: 'hourly', window: '60min', dataWindowMode: undefined,
    alertChannels: ['wework'], receiver: 'dev@hopemobi.com', silencePeriod: 30, antiShake: true, recoverNotify: true,
    conditions: [{ logicOp: 'AND', fields: [{ fieldType: 'event_id', field: '', aggFunc: 'Count', aggTarget: '', calcOp: '' }], compareOp: '>', threshold: '1000/分钟' }]
  },
  '用户留存异常': {
    name: '用户留存异常',
    description: '监控次日留存率，低于阈值时告警',
    level: 'P1',
    productGroups: ['pg2'], apps: [], appVersions: [], countries: [], channels: ['google'],
    freqKey: 'daily', window: 'yesterday', dataWindowMode: undefined,
    alertChannels: ['wework'], receiver: 'ops@hopemobi.com', silencePeriod: 60, antiShake: true, recoverNotify: true,
    conditions: [{ logicOp: 'AND', fields: [{ fieldType: 'user_pseudo_id', field: '', aggFunc: 'AVG', aggTarget: '', calcOp: '' }], compareOp: '<', threshold: '40%' }]
  }
}

const alerts = ref([
  { id: 1, time: '2026-07-31 14:35:00', rule: 'Ecpm低值监控', level: 'P2', productGroup: 'pg1', dimension: '产品1组 / Phone Recover1 / v1.0.0', factor: 'AVG(params.ecpm)', condition: '< 0.5', freq: '每5分钟', window: '最近5分钟', status: 'pending', hitCount: 4, hitData: [
    { event_id: 'ad_click', user_id: 'u_10023', country: 'US', value: '0.21' },
    { event_id: 'ad_click', user_id: 'u_10456', country: 'CN', value: '0.35' },
    { event_id: 'ad_click', user_id: 'u_10891', country: 'JP', value: '0.18' },
    { event_id: 'ad_click', user_id: 'u_11205', country: 'KR', value: '0.42' }
  ]},
  { id: 2, time: '2026-07-31 14:30:00', rule: '空值率监控', level: 'P1', project: 'pg1', productGroup: 'pg1', dimension: '产品1组 / Phone Recover2', factor: 'NULL_RATE(account_id)', condition: '> 5%', freq: '每日 T+1', window: '昨日全天', status: 'resolved', hitCount: 2, hitData: [
    { event_id: 'ad_impression', user_id: 'u_20011', country: 'US', value: '6.2%' },
    { event_id: 'ad_impression', user_id: 'u_20045', country: 'BR', value: '5.8%' }
  ]},
  { id: 3, time: '2026-07-31 14:25:00', rule: '事件顺序异常', level: 'P1', project: 'pg2', productGroup: 'pg2', dimension: '产品2组 / 全部App', factor: 'SEQUENCE_MATCH', condition: '实时匹配', freq: '实时', window: '逐条', status: 'pending', hitCount: 3, hitData: [
    { event_id: '40601', user_id: 'u_30120', country: 'US', value: '序列不匹配' },
    { event_id: '40602', user_id: 'u_30155', country: 'ID', value: '缺失40602' },
    { event_id: '40601', user_id: 'u_30188', country: 'JP', value: '序列不匹配' }
  ]},
  { id: 4, time: '2026-07-31 14:20:00', rule: '高延迟告警', level: 'P2', project: 'pg3', productGroup: 'pg3', dimension: '产品3组 / 全部版本', factor: 'P99(delay)', condition: '> 5000ms', freq: '每5分钟', window: '最近10分钟', status: 'resolved', hitCount: 1, hitData: [
    { event_id: 'ad_click', user_id: 'u_40110', country: 'DE', value: '6800ms' }
  ]},
  { id: 5, time: '2026-07-31 14:15:00', rule: 'DAU骤降监控', level: 'P0', project: 'pg2', productGroup: 'pg2', dimension: '产品2组 / Phone Recover3 / 美国-us', factor: 'COUNT(DISTINCT user_id)', condition: '< 昨日-20%', freq: '每小时 H+1', window: '最近1小时', status: 'pending', hitCount: 1, hitData: [
    { event_id: '40601', user_id: '聚合', country: 'US', value: '-25%' }
  ]},
  { id: 6, time: '2026-07-31 14:10:00', rule: '转化漏斗异常', level: 'P0', project: 'pg1', productGroup: 'pg1', dimension: '产品1组 / Phone Recover1 / FB', factor: '转化率(40601→40605)', condition: '< 10%', freq: '每5分钟', window: '最近15分钟', status: 'resolved', hitCount: 2, hitData: [
    { event_id: '40605', user_id: '聚合', country: 'US', value: '8.3%' },
    { event_id: '40605', user_id: '聚合', country: 'KR', value: '9.1%' }
  ]},
  { id: 7, time: '2026-07-31 14:05:00', rule: '重复事件检测', level: 'P2', project: 'pg3', productGroup: 'pg3', dimension: '产品3组 / TikTok', factor: 'COUNT(event_id)', condition: '> 1000/分钟', freq: '实时', window: '逐条', status: 'resolved', hitCount: 1, hitData: [
    { event_id: 'ad_click', user_id: '聚合', country: 'US', value: '1250/min' }
  ]},
  { id: 8, time: '2026-07-31 14:00:00', rule: '用户留存异常', level: 'P1', project: 'pg2', productGroup: 'pg2', dimension: '产品2组 / Google', factor: '次日留存率', condition: '< 40%', freq: '每日 T+1', window: '昨日全天', status: 'pending', hitCount: 1, hitData: [
    { event_id: '40601', user_id: '聚合', country: 'US', value: '38.2%' }
  ]}
])

const stats = computed(() => ({
  total: alerts.value.length,
  pending: alerts.value.filter(a => a.status === 'pending').length,
  resolved: alerts.value.filter(a => a.status === 'resolved').length
}))

const filteredAlerts = computed(() => {
  return alerts.value.filter(a => {
    if (productGroupFilter.value && a.productGroup !== productGroupFilter.value) return false
    if (statusFilter.value && a.status !== statusFilter.value) return false
    if (levelFilter.value && a.level !== levelFilter.value) return false
    if (searchText.value && !a.rule.toLowerCase().includes(searchText.value.toLowerCase())) return false
    return true
  })
})

const columns = [
  { title: '触发执行时间', dataIndex: 'time', key: 'time', width: 170 },
  { title: '监控等级', dataIndex: 'level', key: 'level', width: 100 },
  { title: '规则名称', dataIndex: 'rule', key: 'rule', width: 160 },
  { title: '监控维度', dataIndex: 'dimension', key: 'dimension' },
  { title: '规则说明', key: 'ruleDesc', width: 90, align: 'center' },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const openRuleModal = (record) => {
  // 从规则配置中查找完整规则数据，用于只读查看
  const config = ruleConfigs[record.rule] || { name: record.rule, description: '', productGroups: [record.productGroup], freqKey: 'hourly', window: '60min' }
  viewingRule.value = { ...config, level: record.level || config.level }
  ruleModalVisible.value = true
}

const openDetail = (record) => {
  currentAlert.value = record
  drawerVisible.value = true
}

const markResolved = (record) => {
  if (!record || record.status === 'resolved') return
  record.status = 'resolved'
  message.success('已标记为已处理')
}

const exportDetail = () => {
  if (!currentAlert.value) return
  const rows = currentAlert.value.hitData
  const headers = ['event_id', 'user_id', 'country', '命中值']
  const csv = [headers.join(','), ...rows.map(r => [r.event_id, r.user_id, r.country, r.value].join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `告警明细_${currentAlert.value.rule}_${currentAlert.value.time}.csv`
  link.click()
  URL.revokeObjectURL(url)
  message.success('导出成功')
}

const updateRefreshTime = () => {
  const d = new Date()
  lastRefresh.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

let refreshTimer = null
onMounted(() => {
  updateRefreshTime()
  // 每半小时自动刷新（演示用 30s 间隔以便观察）
  refreshTimer = setInterval(updateRefreshTime, 30000)
})
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

<style scoped>
.em-alerts { padding: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1E293B; }
.page-desc { font-size: 13px; color: #64748B; margin-top: 4px; }
.refresh-tip { font-size: 12px; color: #64748B; display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; }
.dot.pulse { animation: pulse 1.6s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
.stats-bar { display: flex; gap: 24px; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 24px; margin-bottom: 16px; }
.stat { display: flex; flex-direction: column; }
.val { font-size: 24px; font-weight: 700; }
.val.red { color: #EF4444; }
.val.green { color: #10B981; }
.val.amber { color: #F59E0B; }
.stat-lbl { font-size: 12px; color: #64748B; margin-top: 2px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.toolbar-left { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.toolbar-right { display: flex; gap: 12px; }
.mono { font-family: monospace; font-size: 12px; color: #4F46E5; background: #EEF2FF; padding: 2px 6px; border-radius: 4px; }
.rule-snapshot .kv, .drawer-section .kv { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
.kv .k { color: #64748B; }
.kv .v { color: #1E293B; font-weight: 500; }
.drawer-section { margin-bottom: 20px; }
.drawer-section-title { font-size: 13px; font-weight: 600; color: #64748B; margin-bottom: 8px; }
.sample-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.sample-table th { background: #F8FAFC; padding: 8px 12px; text-align: left; font-weight: 600; color: #64748B; border-bottom: 1px solid #E2E8F0; }
.sample-table td { padding: 8px 12px; border-bottom: 1px solid #E2E8F0; }
</style>
