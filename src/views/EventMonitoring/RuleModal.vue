<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '编辑规则' : '新建规则'"
    :width="960"
    :body-style="{ maxHeight: '70vh', overflowY: 'auto', padding: '20px 24px' }"
    :footer-style="{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', textAlign: 'right' }"
    @cancel="handleCancel"
    :mask-closable="false"
  >
    <!-- Section 1: Basic Info -->
    <div class="form-section">
      <div class="form-section-title"><span class="dot"></span>基本信息</div>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="规则名称" required>
            <a-input v-model:value="form.name" placeholder="请输入规则名称" data-marker="规则名称输入框" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="所属项目组" required>
            <a-select v-model:value="form.project" placeholder="请选择项目组" data-marker="规则所属项目组选择">
              <a-select-option value="">请选择项目组</a-select-option>
              <a-select-option value="ad">广告聚合</a-select-option>
              <a-select-option value="growth">用户增长</a-select-option>
              <a-select-option value="content">内容中台</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="规则描述">
        <a-textarea v-model:value="form.description" placeholder="描述规则的监控目的和业务背景..." :rows="2" />
      </a-form-item>
    </div>

    <!-- Section 2: Execution Plan -->
    <div class="form-section">
      <div class="form-section-title"><span class="dot"></span>执行计划</div>
      <div class="section-sub">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="执行频率" required>
              <a-select v-model:value="form.freq" @change="onFreqChange" data-marker="规则执行频率选择">
                <a-select-option value="realtime">实时</a-select-option>
                <a-select-option value="5min">每5分钟</a-select-option>
                <a-select-option value="hourly">每小时</a-select-option>
                <a-select-option value="daily">每日 T+1</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="时间窗口" required>
              <a-select v-model:value="form.window" data-marker="规则时间窗口选择">
                <a-select-option v-for="o in windowOptions" :key="o.value" :value="o.value">{{ o.label }}</a-select-option>
              </a-select>
              <div v-if="form.freq === 'daily'" class="form-hint">计算时间：每日凌晨 01:00</div>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- Section 3: Filter (WHERE) -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="dot"></span>条件过滤器 (WHERE)
        <div style="margin-left:auto;display:flex;gap:8px">
          <a-button size="small" @click="addFilterRow('root')" data-marker="添加条件按钮">+ 添加条件</a-button>
          <a-button size="small" @click="addFilterGroup('root')">+ 添加条件组</a-button>
        </div>
      </div>
      <div ref="filterContainerRef"></div>
    </div>

    <!-- Section 4: Metric -->
    <div class="form-section">
      <div class="form-section-title"><span class="dot"></span>计算因子 (Metric)</div>
      <div class="section-sub">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="计算类型" required>
              <a-select v-model:value="form.metricType" @change="onMetricTypeChange" data-marker="计算类型选择">
                <a-select-option value="agg">聚合值</a-select-option>
                <a-select-option value="single">单条值</a-select-option>
                <a-select-option value="nullrate">空值率</a-select-option>
                <a-select-option value="ratio">占比</a-select-option>
                <a-select-option value="sequence">顺序匹配</a-select-option>
                <a-select-option value="conversion">转化率</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="form.metricType === 'agg'">
            <a-form-item label="聚合函数">
              <a-select v-model:value="form.aggFunc" data-marker="聚合函数选择">
                <a-select-option value="count">COUNT</a-select-option>
                <a-select-option value="sum">SUM</a-select-option>
                <a-select-option value="avg">AVG</a-select-option>
                <a-select-option value="max">MAX</a-select-option>
                <a-select-option value="min">MIN</a-select-option>
                <a-select-option value="count_distinct">COUNT_DISTINCT</a-select-option>
                <a-select-option value="p99">P99</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="目标字段">
          <a-select data-marker="目标字段选择">
            <a-select-option value="params.ecpm">params.ecpm</a-select-option>
            <a-select-option value="params.account_id">params.account_id</a-select-option>
            <a-select-option value="event_time">event_time</a-select-option>
            <a-select-option value="delay">delay（派生字段）</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="form.metricType === 'sequence'" label="事件序列">
          <a-input placeholder="如：40601,40602,40605" />
          <div class="form-hint">最大允许间隔（分钟）：<a-input-number :min="1" :max="1440" :value="30" style="width:100px" /></div>
        </a-form-item>
        <a-form-item v-if="form.metricType === 'conversion'" label="步骤事件">
          <a-textarea placeholder="40601&#10;40602&#10;40603" :rows="3" />
        </a-form-item>
      </div>
    </div>

    <!-- Section 5: Threshold -->
    <div class="form-section">
      <div class="form-section-title"><span class="dot danger"></span>阈值触发</div>
      <div class="section-sub threshold-sub">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="比较操作符">
              <a-select data-marker="阈值比较操作符选择">
                <a-select-option value=">">大于 (>)</a-select-option>
                <a-select-option value="<">小于 (<)</a-select-option>
                <a-select-option value=">=">大于等于 (≥)</a-select-option>
                <a-select-option value="<=">小于等于 (≤)</a-select-option>
                <a-select-option value="=">等于 (=)</a-select-option>
                <a-select-option value="!=">不等于 (≠)</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="阈值">
              <a-input-number :value="0.5" :step="0.01" style="width:100%" data-marker="阈值输入框" />
              <div class="form-hint">根据计算类型，单位可能为：数值 / % / 毫秒</div>
            </a-form-item>
          </a-col>
        </a-row>
        <div class="threshold-preview" data-marker="阈值触发实时预览">
          <div class="preview-label">实时预览</div>
          当 AVG(params.ecpm) < 0.5 时触发告警
        </div>
      </div>
    </div>

    <!-- Section 6: Alert Actions -->
    <div class="form-section">
      <div class="form-section-title"><span class="dot warn"></span>告警动作</div>
      <div class="section-sub">
        <a-form-item label="通知渠道">
          <a-checkbox-group data-marker="告警通知渠道复选框">
            <a-checkbox value="dingtalk">钉钉</a-checkbox>
            <a-checkbox value="wework">企业微信</a-checkbox>
            <a-checkbox value="email">邮件</a-checkbox>
            <a-checkbox value="feishu">飞书</a-checkbox>
            <a-checkbox value="webhook">自定义Webhook</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="接收人">
          <a-input placeholder="支持邮箱、手机号、钉钉ID，用逗号分隔" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="静默期（分钟）">
              <a-input-number :value="30" :min="1" :max="1440" style="width:100%" data-marker="告警静默期输入框" />
              <div class="form-hint">同一规则在静默期内只发送一次告警</div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="告警收敛">
              <div style="display:flex;flex-direction:column;gap:8px">
                <a-checkbox checked>防抖：连续触发时合并通知</a-checkbox>
                <a-checkbox checked>恢复通知：异常恢复后发送"已恢复"通知</a-checkbox>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>

    <template #footer>
      <a-button @click="handleCancel" data-marker="取消按钮">取消</a-button>
      <a-button type="primary" @click="handleSave" data-marker="保存规则按钮">保存规则</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch, nextTick, reactive } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  rule: { type: Object, default: null }
})
const emit = defineEmits(['update:visible', 'saved'])

const isEdit = ref(false)
const filterContainerRef = ref(null)

const form = reactive({
  name: '',
  project: '',
  description: '',
  freq: '5min',
  window: '5min',
  metricType: 'agg',
  aggFunc: 'avg'
})

const windowOptionsMap = {
  realtime: [{ value: 'realtime', label: '逐条（实时）' }],
  '5min': [{ value: '5min', label: '最近5分钟' }, { value: '10min', label: '最近10分钟' }, { value: '15min', label: '最近15分钟' }],
  hourly: [{ value: '30min', label: '最近30分钟' }, { value: '60min', label: '最近1小时' }, { value: '120min', label: '最近2小时' }],
  daily: [{ value: 'yesterday', label: '昨日全天（固定）' }]
}

const windowOptions = ref(windowOptionsMap['5min'])

const onFreqChange = (freq) => {
  windowOptions.value = windowOptionsMap[freq] || []
  form.window = windowOptions.value[0]?.value || ''
}

const onMetricTypeChange = () => {}

const initFilterBuilder = () => {
  if (!filterContainerRef.value) return
  filterContainerRef.value.innerHTML = ''
  const group = document.createElement('div')
  group.className = 'filter-group and'
  group.id = 'filter-group-root'
  group.innerHTML = `
    <div class="filter-group-header">
      <select class="filter-group-title"><option value="and" selected>AND（全部满足）</option><option value="or">OR（任一满足）</option></select>
      <div class="filter-group-actions">
        <button class="fg-btn add" onclick="window.__addFilterRow('root')">+ 条件</button>
        <button class="fg-btn add" onclick="window.__addFilterGroup('root')">+ 组</button>
      </div>
    </div>
    <div class="filter-rows"></div>
    <div style="margin-top:8px;display:flex;gap:6px">
      <button class="fg-btn add" onclick="window.__addFilterRow('root')">+ 添加条件</button>
      <button class="fg-btn add" onclick="window.__addFilterGroup('root')">+ 添加条件组</button>
    </div>
  `
  filterContainerRef.value.appendChild(group)
  addFilterRow('root')
}

const addFilterRow = (groupId) => {
  const group = document.getElementById('filter-group-' + groupId)
  if (!group) return
  const rowsContainer = group.querySelector('.filter-rows')
  const row = document.createElement('div')
  row.className = 'filter-row'
  const fields = [['event_id', '事件ID'], ['user_pseudo_id', '用户伪ID'], ['country', '国家'], ['params.ecpm', 'eCPM'], ['params.account_id', '账户ID'], ['event_time', '事件时间'], ['delay', '延迟(ms)']]
  const ops = [['=', '='], ['!=', '!='], ['>', '>'], ['<', '<'], ['>=', '>='], ['<=', '<='], ['IN', 'IN'], ['LIKE', 'LIKE']]
  row.innerHTML = `
    <select class="fs-mono">${fields.map(f => `<option value="${f[0]}">${f[1]}</option>`).join('')}</select>
    <select>${ops.map(o => `<option value="${o[0]}">${o[0]}</option>`).join('')}</select>
    <input type="text" placeholder="输入值..." style="flex:1;min-width:80px" />
    <button class="remove-btn" onclick="this.parentNode.remove()">✕</button>
  `
  rowsContainer.appendChild(row)
}

const addFilterGroup = (parentId) => {
  const parent = document.getElementById('filter-group-' + parentId)
  if (!parent) return
  const group = document.createElement('div')
  group.className = 'filter-group or'
  group.id = 'filter-group-' + Date.now()
  group.innerHTML = `
    <div class="filter-group-header">
      <select class="filter-group-title"><option value="and">AND</option><option value="or" selected>OR</option></select>
      <div class="filter-group-actions">
        <button class="fg-btn add" onclick="window.__addFilterRow(this.closest('.filter-group').id.replace('filter-group-',''))">+ 条件</button>
        <button class="fg-btn remove" onclick="this.closest('.filter-group').remove()">删除组</button>
      </div>
    </div>
    <div class="filter-rows"></div>
  `
  parent.querySelector('.filter-rows').appendChild(group)
  addFilterRow(group.id.replace('filter-group-', ''))
}

// Expose for inline handlers
window.__addFilterRow = addFilterRow
window.__addFilterGroup = addFilterGroup

const handleCancel = () => {
  emit('update:visible', false)
}

const handleSave = () => {
  if (!form.name.trim()) {
    message.warning('请输入规则名称')
    return
  }
  emit('saved')
}

watch(() => props.visible, (v) => {
  if (v) {
    isEdit.value = !!props.rule
    if (props.rule) {
      Object.assign(form, {
        name: props.rule.name || '',
        project: props.rule.projectKey || '',
        description: '',
        freq: props.rule.freqKey || '5min',
        window: props.rule.window || '5min',
        metricType: 'agg',
        aggFunc: 'avg'
      })
    } else {
      Object.assign(form, { name: '', project: '', description: '', freq: '5min', window: '5min', metricType: 'agg', aggFunc: 'avg' })
    }
    nextTick(initFilterBuilder)
  }
})
</script>

<style scoped>
.form-section { margin-bottom: 24px; }
.form-section-title { font-size: 14px; font-weight: 600; color: #1E293B; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.dot { width: 4px; height: 16px; background: #4F46E5; border-radius: 2px; display: inline-block; }
.dot.danger { background: #EF4444; }
.dot.warn { background: #F59E0B; }
.section-sub { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; }
.threshold-sub { background: #FEF2F2; border-color: #FECACA; }
.form-hint { font-size: 12px; color: #64748B; margin-top: 4px; }
.threshold-preview { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 6px; padding: 12px; font-size: 13px; color: #991B1B; margin-top: 12px; }
.preview-label { font-size: 11px; color: #B91C1C; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; }

.filter-group { border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; }
.filter-group.and { background: #EFF6FF; border: 1px solid #BFDBFE; }
.filter-group.or { background: #FFF7ED; border: 1px solid #FED7AA; }
.filter-group-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.filter-group-title { font-size: 12px; font-weight: 600; text-transform: uppercase; padding: 2px 8px; border: 1px solid var(--border); border-radius: 4px; background: #fff; }
.filter-group.and .filter-group-title { color: #1D4ED8; }
.filter-group.or .filter-group-title { color: #C2410C; }
.filter-group-actions { display: flex; gap: 6px; }
.filter-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.filter-row select, .filter-row input { padding: 5px 8px; border: 1px solid #E2E8F0; border-radius: 4px; font-size: 12px; outline: none; }
.filter-row select { min-width: 120px; }
.filter-row .fs-mono { font-family: monospace; }
.remove-btn { width: 24px; height: 24px; border: none; background: transparent; cursor: pointer; color: #94A3B8; border-radius: 4px; }
.remove-btn:hover { background: #FEE2E2; color: #EF4444; }
.fg-btn { font-size: 12px; padding: 4px 10px; border: 1px solid #E2E8F0; border-radius: 4px; background: #fff; cursor: pointer; color: #64748B; }
.fg-btn:hover { border-color: #4F46E5; color: #4F46E5; }
.fg-btn.remove:hover { border-color: #EF4444; color: #EF4444; }
</style>
