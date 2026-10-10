<template>
  <div class="prop-page">
    <!-- 左侧：事件组织结构树（产品组-产品品类） -->
    <EventOrgTree @select="onOrgSelect" />

    <!-- 右侧：属性列表 -->
    <div class="prop-main">
      <!-- 筛选栏 -->
      <div class="prop-filter">
        <a-input-search
          v-model:value="searchText"
          placeholder="按属性编码/显示名搜索"
          style="width: 240px"
          data-marker="属性-名称搜索-按属性编码/显示名模糊匹配"
          allow-clear
        />
        <a-select
          v-model:value="dataTypeFilter"
          placeholder="数据类型"
          style="width: 160px"
          data-marker="属性-数据类型筛选-string/int/float/bool/list"
          allow-clear
        >
          <a-select-option value="string">string</a-select-option>
          <a-select-option value="int">int</a-select-option>
          <a-select-option value="float">float</a-select-option>
          <a-select-option value="bool">bool</a-select-option>
          <a-select-option value="list">list</a-select-option>
        </a-select>
        <a-select
          v-model:value="typeFilter"
          placeholder="类型"
          style="width: 130px"
          data-marker="属性-类型筛选-通用/自定义"
          allow-clear
        >
          <a-select-option value="common">通用</a-select-option>
          <a-select-option value="custom">自定义</a-select-option>
        </a-select>
        <div style="flex: 1"></div>
        <a-button type="primary" @click="openModal(null)" data-marker="属性-新增属性按钮-新建一个事件属性">
          + 新增属性
        </a-button>
      </div>

      <!-- 属性表格 -->
      <a-table
        :columns="columns"
        :data-source="filteredProps"
        row-key="id"
        size="middle"
        bordered
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }"
        data-marker="属性-属性列表表格-事件属性库"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'dataType'">
            <a-tag :color="dataTypeColor[record.dataType]">{{ record.dataType }}</a-tag>
          </template>
          <template v-else-if="column.key === 'mappingName'">
            {{ record.mappingName || '—' }}
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="record.type === 'common' ? 'green' : 'orange'">{{ record.type === 'common' ? '通用' : '自定义' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'org'">
            {{ getOrgText(record) }}
          </template>
          <template v-else-if="column.key === 'range'">
            <span v-if="record.dataType === 'list'">
              引用编码集：
              <a-tag color="purple">{{ getCodeSetName(record.codeSetId) }}</a-tag>
            </span>
            <span v-else>{{ record.valueRange || '—' }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openModal(record)" :data-marker="'属性-编辑属性-' + record.name">编辑</a-button>
            <a-popconfirm title="确认删除该属性？" @confirm="deleteProp(record.id)">
              <a-button type="link" size="small" danger :data-marker="'属性-删除属性-' + record.name">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 属性 弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingProp ? '编辑属性' : '新增属性'"
      width="520px"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSave"
    >
      <a-form :model="form" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="所属产品组" required>
              <a-select
                v-model:value="form.group"
                :options="groupOptions"
                placeholder="请选择产品组"
                data-marker="属性-所属产品组选择-必填，维护属性归属"
                @change="form.category = undefined"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属产品品类" required>
              <a-select
                v-model:value="form.category"
                :options="formCategoryOptions"
                :disabled="!form.group"
                :placeholder="form.group ? '请选择产品品类' : '请先选择产品组'"
                data-marker="属性-所属产品品类选择-按产品组级联"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="属性编码" required>
          <a-input v-model:value="form.name" placeholder="如：ad_platform" data-marker="属性-属性编码输入框-必填" />
        </a-form-item>
        <a-form-item label="映射属性编码">
          <a-input v-model:value="form.mappingName" placeholder="项目组上报的原始属性编码，如：meditation_ad_platform" data-marker="属性-映射属性编码输入框-存储项目组上报的属性编码" />
        </a-form-item>
        <a-form-item label="显示名" required>
          <a-input v-model:value="form.displayName" placeholder="如：广告平台" data-marker="属性-显示名输入框-必填" />
        </a-form-item>
        <a-form-item label="类型" required>
          <a-radio-group v-model:value="form.type" data-marker="属性-类型选择-通用/自定义">
            <a-radio value="common">通用</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="数据类型" required>
          <a-select
            v-model:value="form.dataType"
            placeholder="选择数据类型"
            data-marker="属性-数据类型选择-string/int/float/bool/list"
          >
            <a-select-option value="string">string</a-select-option>
            <a-select-option value="int">int</a-select-option>
            <a-select-option value="float">float</a-select-option>
            <a-select-option value="bool">bool</a-select-option>
            <a-select-option value="list">list</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="form.dataType === 'list'" label="引用编码集" required>
          <a-select
            v-model:value="form.codeSetId"
            placeholder="选择引用的编码集"
            data-marker="属性-引用编码集选择-list 类型必填"
          >
            <a-select-option v-for="cs in codeSetList" :key="cs.id" :value="cs.id">{{ cs.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="form.dataType && form.dataType !== 'list'" label="值域" required>
          <a-input v-model:value="form.valueRange" placeholder="如：0~100 或 true/false" data-marker="属性-值域输入框-非 list 类型必填" />
        </a-form-item>
        <a-form-item label="备注" required>
          <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="3" data-marker="属性-备注输入框-必填" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 交互说明 -->
    <details class="anno-details">
      <summary>📌 交互说明</summary>
      <ul>
        <li>属性-事件组织结构树-产品组→产品品类，点击节点联动过滤右侧属性列表</li>
        <li>属性-名称搜索-按属性编码/显示名模糊匹配</li>
        <li>属性-数据类型筛选-string/int/float/bool/list</li>
        <li>属性-类型筛选-通用/自定义</li>
        <li>属性-新增属性按钮-新建一个事件属性</li>
        <li>属性-属性列表表格-事件属性库</li>
        <li>属性-所属产品组/产品品类选择-新增编辑时维护归属，按组级联</li>
        <li>属性-映射属性编码输入框-存储项目组上报的属性编码，用于上报数据映射</li>
        <li>属性-编辑属性 / 删除属性-行内操作（删除二次确认）</li>
        <li>属性-类型选择-通用/自定义</li>
        <li>属性-数据类型选择-决定后续字段联动</li>
        <li>属性-引用编码集选择-list 类型必填，从编码集库中选择</li>
        <li>属性-值域输入框-非 list 类型必填</li>
        <li>属性-备注输入框-必填</li>
      </ul>
    </details>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { eventProperties, codeSets, orgTreeData } from './mock.js'
import EventOrgTree from './EventOrgTree.vue'

const propList = ref(JSON.parse(JSON.stringify(eventProperties)))
const codeSetList = ref(JSON.parse(JSON.stringify(codeSets)))

/* ====== 事件组织结构树（产品组-产品品类） ====== */
const orgSelected = ref(null)

function onOrgSelect(node) {
  orgSelected.value = node
}

/* 产品组/品类 key → 名称 */
const getOrgText = (record) => {
  const g = orgTreeData.find(x => x.key === record.group)
  const c = g ? (g.children || []).find(x => x.key === record.category) : null
  return [g && g.title, c && c.title].filter(Boolean).join(' / ') || '—'
}

/* 表单选项：产品组 / 品类级联 */
const groupOptions = orgTreeData.map(g => ({ value: g.key, label: g.title }))

const dataTypeColor = {
  string: 'blue',
  int: 'cyan',
  float: 'green',
  bool: 'orange',
  list: 'purple'
}

const searchText = ref('')
const dataTypeFilter = ref(undefined)
const typeFilter = ref(undefined)

const filteredProps = computed(() => {
  const kw = searchText.value.trim().toLowerCase()
  return propList.value.filter(p => {
    /* 组织结构树过滤：产品组节点 → 过滤该组；品类节点 → 过滤该品类 */
    if (orgSelected.value) {
      if (orgSelected.value.type === 'group' && p.group !== orgSelected.value.key) return false
      if (orgSelected.value.type === 'category' && p.category !== orgSelected.value.key) return false
    }
    if (dataTypeFilter.value && p.dataType !== dataTypeFilter.value) return false
    if (typeFilter.value && p.type !== typeFilter.value) return false
    if (kw && !(
      p.name.toLowerCase().includes(kw) ||
      (p.displayName || '').toLowerCase().includes(kw)
    )) return false
    return true
  })
})

const getCodeSetName = (id) => {
  const cs = codeSetList.value.find(s => s.id === id)
  return cs ? cs.name : '—'
}

// 弹窗
const modalVisible = ref(false)
const editingProp = ref(null)
const form = reactive({
  group: undefined,
  category: undefined,
  name: '',
  mappingName: '',
  displayName: '',
  type: 'common',
  dataType: 'string',
  codeSetId: '',
  valueRange: '',
  remark: ''
})

/* 弹窗内品类选项：跟随所选产品组级联 */
const formCategoryOptions = computed(() => {
  const g = orgTreeData.find(x => x.key === form.group)
  return (g ? (g.children || []) : []).map(c => ({ value: c.key, label: c.title }))
})

const openModal = (prop) => {
  editingProp.value = prop
  if (prop) {
    form.group = prop.group || undefined
    form.category = prop.category || undefined
    form.name = prop.name
    form.mappingName = prop.mappingName || ''
    form.displayName = prop.displayName
    form.type = prop.type || 'common'
    form.dataType = prop.dataType
    form.codeSetId = prop.codeSetId || ''
    form.valueRange = prop.valueRange || ''
    form.remark = prop.remark || ''
  } else {
    /* 新增时默认带入左侧树当前选中的产品组/品类 */
    form.group = orgSelected.value
      ? (orgSelected.value.type === 'group' ? orgSelected.value.key : orgSelected.value.groupKey)
      : undefined
    form.category = orgSelected.value && orgSelected.value.type === 'category' ? orgSelected.value.key : undefined
    form.name = ''
    form.mappingName = ''
    form.displayName = ''
    form.type = 'common'
    form.dataType = 'string'
    form.codeSetId = ''
    form.valueRange = ''
    form.remark = ''
  }
  modalVisible.value = true
}

const handleSave = () => {
  if (!form.group) {
    message.warning('请选择所属产品组')
    return
  }
  if (!form.category) {
    message.warning('请选择所属产品品类')
    return
  }
  if (!form.name.trim()) {
    message.warning('请输入属性编码')
    return
  }
  if (!form.displayName.trim()) {
    message.warning('请输入显示名')
    return
  }
  if (form.dataType === 'list' && !form.codeSetId) {
    message.warning('list 类型必须选择引用的编码集')
    return
  }
  if (form.dataType && form.dataType !== 'list' && !form.valueRange.trim()) {
    message.warning('请输入值域')
    return
  }
  if (!form.remark.trim()) {
    message.warning('请输入备注')
    return
  }
  if (editingProp.value) {
    const p = propList.value.find(x => x.id === editingProp.value.id)
    if (p) {
      Object.assign(p, {
        group: form.group,
        category: form.category,
        name: form.name.trim(),
        mappingName: form.mappingName.trim(),
        displayName: form.displayName.trim(),
        type: form.type,
        dataType: form.dataType,
        codeSetId: form.dataType === 'list' ? form.codeSetId : '',
        valueRange: form.dataType === 'list' ? '' : form.valueRange,
        remark: form.remark
      })
    }
    message.success('属性已更新')
  } else {
    propList.value.push({
      id: 'ep_' + Date.now(),
      group: form.group,
      category: form.category,
      name: form.name.trim(),
      mappingName: form.mappingName.trim(),
      displayName: form.displayName.trim(),
      type: form.type,
      dataType: form.dataType,
      codeSetId: form.dataType === 'list' ? form.codeSetId : '',
      valueRange: form.dataType === 'list' ? '' : form.valueRange,
      remark: form.remark
    })
    message.success('属性已新增')
  }
  modalVisible.value = false
}

const deleteProp = (id) => {
  propList.value = propList.value.filter(p => p.id !== id)
  message.success('属性已删除')
}

// 列定义
const columns = [
  {
    title: '属性编码',
    dataIndex: 'name',
    key: 'name',
    width: 180,
    customHeaderCell: () => ({ title: '属性的英文标识符，同一品类下的事件属性名唯一' })
  },
  {
    title: '映射属性编码',
    dataIndex: 'mappingName',
    key: 'mappingName',
    width: 180,
    customHeaderCell: () => ({ title: '项目组上报的原始属性名，用于上报数据与本平台属性的映射' })
  },
  {
    title: '显示名',
    dataIndex: 'displayName',
    key: 'displayName',
    width: 160,
    customHeaderCell: () => ({ title: '属性的业务可读名称' })
  },
  {
    title: '类型',
    key: 'type',
    width: 90,
    customHeaderCell: () => ({ title: '通用属性可被多事件复用；自定义属性为事件专属' })
  },
  {
    title: '产品组/品类',
    key: 'org',
    width: 180,
    customHeaderCell: () => ({ title: '属性归属的产品组-产品品类' })
  },
  {
    title: '数据类型',
    key: 'dataType',
    width: 100,
    customHeaderCell: () => ({ title: 'string/int/float/bool/list 五种类型之一' })
  },
  {
    title: '值域 / 引用编码集',
    key: 'range',
    customHeaderCell: () => ({ title: 'list 类型展示引用编码集名称；其他类型展示允许的值范围' })
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    customHeaderCell: () => ({ title: '补充说明，如单位、计算口径' })
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
    fixed: 'right',
    customHeaderCell: () => ({ title: '编辑 / 删除该属性（删除二次确认）' })
  }
]
</script>

<style scoped>
.prop-page {
  display: flex;
  height: 100%;
}
.prop-main {
  flex: 1;
  padding: 24px;
  overflow: auto;
  min-width: 0;
}
.prop-filter {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}
.anno-details {
  position: fixed;
  bottom: 12px;
  right: 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  max-width: 360px;
}
.anno-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #1677ff;
}
.anno-details ul {
  margin-top: 8px;
  padding-left: 18px;
  line-height: 1.8;
}
</style>
