## 系统菜单结构

## 侧边栏菜单

【目标二级菜单结构】

- Dashboard (路由 /dashboard)
- Team Report（父菜单，可展开）
  ├── Event Returning Report  (路由 /event-returning-report)
  └── Local Overview Report (路由 /local-overview-report)\
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

<br />

<br />

## 通用表格操作按钮

### 列设置按钮

列设置，点击弹出【列设置】模态窗，【列设置】模态框标题为“列设置”；

左侧是待选择指标名称列表，列表上方为搜索输入框，支持按指标名称检索，根据PRD文档默认不显示字段列出。

右侧是已选择指标名称列表，列表上方为搜索输入框，支持按指标名称检索，根据PRD文档默认显示字段列出。

交互：用户可通过穿梭按钮，左移右移，控制报表指标显示与隐藏。
