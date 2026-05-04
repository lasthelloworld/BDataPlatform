# 数据分析看板 - 原型交互规范（Vue 3 架构版）

> 📌 规范说明：本规范基于 PRD v1.0 提炼，严格遵循 Vue 3 `<script setup>` Composition API 范式，采用响应式状态驱动 UI 更新，全局筛选状态通过 `provide/inject` 或 Pinia 共享，组件内部逻辑通过自定义 Composables 抽离。

***

## 🧩 FilterBar.vue（顶部全局筛选器）

### 布局描述

- **结构**：顶部通栏 Flex 布局，左侧为看板标题，右侧为筛选控件区。
- **控件**：`日期范围选择器`（默认近30天）、`区域级联选择器`（省/市二级）、`重置按钮`。
- **响应式**：1920px 下控件右对齐；1366px 下自动换行至标题下方，保持间距统一。

### 交互行为定义

- **联动触发**：任一筛选条件变更（`@change`）即时触发全局事件 `emit('filterSync', { startDate, endDate, region })`，驱动下方所有组件刷新。
- **区域权限拦截**：基于 RBAC 动态渲染级联选项，无权限节点置灰/隐藏；选中越权区域时自动回退至最近有效父级。
- **防抖重置**：重置按钮点击后清空自定义日期，恢复默认近30天，并触发一次全量刷新。

### 数据加载状态

- **Loading**：区域树首次加载显示骨架屏/Spin，其余状态无阻塞。
- **Empty**：无可用区域权限时，级联器展示占位文本 `暂无可访问区域` 并禁用。
- **Error**：权限接口失败时，顶部 Toast 提示 `区域权限同步失败，请刷新重试`，并提供重试按钮。

### 🛠 Vue 3 Composition API 约定

```vue
<script setup lang="ts">
import { reactive, watch, provide } from 'vue'
import { useRegionTree } from '@/composables/useRegionTree'
import { usePermissionStore } from '@/store'

const filterState = reactive({
  dateRange: [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
  regionPath: []
})
const { regionOptions, loading: treeLoading } = useRegionTree()
const permStore = usePermissionStore()

// 权限过滤级联数据
const filteredOptions = computed(() => permStore.filterRegionTree(regionOptions.value))

// 提供全局筛选状态供子组件 inject
provide('dashboardFilter', filterState)

// 监听变化并广播（实际可替换为 Pinia action）
watch(() => [filterState.dateRange, filterState.regionPath], () => {
  // 触发全局数据刷新逻辑
}, { deep: true })
</script>
```

***

## 📊 MetricCards.vue（核心指标卡片组）

### 布局描述

- **结构**：4列等宽 Grid 布局（`grid-template-columns: repeat(4, 1fr)`），1366px 下自适应为 2×2。
- **单卡元素**：指标名称、主数值（大字重）、同比标识（↑/↓ + 色块）、计算口径 Tooltip 图标。

### 交互行为定义

- **悬停提示**：鼠标悬停指标名右侧 `?` 图标，显示 Tooltip 说明计算逻辑与数据更新时间（T+1 02:00）。
- **视觉联动**：同比值为正显示 `↑`（绿色 `#52C41A`），为负显示 `↓`（红色 `#FF4D4F`），0 显示灰色横线。
- **单位规范**：金额类强制后缀 `万元`，客单价保留2位小数，同比保留1位小数。

### 数据加载状态

- **Loading**：使用数值型骨架屏（`Skeleton.Text`），避免页面抖动。
- **Empty**：接口返回空数据时，主数值显示 `--`，同比隐藏。
- **Error**：卡片右下角浮现 `加载失败` 小标签，点击触发局部重试（不阻塞其他卡片）。

### 🛠 Vue 3 Composition API 约定

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useMetrics } from '@/composables/useMetrics'
import type { MetricItem } from '@/types'

const props = defineProps<{ data: MetricItem[] }>()

// 格式化计算逻辑抽离
const formatMetric = (val: number, type: 'amount' | 'rate' | 'count') => {
  if (type === 'amount') return `${val.toFixed(type === 'amount' && props.data[0]?.code === 'avg' ? 2 : 0)} `
  if (type === 'rate') return { value: val.toFixed(1) + '%', trend: val > 0 ? 'up' : 'down' }
  return val.toLocaleString()
}

// 响应式映射
const displayData = computed(() => props.data.map(d => ({ ...d, ...formatMetric(d.value, d.type) })))
</script>
```

***

## 📈 SalesCharts.vue（可视化图表联动区）

### 布局描述

- **结构**：左右分栏（7:3 比例）。左侧 `LineChart`（月度趋势），右侧 `PieChart`（区域占比）。
- **导航**：右侧图表顶部悬浮面包屑导航（如 `全国 > 华东大区 > 江苏省`），支持点击返回上级。

### 交互行为定义

- **折线图交互**：
  - `Hover`：Tooltip 显示 `YYYY-MM` 及精确销售额（万元）。
  - `Click`：选中某月份，向右侧饼图派发事件 `monthSelected`，饼图数据切换为该月区域分布。
  - `Zoom`：支持鼠标滚轮缩放 X 轴，拖拽平移。
- **饼图交互**：
  - `Click`：点击扇区触发下钻，面包屑追加当前节点，图表刷新为下级城市分布。
  - `Hover`：显示区域名称、销售额（万元）及占比（保留1位小数）。
- **联动约束**：折线图点击后，饼图标题动态更新为 `[选中月份] 区域销售占比`；面包屑点击 `全国` 重置为全量数据。

### 数据加载状态

- **Loading**：图表容器显示居中 Spin，背景置灰。
- **Empty**：数据为空时展示自定义插画 `暂无趋势/占比数据`，隐藏坐标轴。
- **Error**：覆盖层提示 `图表渲染失败`，提供 `切换图表类型` 或 `重试` 快捷操作。

### 🛠 Vue 3 Composition API 约定

```vue
<script setup lang="ts">
import { ref, watch, onUnmounted, inject } from 'vue'
import { useECharts } from '@/composables/useECharts'
import type { EChartsOption } from 'echarts'

const filterState = inject('dashboardFilter')!
const chartRef = ref<HTMLDivElement>()
const lineChart = useECharts(chartRef)

// 监听筛选器变化自动重绘
watch(() => [filterState.dateRange, filterState.regionPath], () => {
  lineChart.setOption(fetchChartOptions(), { notMerge: true })
}, { immediate: true })

// 事件派发
const handleLineClick = (params: any) => {
  lineChart.dispatchAction({ type: 'dataZoom', ... })
  emit('monthDrill', params.name)
}

// 销毁释放资源
onUnmounted(() => lineChart.dispose())
</script>
```

***

## 📋 OrderTable.vue（订单明细表格）

### 布局描述

- **结构**：通栏布局。顶部操作栏含 `关键字搜索框` + `排序指示器`，主体为 `el-table`，底部为 `分页组件`。
- **列定义**：订单号、下单时间、客户名称（脱敏）、订单金额（万元，右对齐）、所属区域（省-市）。

### 交互行为定义

- **排序**：点击表头切换 `asc/desc`，仅允许单列排序；排序图标随状态切换，默认按 `下单时间 desc`。
- **搜索过滤**：输入框实时匹配订单号/客户名，触发防抖请求（≤500ms），结果列表局部刷新。
- **分页**：默认 `pageSize=20`，切换页码/条数时表格显示 Loading，保持滚动条位置。
- **权限脱敏**：`客户名称` 列根据角色动态渲染（区域经理显示脱敏值 `张**`，总监显示明文）。

### 数据加载状态

- **Loading**：表格行级骨架屏或 `v-loading.fullscreen`。
- **Empty**：无数据时显示 `未找到匹配的订单记录，请调整筛选条件`。
- **Error**：行内展示 `数据加载异常`，分页器禁用，顶部 Toast 告警。

### 🛠 Vue 3 Composition API 约定

```vue
<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { useTableQuery } from '@/composables/useTableQuery'
import { debounce } from 'lodash-es'

const query = reactive({ page: 1, size: 20, keyword: '', sortField: 'orderTime', sortOrder: 'desc' })
const { tableData, loading, total, fetchList } = useTableQuery(query)

// 防抖搜索
const handleSearch = debounce((val: string) => {
  query.keyword = val
  query.page = 1
  fetchList()
}, 300)

// 金额格式化计算属性
const formattedData = computed(() => 
  tableData.value.map(row => ({ ...row, amount: `${row.amount.toFixed(2)} 万元` }))
)
</script>
```

***

## 📤 ExportDialog.vue（数据导出弹窗）

### 布局描述

- **结构**：居中 Modal。头部 `导出配置`，中部 `复选框组`（指标摘要 / 图表数据 / 明细表格 / 全选），底部 `确认 / 取消` 按钮。
- **权限控制**：无导出权限角色隐藏入口；有权限但导出上限超限时按钮置灰并提示。

### 交互行为定义

- **选项联动**：勾选 `全选` 时同步选中所有子项；取消任一子项自动取消全选。
- **确认导出**：点击后按钮切换为 Loading 态，禁用交互；成功后自动触发浏览器下载流，关闭弹窗并 Toast 提示 `导出成功：销售数据分析_华东_2026-01-01至2026-05-03_202605031430.xlsx`。
- **取消/关闭**：点击遮罩/ESC/取消按钮重置表单状态。

### 数据加载状态

- **Loading**：确认按钮显示 Spinner，文案变更为 `生成中...`。
- **Empty**：无可用导出项时（如权限隔离导致），弹窗内提示 `当前无可导出数据` 并禁用确认。
- **Error**：接口超时或格式错误时，Toast 提示 `导出失败：网络异常或数据量超限`，提供重试。

### 🛠 Vue 3 Composition API 约定

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExport } from '@/composables/useExport'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const selectedItems = ref<string[]>([])
const isAllSelected = computed({
  get: () => selectedItems.value.length === 3,
  set: (val) => selectedItems.value = val ? ['summary', 'chart', 'detail'] : []
})

const { exportData, loading: exporting } = useExport()

const handleConfirm = async () => {
  if (selectedItems.value.length === 0) return ElMessage.warning('请至少选择一项导出内容')
  exporting.value = true
  try {
    const blob = await exportData(selectedItems.value)
    triggerDownload(blob, generateFileName())
    ElMessage.success('导出成功')
    visible.value = false
  } catch (e) {
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}
</script>
```

***

## 🏗️ 全局架构与状态管理约定（Vue 3）

| 规范维度     | 实现方案                                                                                                      |
| :------- | :-------------------------------------------------------------------------------------------------------- |
| **状态共享** | 筛选器状态通过 `provide('dashboardFilter')` 下发，图表/表格/指标通过 `inject` 订阅；或统一接入 Pinia `useDashboardStore()` 实现跨组件同步。 |
| **异步请求** | 封装 `useAsyncData<T>(fetcher)` Composable，统一处理 `loading`、`error`、`retry` 状态，避免组件内重复写 `try/catch`。          |
| **性能保障** | 图表使用 `v-once` 或 `keep-alive` 缓存；表格列采用虚拟滚动（若数据量 > 5000）；防抖/节流统一使用 `@vueuse/core`。                          |
| **类型安全** | 全量使用 TypeScript，定义 `DashboardFilter`、`MetricPayload`、`ChartData` 等 Interface，API 响应通过 `zod` 校验。           |
| **权限拦截** | 路由级守卫 + 组件级 `v-permission` 指令；数据脱敏通过 `computed` 动态过滤，不依赖后端重复返回。                                           |

> ✅ 本规范可直接交付 UI/UX 团队输出高保真原型，并作为前端组件开发契约。所有交互耗时指标（≤1.5s/≤500ms）需在开发阶段配合 `Performance API` 埋点验证。

