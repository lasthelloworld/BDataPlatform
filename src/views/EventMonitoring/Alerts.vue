<template>
  <div class="em-alerts">
    <div class="page-header">
      <div>
        <div class="page-title">告警历史</div>
        <div class="page-desc">查看所有历史告警记录，支持筛选、标记处理、忽略和导出</div>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat"><div class="val red">156</div><div class="stat-lbl">总告警数</div></div>
      <div class="stat"><div class="val amber">23</div><div class="stat-lbl">未处理</div></div>
      <div class="stat"><div class="val green">112</div><div class="stat-lbl">已恢复</div></div>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <a-select placeholder="全部项目组" style="width:160px" data-marker="告警历史-项目组筛选" allow-clear>
          <a-select-option value="">全部项目组</a-select-option>
          <a-select-option value="ad">广告聚合</a-select-option>
          <a-select-option value="growth">用户增长</a-select-option>
          <a-select-option value="content">内容中台</a-select-option>
        </a-select>
        <a-select placeholder="全部状态" style="width:140px" data-marker="告警历史-告警状态筛选" allow-clear>
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="pending">未处理</a-select-option>
          <a-select-option value="ignored">已忽略</a-select-option>
          <a-select-option value="resolved">已恢复</a-select-option>
        </a-select>
        <a-date-picker placeholder="开始日期" style="width:150px" data-marker="告警历史-开始日期" />
        <span style="color:#64748B">—</span>
        <a-date-picker placeholder="结束日期" style="width:150px" data-marker="告警历史-结束日期" />
      </div>
      <div class="toolbar-right">
        <a-input placeholder="按规则名称搜索..." style="width:220px" data-marker="告警历史-规则名称搜索" allow-clear />
        <a-button type="primary" data-marker="告警历史-导出明细">导出明细</a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="alerts"
      :pagination="{ current: 1, pageSize: 20, total: 156 }"
      :row-key="'id'"
      size="middle"
      bordered
      :row-selection="{ type: 'checkbox' }"
      data-marker="告警列表表格"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'value'">
          <span style="color:#EF4444;font-weight:600">{{ record.value }}</span> / {{ record.threshold }}
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="statusColorMap[record.status]">{{ record.statusLabel }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" type="link" @click="openDetail(record)" :data-marker="'查看告警详情-' + record.rule">查看详情</a-button>
            <a-button size="small" type="link">标记处理</a-button>
            <a-button size="small" type="link">忽略</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-drawer v-model:open="drawerVisible" title="告警详情" width="480" :body-style="{ padding: '16px 20px' }" :footer-style="{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }">
      <div v-if="currentAlert">
        <div class="drawer-section">
          <div class="drawer-section-title">规则配置快照</div>
          <div class="kv"><span class="k">规则名称</span><span class="v">{{ currentAlert.rule }}</span></div>
          <div class="kv"><span class="k">计算因子</span><span class="v">AVG(params.ecpm)</span></div>
          <div class="kv"><span class="k">触发条件</span><span class="v" style="color:#EF4444">< 0.5</span></div>
          <div class="kv"><span class="k">执行频率</span><span class="v">每5分钟</span></div>
          <div class="kv"><span class="k">时间窗口</span><span class="v">最近5分钟</span></div>
        </div>
        <div class="drawer-section">
          <div class="drawer-section-title">触发时的窗口范围</div>
          <div class="kv"><span class="k">开始时间</span><span class="v">{{ currentAlert.time }}</span></div>
          <div class="kv"><span class="k">计算值</span><span class="v" style="color:#EF4444;font-weight:600">{{ currentAlert.value }}</span></div>
          <div class="kv"><span class="k">阈值</span><span class="v">{{ currentAlert.threshold }}</span></div>
        </div>
        <div class="drawer-section">
          <div class="drawer-section-title">命中数据样本（最多10条）</div>
          <table class="sample-table">
            <thead><tr><th>event_id</th><th>user_id</th><th>ecpm</th><th>country</th></tr></thead>
            <tbody>
              <tr><td>40601</td><td>u_10023</td><td>0.21</td><td>US</td></tr>
              <tr><td>40601</td><td>u_10456</td><td>0.35</td><td>CN</td></tr>
              <tr><td>40601</td><td>u_10891</td><td>0.18</td><td>JP</td></tr>
              <tr><td>40601</td><td>u_11205</td><td>0.42</td><td>KR</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <a-space>
          <a-button data-marker="告警详情-标记处理">标记处理</a-button>
          <a-button data-marker="告警详情-忽略">忽略</a-button>
          <a-button type="primary" data-marker="告警详情-导出明细">导出明细 (CSV)</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const drawerVisible = ref(false)
const currentAlert = ref(null)

const statusColorMap = { pending: 'red', ignored: 'default', resolved: 'green' }

const alerts = ref([
  { id: 1, time: '2026-07-31 14:35:00', rule: 'Ecpm低值监控', project: '广告聚合', value: '0.38', threshold: '0.5', status: 'pending', statusLabel: '未处理' },
  { id: 2, time: '2026-07-31 14:30:00', rule: '空值率监控', project: '广告聚合', value: '6.2%', threshold: '5%', status: 'resolved', statusLabel: '已恢复' },
  { id: 3, time: '2026-07-31 14:25:00', rule: '事件顺序异常', project: '用户增长', value: '序列不匹配', threshold: '—', status: 'pending', statusLabel: '未处理' },
  { id: 4, time: '2026-07-31 14:20:00', rule: '高延迟告警', project: '内容中台', value: '6800ms', threshold: '5000ms', status: 'ignored', statusLabel: '已忽略' },
  { id: 5, time: '2026-07-31 14:15:00', rule: 'DAU骤降监控', project: '用户增长', value: '-25%', threshold: '-20%', status: 'pending', statusLabel: '未处理' },
  { id: 6, time: '2026-07-31 14:10:00', rule: '转化漏斗异常', project: '广告聚合', value: '8.3%', threshold: '10%', status: 'resolved', statusLabel: '已恢复' },
  { id: 7, time: '2026-07-31 14:05:00', rule: '重复事件检测', project: '内容中台', value: '1250/min', threshold: '1000/min', status: 'resolved', statusLabel: '已恢复' },
  { id: 8, time: '2026-07-31 14:00:00', rule: '用户留存异常', project: '用户增长', value: '38.2%', threshold: '40%', status: 'pending', statusLabel: '未处理' }
])

const columns = [
  { title: '触发时间', dataIndex: 'time', key: 'time' },
  { title: '规则名称', dataIndex: 'rule', key: 'rule' },
  { title: '项目组', dataIndex: 'project', key: 'project' },
  { title: '计算值 / 阈值', key: 'value' },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

const openDetail = (record) => {
  currentAlert.value = record
  drawerVisible.value = true
}
</script>

<style scoped>
.em-alerts { padding: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1E293B; }
.page-desc { font-size: 13px; color: #64748B; margin-top: 4px; }
.stats-bar { display: flex; gap: 24px; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 24px; margin-bottom: 16px; }
.stat { display: flex; flex-direction: column; }
.val { font-size: 22px; font-weight: 700; }
.val.red { color: #EF4444; }
.val.green { color: #10B981; }
.val.amber { color: #F59E0B; }
.stat-lbl { font-size: 12px; color: #64748B; margin-top: 2px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.toolbar-left { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.toolbar-right { display: flex; gap: 12px; }
.drawer-section { margin-bottom: 20px; }
.drawer-section-title { font-size: 13px; font-weight: 600; color: #64748B; margin-bottom: 8px; }
.kv { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
.kv .k { color: #64748B; }
.kv .v { color: #1E293B; font-weight: 500; }
.sample-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.sample-table th { background: #F8FAFC; padding: 8px 12px; text-align: left; font-weight: 600; color: #64748B; border-bottom: 1px solid #E2E8F0; }
.sample-table td { padding: 8px 12px; border-bottom: 1px solid #E2E8F0; }
</style>
