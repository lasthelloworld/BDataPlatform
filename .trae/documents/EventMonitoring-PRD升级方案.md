# EventMonitoring 监控中心 PRD V0.0.1 升级方案

## Context（背景）

`src/views/EventMonitoring` 模块为事件监控中心，当前实现与新版 PRD（`docs/prd/事件监控/PRD-事件监控-V0.0.1.md`）存在较大差距：

- **RuleModal.vue** 的「规则维度」用单选 App/版本/渠道，而 PRD 要求「产品组→app→app_version→国家→投放渠道」全多选、产品组必选；条件配置用了原生 DOM 拼接的 WHERE 过滤器 + 分离的「计算因子/阈值」，与 PRD「字段选择器(事件/自定义参数/指标) + 操作符(计算/比较/逻辑/聚合) + 阈值」统一条件项模型不符；缺少「监控数据范围时间窗口」。
- **Alerts.vue** 状态有三态(未处理/已忽略/已恢复)且列含「计算值/阈值」，PRD 要求两态(未处理/已处理)，列为「触发执行时间/规则名称/监控维度/规则说明/状态/操作」。
- 静态 demo `event-monitoring.html` 与标注索引 `annotations.html` 需同步。

**已与用户确认的关键决策：**
1. **范围收窄仅限告警状态**：监控频率(实时/5min/每小时/每日)、告警渠道(钉钉/企业微信/邮件/飞书/Webhook)保留现有丰富选项；仅告警状态按 PRD 收窄为「未处理/已处理」两态。
2. **规则描述**为普通文本域框（保持现状），「复选框」字样按文本域实现。
3. **Dashboard.vue / Fields.vue** 维持「暂无」状态（PRD 未定义），不改。路由(`src/router/index.js`)、Sidebar.vue 无需改动。

预期结果：规则配置对齐 PRD 的维度模型与统一条件项构建器；告警历史对齐 PRD 列结构与两态；HTML demo 与标注索引同步。

---

## 实施步骤

### 1. RuleModal.vue — 重写（核心）

将原生 DOM 条件构建器替换为 Vue 响应式模型，重组分区为 PRD 的 6 个部分：

**Section 1 基本信息**（保留微调）
- 规则名称（必填 input）、规则描述（textarea）
- 移除原「所属项目组」单项（下沉到 Section 2 产品组多选）

**Section 2 监控维度**（按 PRD 4.2.1 表，全部多选）
- 产品组：多选 **必选**（组织架构产品组：产品1组/产品2组…）
- app：多选 非必选，级联产品组（选项沿用 Phone Recover1/2/3，依项目记忆）
- app_version：多选 非必选（v1.0.0…）
- 国家：多选 非必选（美国-us…）
- 投放渠道：多选 非必选（FB/Tiktok/google）

**Section 3 监控规则条件配置**（统一条件项构建器，响应式）
合并原「条件过滤器/计算因子/阈值触发」三段为一段。响应式模型：
```
conditions: [{
  id, logicOp: 'AND'|'OR'|'NOT',       // 与上一条件项关联（首项无）
  fields: [{                            // 1~N 个字段选择器，用计算操作符串联
    fieldType: 'event'|'param'|'metric',
    field: '',                          // 事件Event_id / event.param.xxx(级联) / Cost|CDNU
    aggFunc: '', aggTarget: '',         // 聚合操作符控件组(AVG/SUM/Count/Max/Min + 目标值)，可选
    calcOp: '',                         // 计算操作符 +/-/*// 与下一字段串联(末字段空)
  }],
  compareOp: '',                        // 比较操作符(大于…is null/is not null/in/Not In/between/in Range)
  threshold: '',                        // 监控值阈值
}]
```
- 「+ 添加条件」按钮新增条件项；每项内「+ 添加字段」串联字段；移除按钮删除项/字段。
- 自定义参数选择器需先选事件选择器再级联其 param 字段。
- 保留实时预览条（拼接表达式文案）。
- 删除 `initFilterBuilder/addFilterRow/addFilterGroup` 及 `window.__addFilterRow` 等 DOM 逻辑。

**Section 4 监控数据范围时间窗口**（新增，非必选，按 PRD 4.2.3）
- 模式切换：日期间隔 / 日期区间
  - 日期间隔：近7日 / 近X天（X 数字输入）
  - 日期区间：开始日期 + 结束日期（DatePicker.RangePicker）

**Section 5 监控频率**（必填，保留丰富选项）
- 实时 / 每5分钟 / 每小时 / 每日 T+1（保留现有 windowOptionsMap 联动逻辑）

**Section 6 监控告警**（非必填，保留丰富渠道）
- 通知渠道复选框：钉钉/企业微信/邮件/飞书/Webhook（保留）；接收人、静默期、告警收敛（保留）

`form` reactive 增字段：`productGroups[]、apps[]、appVersions[]、countries[]、channels[](维度)、dataWindowMode、dataWindowValue、dataWindowRange[]、conditions[]`；`handleSave` 校验规则名称与产品组必填。

### 2. Rules.vue — 列与数据对齐
- 列调整为：规则名称 / 监控维度(替代「项目组」，展示产品组+app 摘要) / 执行频率 / 最近触发 / 启用状态(toggle) / 操作
- 保留「计算因子/触发条件」可作「规则说明」查看入口或合并展示；保留 toggle/编辑/复制/删除
- mock 数据：`project/projectKey` → `productGroups/apps` 等维度字段，`freq/freqKey` 保留

### 3. Alerts.vue — 对齐 PRD 4.2.2
- 顶部统计：总告警数(红) / 未处理数(橙) / 已处理数(绿) — 当日；新增「每半小时自动刷新」提示与 `setInterval(30min)` mock 刷新
- 筛选状态选项：未处理 / 已处理（移除「已忽略/已恢复」）
- 表格列：触发执行时间 / 规则名称 / 监控维度 / 规则说明(查看按钮→弹窗规则明细) / 状态 / 操作(标记处理/查看详情)
  - 移除「计算值/阈值」列与「忽略」操作
- 侧滑抽屉(告警日志明细)：命中规则及规则快照 / 触发窗口期范围+数据条数 / 命中数据明细表格 + 导出；操作：标记处理 / 导出明细
- `statusColorMap`/`statusLabel` 收敛为 `pending→未处理(red) / resolved→已处理(green)`

### 4. 同步静态 demo 与标注索引
- `src/html_demo/event-monitoring.html`：镜像上述 1~3 的结构变更（监控维度全多选、统一条件项构建器、时间窗口段、告警历史两态与新列、抽屉明细+导出），更新对应 `data-marker`
- `src/html_demo/annotations.html`（L81-L106 事件监控区）：更新标注条目以反映新增/变更标记（监控维度选择器、条件项构建器、时间窗口、规则说明查看按钮等），并修正顶部计数文案

---

## 关键文件
- `src/views/EventMonitoring/RuleModal.vue`（重写）
- `src/views/EventMonitoring/Rules.vue`（改）
- `src/views/EventMonitoring/Alerts.vue`（改）
- `src/html_demo/event-monitoring.html`（同步）
- `src/html_demo/annotations.html`（同步索引）
- 不动：`index.vue`、`Dashboard.vue`、`Fields.vue`、`router/index.js`、`Sidebar.vue`

## 复用项
- 复用 RuleModal 现有 `windowOptionsMap/onFreqChange` 频率-窗口联动
- 复用 Alerts 现有 Drawer 结构与 `sample-table` 样式
- 复用 ant-design-vue 的 Select(multiple)/Checkbox/DatePicker.RangePicker 组件

## 验证方式
1. `npm run dev` 启动，进入「Event Monitoring → 规则管理」
2. 新建规则：校验产品组必选、各维度多选、条件项增删/字段串联/逻辑操作符、时间窗口双模式、频率与告警渠道保留
3. 进入「告警历史」：统计三色卡、状态两态筛选、列结构含规则说明查看按钮、侧滑明细含命中表格与导出
4. `annotations.html` 浏览器打开，核对事件监控标注条目与实际一致
5. 用 integrated_browser 截图规则管理/告警历史/新建规则弹窗验证视觉
