<template>
  <div class="me-tabs-page">
    <a-tabs
      v-model:activeKey="activeTab"
      class="me-tabs"
      data-marker="事件管理-页签切换-元事件管理/事件属性管理/编码集管理 三页签"
      @change="onTabChange"
    >
      <a-tab-pane key="events" tab="元事件管理" />
      <a-tab-pane key="properties" tab="事件属性管理" />
      <a-tab-pane key="code-set" tab="编码集管理" />
    </a-tabs>
    <div class="me-tab-content">
      <KeepAlive>
        <CodeSet v-if="activeTab === 'code-set'" />
        <Properties v-else-if="activeTab === 'properties'" />
        <Events v-else />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CodeSet from './CodeSet.vue'
import Properties from './Properties.vue'
import Events from './Events.vue'

/* 页签与路由参数双向同步，支持深链接直达某个页签 */
const validTabs = ['code-set', 'properties', 'events']
const route = useRoute()
const router = useRouter()

const activeTab = ref(validTabs.includes(route.params.tab) ? route.params.tab : 'events')

watch(() => route.params.tab, (t) => {
  if (validTabs.includes(t) && t !== activeTab.value) activeTab.value = t
})

const onTabChange = (key) => {
  if (route.params.tab !== key) router.replace('/meta-event/' + key)
}
</script>

<style scoped>
.me-tabs-page {
  height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
}
.me-tabs {
  flex-shrink: 0;
}
.me-tab-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
