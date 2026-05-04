import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../App.vue'),
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
    component: () => import('../App.vue'),
    meta: { title: 'Local Overview Report' }
  },
  {
    path: '/local-roi-report',
    name: 'LocalRoiReport',
    component: () => import('../App.vue'),
    meta: { title: 'Local ROI Report' }
  },
  {
    path: '/keyword-report',
    name: 'KeywordReport',
    component: () => import('../App.vue'),
    meta: { title: 'Keyword Report' }
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