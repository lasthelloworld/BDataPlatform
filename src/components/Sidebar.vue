<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-icon">📊</span>
      <span class="logo-text">销售数据分析平台</span>
    </div>
    <nav class="menu">
      <a 
        v-for="item in menuItems" 
        :key="item.key"
        :class="['menu-item', { active: activeMenu === item.key }]"
        @click="activeMenu = item.key"
        data-marker="侧边栏导航菜单"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span class="menu-text">{{ item.label }}</span>
      </a>
    </nav>
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
import { ref } from 'vue'

const activeMenu = ref('dashboard')

const menuItems = [
  { key: 'dashboard', label: '数据看板', icon: '📈' },
  { key: 'orders', label: '订单管理', icon: '📋' },
  { key: 'regions', label: '区域分析', icon: '🌍' },
  { key: 'reports', label: '报表中心', icon: '📊' },
  { key: 'settings', label: '系统设置', icon: '⚙️' }
]
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
  padding: 16px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.3s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menu-item.active {
  background: #1677ff;
}

.menu-icon {
  font-size: 16px;
  margin-right: 12px;
}

.menu-text {
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