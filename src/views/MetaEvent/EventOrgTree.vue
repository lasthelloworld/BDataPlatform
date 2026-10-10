<template>
  <div class="eot-panel">
    <div class="eot-header">事件组织结构</div>
    <a-input-search
      v-model:value="search"
      placeholder="搜索节点"
      size="small"
      style="margin-bottom: 8px"
      allow-clear
      data-marker="事件组织树-节点搜索-按名称模糊匹配产品组/品类"
    />
    <div class="eot-tree-wrap">
      <a-tree
        v-model:selectedKeys="selectedKeys"
        v-model:expandedKeys="expandedKeys"
        :tree-data="filteredTree"
        @select="onSelect"
        data-marker="事件组织结构树-产品组→产品品类 两级结构，点击节点联动右侧列表"
      >
        <template #title="nodeData">
          <span class="eot-node">
            <span class="eot-icon">{{ iconMap[nodeData.type] || '📄' }}</span>
            <span>{{ nodeData.title }}</span>
          </span>
        </template>
      </a-tree>
    </div>
    <div class="eot-note">【备注】数据归属到「产品组-产品品类」，点击节点联动右侧列表；再次点击已选节点取消筛选。</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { orgTreeData } from './mock.js'

const emit = defineEmits(['select'])

const iconMap = { group: '🏢', category: '📂' }

/* 仅保留 产品组→产品品类 两级结构 */
const treeData = ref(
  JSON.parse(JSON.stringify(orgTreeData)).map(g => ({
    key: g.key,
    title: g.title,
    type: 'group',
    children: (g.children || []).map(c => ({ key: c.key, title: c.title, type: 'category' }))
  }))
)

const search = ref('')
const selectedKeys = ref([])
const expandedKeys = ref(treeData.value.map(g => g.key))

const filteredTree = computed(() => {
  const kw = search.value.trim()
  if (!kw) return treeData.value
  const filter = (nodes) => {
    const result = []
    nodes.forEach(n => {
      const children = n.children ? filter(n.children) : []
      if (n.title.includes(kw) || children.length > 0) result.push({ ...n, children })
    })
    return result
  }
  return filter(treeData.value)
})

function onSelect(keys) {
  if (!keys.length) {
    /* 再次点击已选中节点 → 取消筛选 */
    selectedKeys.value = []
    emit('select', null)
    return
  }
  const key = keys[0]
  for (const g of treeData.value) {
    if (g.key === key) {
      emit('select', { type: 'group', key })
      return
    }
    const c = (g.children || []).find(x => x.key === key)
    if (c) {
      emit('select', { type: 'category', key, groupKey: g.key })
      return
    }
  }
}
</script>

<style scoped>
.eot-panel {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.eot-header {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}
.eot-tree-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
.eot-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.eot-icon {
  font-size: 13px;
}
.eot-note {
  margin-top: 12px;
  padding: 8px 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
}
</style>
