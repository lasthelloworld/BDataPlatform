# 项目名称：Hopemobi Mind

## 技术栈

- 前端框架：Vue 3 + Composition API
- 构建工具：Vite
- UI 组件库：Ant Design Vue 4.x 或 Element Plus 2.x（二选一，推荐 Ant Design Vue）
- 图表库：ECharts
- 状态管理：Pinia
- HTTP 请求：Axios

## 设计规范

- 主题色：#1677ff（品牌蓝）
- 圆角：卡片 8px，按钮 6px
- 字体：标题 16px/20px，正文 14px/20px
- 间距：页面边距 24px，组件间距 16px

## 页面布局约定

- 左右结构：左侧菜单宽 240px，右侧内容区
- 顶部全局筛选栏（区域/日期范围），联动所有图表
- 表格默认每页 20 条，支持 10/20/50/100 切换

## 代码生成约束

- 使用 Vue 3 `<script setup>` 语法
- 样式使用 `<style scoped>` 或 CSS Modules
- API 请求统一封装在 `src/services/` 目录
- 图表组件必须支持响应式 resize
- 组件命名采用 PascalCase，文件名采用 kebab-case

