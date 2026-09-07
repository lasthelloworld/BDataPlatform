import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard/index.vue'),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/localAdPerformance',
    name: 'LocalAdPerformance',
    component: () => import('../views/adreport/LocalAdPerformance.vue'),
    meta: { title: 'Local Ad Performance' }
  },
  {
    path: '/event-returning-report',
    name: 'EventReturningReport',
    component: () => import('../App.vue'),
    meta: { title: 'Event Returning Report' }
  },
  {
    path: '/local-overview-report',
    name: 'LocalOverviewReport',
    component: () => import('../views/Local_overview_Report/index.vue'),
    meta: { title: 'Local Overview Report' }
  },
  {
    path: '/ai-analyses-task',
    name: 'AIAnalysesTask',
    component: () => import('../views/AIAnalysesTask/index.vue'),
    meta: { title: 'AI Analyses Task' }
  },
  {
    path: '/AI-Chat',
    name: 'AIChat',
    component: () => import('../views/AIAnalysesTask/AI-Chat.vue'),
    meta: { title: 'AI-Chat' }
  },
  {
    path: '/ai-analyses-task/:id',
    name: 'AITaskDetail',
    component: () => import('../views/AITaskDetail/index.vue'),
    meta: { title: 'AI Task Detail' }
  },
  {
    path: '/keyword-report',
    name: 'KeywordReport',
    component: () => import('../App.vue'),
    meta: { title: 'Keyword Report' }
  },
  {
    path: '/user-segmentation-insights',
    name: 'UserSegmentationInsights',
    component: () => import('../views/UserSegmentationInsights/index.vue'),
    meta: { title: 'User Segmentation Insights' }
  },
  {
    path: '/event-monitoring',
    name: 'EventMonitoring',
    component: () => import('../views/EventMonitoring/index.vue'),
    redirect: '/event-monitoring/dashboard',
    meta: { title: 'Event Monitoring' },
    children: [
      {
        path: 'dashboard',
        name: 'EventMonitoringDashboard',
        component: () => import('../views/EventMonitoring/Dashboard.vue'),
        meta: { title: '监控概览' }
      },
      {
        path: 'rules',
        name: 'EventMonitoringRules',
        component: () => import('../views/EventMonitoring/Rules.vue'),
        meta: { title: '规则管理' }
      },
      {
        path: 'alerts',
        name: 'EventMonitoringAlerts',
        component: () => import('../views/EventMonitoring/Alerts.vue'),
        meta: { title: '告警历史' }
      },
      {
        path: 'fields',
        name: 'EventMonitoringFields',
        component: () => import('../views/EventMonitoring/Fields.vue'),
        meta: { title: '字段管理' }
      }
    ]
  },
  {
    path: '/system-settings',
    name: 'SystemSettings',
    component: () => import('../App.vue'),
    meta: { title: 'System Settings' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router