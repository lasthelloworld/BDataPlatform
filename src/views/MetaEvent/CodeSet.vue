<template>
  <div class="cs-page">
    <!-- 左侧：编码集分类树 -->
    <div class="cs-left">
      <div class="cs-left-header">编码集分类</div>
      <div class="cs-left-toolbar">
        <a-button type="primary" size="small" @click="openCatModal(null, 'top')" data-marker="编码集-添加分类按钮-新增一级分类">添加分类</a-button>
        <a-button type="primary" size="small" :disabled="!canAddChild" @click="openCatModal(null, 'child')" data-marker="编码集-添加子分类按钮-仅在一级分类下新增二级分类">添加子分类</a-button>
        <a-popconfirm title="确认删除该分类？子分类将一并删除" @confirm="deleteCategory" :disabled="!selectedCategoryKey">
          <a-button size="small" :disabled="!selectedCategoryKey" data-marker="编码集-删除分类按钮-删除选中的分类节点">删除</a-button>
        </a-popconfirm>
      </div>
      <a-input-search
        v-model:value="catSearch"
        placeholder="请输入关键字检索"
        size="small"
        style="margin-bottom: 8px"
        data-marker="编码集-分类搜索框-按关键字过滤分类树"
      />
      <div class="cs-tree-wrap">
        <a-tree
          :tree-data="filteredTreeData"
          v-model:selectedKeys="selectedKeys"
          v-model:expandedKeys="expandedKeys"
          :field-names="{ children: 'children', title: 'title', key: 'key' }"
          @select="onCategorySelect"
          data-marker="编码集-分类树-点击分类节点联动右侧编码集列表"
        >
          <template #title="{ key, title }">
            <span class="cs-tree-node">
              <span>{{ title }}</span>
              <span v-if="selectedKeys.includes(key)" class="cs-tree-actions" @click.stop>
                <span class="cs-tree-act" title="编辑" @click="openCatModal(findCategory(categoryTree, key), 'edit')" data-marker="编码集-分类编辑-修改分类名称">✎</span>
                <span v-if="getNodeLevel(categoryTree, key) === 1" class="cs-tree-act" title="添加子分类" @click="openCatModal(key, 'child')" data-marker="编码集-分类添加子分类-仅一级节点可添加二级分类">⊕</span>
              </span>
            </span>
          </template>
        </a-tree>
      </div>
      <div class="cs-left-note">
        【备注】分类树只支持二级维护；编码集只能挂载到末级分类，父级分类不可直接挂载编码集。
      </div>
    </div>

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
          <template v-else-if="column.key === 'dataType'">
            <a-tag :color="dataTypeTagMap[record.dataType] || 'default'">{{ dataTypeTextMap[record.dataType] || '—' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'categoryName'">
            {{ getCategoryName(record.categoryId) }}
          </template>
          <template v-else-if="column.key === 'valueCount'">
            <a-tag color="blue">{{ (record.values || []).length }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="onSetClick(record)" :data-marker="'编码集-查看编码值-' + record.name">查看</a-button>
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
      :title="`「${selectedSetName}」编码值明细`"
      width="560"
      placement="right"
      data-marker="编码集-编码值弹窗-展示选中编码集的键值列表"
    >
      <div style="margin-bottom: 12px">
        <a-button type="primary" size="small" @click="openValueModal(null)" data-marker="编码集-新增编码值按钮-向当前编码集添加一个键值">+ 新增编码值</a-button>
      </div>
      <a-table
        :columns="valueColumns"
        :data-source="selectedValues"
        row-key="id"
        size="small"
        bordered
        :pagination="false"
        data-marker="编码集-编码值列表-展示当前编码集的键值对"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openValueModal(record)" :data-marker="'编码值-编辑-' + record.key">编辑</a-button>
            <a-popconfirm title="确认删除该编码值？" @confirm="deleteCodeValue(record.id)">
              <a-button type="link" size="small" danger :data-marker="'编码值-删除-' + record.key">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
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
        <a-form-item label="唯一编码" required>
          <a-input v-model:value="setForm.code" placeholder="请输入唯一编码，如 AD_PLATFORM" data-marker="编码集-唯一编码输入框-全局唯一标识" />
        </a-form-item>
        <a-form-item label="编码集名称" required>
          <a-input v-model:value="setForm.name" placeholder="请输入编码集名称" data-marker="编码集-名称输入框-必填" />
        </a-form-item>
        <a-form-item label="所属分类" required>
          <a-tree-select
            v-model:value="setForm.categoryId"
            :tree-data="leafCategoryOptions"
            :field-names="{ children: 'children', title: 'title', value: 'key' }"
            placeholder="请选择末级分类"
            allow-clear
            tree-default-expand-all
            data-marker="编码集-所属分类选择-只能挂载到末级分类"
          />
        </a-form-item>
        <a-form-item label="数据类型" required>
          <a-select v-model:value="setForm.dataType" placeholder="请选择数据类型" :options="dataTypeOptions" data-marker="编码集-数据类型选择-集内统一类型必填" />
        </a-form-item>
        <a-form-item label="描述" required>
          <a-textarea v-model:value="setForm.description" placeholder="请输入描述" :rows="3" data-marker="编码集-描述输入框-必填" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编码值 Modal -->
    <a-modal
      v-model:open="valueModalVisible"
      :title="editingValue ? '编辑编码值' : '新增编码值'"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleValueSave"
    >
      <a-form :model="valueForm" layout="vertical">
        <a-form-item label="键 (key)" required>
          <a-input v-model:value="valueForm.key" placeholder="请输入键，如 admob" data-marker="编码值-键输入框-必填" />
        </a-form-item>
        <a-form-item label="值 (value)" required>
          <a-input v-model:value="valueForm.value" placeholder="请输入值，如 1" data-marker="编码值-值输入框-必填" />
        </a-form-item>
        <a-form-item label="业务说明" required>
          <a-input v-model:value="valueForm.desc" placeholder="请输入业务说明" data-marker="编码值-业务说明输入框-必填" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 交互说明 -->
    <details class="anno-details">
      <summary>📌 交互说明</summary>
      <ul>
        <li>编码集-添加分类/添加子分类/删除-分类树CRUD</li>
        <li>编码集-分类搜索框-按关键字过滤分类树</li>
        <li>编码集-分类树-点击节点联动右侧列表</li>
        <li>编码集-分类编辑/添加子分类-节点内联操作</li>
        <li>编码集-名称筛选/唯一编码筛选-右侧列表过滤</li>
        <li>编码集-新建按钮-创建新编码集</li>
        <li>编码集-列表表格-展示编码集，点击名称查看编码值</li>
        <li>编码集-查看/编辑/删除-行内操作</li>
        <li>编码集-编码值弹窗-Drawer展示键值对明细</li>
        <li>编码集-所属分类选择-只能挂载到末级分类</li>
      </ul>
    </details>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { codeSets, codeSetCategories } from './mock.js'

/* ====== 分类树 ====== */
const categoryTree = ref(JSON.parse(JSON.stringify(codeSetCategories)))
const selectedKeys = ref([])
const expandedKeys = ref(['cat_iaa', 'cat_iap'])
const selectedCategoryKey = ref('')
const catSearch = ref('')

/* 递归搜索过滤 */
function filterTree(nodes, keyword) {
  if (!keyword) return nodes
  const result = []
  for (const node of nodes) {
    const children = node.children ? filterTree(node.children, keyword) : []
    if (node.title.includes(keyword) || children.length) {
      result.push({ ...node, children: children.length ? children : undefined })
    }
  }
  return result
}
const filteredTreeData = computed(() => filterTree(categoryTree.value, catSearch.value))

/* 递归查找分类 */
function findCategory(nodes, key) {
  for (const node of nodes) {
    if (node.key === key) return node
    if (node.children) {
      const found = findCategory(node.children, key)
      if (found) return found
    }
  }
  return null
}
function getCategoryName(key) {
  const node = findCategory(categoryTree.value, key)
  return node ? node.title : '—'
}

/* 递归收集所有 key（用于展开） */
function collectKeys(nodes) {
  const keys = []
  for (const node of nodes) {
    keys.push(node.key)
    if (node.children) keys.push(...collectKeys(node.children))
  }
  return keys
}

/* 递归判断是否为叶子节点 */
function isLeaf(nodes, key) {
  const node = findCategory(nodes, key)
  return node && (!node.children || node.children.length === 0)
}

/* 递归获取节点层级（1=一级，2=二级） */
function getNodeLevel(nodes, key, level = 1) {
  for (const node of nodes) {
    if (node.key === key) return level
    if (node.children) {
      const found = getNodeLevel(node.children, key, level + 1)
      if (found) return found
    }
  }
  return 0
}

/* 获取末级分类选项（只有叶子节点可选） */
function getLeafOptions(nodes) {
  const result = []
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      result.push({ key: node.key, title: node.title })
    } else {
      result.push({ key: node.key, title: node.title, children: getLeafOptions(node.children) })
    }
  }
  return result
}
const leafCategoryOptions = computed(() => getLeafOptions(categoryTree.value))

/* 上级分类只能选一级分类（保证最多二级） */
const parentTreeOptions = computed(() =>
  categoryTree.value.map(node => ({ key: node.key, title: node.title }))
)

/* 当前选中节点是否为一级（可添加子分类） */
const canAddChild = computed(() => {
  if (!selectedCategoryKey.value) return false
  return getNodeLevel(categoryTree.value, selectedCategoryKey.value) === 1
})

/* 分类选择 */
function onCategorySelect(keys, { node }) {
  selectedCategoryKey.value = keys.length ? keys[0] : ''
}

/* 分类 Modal */
const catModalVisible = ref(false)
const catModalTitle = ref('')
const catForm = reactive({ key: '', title: '', parentKey: null })

function openCatModal(target, mode) {
  catForm.title = ''
  catForm.parentKey = null
  catForm.key = ''
  if (mode === 'top') {
    catModalTitle.value = '添加分类'
  } else if (mode === 'child') {
    catModalTitle.value = '添加子分类'
    catForm.parentKey = typeof target === 'string' ? target : (selectedCategoryKey.value || null)
  } else if (mode === 'edit') {
    catModalTitle.value = '编辑分类'
    if (target) {
      catForm.key = target.key
      catForm.title = target.title
    }
  }
  catModalVisible.value = true
}

function handleCatSave() {
  if (!catForm.title.trim()) {
    message.warning('请输入分类名称')
    return
  }
  if (catForm.key) {
    /* 编辑 */
    const node = findCategory(categoryTree.value, catForm.key)
    if (node) node.title = catForm.title.trim()
    message.success('分类已更新')
  } else if (catForm.parentKey) {
    /* 添加子分类（仅允许挂在一级分类下，保证最多二级） */
    const parentLevel = getNodeLevel(categoryTree.value, catForm.parentKey)
    if (parentLevel !== 1) {
      message.warning('只支持二级分类维护，无法在二级分类下继续添加')
      return
    }
    const parent = findCategory(categoryTree.value, catForm.parentKey)
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push({ key: 'cat_' + Date.now(), title: catForm.title.trim() })
      expandedKeys.value = [...expandedKeys.value, catForm.parentKey]
    }
    message.success('子分类已添加')
  } else {
    /* 添加一级分类 */
    categoryTree.value.push({ key: 'cat_' + Date.now(), title: catForm.title.trim() })
    message.success('分类已添加')
  }
  catModalVisible.value = false
}

function deleteCategory() {
  if (!selectedCategoryKey.value) return
  function removeFromList(nodes, key) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].key === key) {
        nodes.splice(i, 1)
        return true
      }
      if (nodes[i].children && removeFromList(nodes[i].children, key)) return true
    }
    return false
  }
  removeFromList(categoryTree.value, selectedCategoryKey.value)
  selectedKeys.value = []
  selectedCategoryKey.value = ''
  message.success('分类已删除')
}

/* ====== 编码集列表 ====== */
const codeSetList = ref(JSON.parse(JSON.stringify(codeSets)))
const filterName = ref('')
const filterCode = ref('')
const filterSource = ref(undefined)

const filteredSets = computed(() => {
  let list = codeSetList.value
  /* 分类过滤：选中分类时，过滤属于该分类（含子分类）的编码集 */
  if (selectedCategoryKey.value) {
    const childKeys = collectChildKeys(categoryTree.value, selectedCategoryKey.value)
    childKeys.push(selectedCategoryKey.value)
    list = list.filter(s => childKeys.includes(s.categoryId))
  }
  if (filterCode.value.trim()) {
    const kw = filterCode.value.trim().toLowerCase()
    list = list.filter(s => (s.code || '').toLowerCase().includes(kw))
  }
  if (filterName.value.trim()) {
    const kw = filterName.value.trim().toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(kw))
  }
  return list
})

/* 递归收集某节点下所有子节点 key */
function collectChildKeys(nodes, parentKey) {
  const keys = []
  const node = findCategory(nodes, parentKey)
  if (node && node.children) {
    for (const child of node.children) {
      keys.push(child.key)
      keys.push(...collectChildKeys(nodes, child.key))
    }
  }
  return keys
}

/* 编码集列 */
const setColumns = [
  { title: '编号', key: 'index', width: 60, customHeaderCell: () => ({ title: '序号' }) },
  { title: '唯一编码', dataIndex: 'code', key: 'code', width: 160, customHeaderCell: () => ({ title: '编码集全局唯一标识，大写下划线' }) },
  { title: '编码集名称', key: 'name', width: 160, customHeaderCell: () => ({ title: '编码集的业务名称' }) },
  { title: '数据类型', key: 'dataType', width: 100, customHeaderCell: () => ({ title: '该编码集下所有编码值的统一数据类型' }) },
  { title: '编码分类', key: 'categoryName', width: 140, customHeaderCell: () => ({ title: '所属分类，从分类树中选择' }) },
  { title: '编码数量', key: 'valueCount', width: 100, customHeaderCell: () => ({ title: '该编码集下当前键值数量' }) },
  { title: '创建者', dataIndex: 'creator', key: 'creator', width: 100, customHeaderCell: () => ({ title: '创建人' }) },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, customHeaderCell: () => ({ title: '创建时间' }) },
  { title: '操作', key: 'action', width: 160, fixed: 'right', customHeaderCell: () => ({ title: '查看/编辑/删除' }) }
]

/* 编码集 Modal */
const setModalVisible = ref(false)
const editingSet = ref(null)
const setForm = reactive({ code: '', name: '', categoryId: undefined, dataType: undefined, description: '' })

function openSetModal(set) {
  editingSet.value = set
  setForm.code = set ? (set.code || '') : ''
  setForm.name = set ? set.name : ''
  setForm.categoryId = set ? set.categoryId : (selectedCategoryKey.value || undefined)
  setForm.dataType = set ? (set.dataType || undefined) : undefined
  setForm.description = set ? (set.description || '') : ''
  setModalVisible.value = true
}

function handleSetSave() {
  if (!setForm.code.trim()) { message.warning('请输入唯一编码'); return }
  if (!setForm.name.trim()) { message.warning('请输入编码集名称'); return }
  if (!setForm.categoryId) { message.warning('请选择所属分类'); return }
  if (!setForm.dataType) { message.warning('请选择数据类型'); return }
  if (!setForm.description.trim()) { message.warning('请输入描述'); return }
  if (editingSet.value) {
    const s = codeSetList.value.find(x => x.id === editingSet.value.id)
    if (s) { s.code = setForm.code.trim(); s.name = setForm.name.trim(); s.categoryId = setForm.categoryId; s.dataType = setForm.dataType; s.description = setForm.description }
    message.success('编码集已更新')
  } else {
    codeSetList.value.push({
      id: 'cs_' + Date.now(),
      code: setForm.code.trim(),
      name: setForm.name.trim(),
      categoryId: setForm.categoryId,
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

/* 编码值 Drawer */
const valueDrawerVisible = ref(false)
const selectedSetId = ref('')
const selectedSetName = computed(() => {
  const s = codeSetList.value.find(x => x.id === selectedSetId.value)
  return s ? s.name : ''
})
const selectedValues = computed(() => {
  const s = codeSetList.value.find(x => x.id === selectedSetId.value)
  return s ? (s.values || []) : []
})

function onSetClick(record) {
  selectedSetId.value = record.id
  valueDrawerVisible.value = true
}

/* 编码值 Modal */
const valueModalVisible = ref(false)
const editingValue = ref(null)
const valueForm = reactive({ key: '', value: '', desc: '' })

const dataTypeOptions = [
  { value: 'int', label: '整型' },
  { value: 'float', label: '浮动型' },
  { value: 'string', label: '字符串' },
  { value: 'datetime', label: '时间' }
]

function openValueModal(val) {
  editingValue.value = val
  valueForm.key = val ? val.key : ''
  valueForm.value = val ? val.value : ''
  valueForm.desc = val ? (val.desc || '') : ''
  valueModalVisible.value = true
}

function handleValueSave() {
  if (!valueForm.key.trim()) { message.warning('请输入键'); return }
  if (!valueForm.value.trim()) { message.warning('请输入值'); return }
  if (!valueForm.desc.trim()) { message.warning('请输入业务说明'); return }
  const set = codeSetList.value.find(s => s.id === selectedSetId.value)
  if (!set) { message.error('编码集未找到'); return }
  if (!set.values) set.values = []
  if (editingValue.value) {
    const v = set.values.find(x => x.id === editingValue.value.id)
    if (v) { v.key = valueForm.key.trim(); v.value = valueForm.value.trim(); v.desc = valueForm.desc }
    message.success('编码值已更新')
  } else {
    set.values.push({ id: 'cv_' + Date.now(), key: valueForm.key.trim(), value: valueForm.value.trim(), desc: valueForm.desc })
    message.success('编码值已新增')
  }
  valueModalVisible.value = false
}

function deleteCodeValue(id) {
  const set = codeSetList.value.find(s => s.id === selectedSetId.value)
  if (set && set.values) {
    set.values = set.values.filter(v => v.id !== id)
    message.success('编码值已删除')
  }
}

/* 编码值列 */
const dataTypeTagMap = { int: 'cyan', float: 'green', string: 'blue', datetime: 'orange' }
const dataTypeTextMap = { int: '整型', float: '浮动型', string: '字符串', datetime: '时间' }

const valueColumns = [
  { title: '键 (key)', dataIndex: 'key', key: 'key', width: 140, customHeaderCell: () => ({ title: '编码键，集内唯一' }) },
  { title: '值 (value)', dataIndex: 'value', key: 'value', width: 120, customHeaderCell: () => ({ title: '编码值' }) },
  { title: '业务说明', dataIndex: 'desc', key: 'desc', customHeaderCell: () => ({ title: '该键值对应的业务语义' }) },
  { title: '操作', key: 'action', width: 120, fixed: 'right', customHeaderCell: () => ({ title: '编辑/删除' }) }
]
</script>

<style scoped>
.cs-page {
  display: flex;
  height: calc(100vh - 96px);
  gap: 0;
}

/* 左侧分类树 */
.cs-left {
  width: 340px;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cs-left-header {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}
.cs-left-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.cs-tree-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
.cs-tree-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.cs-tree-actions {
  display: inline-flex;
  gap: 4px;
  margin-left: 4px;
}
.cs-tree-act {
  cursor: pointer;
  font-size: 14px;
  color: #1677ff;
  opacity: 0.7;
}
.cs-tree-act:hover {
  opacity: 1;
}
.cs-left-note {
  margin-top: 12px;
  padding: 8px 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
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
