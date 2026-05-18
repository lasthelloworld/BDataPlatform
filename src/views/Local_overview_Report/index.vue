<template>
  <div class="overview-report-container">
    <div class="page-header">
      <h2 class="page-title">Local Overview Report</h2>
      <p class="page-subtitle">内嵌AI辅助分析工作台</p>
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item" data-marker="lp_date_filter">
          <a-checkbox v-model:checked="filters.dateEnabled" data-marker="lp_date_checkbox" />
          <span class="filter-label">Date</span>
          <a-range-picker
            v-model:value="dateRange"
            format="MM/DD/YYYY"
            data-marker="lp_date_picker"
            :disabled="!filters.dateEnabled"
          />
        </div>

        <div class="filter-item" data-marker="lp_app_filter">
          <a-checkbox v-model:checked="filters.appEnabled" data-marker="lp_app_checkbox" />
          <span class="filter-label">App</span>
          <a-select
            v-model:value="filters.app"
            placeholder="All selected"
            style="width: 180px"
            :disabled="!filters.appEnabled"
            data-marker="lp_app_select"
          >
            <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
            <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
            <a-select-option value="CleanMaster">CleanMaster</a-select-option>
            <a-select-option value="Security">Security</a-select-option>
          </a-select>
        </div>

        <div class="filter-item" data-marker="lp_country_filter">
          <a-checkbox v-model:checked="filters.countryEnabled" data-marker="lp_country_checkbox" />
          <span class="filter-label">Country</span>
          <a-select
            v-model:value="filters.country"
            placeholder="All selected"
            style="width: 180px"
            :disabled="!filters.countryEnabled"
            data-marker="lp_country_select"
          >
            <a-select-option value="US">United States</a-select-option>
            <a-select-option value="CN">China</a-select-option>
            <a-select-option value="JP">Japan</a-select-option>
            <a-select-option value="KR">Korea</a-select-option>
          </a-select>
        </div>

        <div class="filter-item" data-marker="lp_version_filter">
          <a-checkbox v-model:checked="filters.versionEnabled" data-marker="lp_version_checkbox" />
          <span class="filter-label">版本号</span>
          <a-select
            v-model:value="filters.version"
            mode="multiple"
            placeholder="All selected"
            style="min-width: 200px"
            :disabled="!filters.versionEnabled"
            data-marker="lp_version_select"
          >
            <a-select-option value="1.9.0">v1.9.0</a-select-option>
            <a-select-option value="1.8.0">v1.8.0</a-select-option>
            <a-select-option value="1.7.5">v1.7.5</a-select-option>
          </a-select>
        </div>
      </div>

      <div class="metrics-section">
        <div class="filter-row">
          <div class="filter-item" data-marker="lp_metrics_filter">
            <span class="filter-label">Metrics</span>
            <a-select
              v-model:value="selectedMetrics"
              mode="multiple"
              placeholder="Select metrics"
              style="min-width: 400px"
              data-marker="lp_metrics_select"
            >
              <a-select-opt-group>
                <template #label>Revenue & Cost</template>
                <a-select-option value="Cost">Cost</a-select-option>
                <a-select-option value="Revenue">Revenue</a-select-option>
                <a-select-option value="Profit">Profit</a-select-option>
              </a-select-opt-group>
              <a-select-opt-group>
                <template #label>Users</template>
                <a-select-option value="CDNU">CDNU</a-select-option>
              </a-select-opt-group>
              <a-select-opt-group>
                <template #label>Retention</template>
                <a-select-option value="RR D1">RR D1</a-select-option>
                <a-select-option value="RR D3">RR D3</a-select-option>
                <a-select-option value="RR D7">RR D7</a-select-option>
              </a-select-opt-group>
              <a-select-opt-group>
                <template #label>In-App Revenue</template>
                <a-select-option value="In-RR">In-RR</a-select-option>
                <a-select-option value="In-RR D1">In-RR D1</a-select-option>
                <a-select-option value="In-RR D2">In-RR D2</a-select-option>
                <a-select-option value="In-RR D3">In-RR D3</a-select-option>
                <a-select-option value="AIPU">AIPU</a-select-option>
                <a-select-option value="AIPU D0">AIPU D0</a-select-option>
              </a-select-opt-group>
              <a-select-opt-group>
                <template #label>Monetization</template>
                <a-select-option value="ECPM">ECPM</a-select-option>
                <a-select-option value="CPI">CPI</a-select-option>
              </a-select-opt-group>
              <a-select-opt-group>
                <template #label>ROI</template>
                <a-select-option value="ROAS">ROAS</a-select-option>
                <a-select-option value="ROI0">ROI0</a-select-option>
                <a-select-option value="ROI3">ROI3</a-select-option>
                <a-select-option value="ROI7">ROI7</a-select-option>
              </a-select-opt-group>
            </a-select>
          </div>
        </div>
      </div>

      <div class="filter-actions">
        <a-button
          type="primary"
          @click="handleSearch"
          data-marker="lp_search_btn"
        >
          Search
        </a-button>
        <a-button @click="handleShowEvents" data-marker="lp_show_events_btn">
          Show events
        </a-button>
        <a-button @click="handleShowAll" data-marker="lp_show_all_btn">
          Show All
        </a-button>
      </div>
    </div>

    <a-collapse :bordered="false" class="interaction-guide">
      <a-collapse-panel key="guide" header="📌 交互说明">
        <table class="guide-table">
          <thead>
            <tr>
              <th>元素</th>
              <th>标注说明</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>日期筛选</td><td>选择查询的日期范围</td></tr>
            <tr><td>APP筛选</td><td>按APP维度筛选数据</td></tr>
            <tr><td>国家筛选</td><td>按国家维度筛选数据</td></tr>
            <tr><td>版本号筛选</td><td>按版本号维度筛选数据（支持多选）</td></tr>
            <tr><td>指标筛选</td><td>选择要显示的指标（支持多选）</td></tr>
            <tr><td>Search按钮</td><td>根据筛选条件执行查询</td></tr>
            <tr><td>Show events按钮</td><td>显示事件数据</td></tr>
            <tr><td>Show All按钮</td><td>显示全部数据</td></tr>
            <tr><td>AI辅助分析入口</td><td>右下角🤖按钮，点击打开AI辅助分析工作台</td></tr>
          </tbody>
        </table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'

const dateRange = ref([])

const filters = reactive({
  dateEnabled: false,
  appEnabled: true,
  countryEnabled: false,
  versionEnabled: false,
  app: 'PhotoRescue',
  country: '',
  version: []
})

const selectedMetrics = ref([
  'Cost', 'Revenue', 'Profit', 'CDNU', 'RR D1', 'RR D3', 'RR D7',
  'In-RR', 'In-RR D1', 'In-RR D2', 'In-RR D3', 'AIPU', 'AIPU D0',
  'ECPM', 'CPI', 'ROAS', 'ROI0', 'ROI3', 'ROI7'
])

const handleSearch = () => {
  message.success('数据查询成功')
}

const handleShowEvents = () => {
  message.info('显示事件数据')
}

const handleShowAll = () => {
  message.info('显示全部数据')
}
</script>

<style scoped>
.overview-report-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.filter-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: #666;
  min-width: 50px;
}

.metrics-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.filter-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

.interaction-guide {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.guide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.guide-table th,
.guide-table td {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  text-align: left;
}

.guide-table th {
  background: #fafafa;
  font-weight: 500;
}
</style>