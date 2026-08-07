<template>
  <a-modal
    :open="visible"
    :title="readonly ? '查看规则' : (isEdit ? '编辑规则' : '新建规则')"
    :width="1000"
    :body-style="{ maxHeight: '72vh', overflowY: 'auto', padding: '20px 24px' }"
    :footer-style="{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', textAlign: 'right' }"
    @cancel="handleCancel"
    :mask-closable="false"
  >
    <!-- Section 1: 基本信息 -->
    <div class="form-section">
      <div class="form-section-title"><span class="dot"></span>基本信息</div>
      <div class="section-sub">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="规则名称" required>
              <a-input v-model:value="form.name" :disabled="formDisabled" placeholder="请输入规则名称" data-marker="规则名称输入框" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="规则描述">
              <a-input v-model:value="form.description" :disabled="formDisabled" placeholder="描述规则监控目的与业务背景（可选）" data-marker="规则描述输入框" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="监控等级" required>
              <a-select v-model:value="form.level" :disabled="formDisabled" placeholder="请选择监控等级" data-marker="规则监控等级选择" :options="levelOptions" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- Section 2: 监控维度 -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="dot"></span>监控维度
        <span class="section-hint">产品组→app→app_version→国家→投放渠道，框定事件日志监控范围</span>
      </div>
      <div class="section-sub">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="产品组" required>
              <a-select v-model:value="form.productGroups" mode="multiple" :disabled="formDisabled" placeholder="请选择产品组（多选必选）" data-marker="监控维度-产品组多选" :options="productGroupOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="App">
              <a-select v-model:value="form.apps" mode="multiple" :disabled="formDisabled" placeholder="请选择App（可多选）" data-marker="监控维度-App多选" :options="appOptions" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="App版本">
              <a-select v-model:value="form.appVersions" mode="multiple" :disabled="formDisabled" placeholder="请选择版本号（可多选）" data-marker="监控维度-App版本多选" :options="appVersionOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="国家">
              <a-select v-model:value="form.countries" mode="multiple" :disabled="formDisabled" placeholder="请选择国家（可多选）" data-marker="监控维度-国家多选" :options="countryOptions" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="投放渠道">
              <a-select v-model:value="form.channels" mode="multiple" :disabled="formDisabled" placeholder="请选择投放渠道（可多选）" data-marker="监控维度-投放渠道多选" :options="channelOptions" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- Section 3: 监控规则条件配置 -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="dot"></span>监控规则条件配置
        <div v-if="!readonly" style="margin-left:auto; display:flex; gap:8px; flex-wrap:wrap;">
          <a-button size="small" type="primary" ghost @click="addEventField" data-marker="添加事件字段按钮">添加事件字段</a-button>
          <a-button size="small" type="primary" ghost @click="addMetricField" data-marker="添加指标字段按钮">添加指标字段</a-button>
          <a-button size="small" type="primary" ghost @click="addCalcOp" data-marker="添加计算操作符按钮">添加计算操作符</a-button>
          <a-button size="small" type="primary" ghost @click="addCompareOp" data-marker="添加比较操作符按钮">添加比较操作符</a-button>
          <a-button size="small" type="primary" ghost @click="addLogicOp" data-marker="添加逻辑操作符按钮">添加逻辑操作符</a-button>
          <a-button size="small" type="primary" ghost @click="addCondition" data-marker="添加条件项按钮">+ 添加条件</a-button>
        </div>
      </div>
      <div class="section-sub condition-builder">
        <div v-for="(cond, idx) in conditions" :key="cond.id" class="condition-item">
          <div class="condition-head">
            <a-select
              v-if="idx > 0"
              v-model:value="cond.logicOp"
              style="width:120px"
              :disabled="formDisabled"
              :options="logicOpOptions"
              data-marker="逻辑操作符选择"
            />
            <span v-else class="condition-flag">条件 {{ idx + 1 }}</span>
            <a-button v-if="!readonly" size="small" type="link" danger @click="removeCondition(cond.id)" :disabled="conditions.length === 1">移除条件</a-button>
          </div>
          <div class="condition-elements">
            <div v-for="(el, ei) in cond.elements" :key="el.id" class="element-row" :class="'element-' + el.type">
              <!-- 事件字段 -->
              <template v-if="el.type === 'event_field'">
                <span class="element-label">事件</span>
                <a-select
                  v-model:value="el.fieldType"
                  style="width:200px"
                  :disabled="formDisabled"
                  show-search
                  :options="eventFieldOptions"
                  @change="onEventFieldTypeChange(cond, el)"
                  data-marker="事件字段选择"
                  placeholder="请选择事件字段"
                  option-filter-prop="label"
                />
                <!-- 级联: params -> 监控自定义字段选择器 -->
                <a-select
                  v-if="el.fieldType === 'params'"
                  v-model:value="el.field"
                  style="width:200px"
                  :disabled="formDisabled"
                  placeholder="请选择自定义参数"
                  :options="paramFieldOptions"
                  data-marker="监控自定义字段选择器"
                />
                <!-- 聚合操作符控件组 -->
                <a-select v-model:value="el.aggFunc" style="width:96px" placeholder="聚合" :disabled="formDisabled" allow-clear :options="aggFuncOptions" data-marker="聚合函数选择" />
                <a-input v-model:value="el.aggTarget" style="width:120px" :disabled="formDisabled" placeholder="聚合目标值" data-marker="聚合目标值输入" />
              </template>
              <!-- 指标字段 -->
              <template v-else-if="el.type === 'metric_field'">
                <span class="element-label">指标</span>
                <a-select v-model:value="el.field" style="width:200px" :disabled="formDisabled" placeholder="请选择指标" :options="metricOptions" data-marker="指标值选择器" />
                <a-select v-model:value="el.aggFunc" style="width:96px" placeholder="聚合" :disabled="formDisabled" allow-clear :options="aggFuncOptions" data-marker="聚合函数选择" />
                <a-input v-model:value="el.aggTarget" style="width:120px" :disabled="formDisabled" placeholder="聚合目标值" data-marker="聚合目标值输入" />
              </template>
              <!-- 计算操作符 -->
              <template v-else-if="el.type === 'calc_op'">
                <span class="element-label">计算</span>
                <a-select v-model:value="el.op" style="width:70px" :disabled="formDisabled" :options="calcOpOptions" data-marker="计算操作符选择" />
              </template>
              <!-- 比较操作符 + 阈值 -->
              <template v-else-if="el.type === 'compare_op'">
                <span class="element-label">比较</span>
                <a-select v-model:value="el.op" style="width:170px" :disabled="formDisabled" placeholder="比较操作符" :options="compareOpOptions" data-marker="比较操作符选择" />
                <a-input v-if="!isNullOp(el.op)" v-model:value="el.threshold" :disabled="formDisabled" style="flex:1" placeholder="监控值阈值" data-marker="监控值阈值输入" />
                <span v-else class="form-hint" style="margin-left:8px">该操作符无需阈值</span>
              </template>
              <!-- 逻辑操作符 -->
              <template v-else-if="el.type === 'logic_op'">
                <a-select v-model:value="el.op" style="width:120px" :disabled="formDisabled" placeholder="逻辑操作符" :options="logicOpOptions" data-marker="逻辑操作符选择" />
              </template>
              <!-- 移除按钮 -->
              <a-button v-if="!readonly" size="small" type="link" danger @click="removeElement(cond, ei)" :disabled="cond.elements.length <= 1">✕</a-button>
            </div>
          </div>
        </div>
        <div class="threshold-preview" data-marker="条件配置实时预览">
          <div class="preview-label">实时预览</div>
          {{ conditionPreview }}
        </div>
      </div>
    </div>

    <!-- Section 4: 监控计算规则配置 -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="dot"></span>监控计算规则配置
        <span class="section-hint">支持事件字段、指标字段与计算操作符自由组合，定义计算结果</span>
        <div v-if="!readonly" style="margin-left:auto; display:flex; gap:8px; flex-wrap:wrap;">
          <a-button size="small" type="primary" ghost @click="addCompMetricField" data-marker="计算-添加指标字段">添加指标字段</a-button>
          <a-button size="small" type="primary" ghost @click="addCompEventField" data-marker="计算-添加事件字段">添加事件字段</a-button>
          <a-button size="small" type="primary" ghost @click="addCompCalcOp" data-marker="计算-添加计算操作符">添加计算操作符</a-button>
          <a-button size="small" type="primary" ghost @click="addCompCompareOp" data-marker="计算-添加比较操作符">添加比较操作符</a-button>
          <a-button size="small" type="primary" ghost @click="addCompLogicOp" data-marker="计算-添加逻辑操作符">添加逻辑操作符</a-button>
          <a-button size="small" type="primary" ghost @click="addComputation" data-marker="计算-添加计算项">+ 添加计算项</a-button>
        </div>
      </div>
      <div class="section-sub condition-builder">
        <div v-if="computations.length === 0" class="empty-tip">
          <span>暂无计算项，请点击右上角「+ 添加计算项」或直接点击按钮添加</span>
        </div>
        <div v-for="(comp, ci) in computations" :key="comp.id" class="condition-item">
          <div class="condition-head">
            <span class="condition-flag">计算项 {{ ci + 1 }}</span>
            <a-button v-if="!readonly" size="small" type="link" danger @click="removeComputation(comp.id)" :disabled="computations.length <= 1">移除计算项</a-button>
          </div>
          <div class="condition-elements">
            <div v-for="(el, ei) in comp.elements" :key="el.id" class="element-row" :class="'element-' + el.type">
              <!-- 指标字段 -->
              <template v-if="el.type === 'metric_field'">
                <span class="element-label">指标</span>
                <a-select v-model:value="el.field" style="width:200px" :disabled="formDisabled" placeholder="请选择指标" :options="metricOptions" data-marker="计算-指标值选择器" />
                <a-select v-model:value="el.aggFunc" style="width:96px" placeholder="聚合" :disabled="formDisabled" allow-clear :options="aggFuncOptions" data-marker="计算-聚合函数选择" />
                <a-input v-model:value="el.aggTarget" style="width:120px" :disabled="formDisabled" placeholder="聚合目标值" data-marker="计算-聚合目标值输入" />
              </template>
              <!-- 事件字段 -->
              <template v-else-if="el.type === 'event_field'">
                <span class="element-label">事件</span>
                <a-select
                  v-model:value="el.fieldType"
                  style="width:200px"
                  :disabled="formDisabled"
                  show-search
                  :options="eventFieldOptions"
                  @change="onEventFieldTypeChange(comp, el)"
                  data-marker="计算-事件字段选择"
                  placeholder="请选择事件字段"
                  option-filter-prop="label"
                />
                <a-select v-if="el.fieldType === 'params'" v-model:value="el.field" style="width:200px" :disabled="formDisabled" placeholder="请选择自定义参数" :options="paramFieldOptions" data-marker="计算-自定义字段选择" />
                <a-select v-model:value="el.aggFunc" style="width:96px" placeholder="聚合" :disabled="formDisabled" allow-clear :options="aggFuncOptions" data-marker="计算-聚合函数选择" />
                <a-input v-model:value="el.aggTarget" style="width:120px" :disabled="formDisabled" placeholder="聚合目标值" data-marker="计算-聚合目标值输入" />
              </template>
              <!-- 计算操作符 -->
              <template v-else-if="el.type === 'calc_op'">
                <a-select v-model:value="el.op" style="width:70px" :disabled="formDisabled" :options="calcOpOptions" data-marker="计算-计算操作符选择" />
              </template>
              <!-- 比较操作符 + 阈值 -->
              <template v-else-if="el.type === 'compare_op'">
                <span class="element-label">比较</span>
                <a-select v-model:value="el.op" style="width:170px" :disabled="formDisabled" placeholder="比较操作符" :options="compareOpOptions" data-marker="计算-比较操作符选择" />
                <a-input v-if="!isNullOp(el.op)" v-model:value="el.threshold" :disabled="formDisabled" style="flex:1" placeholder="监控值阈值" data-marker="计算-监控值阈值输入" />
                <span v-else class="form-hint" style="margin-left:8px">该操作符无需阈值</span>
              </template>
              <!-- 逻辑操作符 -->
              <template v-else-if="el.type === 'logic_op'">
                <a-select v-model:value="el.op" style="width:120px" :disabled="formDisabled" placeholder="逻辑操作符" :options="logicOpOptions" data-marker="计算-逻辑操作符选择" />
              </template>
              <!-- 移除按钮 -->
              <a-button v-if="!readonly" size="small" type="link" danger @click="removeCompElement(comp, ei)" :disabled="comp.elements.length <= 1">✕</a-button>
            </div>
          </div>
        </div>
        <div class="threshold-preview" data-marker="计算配置实时预览">
          <div class="preview-label">实时预览</div>
          {{ computationPreview }}
        </div>
      </div>
    </div>

    <!-- Section 5: 监控数据范围时间窗口 -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="dot"></span>监控数据范围时间窗口
        <span class="section-hint">非必选，选择监控哪个数据时间范围的数据</span>
      </div>
      <div class="section-sub">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="方式">
              <a-select v-model:value="form.dataWindowMode" :disabled="formDisabled" placeholder="不限制" allow-clear data-marker="数据时间窗口方式" :options="dataWindowModeOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="16" v-if="form.dataWindowMode === 'interval'">
            <a-form-item label="日期间隔">
              <a-select v-model:value="form.dataWindowInterval" :disabled="formDisabled" style="width:140px" data-marker="日期间隔选择" :options="dataWindowIntervalOptions" />
              <a-input-number v-if="form.dataWindowInterval === 'custom'" v-model:value="form.dataWindowX" :disabled="formDisabled" :min="1" :max="365" style="width:120px;margin-left:8px" data-marker="近X天输入" />
              <span v-if="form.dataWindowInterval === 'custom'" class="form-hint" style="margin-left:8px">天</span>
            </a-form-item>
          </a-col>
          <a-col :span="16" v-if="form.dataWindowMode === 'range'">
            <a-form-item label="日期区间">
              <a-range-picker v-model:value="form.dataWindowRange" :disabled="formDisabled" style="width:100%" data-marker="日期区间范围选择" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- Section 5: 监控频率 -->
    <div class="form-section">
      <div class="form-section-title"><span class="dot"></span>监控频率</div>
      <div class="section-sub">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="执行频率" required>
              <a-select v-model:value="form.freq" :disabled="formDisabled" @change="onFreqChange" data-marker="规则执行频率选择">
                <a-select-option value="hourly">每小时（H+1）</a-select-option>
                <a-select-option value="daily">每日（T+1）</a-select-option>
              </a-select>
              <div v-if="form.freq === 'daily'" class="form-hint">计算时间：每日凌晨 01:00</div>
              <div v-else-if="form.freq === 'hourly'" class="form-hint">计算时间：每小时整点 H+1</div>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- Section 6: 监控告警 -->
    <div class="form-section">
      <div class="form-section-title">
        <span class="dot warn"></span>监控告警
        <span class="section-hint">非必填，有监控日志但不一定告警</span>
      </div>
      <div class="section-sub">
        <a-form-item label="通知渠道">
          <a-checkbox-group v-model:value="form.alertChannels" :disabled="formDisabled" data-marker="告警通知渠道复选框">
            <a-checkbox value="wework">企业微信</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="接收人">
          <a-input v-model:value="form.receiver" :disabled="formDisabled" placeholder="支持邮箱、手机号、企业微信ID，用逗号分隔" data-marker="告警接收人输入" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="静默期（分钟）">
              <a-input-number v-model:value="form.silencePeriod" :disabled="true" :min="1" :max="1440" style="width:100%; opacity:0.6" data-marker="告警静默期输入框" />
              <div class="form-hint" style="color:#94A3B8">同一规则在静默期内只发送一次告警 · 本期不做</div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="告警收敛">
              <div style="display:flex;flex-direction:column;gap:8px;opacity:0.6">
                <a-checkbox v-model:checked="form.antiShake" :disabled="true">防抖：连续触发时合并通知</a-checkbox>
                <a-checkbox v-model:checked="form.recoverNotify" :disabled="true">恢复通知：异常恢复后发送"已恢复"通知</a-checkbox>
                <div class="form-hint" style="color:#94A3B8">本期不做</div>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>

    <template #footer>
      <a-button v-if="readonly" type="primary" @click="handleCancel" data-marker="关闭按钮">关闭</a-button>
      <template v-else>
        <a-button @click="handleCancel" data-marker="取消按钮">取消</a-button>
        <a-button type="primary" @click="handleSave" data-marker="保存规则按钮">保存规则</a-button>
      </template>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch, nextTick, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  rule: { type: Object, default: null },
  readonly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'saved'])

const isEdit = ref(false)
const formDisabled = computed(() => props.readonly)
let condSeq = 1

const form = reactive({
  name: '',
  description: '',
  level: 'P2',
  productGroups: [],
  apps: [],
  appVersions: [],
  countries: [],
  channels: [],
  dataWindowMode: undefined,
  dataWindowInterval: '7',
  dataWindowX: 7,
  dataWindowRange: [],
  freq: '5min',
  window: '5min',
  alertChannels: [],
  receiver: '',
  silencePeriod: 30,
  antiShake: true,
  recoverNotify: true
})

// 监控等级选项
const levelOptions = [
  { value: 'P0', label: 'P0 致命' },
  { value: 'P1', label: 'P1 严重' },
  { value: 'P2', label: 'P2 一般' }
]
const levelColorMap = { P0: '#DC2626', P1: '#F59E0B', P2: '#3B82F6' }

// 维度选项
const productGroupOptions = [
  { value: 'pg1', label: '产品1组' },
  { value: 'pg2', label: '产品2组' },
  { value: 'pg3', label: '产品3组' }
]
const appOptions = [
  { value: 'recover1', label: 'Phone Recover1' },
  { value: 'recover2', label: 'Phone Recover2' },
  { value: 'recover3', label: 'Phone Recover3' }
]
const appVersionOptions = [
  { value: 'v1.0.0', label: 'v1.0.0' },
  { value: 'v1.1.0', label: 'v1.1.0' },
  { value: 'v2.0.0', label: 'v2.0.0' },
  { value: 'v2.1.0', label: 'v2.1.0' }
]
const countryOptions = [
  { value: 'us', label: '美国-us' },
  { value: 'jp', label: '日本-jp' },
  { value: 'kr', label: '韩国-kr' },
  { value: 'gb', label: '英国-gb' },
  { value: 'de', label: '德国-de' },
  { value: 'br', label: '巴西-br' },
  { value: 'id', label: '印尼-id' }
]
const channelOptions = [
  { value: 'FB', label: 'Facebook' },
  { value: 'Tiktok', label: 'TikTok' },
  { value: 'google', label: 'Google' },
  { value: 'Apple', label: 'Apple' }
]

// 条件构建器选项
const logicOpOptions = [
  { value: 'AND', label: 'AND（与）' },
  { value: 'OR', label: 'OR（或）' },
  { value: 'NOT', label: 'NOT（非）' }
]
const aggFuncOptions = [
  { value: 'AVG', label: 'AVG' },
  { value: 'SUM', label: 'SUM' },
  { value: 'Count', label: 'Count' },
  { value: 'Max', label: 'Max' },
  { value: 'Min', label: 'Min' }
]
const calcOpOptions = [
  { value: '+', label: '+' },
  { value: '-', label: '-' },
  { value: '*', label: '×' },
  { value: '/', label: '÷' }
]
const compareOpOptions = [
  { value: '>', label: '大于' },
  { value: '>=', label: '大于等于' },
  { value: '<', label: '小于' },
  { value: '<=', label: '小于等于' },
  { value: '=', label: '等于' },
  { value: '!=', label: '不等于' },
  { value: 'in', label: 'In' },
  { value: 'not in', label: 'Not In' },
  { value: 'between', label: 'Between' },
  { value: 'in range', label: 'In Range（最近多长时间）' },
  { value: 'is null', label: 'Is Null' },
  { value: 'is not null', label: 'Is Not Null' }
]
const eventParamMap = {}
// 事件字段下拉选项（完整的事件日志字段列表）
const eventFieldOptions = [
  { value: 'params', label: 'params' },
  { value: 'user_pseudo_id', label: 'user_pseudo_id' },
  { value: 'app_id', label: 'app_id' },
  { value: 'event_date', label: 'event_date' },
  { value: 'event_hour', label: 'event_hour' },
  { value: 'event_time', label: 'event_time' },
  { value: 'user_type', label: 'user_type' },
  { value: 'days', label: 'days' },
  { value: 'event_id', label: 'event_id' },
  { value: 'ip', label: 'ip' },
  { value: 'country', label: 'country' },
  { value: 'app_package_name', label: 'app_package_name' },
  { value: 'app_version_name', label: 'app_version_name' },
  { value: 'app_version_code', label: 'app_version_code' },
  { value: 'sdk_version_code', label: 'sdk_version_code' },
  { value: 'sdk_version_name', label: 'sdk_version_name' },
  { value: 'brand', label: 'brand' },
  { value: 'model', label: 'model' },
  { value: 'os_version_name', label: 'os_version_name' },
  { value: 'os_version_code', label: 'os_version_code' },
  { value: 'network_state', label: 'network_state' },
  { value: 'resolution', label: 'resolution' },
  { value: 'density', label: 'density' },
  { value: 'metric_1', label: 'metric_1' },
  { value: 'metric_2', label: 'metric_2' },
  { value: 'metric_3', label: 'metric_3' },
  { value: 'metric_4', label: 'metric_4' },
  { value: 'metric_5', label: 'metric_5' },
  { value: 'ad_type', label: 'ad_type' },
  { value: 'ad_platform', label: 'ad_platform' },
  { value: 'unit_id', label: 'unit_id' },
  { value: 'show_type', label: 'show_type' },
  { value: 'dev_id', label: 'dev_id' },
  { value: 'ad_id', label: 'ad_id' },
  { value: 'android_id', label: 'android_id' },
  { value: 'idfa', label: 'idfa' },
  { value: 'udid', label: 'udid' },
  { value: 'imei', label: 'imei' },
  { value: 'mac', label: 'mac' },
  { value: 'gaid', label: 'gaid' },
  { value: 'utm_source', label: 'utm_source' },
  { value: 'utm_c_source', label: 'utm_c_source' },
  { value: 'utm_adgroup_id', label: 'utm_adgroup_id' },
  { value: 'utm_campaign_id', label: 'utm_campaign_id' },
  { value: 'utm_account_id', label: 'utm_account_id' },
  { value: 'utm_v', label: 'utm_v' },
  { value: 'utm_data', label: 'utm_data' },
  { value: 'utm_nonce', label: 'utm_nonce' },
  { value: 'ua', label: 'ua' },
  { value: 'asn', label: 'asn' },
  { value: 'lang', label: 'lang' },
  { value: 'reg_token', label: 'reg_token' },
  { value: 'reg_time', label: 'reg_time' },
  { value: 'referrer', label: 'referrer' },
  { value: 'local_scene_id', label: 'local_scene_id' },
  { value: 'client_time', label: 'client_time' },
  { value: 'utc_date', label: 'utc_date' },
  { value: 'utc_hour', label: 'utc_hour' },
  { value: 'channel', label: 'channel' },
  { value: 'ip_new', label: 'ip_new' },
  { value: 'utm_creative', label: 'utm_creative' },
  { value: 'pvn', label: 'pvn' },
  { value: 'idfv', label: 'idfv' },
  { value: 'mbr_type', label: 'mbr_type' }
]
// 监控自定义字段选择器下拉值（params 级联）
const paramFieldOptions = [
  { value: 'params.type1', label: 'params.type1' },
  { value: 'params.type2', label: 'params.type2' },
  { value: 'params.type3', label: 'params.type3' },
  { value: 'params.type4', label: 'params.type4' },
  { value: 'params.type5', label: 'params.type5' }
]
// 指标选择器下拉值
const metricOptions = [
  { value: 'Cost', label: 'Cost（消耗）' },
  { value: 'CDNU', label: 'CDNU' },
  { value: 'DAU', label: 'DAU（日活跃用户）' },
  { value: 'DNU', label: 'DNU（日新增用户）' }
]
const dataWindowModeOptions = [
  { value: 'interval', label: '日期间隔' },
  { value: 'range', label: '日期区间' }
]
const dataWindowIntervalOptions = [
  { value: '7', label: '近7日' },
  { value: 'custom', label: '近X天' }
]

const conditions = ref([])

// 生成唯一ID
let elSeq = 1
const genElId = () => elSeq++

// 监控计算规则配置
const computations = ref([])

const onFieldTypeChange = (f) => {
  // 切换字段类型时清空字段值与聚合相关数据
  f.field = ''
  f.aggFunc = ''
  f.aggTarget = ''
}

const fieldPlaceholder = (f) => {
  if (f.fieldType === 'params') return '请选择自定义参数'
  if (f.fieldType === 'other') return '请输入字段名（参考表结构）'
  return '请选择字段'
}

const fieldOptionsFor = (f) => {
  if (f.fieldType === 'params') return paramFieldOptions
  if (f.fieldType === 'metric') return metricOptions
  return []
}

const isNullOp = (op) => op === 'is null' || op === 'is not null'

// 添加条件
const addCondition = () => {
  conditions.value.push({
    id: condSeq++,
    logicOp: 'AND',
    elements: [
      { id: genElId(), type: 'event_field', fieldType: 'event_id', field: '', aggFunc: '', aggTarget: '' }
    ]
  })
}

const removeCondition = (id) => {
  if (conditions.value.length === 1) return
  conditions.value = conditions.value.filter(c => c.id !== id)
}

// 获取最后一个条件
const getLastCondition = () => conditions.value[conditions.value.length - 1]

// 添加事件字段
const addEventField = () => {
  const last = getLastCondition()
  if (last) {
    last.elements.push({ id: genElId(), type: 'event_field', fieldType: 'event_id', field: '', aggFunc: '', aggTarget: '' })
  }
}

// 添加指标字段
const addMetricField = () => {
  const last = getLastCondition()
  if (last) {
    last.elements.push({ id: genElId(), type: 'metric_field', field: 'Cost', aggFunc: '', aggTarget: '' })
  }
}

// 添加计算操作符
const addCalcOp = () => {
  const last = getLastCondition()
  if (last) {
    last.elements.push({ id: genElId(), type: 'calc_op', op: '+' })
  }
}

// 添加比较操作符
const addCompareOp = () => {
  const last = getLastCondition()
  if (last) {
    last.elements.push({ id: genElId(), type: 'compare_op', op: '>', threshold: '' })
  }
}

// 添加逻辑操作符
const addLogicOp = () => {
  const last = getLastCondition()
  if (last) {
    last.elements.push({ id: genElId(), type: 'logic_op', op: 'AND' })
  }
}

// 计算规则: 获取最后一个计算项
const getLastComputation = () => computations.value[computations.value.length - 1]

// 计算规则: 添加计算项
const addComputation = () => {
  computations.value.push({
    id: 'comp_' + Date.now(),
    elements: [
      { id: genElId(), type: 'metric_field', field: 'Cost', aggFunc: '', aggTarget: '' }
    ]
  })
}

// 计算规则: 移除计算项
const removeComputation = (id) => {
  if (computations.value.length <= 1) return
  computations.value = computations.value.filter(c => c.id !== id)
}

// 计算规则: 添加指标字段
const addCompMetricField = () => {
  let last = getLastComputation()
  if (!last) {
    addComputation()
    last = getLastComputation()
  }
  last.elements.push({ id: genElId(), type: 'metric_field', field: 'Cost', aggFunc: '', aggTarget: '' })
}

// 计算规则: 添加事件字段
const addCompEventField = () => {
  let last = getLastComputation()
  if (!last) {
    addComputation()
    last = getLastComputation()
  }
  last.elements.push({ id: genElId(), type: 'event_field', fieldType: 'event_id', field: '', aggFunc: '', aggTarget: '' })
}

// 计算规则: 添加计算操作符
const addCompCalcOp = () => {
  let last = getLastComputation()
  if (!last) {
    addComputation()
    last = getLastComputation()
  }
  last.elements.push({ id: genElId(), type: 'calc_op', op: '+' })
}

// 计算规则: 添加比较操作符
const addCompCompareOp = () => {
  let last = getLastComputation()
  if (!last) {
    addComputation()
    last = getLastComputation()
  }
  last.elements.push({ id: genElId(), type: 'compare_op', op: '>', threshold: '' })
}

// 计算规则: 添加逻辑操作符
const addCompLogicOp = () => {
  let last = getLastComputation()
  if (!last) {
    addComputation()
    last = getLastComputation()
  }
  last.elements.push({ id: genElId(), type: 'logic_op', op: 'AND' })
}

// 计算规则: 移除元素
const removeCompElement = (comp, idx) => {
  if (comp.elements.length <= 1) return
  comp.elements.splice(idx, 1)
}

// 移除元素
const removeElement = (cond, idx) => {
  if (cond.elements.length <= 1) return
  cond.elements.splice(idx, 1)
}

// 事件字段类型变更处理
const onEventFieldTypeChange = (cond, el) => {
  el.field = ''
  el.aggFunc = ''
  el.aggTarget = ''
}

// 条件预览
const conditionPreview = computed(() => {
  if (!conditions.value.length) return '请添加条件项'
  
  const elementDisplay = (el) => {
    switch (el.type) {
      case 'event_field':
        if (el.fieldType === 'params') return el.field || 'params.?'
        if (el.fieldType === 'other') return el.field || '其他字段?'
        return el.fieldType
      case 'metric_field':
        return el.field || '指标?'
      case 'calc_op':
        return el.op || '?'
      case 'compare_op':
        const th = isNullOp(el.op) ? '' : ` ${el.threshold || '?'}`
        return `${el.op || '?'}${th}`
      case 'logic_op':
        return el.op || '?'
      default:
        return '?'
    }
  }
  
  const elementStr = (el) => {
    if (el.type === 'event_field' || el.type === 'metric_field') {
      const display = elementDisplay(el)
      return el.aggFunc ? `${el.aggFunc}(${display})` : display
    }
    return elementDisplay(el)
  }
  
  return conditions.value.map((cond, idx) => {
    const prefix = idx === 0 ? '' : ` ${cond.logicOp} `
    const body = cond.elements.map(elementStr).join(' ')
    return `${prefix}${body}`
  }).join('')
})

// 计算规则预览
const computationPreview = computed(() => {
  if (!computations.value.length) return '请添加计算项'
  
  const elementDisplay = (el) => {
    switch (el.type) {
      case 'event_field':
        if (el.fieldType === 'params') return el.field || 'params.?'
        return el.fieldType
      case 'metric_field':
        return el.field || '指标?'
      case 'calc_op':
        return el.op || '?'
      case 'compare_op':
        const op = el.op || '?'
        const threshold = el.threshold || ''
        return threshold ? `${op} ${threshold}` : op
      case 'logic_op':
        return el.op || '?'
      default:
        return '?'
    }
  }
  
  const elementStr = (el) => {
    if (el.type === 'event_field' || el.type === 'metric_field') {
      const display = elementDisplay(el)
      return el.aggFunc ? `${el.aggFunc}(${display})` : display
    }
    return elementDisplay(el)
  }
  
  return computations.value.map((comp, idx) => {
    const body = comp.elements.map(elementStr).join(' ')
    return idx === 0 ? body : ` ; ${body}`
  }).join('')
})

// 频率-时间窗口联动
const windowOptionsMap = {
  hourly: [{ value: '30min', label: '最近30分钟' }, { value: '60min', label: '最近1小时' }, { value: '120min', label: '最近2小时' }],
  daily: [{ value: 'yesterday', label: '昨日全天（固定）' }]
}
const windowOptions = ref(windowOptionsMap['hourly'])
const onFreqChange = (freq) => {
  windowOptions.value = windowOptionsMap[freq] || []
  form.window = windowOptions.value[0]?.value || ''
}

const handleCancel = () => emit('update:visible', false)

const handleSave = () => {
  if (!form.name.trim()) {
    message.warning('请输入规则名称')
    return
  }
  if (!form.level) {
    message.warning('请选择监控等级')
    return
  }
  if (!form.productGroups.length) {
    message.warning('请选择产品组（监控维度必选）')
    return
  }
  emit('saved')
}

const resetForm = () => {
  Object.assign(form, {
    name: '', description: '', level: 'P2',
    productGroups: [], apps: [], appVersions: [], countries: [], channels: [],
    dataWindowMode: undefined, dataWindowInterval: '7', dataWindowX: 7, dataWindowRange: [],
    freq: 'hourly', window: '60min',
    alertChannels: [], receiver: '', silencePeriod: 30, antiShake: true, recoverNotify: true
  })
  conditions.value = []
  addCondition()
  computations.value = []
  windowOptions.value = windowOptionsMap['hourly']
}

watch(() => props.visible, (v) => {
  if (v) {
    isEdit.value = !!props.rule
    resetForm()
    if (props.rule) {
      Object.assign(form, {
        name: props.rule.name || '',
        description: props.rule.description || '',
        level: props.rule.level || 'P2',
        productGroups: props.rule.productGroups || [],
        apps: props.rule.apps || [],
        appVersions: props.rule.appVersions || [],
        countries: props.rule.countries || [],
        channels: props.rule.channels || [],
        freq: props.rule.freqKey || 'hourly',
        window: props.rule.window || '60min',
        dataWindowMode: props.rule.dataWindowMode,
        dataWindowInterval: props.rule.dataWindowInterval || '7',
        dataWindowX: props.rule.dataWindowX || 7,
        dataWindowRange: props.rule.dataWindowRange || [],
        alertChannels: props.rule.alertChannels || [],
        receiver: props.rule.receiver || '',
        silencePeriod: props.rule.silencePeriod ?? 30,
        antiShake: props.rule.antiShake ?? true,
        recoverNotify: props.rule.recoverNotify ?? true
      })
      onFreqChange(form.freq)
      // 填充条件配置 - 转换旧格式到新的 elements[] 格式
      if (props.rule.conditions && props.rule.conditions.length) {
        conditions.value = props.rule.conditions.map(c => {
          const elements = []
          // 转换 fields 为 event_field/metric_field 元素
          if (c.fields && c.fields.length) {
            c.fields.forEach((f, fi) => {
              if (f.fieldType === 'metric') {
                elements.push({ id: genElId(), type: 'metric_field', field: f.field || 'Cost', aggFunc: f.aggFunc || '', aggTarget: f.aggTarget || '' })
              } else {
                elements.push({ id: genElId(), type: 'event_field', fieldType: f.fieldType || 'event_id', field: f.field || '', aggFunc: f.aggFunc || '', aggTarget: f.aggTarget || '' })
              }
              // 字段间的计算操作符
              if (fi < c.fields.length - 1) {
                elements.push({ id: genElId(), type: 'calc_op', op: f.calcOp || '+' })
              }
            })
          }
          // 添加比较操作符
          if (c.compareOp) {
            elements.push({ id: genElId(), type: 'compare_op', op: c.compareOp, threshold: c.threshold || '' })
          }
          // 如果没有 compare_op，默认添加一个
          if (!elements.some(e => e.type === 'compare_op')) {
            elements.push({ id: genElId(), type: 'compare_op', op: '>', threshold: '' })
          }
          return { id: condSeq++, logicOp: c.logicOp || 'AND', elements }
        })
      }
      // 填充计算规则配置
      if (props.rule.computations && props.rule.computations.length) {
        computations.value = props.rule.computations.map((c, ci) => ({
          id: c.id || ('comp_' + (ci + 1)),
          elements: (c.elements || []).map(el => ({
            id: genElId(),
            type: el.type,
            fieldType: el.fieldType,
            field: el.field,
            aggFunc: el.aggFunc || '',
            aggTarget: el.aggTarget || '',
            op: el.op,
            threshold: el.threshold
          }))
        }))
      }
    }
  }
})
</script>

<style scoped>
.form-section { margin-bottom: 24px; }
.form-section-title { font-size: 14px; font-weight: 600; color: #1E293B; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.dot { width: 4px; height: 16px; background: #4F46E5; border-radius: 2px; display: inline-block; }
.dot.warn { background: #F59E0B; }
.section-hint { font-size: 12px; color: #94A3B8; font-weight: 400; }
.section-sub { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; }
.form-hint { font-size: 12px; color: #64748B; margin-top: 4px; }

.condition-builder { display: flex; flex-direction: column; gap: 12px; }
.condition-item { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
.condition-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.condition-flag { font-size: 12px; font-weight: 600; color: #4F46E5; }
.condition-elements { display: flex; flex-direction: column; gap: 8px; }
.element-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 6px 8px; background: #F8FAFC; border-radius: 6px; }
.element-row.element-calc_op { background: #FEF3C7; border: 1px dashed #F59E0B; }
.element-row.element-compare_op { background: #FCE7F3; border: 1px dashed #EC4899; }
.element-label { font-size: 12px; font-weight: 600; color: #64748B; background: #E2E8F0; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
.element-row.element-calc_op .element-label { background: #F59E0B; color: #fff; }
.element-row.element-compare_op .element-label { background: #EC4899; color: #fff; }
.threshold-preview { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 6px; padding: 12px; font-size: 13px; color: #3730A3; font-family: monospace; word-break: break-all; }
.preview-label { font-size: 11px; color: #4338CA; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; }
.empty-tip { background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 6px; padding: 24px; text-align: center; color: #94A3B8; font-size: 13px; }
</style>
