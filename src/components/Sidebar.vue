<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-icon">📊</span>
      <span class="logo-text">Hopemobi Mind</span>
    </div>
    <a-menu
      mode="inline"
      :open-keys="openKeys"
      :selected-keys="[activeMenu]"
      :default-open-keys="['team-report', 'ai-analyses', 'event-monitoring']"
      @open-change="handleOpenChange"
      @select="handleSelect"
      class="menu"
    >
      <a-menu-item
        key="dashboard"
        data-marker="侧边栏菜单-Dashboard"
      >
        <span class="menu-icon">📈</span>
        <span>Dashboard</span>
      </a-menu-item>

      <a-sub-menu key="team-report" data-marker="侧边栏菜单-Team Report">
        <template #title>
          <span class="menu-icon">📊</span>
          <span>Team Report</span>
        </template>
        <a-menu-item
          key="event-returning-report"
          data-marker="侧边栏菜单-Event Returning Report"
        >
          <span>Event Returning Report</span>
        </a-menu-item>
        <a-menu-item
          key="local-overview-report"
          data-marker="侧边栏菜单-Local Overview Report"
        >
          <span>Local Overview Report</span>
        </a-menu-item>
        <a-menu-item
          key="local-roi-report"
          data-marker="侧边栏菜单-Local ROI Report"
        >
          <span>Local ROI Report</span>
        </a-menu-item>
        <a-menu-item
          key="localAdPerformance"
          data-marker="侧边栏菜单-Local Ad Performance"
        >
          <span>Local Ad Performance</span>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="ai-analyses" data-marker="侧边栏菜单-AI Analyses">
        <template #title>
          <span class="menu-icon">🤖</span>
          <span>AI analyses</span>
        </template>
        <a-menu-item
          key="ai-analyses-task"
          data-marker="侧边栏菜单-AI Analyses Task"
        >
          <span>AI analyses Task</span>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="iap-web-report" data-marker="侧边栏菜单-IAP Web Report">
        <template #title>
          <span class="menu-icon">🔍</span>
          <span>IAP Web Report</span>
        </template>
        <a-menu-item
          key="keyword-report"
          data-marker="侧边栏菜单-Keyword Report"
        >
          <span>Keyword Report</span>
        </a-menu-item>
        <a-menu-item
          key="user-segmentation-insights"
          data-marker="侧边栏菜单-User Segmentation Insights"
        >
          <span>User Segmentation Insights | 用户分层洞察</span>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="event-monitoring" data-marker="侧边栏菜单-Event Monitoring">
        <template #title>
          <span class="menu-icon">⚡</span>
          <span>Event Monitoring</span>
        </template>
        <a-menu-item
          key="event-monitoring/dashboard"
          data-marker="侧边栏菜单-Event Monitoring Dashboard"
        >
          <span>监控概览-暂无</span>
        </a-menu-item>
        <a-menu-item
          key="event-monitoring/rules"
          data-marker="侧边栏菜单-Event Monitoring Rules"
        >
          <span>规则管理</span>
        </a-menu-item>
        <a-menu-item
          key="event-monitoring/alerts"
          data-marker="侧边栏菜单-Event Monitoring Alerts"
        >
          <span>告警历史</span>
        </a-menu-item>
        <a-menu-item
          key="event-monitoring/fields"
          data-marker="侧边栏菜单-Event Monitoring Fields"
        >
          <span>字段管理-暂无</span>
        </a-menu-item>
      </a-sub-menu>

      <a-menu-item
        key="system-settings"
        data-marker="侧边栏菜单-System Settings"
      >
        <span class="menu-icon">⚙️</span>
        <span>System Settings</span>
      </a-menu-item>
    </a-menu>
    <div class="user-info">
      <div class="avatar">👤</div>
      <div class="user-detail">
        <div class="user-name">运营总监</div>
        <div class="user-role">管理员</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('dashboard')
const openKeys = ref(['team-report'])

watch(() => route.path, (path) => {
  const menuKey = path.replace('/', '')
  activeMenu.value = menuKey || 'dashboard'
}, { immediate: true })

const handleSelect = ({ key }) => {
  activeMenu.value = key
  router.push('/' + key)
}

const handleOpenChange = (keys) => {
  openKeys.value = keys
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #1f3349;
}

.logo-icon {
  font-size: 24px;
  margin-right: 12px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
}

.menu {
  flex: 1;
  border: none;
}

.menu-icon {
  margin-right: 8px;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #1f3349;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>