<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
    <div class="annotation-panel" :class="{ visible: panelVisible }">
      <div class="panel-header">
        <span class="panel-icon">📌</span>
        <span class="panel-title">标注说明</span>
        <span class="panel-close" @click="panelVisible = false" title="关闭">×</span>
      </div>
      <div class="panel-content">
        {{ panelContent }}
      </div>
    </div>
    <AIWorkbench />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Sidebar from './components/Sidebar.vue'
import AIWorkbench from './components/aiworkbench/index.vue'

const panelVisible = ref(false)
const panelContent = ref('点击任意带标注的元素，查看需求详情。')

const handleAnnotationClick = (e) => {
  const target = e.target.closest('[data-marker]')
  if (target) {
    const tagName = target.tagName.toLowerCase()
    const className = target.className.toLowerCase()
    
    if (tagName === 'button' || 
        className.includes('ant-btn') || 
        className.includes('menu-item') || 
        className.includes('nav-item') ||
        target.closest('button') ||
        target.closest('.ant-btn') ||
        target.closest('.menu-item') ||
        target.closest('.nav-item')) {
      return
    }
    
    panelContent.value = target.getAttribute('data-marker')
    panelVisible.value = true
  }
}

onMounted(() => {
  nextTick(() => {
    document.querySelectorAll('[data-marker]').forEach(el => {
      el.addEventListener('click', handleAnnotationClick)
    })
  })
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 24px;
  overflow-y: auto;
}

.annotation-panel {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 320px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
  z-index: 9998;
}

.annotation-panel.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-icon {
  margin-right: 6px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.panel-close {
  margin-left: 8px;
  font-size: 18px;
  line-height: 1;
  color: #999;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.panel-close:hover {
  color: #333;
}

.panel-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-line;
}
</style>