<template>
  <div class="prop-page">
    <!-- 筛选栏 -->
    <div class="prop-filter">
      <a-input-search
        v-model:value="searchText"
        placeholder="按属性名搜索"
        style="width: 240px"
        data-marker="属性-名称搜索-按属性名/显示名模糊匹配"
        allow-clear
      />
      <a-select
        v-model:value="dataTypeFilter"
        placeholder="数据类型"
        style="width: 160px"
        data-marker="属性-数据类型筛选-string/int/float/bool/list/enum"
        allow-clear
      >
        <a-select-option value="string">string</a-select-option>
        <a-select-option value="int">int</a-select-option>
        <a-select-option value="float">float</a-select-option>
        <a-select-option value="bool">bool</a-select-option>
        <a-select-option value="list">list</a-select-option>
        <a-select-option value="enum">enum</a-select-option>
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
        <a-form-item label="属性名" required>
          <a-input v-model:value="form.name" placeholder="如：ad_platform" data-marker="属性-属性名输入框-必填" />
        </a-form-item>
        <a-form-item label="显示名" required>
          <a-input v-model:value="form.displayName" placeholder="如：广告平台" data-marker="属性-显示名输入框-必填" />
        </a-form-item>
        <a-form-item label="数据类型" required>
          <a-select
            v-model:value="form.dataType"
            placeholder="选择数据类型"
            data-marker="属性-数据类型选择-string/int/float/bool/list/enum"
          >
            <a-select-option value="string">string</a-select-option>
            <a-select-option value="int">int</a-select-option>
            <a-select-option value="float">float</a-select-option>
            <a-select-option value="bool">bool</a-select-option>
            <a-select-option value="list">list</a-select-option>
            <a-select-option value="enum">enum</a-select-option>
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
        <li>属性-名称搜索-按属性名/显示名模糊匹配</li>
        <li>属性-数据类型筛选-string/int/float/bool/list/enum</li>
        <li>属性-新增属性按钮-新建一个事件属性</li>
        <li>属性-属性列表表格-事件属性库</li>
        <li>属性-编辑属性 / 删除属性-行内操作（删除二次确认）</li>
        <li>属性-属性名 / 显示名输入框-必填</li>
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
import { eventProperties, codeSets } from './mock.js'

const propList = ref(JSON.parse(JSON.stringify(eventProperties)))
const codeSetList = ref(JSON.parse(JSON.stringify(codeSets)))

const dataTypeColor = {
  string: 'blue',
  int: 'cyan',
  float: 'green',
  bool: 'orange',
  list: 'purple',
  enum: 'geekblue'
}

const searchText = ref('')
const dataTypeFilter = ref(undefined)

const filteredProps = computed(() => {
  const kw = searchText.value.trim().toLowerCase()
  return propList.value.filter(p => {
    if (dataTypeFilter.value && p.dataType !== dataTypeFilter.value) return false
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
  name: '',
  displayName: '',
  dataType: 'string',
  codeSetId: '',
  valueRange: '',
  remark: ''
})

const openModal = (prop) => {
  editingProp.value = prop
  if (prop) {
    form.name = prop.name
    form.displayName = prop.displayName
    form.dataType = prop.dataType
    form.codeSetId = prop.codeSetId || ''
    form.valueRange = prop.valueRange || ''
    form.remark = prop.remark || ''
  } else {
    form.name = ''
    form.displayName = ''
    form.dataType = 'string'
    form.codeSetId = ''
    form.valueRange = ''
    form.remark = ''
  }
  modalVisible.value = true
}

const handleSave = () => {
  if (!form.name.trim()) {
    message.warning('请输入属性名')
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
        name: form.name.trim(),
        displayName: form.displayName.trim(),
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
      name: form.name.trim(),
      displayName: form.displayName.trim(),
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
    title: '属性名',
    dataIndex: 'name',
    key: 'name',
    width: 180,
    customHeaderCell: () => ({ title: '属性的英文标识符，全局唯一' })
  },
  {
    title: '显示名',
    dataIndex: 'displayName',
    key: 'displayName',
    width: 160,
    customHeaderCell: () => ({ title: '属性的业务可读名称' })
  },
  {
    title: '数据类型',
    key: 'dataType',
    width: 100,
    customHeaderCell: () => ({ title: 'string/int/float/bool/list/enum 六种类型之一' })
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
  padding: 24px;
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
