<template>
  <div class="cs-page">
    <!-- 左侧：事件组织结构树（产品组-产品品类） -->
    <EventOrgTree @select="onOrgSelect" />

    <!-- 右侧：编码集列表 -->
    <div class="cs-right">
      <div class="cs-right-header">编码集列表</div>
      <div class="cs-filter">
        <div class="cs-filter-item">
          <span class="cs-filter-label">唯一编码：</span>
          <a-input v-model:value="filterCode" placeholder="请输入" allow-clear style="width: 200px" data-marker="编码集-唯一编码筛选-按编码模糊搜索编码集" />
        </div>
        <div class="cs-filter-item">
          <span class="cs-filter-label">编码集名称：</span>
          <a-input v-model:value="filterName" placeholder="请输入" allow-clear style="width: 200px" data-marker="编码集-名称筛选-按名称模糊搜索编码集" />
        </div>
        <div class="cs-filter-item">
          <span class="cs-filter-label">类型：</span>
          <a-select
            v-model:value="filterType"
            placeholder="全部"
            allow-clear
            style="width: 130px"
            data-marker="编码集-类型筛选-通用/自定义"
          >
            <a-select-option value="common">通用</a-select-option>
            <a-select-option value="custom">自定义</a-select-option>
          </a-select>
        </div>
        <div class="cs-filter-spacer" />
        <a-button type="primary" @click="openSetModal(null)" data-marker="编码集-新建按钮-创建新的编码集">
          <template #icon><span>+</span></template>
          新建
        </a-button>
      </div>

      <a-table
        :columns="setColumns"
        :data-source="filteredSets"
        row-key="id"
        size="middle"
        bordered
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
        data-marker="编码集-列表表格-展示编码集列表，点击名称查看编码值"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'index'">
            {{ filteredSets.indexOf(record) + 1 }}
          </template>
          <template v-else-if="column.key === 'name'">
            <a @click="onSetClick(record)" :data-marker="'编码集-查看详情-' + record.name">{{ record.name }}</a>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="record.type === 'common' ? 'green' : 'orange'">{{ record.type === 'common' ? '通用' : '自定义' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'dataType'">
            <a-tag :color="dataTypeTagMap[record.dataType] || 'default'">{{ dataTypeTextMap[record.dataType] || '—' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'org'">
            {{ getOrgText(record) }}
          </template>
          <template v-else-if="column.key === 'valueCount'">
            <a-tag color="blue">{{ (record.values || []).length }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="onSetClick(record)" :data-marker="'编码集-维护编码值-' + record.name">维护</a-button>
            <a-button type="link" size="small" @click="openSetModal(record)" :data-marker="'编码集-编辑-' + record.name">编辑</a-button>
            <a-popconfirm title="确认删除该编码集？" @confirm="deleteCodeSet(record.id)">
              <a-button type="link" size="small" danger :data-marker="'编码集-删除-' + record.name">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 编码值明细 Drawer -->
    <a-drawer
      v-model:open="valueDrawerVisible"
      :title="`「${selectedSetName}」编码值维护`"
      width="620"
      placement="right"
      :footer-style="{ textAlign: 'right', padding: '12px 24px', borderTop: '1px solid #e8e8e8' }"
      data-marker="编码集-编码值弹窗-动态表格行内编辑，新增/删除行后统一保存"
    >
      <div class="value-toolbar">
        <a-button type="primary" size="small" @click="addValueRow" data-marker="编码集-新增编码值行-在表格末尾追加一行空编码值">+ 新增编码值</a-button>
        <span class="value-tip">直接在表格中编辑，全部完成后点击底部「保存」一次性提交</span>
      </div>
      <a-table
        :columns="valueColumns"
        :data-source="draftValues"
        row-key="id"
        size="small"
        bordered
        :pagination="false"
        :scroll="{ y: 420 }"
        data-marker="编码集-编码值列表-行内编辑键/值/业务说明"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'key'">
            <a-input v-model:value="record.key" size="small" placeholder="如 admob" :data-marker="'编码值-键输入-' + (index + 1)" />
          </template>
          <template v-else-if="column.key === 'value'">
            <a-input v-model:value="record.value" size="small" placeholder="如 1" :data-marker="'编码值-值输入-' + (index + 1)" />
          </template>
          <template v-else-if="column.key === 'desc'">
            <a-input v-model:value="record.desc" size="small" placeholder="业务说明" :data-marker="'编码值-说明输入-' + (index + 1)" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-popconfirm title="确认删除该行？" @confirm="removeValueRow(record.id)">
              <a-button type="link" size="small" danger :data-marker="'编码值-删除行-' + (record.key || index)">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
      <a-empty v-if="!draftValues.length" description="暂无编码值，点击「新增编码值」添加" />
      <template #footer>
        <a-button @click="valueDrawerVisible = false" data-marker="编码集-编码值-取消-放弃本次改动并关闭">取消</a-button>
        <a-button type="primary" @click="saveDraftValues" data-marker="编码集-编码值-保存-一次性提交所有编码值改动">保存</a-button>
      </template>
    </a-drawer>

    <!-- 分类 Modal -->
    <a-modal
      v-model:open="catModalVisible"
      :title="catModalTitle"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleCatSave"
    >
      <a-form :model="catForm" layout="vertical">
        <a-form-item label="分类名称" required>
          <a-input v-model:value="catForm.title" placeholder="请输入分类名称" data-marker="编码集-分类名称输入框-必填" />
        </a-form-item>
        <a-form-item label="上级分类">
          <a-tree-select
            v-model:value="catForm.parentKey"
            :tree-data="parentTreeOptions"
            :field-names="{ children: 'children', title: 'title', value: 'key' }"
            placeholder="无（作为一级分类）"
            allow-clear
            tree-default-expand-all
            data-marker="编码集-上级分类选择-选择父级分类节点"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编码集 Modal -->
    <a-modal
      v-model:open="setModalVisible"
      :title="editingSet ? '编辑编码集' : '新建编码集'"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSetSave"
      width="520px"
    >
      <a-form :model="setForm" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="所属产品组" required>
              <a-select
                v-model:value="setForm.group"
                :options="groupOptions"
                placeholder="请选择产品组"
                data-marker="编码集-所属产品组选择-必填，维护编码集归属"
                @change="setForm.category = undefined"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属产品品类" required>
              <a-select
                v-model:value="setForm.category"
                :options="formCategoryOptions"
                :disabled="!setForm.group"
                :placeholder="setForm.group ? '请选择产品品类' : '请先选择产品组'"
                data-marker="编码集-所属产品品类选择-按产品组级联"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="唯一编码" required>
          <a-input v-model:value="setForm.code" placeholder="请输入唯一编码，如 AD_PLATFORM" data-marker="编码集-唯一编码输入框-全局唯一标识" />
        </a-form-item>
        <a-form-item label="编码集名称" required>
          <a-input v-model:value="setForm.name" placeholder="请输入编码集名称" data-marker="编码集-名称输入框-必填" />
        </a-form-item>
        <a-form-item label="类型" required>
          <a-radio-group v-model:value="setForm.type" data-marker="编码集-类型选择-通用/自定义">
            <a-radio value="common">通用</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="数据类型" required>
          <a-select v-model:value="setForm.dataType" placeholder="请选择数据类型" :options="dataTypeOptions" data-marker="编码集-数据类型选择-集内统一类型必填" />
        </a-form-item>
        <a-form-item label="描述" required>
          <a-textarea v-model:value="setForm.description" placeholder="请输入描述" :rows="3" data-marker="编码集-描述输入框-必填" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 交互说明 -->
    <details class="anno-details">
      <summary>📌 交互说明</summary>
      <ul>
        <li>编码集-事件组织结构树-产品组→产品品类，点击节点联动过滤右侧编码集列表</li>
        <li>编码集-名称筛选/唯一编码筛选-右侧列表过滤</li>
        <li>编码集-类型筛选-通用/自定义</li>
        <li>编码集-新建按钮-创建新编码集</li>
        <li>编码集-所属产品组/产品品类选择-新增编辑时维护归属，按组级联</li>
        <li>编码集-类型选择-通用/自定义</li>
        <li>编码集-列表表格-展示编码集，点击名称查看编码值</li>
        <li>编码集-维护/编辑/删除-行内操作（维护打开编码值动态编辑表格）</li>
        <li>编码集-编码值弹窗-动态表格行内编辑，新增/删除行后统一保存</li>
        <li>编码集-新增编码值行-在表格末尾追加一行空编码值</li>
        <li>编码集-编码值-保存-一次性提交所有编码值改动（取消则放弃）</li>
      </ul>
    </details>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { codeSets, orgTreeData } from './mock.js'
import EventOrgTree from './EventOrgTree.vue'

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

/* 表单选项：产品组 */
const groupOptions = orgTreeData.map(g => ({ value: g.key, label: g.title }))

/* ====== 编码集列表 ====== */
const codeSetList = ref(JSON.parse(JSON.stringify(codeSets)))
const filterName = ref('')
const filterCode = ref('')
const filterType = ref(undefined)
const filterSource = ref(undefined)

const filteredSets = computed(() => {
  let list = codeSetList.value
  /* 组织结构树过滤：产品组节点 → 过滤该组；品类节点 → 过滤该品类 */
  if (orgSelected.value) {
    if (orgSelected.value.type === 'group') {
      list = list.filter(s => s.group === orgSelected.value.key)
    } else {
      list = list.filter(s => s.category === orgSelected.value.key)
    }
  }
  if (filterCode.value.trim()) {
    const kw = filterCode.value.trim().toLowerCase()
    list = list.filter(s => (s.code || '').toLowerCase().includes(kw))
  }
  if (filterName.value.trim()) {
    const kw = filterName.value.trim().toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(kw))
  }
  if (filterType.value) {
    list = list.filter(s => s.type === filterType.value)
  }
  return list
})

/* 编码集列 */
const setColumns = [
  { title: '编号', key: 'index', width: 60, customHeaderCell: () => ({ title: '序号' }) },
  { title: '唯一编码', dataIndex: 'code', key: 'code', width: 160, customHeaderCell: () => ({ title: '编码集全局唯一标识，大写下划线；同一个品类下的唯一编码唯一' }) },
  { title: '编码集名称', key: 'name', width: 160, customHeaderCell: () => ({ title: '编码集的业务名称' }) },
  { title: '类型', key: 'type', width: 90, customHeaderCell: () => ({ title: '通用编码集可被多属性引用；自定义编码集为属性专属' }) },
  { title: '数据类型', key: 'dataType', width: 100, customHeaderCell: () => ({ title: '该编码集下所有编码值的统一数据类型' }) },
  { title: '产品组/品类', key: 'org', width: 170, customHeaderCell: () => ({ title: '编码集归属的产品组-产品品类' }) },
  { title: '编码数量', key: 'valueCount', width: 100, customHeaderCell: () => ({ title: '该编码集下当前键值数量' }) },
  { title: '创建者', dataIndex: 'creator', key: 'creator', width: 100, customHeaderCell: () => ({ title: '创建人' }) },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, customHeaderCell: () => ({ title: '创建时间' }) },
  { title: '操作', key: 'action', width: 160, fixed: 'right', customHeaderCell: () => ({ title: '维护/编辑/删除' }) }
]

/* 编码集 Modal */
const setModalVisible = ref(false)
const editingSet = ref(null)
const setForm = reactive({ group: undefined, category: undefined, code: '', name: '', type: 'common', dataType: undefined, description: '' })

/* 弹窗内品类选项：跟随所选产品组级联 */
const formCategoryOptions = computed(() => {
  const g = orgTreeData.find(x => x.key === setForm.group)
  return (g ? (g.children || []) : []).map(c => ({ value: c.key, label: c.title }))
})

function openSetModal(set) {
  editingSet.value = set
  if (set) {
    setForm.group = set.group || undefined
    setForm.category = set.category || undefined
    setForm.code = set.code || ''
    setForm.name = set.name
    setForm.type = set.type || 'common'
    setForm.dataType = set.dataType || undefined
    setForm.description = set.description || ''
  } else {
    /* 新增时默认带入左侧树当前选中的产品组/品类 */
    setForm.group = orgSelected.value
      ? (orgSelected.value.type === 'group' ? orgSelected.value.key : orgSelected.value.groupKey)
      : undefined
    setForm.category = orgSelected.value && orgSelected.value.type === 'category' ? orgSelected.value.key : undefined
    setForm.code = ''
    setForm.name = ''
    setForm.type = 'common'
    setForm.dataType = undefined
    setForm.description = ''
  }
  setModalVisible.value = true
}

function handleSetSave() {
  if (!setForm.group) { message.warning('请选择所属产品组'); return }
  if (!setForm.category) { message.warning('请选择所属产品品类'); return }
  if (!setForm.code.trim()) { message.warning('请输入唯一编码'); return }
  if (!setForm.name.trim()) { message.warning('请输入编码集名称'); return }
  if (!setForm.dataType) { message.warning('请选择数据类型'); return }
  if (!setForm.description.trim()) { message.warning('请输入描述'); return }
  if (editingSet.value) {
    const s = codeSetList.value.find(x => x.id === editingSet.value.id)
    if (s) {
      s.group = setForm.group
      s.category = setForm.category
      s.code = setForm.code.trim()
      s.name = setForm.name.trim()
      s.type = setForm.type
      s.dataType = setForm.dataType
      s.description = setForm.description
    }
    message.success('编码集已更新')
  } else {
    codeSetList.value.push({
      id: 'cs_' + Date.now(),
      group: setForm.group,
      category: setForm.category,
      code: setForm.code.trim(),
      name: setForm.name.trim(),
      type: setForm.type,
      dataType: setForm.dataType,
      creator: '管理员',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      description: setForm.description,
      values: []
    })
    message.success('编码集已新建')
  }
  setModalVisible.value = false
}

function deleteCodeSet(id) {
  codeSetList.value = codeSetList.value.filter(s => s.id !== id)
  message.success('编码集已删除')
}

/* 编码值 Drawer（动态行内编辑） */
const valueDrawerVisible = ref(false)
const selectedSetId = ref('')
const draftValues = ref([])
const selectedSetName = computed(() => {
  const s = codeSetList.value.find(x => x.id === selectedSetId.value)
  return s ? s.name : ''
})

function onSetClick(record) {
  selectedSetId.value = record.id
  /* 打开时深拷贝一份作为草稿，保存时再写回 */
  const s = codeSetList.value.find(x => x.id === selectedSetId.value)
  draftValues.value = JSON.parse(JSON.stringify((s && s.values) || []))
  valueDrawerVisible.value = true
}

const dataTypeOptions = [
  { value: 'int', label: '整型' },
  { value: 'float', label: '浮动型' },
  { value: 'string', label: '字符串' },
  { value: 'datetime', label: '时间' }
]

/* 新增空行 */
function addValueRow() {
  draftValues.value.push({ id: 'cv_tmp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), key: '', value: '', desc: '' })
}

/* 删除行 */
function removeValueRow(id) {
  draftValues.value = draftValues.value.filter(v => v.id !== id)
}

/* 统一保存：校验后写回编码集 */
function saveDraftValues() {
  const set = codeSetList.value.find(s => s.id === selectedSetId.value)
  if (!set) { message.error('编码集未找到'); return }
  /* 校验 */
  for (let i = 0; i < draftValues.value.length; i++) {
    const row = draftValues.value[i]
    if (!row.key.trim()) { message.warning(`第 ${i + 1} 行：请输入键`); return }
    if (!row.value.trim()) { message.warning(`第 ${i + 1} 行：请输入值`); return }
    if (!row.desc.trim()) { message.warning(`第 ${i + 1} 行：请输入业务说明`); return }
  }
  /* 键唯一性校验 */
  const keys = draftValues.value.map(v => v.key.trim())
  if (new Set(keys).size !== keys.length) { message.warning('编码键在集内需唯一，存在重复键'); return }
  /* 写回：去掉临时 id 前缀，保留已有 id */
  set.values = draftValues.value.map(v => ({
    id: v.id.startsWith('cv_tmp_') ? 'cv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) : v.id,
    key: v.key.trim(),
    value: v.value.trim(),
    desc: v.desc.trim()
  }))
  message.success(`已保存 ${set.values.length} 个编码值`)
  valueDrawerVisible.value = false
}

/* 编码值列 */
const dataTypeTagMap = { int: 'cyan', float: 'green', string: 'blue', datetime: 'orange' }
const dataTypeTextMap = { int: '整型', float: '浮动型', string: '字符串', datetime: '时间' }

const valueColumns = [
  { title: '键 (key)', dataIndex: 'key', key: 'key', width: 140, customHeaderCell: () => ({ title: '编码键，集内唯一' }) },
  { title: '值 (value)', dataIndex: 'value', key: 'value', width: 120, customHeaderCell: () => ({ title: '编码值' }) },
  { title: '业务说明', dataIndex: 'desc', key: 'desc', customHeaderCell: () => ({ title: '该键值对应的业务语义' }) },
  { title: '操作', key: 'action', width: 90, fixed: 'right', customHeaderCell: () => ({ title: '删除该行' }) }
]
</script>

<style scoped>
.value-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.value-tip {
  font-size: 12px;
  color: #8c8c8c;
}
.cs-page {
  display: flex;
  height: 100%;
  gap: 0;
}

/* 右侧列表 */
.cs-right {
  flex: 1;
  padding: 12px 24px;
  overflow: auto;
}
.cs-right-header {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}
.cs-filter {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.cs-filter-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cs-filter-label {
  font-size: 13px;
  color: #475569;
  white-space: nowrap;
}
.cs-filter-spacer {
  flex: 1;
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
