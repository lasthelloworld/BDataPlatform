<template>
  <div class="ad-performance-container">
    <div class="page-header">
      <h2 class="page-title">Local Ad Performance</h2>
      <p class="page-subtitle">本地广告性能报表 - 广告数据分析</p>
    </div>

    <a-card class="filter-card" :bordered="false">
      <div class="filter-container">
        <div class="filter-row date-filter-row">
          <div class="filter-item" data-marker="广告报表-快捷日期选项">
            <span class="filter-label">快捷选项</span>
            <a-select
              v-model:value="formState.quickRange"
              style="width: 100px"
              data-marker="广告报表-快捷日期选择"
            >
              <a-select-option value="yesterday">昨日</a-select-option>
              <a-select-option value="last7days">近7天</a-select-option>
              <a-select-option value="last30days">近30天</a-select-option>
            </a-select>
          </div>

          <div class="filter-item" data-marker="广告报表-日期范围选择">
            <span class="filter-label">数据日期</span>
            <a-range-picker
              v-model:value="formState.dateRange"
              style="width: 240px"
              data-marker="广告报表-日期范围选择器"
            />
          </div>
        </div>

        <div class="filter-row">
          <div class="filter-item" data-marker="广告报表-维度勾选-APP">
            <a-checkbox
              :checked="isDimensionSelected('app')"
              @change="toggleDimension('app')"
            />
            <span class="filter-label">APP</span>
            <a-select
              v-model:value="formState.app"
              placeholder="请选择APP"
              style="width: 100px"
              allowClear
              data-marker="广告报表-APP筛选"
            >
              <a-select-option value="phoneRecover">PhoneRecover</a-select-option>
              <a-select-option value="cleanMaster">CleanMaster</a-select-option>
              <a-select-option value="security">Security</a-select-option>
            </a-select>
          </div>

          <div class="filter-item" data-marker="广告报表-维度勾选-Version">
            <a-checkbox
              :checked="isDimensionSelected('version')"
              @change="toggleDimension('version')"
            />
            <span class="filter-label">Version</span>
            <a-select
              v-model:value="formState.version"
              placeholder="请选择"
              style="width: 100px"
              allowClear
              data-marker="广告报表-Version筛选"
            >
              <a-select-option value="v1.9.0">v1.9.0</a-select-option>
              <a-select-option value="v1.8.0">v1.8.0</a-select-option>
              <a-select-option value="v1.7.5">v1.7.5</a-select-option>
            </a-select>
          </div>

          <div class="filter-item" data-marker="广告报表-维度勾选-Country">
            <a-checkbox
              :checked="isDimensionSelected('country')"
              @change="toggleDimension('country')"
            />
            <span class="filter-label">Country</span>
            <a-select
              v-model:value="formState.country"
              placeholder="请选择"
              style="width: 100px"
              allowClear
              data-marker="广告报表-Country筛选"
            >
              <a-select-option value="US">US</a-select-option>
              <a-select-option value="CN">CN</a-select-option>
              <a-select-option value="JP">JP</a-select-option>
              <a-select-option value="KR">KR</a-select-option>
              <a-select-option value="IN">IN</a-select-option>
            </a-select>
          </div>

          <div class="filter-item" data-marker="广告报表-维度勾选-系统版本">
            <a-checkbox
              :checked="isDimensionSelected('osVersion')"
              @change="toggleDimension('osVersion')"
            />
            <span class="filter-label">系统版本</span>
            <a-select
              v-model:value="formState.osVersion"
              placeholder="请选择"
              style="width: 100px"
              allowClear
              data-marker="广告报表-系统版本筛选"
            >
              <a-select-option value="ios15">iOS 15</a-select-option>
              <a-select-option value="ios16">iOS 16</a-select-option>
              <a-select-option value="android11">Android 11</a-select-option>
              <a-select-option value="android12">Android 12</a-select-option>
            </a-select>
          </div>

          <div class="filter-item" data-marker="广告报表-维度勾选-手机品牌">
            <a-checkbox
              :checked="isDimensionSelected('deviceBrand')"
              @change="toggleDimension('deviceBrand')"
            />
            <span class="filter-label">手机品牌</span>
            <a-select
              v-model:value="formState.deviceBrand"
              placeholder="请选择"
              style="width: 100px"
              allowClear
              data-marker="广告报表-手机品牌筛选"
            >
              <a-select-option value="apple">Apple</a-select-option>
              <a-select-option value="xiaomi">Xiaomi</a-select-option>
              <a-select-option value="oppo">OPPO</a-select-option>
              <a-select-option value="vivo">Vivo</a-select-option>
            </a-select>
          </div>

          <div class="filter-item" data-marker="广告报表-维度勾选-手机型号">
            <a-checkbox
              :checked="isDimensionSelected('deviceModel')"
              @change="toggleDimension('deviceModel')"
            />
            <span class="filter-label">手机型号</span>
            <a-select
              v-model:value="formState.deviceModel"
              placeholder="请选择"
              style="width: 120px"
              allowClear
              data-marker="广告报表-手机型号筛选"
            >
              <a-select-option value="iphone14">iPhone 14</a-select-option>
              <a-select-option value="iphone15">iPhone 15</a-select-option>
              <a-select-option value="mi13">小米13</a-select-option>
              <a-select-option value="mi14">小米14</a-select-option>
              <a-select-option value="mi17">小米17</a-select-option>
              <a-select-option value="mi17promax">小米17 Pro Max</a-select-option>
              <a-select-option value="findx5">Find X5</a-select-option>
              <a-select-option value="findx6">Find X6</a-select-option>
              <a-select-option value="x90">X90</a-select-option>
              <a-select-option value="x100">X100</a-select-option>
            </a-select>
          </div>

          <div class="filter-item" data-marker="广告报表-维度勾选-用户类型">
            <a-checkbox
              :checked="isDimensionSelected('userType')"
              @change="toggleDimension('userType')"
            />
            <span class="filter-label">User Type</span>
            <a-select
              v-model:value="formState.userType"
              placeholder="请选择"
              style="width: 100px"
              allowClear
              data-marker="广告报表-用户类型筛选"
            >
              <a-select-option value="new">新用户</a-select-option>
              <a-select-option value="old">老用户</a-select-option>
            </a-select>
          </div>
        </div>

        <div class="filter-row">
          <a-button type="link" @click="advancedFilterExpanded = !advancedFilterExpanded" data-marker="广告报表-展开折叠高级筛选">
            {{ advancedFilterExpanded ? '收起' : '展开' }}高级筛选
            <component :is="advancedFilterExpanded ? 'UpOutlined' : 'DownOutlined'" />
          </a-button>
        </div>

        <a-collapse :bordered="false" style="margin-top: 12px" v-if="advancedFilterExpanded" default-active-key="delivery">
          <a-collapse-panel key="delivery" header="投放维">
            <div class="filter-row">
              <div class="filter-item" data-marker="广告报表-维度勾选-AdSource">
                <a-checkbox
                  :checked="isDimensionSelected('adSource')"
                  @change="toggleDimension('adSource')"
                />
                <span class="filter-label">Ad Source</span>
                <a-select
                  v-model:value="formState.adSource"
                  placeholder="请选择"
                  style="width: 100px"
                  allowClear
                  data-marker="广告报表-投放平台筛选"
                >
                  <a-select-option value="google">Google</a-select-option>
                  <a-select-option value="fb">Facebook</a-select-option>
                  <a-select-option value="tiktok">TikTok</a-select-option>
                </a-select>
              </div>

              <div class="filter-item" data-marker="广告报表-维度勾选-Account">
                <a-checkbox
                  :checked="isDimensionSelected('account')"
                  @change="toggleDimension('account')"
                />
                <span class="filter-label">Account</span>
                <a-select
                  v-model:value="formState.account"
                  placeholder="请选择"
                  style="width: 100px"
                  allowClear
                  data-marker="广告报表-广告账户筛选"
                >
                  <a-select-option value="1034301211">1034301211</a-select-option>
                  <a-select-option value="1034301212">1034301212</a-select-option>
                </a-select>
              </div>

              <div class="filter-item" data-marker="广告报表-维度勾选-Campaign">
                <a-checkbox
                  :checked="isDimensionSelected('campaign')"
                  @change="toggleDimension('campaign')"
                />
                <span class="filter-label">Campaign</span>
                <a-select
                  v-model:value="formState.campaign"
                  placeholder="请选择"
                  style="width: 100px"
                  allowClear
                  data-marker="广告报表-广告系列筛选"
                >
                  <a-select-option value="camp001">Campaign-001</a-select-option>
                  <a-select-option value="camp002">Campaign-002</a-select-option>
                </a-select>
              </div>

              <div class="filter-item" data-marker="广告报表-维度勾选-AdGroup">
                <a-checkbox
                  :checked="isDimensionSelected('adGroup')"
                  @change="toggleDimension('adGroup')"
                />
                <span class="filter-label">Ad Group</span>
                <a-select
                  v-model:value="formState.adGroup"
                  placeholder="请选择"
                  style="width: 100px"
                  allowClear
                  data-marker="广告报表-广告组筛选"
                >
                  <a-select-option value="group001">AdGroup-001</a-select-option>
                  <a-select-option value="group002">AdGroup-002</a-select-option>
                </a-select>
              </div>
            </div>
          </a-collapse-panel>

          <a-collapse-panel key="monetization" header="变现维">
            <div class="filter-row">
              <div class="filter-item" data-marker="广告报表-维度勾选-广告平台">
                <a-checkbox
                  :checked="isDimensionSelected('adPlatform')"
                  @change="toggleDimension('adPlatform')"
                />
                <span class="filter-label">广告平台</span>
                <a-select
                  v-model:value="formState.adPlatform"
                  placeholder="请选择"
                  style="width: 100px"
                  allowClear
                  mode="multiple"
                  data-marker="广告报表-广告平台多选"
                >
                  <a-select-option value="topon">TopOn</a-select-option>
                  <a-select-option value="max">Max</a-select-option>
                  <a-select-option value="admob">AdMob</a-select-option>
                  <a-select-option value="meta">Meta</a-select-option>
                </a-select>
              </div>

              <div class="filter-item" data-marker="广告报表-维度勾选-UnionType">
                <a-checkbox
                  :checked="isDimensionSelected('unionType')"
                  @change="toggleDimension('unionType')"
                />
                <span class="filter-label">Union Type</span>
                <a-select
                  v-model:value="formState.unionType"
                  placeholder="请选择"
                  style="width: 100px"
                  allowClear
                  data-marker="广告报表-聚合平台筛选"
                >
                  <a-select-option value="topon">TopOn</a-select-option>
                  <a-select-option value="max">Max</a-select-option>
                  <a-select-option value="admob">AdMob</a-select-option>
                </a-select>
              </div>

              <div class="filter-item" data-marker="广告报表-维度勾选-广告类型">
                <a-checkbox
                  :checked="isDimensionSelected('adType')"
                  @change="toggleDimension('adType')"
                />
                <span class="filter-label">广告类型</span>
                <a-select
                  v-model:value="formState.adType"
                  placeholder="请选择"
                  style="width: 100px"
                  allowClear
                  mode="multiple"
                  data-marker="广告报表-广告类型多选"
                >
                  <a-select-option value="splash">开屏广告</a-select-option>
                  <a-select-option value="interstitial">插屏广告</a-select-option>
                  <a-select-option value="banner">Banner</a-select-option>
                  <a-select-option value="rewarded">激励视频</a-select-option>
                </a-select>
              </div>

              <div class="filter-item" data-marker="广告报表-维度勾选-Placement">
                <a-checkbox
                  :checked="isDimensionSelected('placement')"
                  @change="toggleDimension('placement')"
                />
                <span class="filter-label">Placement</span>
                <a-select
                  v-model:value="formState.placement"
                  placeholder="请选择"
                  style="width: 100px"
                  allowClear
                  data-marker="广告报表-广告位筛选"
                >
                  <a-select-option value="hyper_splash">hyper_splash</a-select-option>
                  <a-select-option value="hyper_function_int">hyper_function_int</a-select-option>
                </a-select>
              </div>

              <div class="filter-item" data-marker="广告报表-维度勾选-AdId">
                <a-checkbox
                  :checked="isDimensionSelected('adId')"
                  @change="toggleDimension('adId')"
                />
                <span class="filter-label">Ad ID</span>
                <a-input
                  v-model:value="formState.adId"
                  placeholder="请输入"
                  style="width: 100px"
                  allowClear
                  data-marker="广告报表-广告ID输入"
                />
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <a-divider style="margin: 16px 0" />

      <a-space>
        <a-button type="primary" data-marker="广告报表-查询按钮" @click="handleQuery">
          查询
        </a-button>
        <a-button data-marker="广告报表-重置按钮" @click="handleReset">
          重置
        </a-button>
      </a-space>
    </a-card>

    <a-card class="table-card" :bordered="false">
      <div class="table-toolbar">
        <a-space>
          <a-button size="small" data-marker="广告报表-列设置按钮" @click="showColumnModal = true">列设置</a-button>
          <a-button size="small" data-marker="广告报表-导出按钮" @click="handleExport">导出</a-button>
        </a-space>
      </div>

      <a-table
        :columns="tableColumns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 2000 }"
        row-key="id"
        size="small"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="dimensionColumnsMap[column.dataIndex]">
            <span class="dimension-cell">{{ record[column.dataIndex] || '-' }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'dau'">
            <span class="metric-cell">{{ formatInt(record.dau) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'dnu'">
            <span class="metric-cell">{{ formatInt(record.dnu) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'scene'">
            <span class="metric-cell">{{ formatInt(record.scene) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'show'">
            <span class="metric-cell">{{ formatInt(record.show) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'click'">
            <span class="metric-cell">{{ formatInt(record.click) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'sceneRate'">
            <span class="metric-cell rate">{{ formatRate(record.sceneRate) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'showRate'">
            <span class="metric-cell rate">{{ formatRate(record.showRate) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'clickRate'">
            <span class="metric-cell rate">{{ formatRate(record.clickRate) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'revenue'">
            <span class="metric-cell revenue">${{ record.revenue }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'ecpm'">
            <span class="metric-cell">${{ record.ecpm }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'darpu'">
            <span class="metric-cell">${{ record.darpu }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'request'">
            <span class="metric-cell">{{ formatInt(record.request) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'response'">
            <span class="metric-cell">{{ formatInt(record.response) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'fillFailed'">
            <span class="metric-cell">{{ formatInt(record.fillFailed) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'fillRate'">
            <span class="metric-cell rate">{{ formatRate(record.fillRate) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'fillFailRate'">
            <span class="metric-cell rate">{{ formatRate(record.fillFailRate) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'reqPU'">
            <span class="metric-cell">{{ record.reqPU }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'aipu'">
            <span class="metric-cell">{{ record.aipu }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'clickPU'">
            <span class="metric-cell">{{ record.clickPU }}</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="showColumnModal"
      title="列设置"
      :footer="null"
      width="700px"
      data-marker="广告报表-列设置模态窗"
    >
      <div class="column-modal-content">
        <div class="transfer-container">
          <div class="transfer-panel">
            <div class="panel-header">
              <a-input
                v-model:value="leftSearch"
                placeholder="请输入关键字"
                allowClear
                class="search-input"
                data-marker="广告报表-列设置-待选搜索"
              >
                <template #suffix><span class="search-icon">🔍</span></template>
              </a-input>
            </div>
            <div class="panel-header">
              <label class="checkbox-label">
                <a-checkbox
                  :checked="leftSelectAll"
                  @change="toggleLeftSelectAll"
                />
                <span>待选择指标 ({{ filteredLeftItems.length }}个)</span>
              </label>
            </div>
            <div class="panel-body">
              <label
                v-for="item in filteredLeftItems"
                :key="item.key"
                class="item-label"
              >
                <a-checkbox
                  :checked="leftSelected.includes(item.key)"
                  @change="toggleLeftItem(item.key)"
                />
                <span>{{ item.title }}</span>
              </label>
            </div>
          </div>

          <div class="transfer-buttons">
            <a-button
              type="primary"
              shape="circle"
              @click="moveToRight"
              data-marker="广告报表-列设置-右移"
            >
              <RightOutlined />
            </a-button>
            <a-button
              type="primary"
              shape="circle"
              @click="moveToLeft"
              data-marker="广告报表-列设置-左移"
            >
              <LeftOutlined />
            </a-button>
          </div>

          <div class="transfer-panel">
            <div class="panel-header">
              <a-input
                v-model:value="rightSearch"
                placeholder="请输入关键字"
                allowClear
                class="search-input"
                data-marker="广告报表-列设置-已选搜索"
              >
                <template #suffix><span class="search-icon">🔍</span></template>
              </a-input>
            </div>
            <div class="panel-header">
              <label class="checkbox-label">
                <a-checkbox
                  :checked="rightSelectAll"
                  @change="toggleRightSelectAll"
                />
                <span>已选择指标 ({{ filteredRightItems.length }}个)</span>
              </label>
            </div>
            <div class="panel-body">
              <label
                v-for="item in filteredRightItems"
                :key="item.key"
                class="item-label"
              >
                <a-checkbox
                  :checked="rightSelected.includes(item.key)"
                  @change="toggleRightItem(item.key)"
                />
                <span>{{ item.title }}</span>
              </label>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px; text-align: right;">
          <a-button @click="showColumnModal = false" data-marker="广告报表-列设置-取消">取消</a-button>
          <a-button type="primary" @click="confirmColumnSettings" data-marker="广告报表-列设置-确定">确定</a-button>
        </div>
      </div>
    </a-modal>

    <details class="interaction-guide">
      <summary>📌 交互说明</summary>
      <table class="guide-table">
        <thead>
          <tr>
            <th>元素</th>
            <th>标注说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>快捷日期选项</td><td>快速选择昨日/近7天/近30天等快捷选项，选择后自动填充日期范围</td></tr>
          <tr><td>日期范围选择器</td><td>选择报表查询的时间范围，默认T+1昨日数据，支持自定义日期区间</td></tr>
          <tr><td>维度勾选-APP</td><td>勾选后APP将作为表格固定列展示，支持PhoneRecover/CleanMaster/Security</td></tr>
          <tr><td>维度勾选-Version</td><td>勾选后Version将作为表格固定列展示，支持v1.9.0/v1.8.0/v1.7.5</td></tr>
          <tr><td>维度勾选-Country</td><td>勾选后Country将作为表格固定列展示，支持US/CN/JP/KR/IN</td></tr>
          <tr><td>维度勾选-系统版本</td><td>勾选后系统版本将作为表格固定列展示，支持iOS 15/iOS 16/Android 11/Android 12</td></tr>
          <tr><td>维度勾选-手机品牌</td><td>勾选后手机品牌将作为表格固定列展示，支持Apple/Xiaomi/OPPO/Vivo</td></tr>
          <tr><td>维度勾选-手机型号</td><td>勾选后手机型号将作为表格固定列展示，支持iPhone 14/小米17/Find X5等</td></tr>
          <tr><td>维度勾选-用户类型</td><td>勾选后User Type将作为表格固定列展示，支持新用户/老用户</td></tr>
          <tr><td>展开/收起高级筛选</td><td>展开后显示投放维和变现维两个分组的筛选选项，初始状态为收起</td></tr>
          <tr><td>投放维</td><td>投放维度筛选分组，包含Ad Source、Account、Campaign、Ad Group四个筛选项</td></tr>
          <tr><td>变现维</td><td>变现维度筛选分组，包含广告平台、Union Type、广告类型、Placement、Ad ID五个筛选项</td></tr>
          <tr><td>Ad Source筛选</td><td>按投放平台筛选，支持Google/Facebook/TikTok</td></tr>
          <tr><td>Account筛选</td><td>按广告账户筛选，支持多个账户ID</td></tr>
          <tr><td>Campaign筛选</td><td>按广告系列筛选</td></tr>
          <tr><td>Ad Group筛选</td><td>按广告组筛选</td></tr>
          <tr><td>广告平台多选</td><td>按变现广告平台多选筛选，支持TopOn/Max/AdMob/Meta</td></tr>
          <tr><td>Union Type筛选</td><td>按聚合广告平台类型筛选，支持TopOn/Max/AdMob</td></tr>
          <tr><td>广告类型多选</td><td>按广告类型多选筛选，支持开屏广告/插屏广告/Banner/激励视频</td></tr>
          <tr><td>Placement筛选</td><td>按广告位筛选</td></tr>
          <tr><td>Ad ID输入</td><td>输入特定广告ID进行精确查询</td></tr>
          <tr><td>查询按钮</td><td>根据所有筛选条件刷新报表数据，触发数据请求</td></tr>
          <tr><td>重置按钮</td><td>清除所有筛选条件，恢复默认状态，不触发数据请求</td></tr>
          <tr><td>列设置按钮</td><td>打开列设置模态窗，控制表格指标列的显示与隐藏</td></tr>
          <tr><td>列设置模态窗</td><td>左侧待选择指标列表，右侧已选择指标列表，支持穿梭操作</td></tr>
          <tr><td>列设置-待选搜索</td><td>搜索待选择指标列表，支持按指标名称模糊检索</td></tr>
          <tr><td>列设置-已选搜索</td><td>搜索已选择指标列表，支持按指标名称模糊检索</td></tr>
          <tr><td>列设置-全选</td><td>一键选中当前列表中所有可见指标</td></tr>
          <tr><td>列设置-右移</td><td>将选中的待选指标移到已选列表</td></tr>
          <tr><td>列设置-左移</td><td>将选中的已选指标移到待选列表</td></tr>
          <tr><td>列设置-确定</td><td>确认列设置并刷新表格显示</td></tr>
          <tr><td>列设置-取消</td><td>取消列设置，关闭模态窗，不保存更改</td></tr>
          <tr><td>导出按钮</td><td>将当前筛选条件下的数据导出为Excel文件</td></tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { UpOutlined, DownOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons-vue'

const loading = ref(false)
const searchKeyword = ref('')
const advancedFilterExpanded = ref(false)
const showColumnModal = ref(false)

const leftSearch = ref('')
const rightSearch = ref('')
const leftSelected = ref([])
const rightSelected = ref([])

const allMetrics = ref([
  { key: 'dau', title: 'DAU' },
  { key: 'dnu', title: 'DNU' },
  { key: 'scene', title: 'Scene' },
  { key: 'show', title: 'Show' },
  { key: 'click', title: 'Click' },
  { key: 'sceneRate', title: 'Scene Rate' },
  { key: 'showRate', title: 'Show Rate' },
  { key: 'clickRate', title: 'Click Rate' },
  { key: 'revenue', title: 'Revenue' },
  { key: 'ecpm', title: 'ECPM' },
  { key: 'darpu', title: 'DARPU' },
  { key: 'request', title: 'Request' },
  { key: 'response', title: 'Response' },
  { key: 'fillFailed', title: 'Fill Failed' },
  { key: 'fillRate', title: 'Fill Rate' },
  { key: 'fillFailRate', title: 'Fill Fail Rate' },
  { key: 'reqPU', title: 'ReqPU' },
  { key: 'aipu', title: 'AIPU' },
  { key: 'clickPU', title: 'ClickPU' }
])

const visibleMetrics = ref(['dau', 'dnu', 'scene', 'show', 'click', 'sceneRate', 'showRate', 'clickRate', 'revenue', 'ecpm', 'darpu'])

const handleMetricChange = (targetKeys) => {
  visibleMetrics.value = targetKeys
}

const confirmColumnSettings = () => {
  showColumnModal.value = false
  leftSelected.value = []
  rightSelected.value = []
  leftSearch.value = ''
  rightSearch.value = ''
  message.success('列设置已更新')
}

const leftItems = computed(() => {
  return allMetrics.value.filter(item => !visibleMetrics.value.includes(item.key))
})

const rightItems = computed(() => {
  return allMetrics.value.filter(item => visibleMetrics.value.includes(item.key))
})

const filteredLeftItems = computed(() => {
  if (!leftSearch.value) return leftItems.value
  const keyword = leftSearch.value.toLowerCase()
  return leftItems.value.filter(item => item.title.toLowerCase().includes(keyword))
})

const filteredRightItems = computed(() => {
  if (!rightSearch.value) return rightItems.value
  const keyword = rightSearch.value.toLowerCase()
  return rightItems.value.filter(item => item.title.toLowerCase().includes(keyword))
})

const leftSelectAll = computed(() => {
  return filteredLeftItems.value.length > 0 && 
         filteredLeftItems.value.every(item => leftSelected.value.includes(item.key))
})

const rightSelectAll = computed(() => {
  return filteredRightItems.value.length > 0 && 
         filteredRightItems.value.every(item => rightSelected.value.includes(item.key))
})

const toggleLeftSelectAll = (e) => {
  if (e.target.checked) {
    leftSelected.value = filteredLeftItems.value.map(item => item.key)
  } else {
    leftSelected.value = []
  }
}

const toggleRightSelectAll = (e) => {
  if (e.target.checked) {
    rightSelected.value = filteredRightItems.value.map(item => item.key)
  } else {
    rightSelected.value = []
  }
}

const toggleLeftItem = (key) => {
  const index = leftSelected.value.indexOf(key)
  if (index > -1) {
    leftSelected.value.splice(index, 1)
  } else {
    leftSelected.value.push(key)
  }
}

const toggleRightItem = (key) => {
  const index = rightSelected.value.indexOf(key)
  if (index > -1) {
    rightSelected.value.splice(index, 1)
  } else {
    rightSelected.value.push(key)
  }
}

const moveToRight = () => {
  leftSelected.value.forEach(key => {
    visibleMetrics.value.push(key)
  })
  leftSelected.value = []
}

const moveToLeft = () => {
  rightSelected.value.forEach(key => {
    const index = visibleMetrics.value.indexOf(key)
    if (index > -1) {
      visibleMetrics.value.splice(index, 1)
    }
  })
  rightSelected.value = []
}

const formState = reactive({
  quickRange: 'yesterday',
  dateRange: [],
  app: undefined,
  version: undefined,
  country: undefined,
  osVersion: undefined,
  deviceBrand: undefined,
  deviceModel: undefined,
  userType: undefined,
  adSource: undefined,
  account: undefined,
  campaign: undefined,
  adGroup: undefined,
  adPlatform: [],
  unionType: undefined,
  adType: [],
  placement: undefined,
  adId: '',
  selectedDimensions: ['date', 'app', 'adType', 'placement']
})

const toggleDimension = (key) => {
  const index = formState.selectedDimensions.indexOf(key)
  if (index > -1) {
    formState.selectedDimensions.splice(index, 1)
  } else {
    formState.selectedDimensions.push(key)
  }
}

const isDimensionSelected = (key) => {
  return formState.selectedDimensions.includes(key)
}

const dimensionColumnsMap = {
  date: { title: 'Date', dataIndex: 'date', key: 'date', fixed: 'left', width: 120 },
  app: { title: 'APP', dataIndex: 'app', key: 'app', fixed: 'left', width: 130 },
  version: { title: 'Version', dataIndex: 'version', key: 'version', fixed: 'left', width: 100 },
  country: { title: 'Country', dataIndex: 'country', key: 'country', fixed: 'left', width: 120 },
  osVersion: { title: 'OS Version', dataIndex: 'osVersion', key: 'osVersion', fixed: 'left', width: 110 },
  deviceBrand: { title: 'Device Brand', dataIndex: 'deviceBrand', key: 'deviceBrand', fixed: 'left', width: 110 },
  deviceModel: { title: 'Device Model', dataIndex: 'deviceModel', key: 'deviceModel', fixed: 'left', width: 120 },
  userType: { title: 'User Type', dataIndex: 'userType', key: 'userType', fixed: 'left', width: 100 },
  adSource: { title: 'Ad Source', dataIndex: 'adSource', key: 'adSource', fixed: 'left', width: 100 },
  account: { title: 'Account', dataIndex: 'account', key: 'account', fixed: 'left', width: 120 },
  campaign: { title: 'Campaign', dataIndex: 'campaign', key: 'campaign', fixed: 'left', width: 140 },
  adGroup: { title: 'Ad Group', dataIndex: 'adGroup', key: 'adGroup', fixed: 'left', width: 140 },
  adPlatform: { title: 'Ad Platform', dataIndex: 'adPlatform', key: 'adPlatform', fixed: 'left', width: 110 },
  unionType: { title: 'Union Type', dataIndex: 'unionType', key: 'unionType', fixed: 'left', width: 110 },
  adType: { title: 'Ad Type', dataIndex: 'adType', key: 'adType', fixed: 'left', width: 100 },
  placement: { title: 'Placement', dataIndex: 'placement', key: 'placement', fixed: 'left', width: 150 },
  adId: { title: 'Ad ID', dataIndex: 'adId', key: 'adId', fixed: 'left', width: 120 }
}

const dimensionColumns = computed(() => {
  return formState.selectedDimensions.map(key => dimensionColumnsMap[key]).filter(Boolean)
})

const metricColumns = [
  {
    title: 'DAU',
    dataIndex: 'dau',
    key: 'dau',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '活跃用户数\nCOUNT(DISTINCT user_id) WHERE active_date = {date}' })
  },
  {
    title: 'DNU',
    dataIndex: 'dnu',
    key: 'dnu',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '激活用户数\nCOUNT(DISTINCT user_id) WHERE first_active_date = {date}' })
  },
  {
    title: 'Scene',
    dataIndex: 'scene',
    key: 'scene',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '场景到达数\nCOUNT(event_id) WHERE event_id=40300' })
  },
  {
    title: 'Show',
    dataIndex: 'show',
    key: 'show',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '广告展示数\nCOUNT(event_id) WHERE event_id=40301' })
  },
  {
    title: 'Click',
    dataIndex: 'click',
    key: 'click',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '广告点击数\nCOUNT(event_id) WHERE event_id=40401' })
  },
  {
    title: 'Scene Rate',
    dataIndex: 'sceneRate',
    key: 'sceneRate',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '场景展示率\nShow / Scene * 100%，保留2位小数' })
  },
  {
    title: 'Show Rate',
    dataIndex: 'showRate',
    key: 'showRate',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '广告展示率\nShow / Response * 100%，保留2位小数' })
  },
  {
    title: 'Click Rate',
    dataIndex: 'clickRate',
    key: 'clickRate',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '广告点击率\nClick / Show * 100%，保留2位小数' })
  },
  {
    title: 'Revenue',
    dataIndex: 'revenue',
    key: 'revenue',
    width: 120,
    sorter: true,
    customHeaderCell: () => ({ title: '广告收入\nSUM(revenue_usd)，单位：$万元' })
  },
  {
    title: 'ECPM',
    dataIndex: 'ecpm',
    key: 'ecpm',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: 'ECPM\nRevenue / Show * 1000，单位：$' })
  },
  {
    title: 'DARPU',
    dataIndex: 'darpu',
    key: 'darpu',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: 'DARPU\nRevenue / DAU，保留4位小数' })
  },
  {
    title: 'Request',
    dataIndex: 'request',
    key: 'request',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '广告请求数\nCOUNT(event_id) WHERE event_id=40101' })
  },
  {
    title: 'Response',
    dataIndex: 'response',
    key: 'response',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '广告请求响应数\nCOUNT(event_id) WHERE event_id=40201' })
  },
  {
    title: 'Fill Failed',
    dataIndex: 'fillFailed',
    key: 'fillFailed',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '广告填充失败数\nCOUNT(event_id) WHERE event_id=40202' })
  },
  {
    title: 'Fill Rate',
    dataIndex: 'fillRate',
    key: 'fillRate',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '广告填充率\nResponse / Request * 100%，保留2位小数' })
  },
  {
    title: 'Fill Fail Rate',
    dataIndex: 'fillFailRate',
    key: 'fillFailRate',
    width: 110,
    sorter: true,
    customHeaderCell: () => ({ title: '广告填充失败率\nFill Failed / Request * 100%，保留2位小数' })
  },
  {
    title: 'ReqPU',
    dataIndex: 'reqPU',
    key: 'reqPU',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '人均请求数\nRequest / DAU，保留2位小数' })
  },
  {
    title: 'AIPU',
    dataIndex: 'aipu',
    key: 'aipu',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '人均展示数\nShow / DAU，保留2位小数' })
  },
  {
    title: 'ClickPU',
    dataIndex: 'clickPU',
    key: 'clickPU',
    width: 100,
    sorter: true,
    customHeaderCell: () => ({ title: '人均点击数\nClick / DAU，保留2位小数' })
  }
]

const tableColumns = computed(() => {
  const filteredMetrics = metricColumns.filter(col => visibleMetrics.value.includes(col.key))
  return [...dimensionColumns.value, ...filteredMetrics]
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
})

const tableData = ref([])

const formatInt = (num) => {
  if (num === null || num === undefined) return '--'
  return Number(num).toLocaleString()
}

const formatRate = (value) => {
  if (!value || value === '--' || value === 'NaN') return '--'
  const num = parseFloat(value)
  if (isNaN(num)) return '--'
  return `${num.toFixed(2)}%`
}

const generateMockData = () => {
  const apps = ['PhoneRecover', 'CleanMaster', 'Security']
  const countries = ['US', 'CN', 'JP', 'KR', 'IN', 'BR', 'ID', 'RU']
  const adTypes = ['开屏广告', '插屏广告', 'Banner', '激励视频']
  const placements = ['hyper_splash', 'hyper_function_int', 'banner_01', 'rewarded_01']
  const versions = ['v1.9.0', 'v1.8.0', 'v1.7.5']
  const platforms = ['TopOn', 'Max', 'AdMob', 'Meta']
  const adSources = ['Google', 'Facebook', 'TikTok']
  const userTypes = ['新用户', '老用户']

  const data = []
  for (let i = 0; i < 50; i++) {
    const dau = Math.floor(Math.random() * 10000) + 1000
    const scene = Math.floor(Math.random() * 50000) + 5000
    const show = Math.floor(Math.random() * 40000) + 3000
    const click = Math.floor(Math.random() * 5000) + 200
    const request = Math.floor(Math.random() * 80000) + 10000
    const response = Math.floor(request * (0.7 + Math.random() * 0.25))
    const fillFailed = request - response
    const revenue = show * (0.005 + Math.random() * 0.015)
    const showRate = response > 0 ? ((show / response) * 100).toFixed(2) : '--'
    const clickRate = show > 0 ? ((click / show) * 100).toFixed(2) : '--'
    const sceneRate = scene > 0 ? ((show / scene) * 100).toFixed(2) : '--'
    const fillRate = request > 0 ? ((response / request) * 100).toFixed(2) : '--'
    const fillFailRate = request > 0 ? ((fillFailed / request) * 100).toFixed(2) : '--'

    data.push({
      id: i + 1,
      date: '2026-05-03',
      app: apps[Math.floor(Math.random() * apps.length)],
      version: versions[Math.floor(Math.random() * versions.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      osVersion: Math.random() > 0.5 ? 'iOS 16' : 'Android 12',
      deviceBrand: ['Apple', 'Xiaomi', 'OPPO', 'Vivo'][Math.floor(Math.random() * 4)],
      deviceModel: ['iPhone 14', 'Mi 13', 'Find X5', 'X90'][Math.floor(Math.random() * 4)],
      userType: userTypes[Math.floor(Math.random() * 2)],
      adSource: adSources[Math.floor(Math.random() * adSources.length)],
      account: '1034301211',
      campaign: `Campaign-${String(Math.floor(Math.random() * 10)).padStart(3, '0')}`,
      adGroup: `AdGroup-${String(Math.floor(Math.random() * 20)).padStart(3, '0')}`,
      adPlatform: platforms[Math.floor(Math.random() * platforms.length)],
      unionType: platforms[Math.floor(Math.random() * 3)],
      adType: adTypes[Math.floor(Math.random() * adTypes.length)],
      placement: placements[Math.floor(Math.random() * placements.length)],
      adId: `ad_${Math.floor(Math.random() * 100000)}`,
      dau,
      dnu: Math.floor(dau * 0.15),
      scene,
      show,
      click,
      sceneRate,
      showRate,
      clickRate,
      revenue: revenue.toFixed(2),
      ecpm: ((revenue / show) * 1000).toFixed(2),
      darpu: (revenue / dau).toFixed(4),
      request,
      response,
      fillFailed,
      fillRate,
      fillFailRate,
      reqPU: (request / dau).toFixed(2),
      aipu: (show / dau).toFixed(2),
      clickPU: (click / dau).toFixed(2)
    })
  }
  return data
}

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = generateMockData()
    pagination.total = tableData.value.length
    loading.value = false
    message.success('查询成功')
  }, 500)
}

const handleReset = () => {
  formState.quickRange = 'yesterday'
  formState.dateRange = []
  formState.app = undefined
  formState.version = undefined
  formState.country = undefined
  formState.osVersion = undefined
  formState.deviceBrand = undefined
  formState.deviceModel = undefined
  formState.userType = undefined
  formState.adSource = undefined
  formState.account = undefined
  formState.campaign = undefined
  formState.adGroup = undefined
  formState.adPlatform = []
  formState.unionType = undefined
  formState.adType = []
  formState.placement = undefined
  formState.adId = ''
  formState.selectedDimensions = ['date', 'app', 'country', 'adType']
  message.info('已重置')
}

const handleExport = () => {
  message.success('正在导出数据...')
}

const handleSearch = (value) => {
  console.log('搜索:', value)
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  handleQuery()
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.ad-performance-container {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: center;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.filter-label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.table-card {
  margin-bottom: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
}

.dimension-cell {
  font-weight: 500;
  color: #333;
}

.metric-cell {
  font-variant-numeric: tabular-nums;
  color: #666;
}

.metric-cell.rate {
  color: #1890ff;
}

.metric-cell.revenue {
  color: #52c41a;
  font-weight: 500;
}

.transfer-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.transfer-panel {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.panel-header {
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #d9d9d9;
}

.panel-header:first-child {
  border-bottom: none;
}

.search-input {
  width: 100%;
}

.search-icon {
  margin-right: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.panel-body {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.item-label:hover {
  background: #f5f5f5;
}

.transfer-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 80px;
}

.interaction-guide {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.interaction-guide summary {
  cursor: pointer;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.guide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.guide-table th,
.guide-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.guide-table th {
  background: #f5f5f5;
  font-weight: 500;
}

.guide-table td:first-child {
  width: 200px;
  color: #1890ff;
}
</style>