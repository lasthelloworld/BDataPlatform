# 系统菜单结构


## 侧边栏菜单
【目标二级菜单结构】

- Dashboard (路由 /dashboard)
- Team Report（父菜单，可展开）
  ├── Event Returning Report  (路由 /event-returning-report)
  └── Local Overview Report (路由 /local-overview-report)   
  ├── Local ROI Report (路由 /local-roi-report)
 - IAP Web Report（父菜单，可展开）
  └── Keyword Report (路由 /keyword-report)
 - System Settings（父菜单，可展开）
【技术约束】

- 使用 Ant Design Vue 的 <a-sub-menu> 组件实现二级菜单。
- 父菜单不需要路由，只做展开/折叠。
- 保持现有的激活菜单高亮逻辑（根据当前路由匹配子菜单项）。
- 保持现有的样式和主题色。

请直接修改 Sidebar.vue 文件，并在修改后给出完整代码。
