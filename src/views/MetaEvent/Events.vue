<template>
  <div class="ev-page">
    <!-- 左侧：组织树（产品组→品类→主题域） -->
    <div class="ev-left">
      <div class="ev-left-header">事件组织</div>
      <div class="ev-left-toolbar">
        <a-button type="primary" size="small" @click="openNodeModal(null)" data-marker="元事件-组织树-新增节点-在树顶部新增产品组节点">+ 新增节点</a-button>
        <a-input-search
          v-model:value="treeSearch"
          placeholder="搜索节点"
          size="small"
          style="flex: 1"
          data-marker="元事件-组织树-节点搜索-按名称模糊匹配"
          allow-clear
        />
      </div>
      <div class="ev-tree-wrap">
        <a-tree
          v-model:selectedKeys="treeSelectedKeys"
          v-model:expandedKeys="treeExpandedKeys"
          :tree-data="filteredTreeData"
          class="ev-tree"
          data-marker="元事件-组织树-产品组→品类→主题域，点击节点联动右侧事件列表"
          @select="onTreeSelect"
        >
          <template #title="nodeData">
            <a-dropdown :trigger="['contextmenu']">
              <span class="tree-node" :class="{ active: treeSelectedKeys.includes(nodeData.key) }">
                <span class="tree-icon">{{ iconMap[nodeData.type] || '📄' }}</span>
                <span class="tree-title">{{ nodeData.title }}</span>
              </span>
              <template #overlay>
                <a-menu @click="(e) => onContextMenuClick(e.key, nodeData)">
                  <a-menu-item key="add" :disabled="nodeData.type === 'domain'">新增子节点</a-menu-item>
                  <a-menu-item key="edit">编辑</a-menu-item>
                  <a-menu-item key="delete">删除</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tree>
      </div>
      <div class="ev-left-note">
        【备注】事件挂载到「主题域」末级节点下；选择任意节点联动右侧该子树下的事件。
      </div>
    </div>

    <!-- 右侧：事件列表 -->
    <div class="ev-right">
      <div class="ev-right-header">
        <span class="page-title">元事件列表</span>
        <span class="breadcrumb" v-if="selectedNode">{{ nodePath }}</span>
      </div>

      <!-- 筛选栏 -->
      <div class="ev-filter">
        <a-select
          v-model:value="typeFilter"
          placeholder="事件类型"
          style="width: 140px"
          data-marker="元事件-事件类型筛选-通用/自定义"
          allow-clear
        >
          <a-select-option value="common">通用</a-select-option>
          <a-select-option value="custom">自定义</a-select-option>
        </a-select>
        <a-select
          v-model:value="businessTypeFilter"
          placeholder="业务类型"
          style="width: 120px"
          data-marker="元事件-业务类型筛选-IAP/IAA/网赚"
          allow-clear
        >
          <a-select-option v-for="bt in businessTypeOptions" :key="bt.value" :value="bt.value">{{ bt.label }}</a-select-option>
        </a-select>
        <a-select
          v-model:value="productFilter"
          mode="multiple"
          placeholder="产品筛选"
          style="width: 260px"
          data-marker="元事件-产品筛选多选-按产品过滤事件列表"
          allow-clear
        >
          <a-select-option v-for="p in productList" :key="p.id" :value="p.id">{{ p.name }}</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="searchText"
          placeholder="按事件ID搜索"
          style="width: 220px"
          data-marker="元事件-事件ID搜索-按 eventId 模糊匹配"
          allow-clear
        />
        <div style="flex: 1"></div>
        <a-button @click="openImportModal" data-marker="元事件-导入事件按钮-通过 Excel 文件导入事件，关联事件属性与编码集一并导入">
          导入事件
        </a-button>
        <a-button @click="openExportModal" data-marker="元事件-导出事件按钮-按产品组/品类/事件类型导出事件点位 CSV（Excel 可打开）">
          导出事件
        </a-button>
        <a-button type="primary" @click="openCreateDrawer" data-marker="元事件-新建事件按钮-创建一个新的元事件">
          + 新建事件
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="filteredEvents"
        row-key="id"
        size="middle"
        bordered
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }"
        data-marker="元事件-事件列表表格-元事件库主表"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tooltip v-if="record.type === 'common'" title="系统初始化的通用点位事件，不允许删除，仅允许编辑">
              <a-tag color="blue">通用</a-tag>
            </a-tooltip>
            <a-tag v-else color="green">自定义</a-tag>
          </template>
          <template v-else-if="column.key === 'businessType'">
            <a-tag :color="businessTypeColor[record.businessType] || 'default'">{{ record.businessType || '—' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'platforms'">
            <a-tag v-for="p in record.platforms" :key="p" color="default">{{ p }}</a-tag>
          </template>
          <template v-else-if="column.key === 'domain'">
            {{ getDomainTitle(record.domain) }}
          </template>
          <template v-else-if="column.key === 'products'">
            <a-tag v-for="pid in (record.products || [])" :key="pid" color="default">{{ getProductName(pid) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'isAppEvent'">
            <a-tag :color="record.isAppEvent ? 'green' : 'default'">{{ record.isAppEvent ? '是' : '否' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'published' ? 'green' : 'orange'">{{ record.status === 'published' ? '已发布' : '草稿' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openEditDrawer(record)" :data-marker="'元事件-编辑事件-' + record.eventId">编辑</a-button>
            <a-tooltip v-if="record.type === 'common'" title="通用事件为系统初始化点位，不允许删除">
              <a-button type="link" size="small" danger disabled>删除</a-button>
            </a-tooltip>
            <a-popconfirm v-else title="确认删除该事件？" @confirm="deleteEvent(record.id)">
              <a-button type="link" size="small" danger :data-marker="'元事件-删除事件-' + record.eventId">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 编辑 抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      :title="editingEvent ? '编辑事件' : '新建事件'"
      width="720px"
      placement="right"
      :footer-style="{ textAlign: 'right', padding: '12px 24px', borderTop: '1px solid #e8e8e8' }"
    >
      <!-- 1. 基本信息 -->
      <div class="ev-drawer-section">
        <div class="section-title">基本信息</div>
        <a-form :model="form" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="事件ID" required>
                <a-input v-model:value="form.eventId" placeholder="如：app_open" data-marker="元事件-事件ID输入框-必填" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="事件名称" required>
                <a-input v-model:value="form.name" placeholder="如：应用启动" data-marker="元事件-事件名称输入框-必填" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="事件类型" required>
                <a-radio-group v-model:value="form.type" data-marker="元事件-事件类型单选-通用/自定义">
                  <a-radio value="common">通用</a-radio>
                  <a-radio value="custom">自定义</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="埋点平台" required>
                <a-checkbox-group v-model:value="form.platforms" data-marker="元事件-埋点平台多选-Android/iOS/Web">
                  <a-checkbox value="Android">Android</a-checkbox>
                  <a-checkbox value="iOS">iOS</a-checkbox>
                  <a-checkbox value="Web">Web</a-checkbox>
                </a-checkbox-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="主题域" required>
                <a-tree-select
                  v-model:value="form.domain"
                  :tree-data="domainTreeData"
                  :field-names="{ value: 'key', label: 'title', children: 'children' }"
                  placeholder="选择主题域（仅 domain 层级可选）"
                  tree-default-expand-all
                  data-marker="元事件-主题域树选择-仅 domain 层级可选，事件挂载到主题域"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="所属产品" required>
                <a-tree-select
                  v-model:value="form.products"
                  :tree-data="productTreeData"
                  :field-names="{ value: 'value', label: 'title', children: 'children' }"
                  tree-checkable
                  multiple
                  show-search
                  tree-default-expand-all
                  placeholder="勾选品类可全选下级产品"
                  data-marker="元事件-所属产品多选-支持勾选品类全选下级产品"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="业务类型" required>
                <a-select
                  v-model:value="form.businessType"
                  :options="businessTypeOptions"
                  placeholder="请选择业务类型"
                  data-marker="元事件-业务类型选择-IAP/IAA/网赚"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <!-- 产品版本（先隐藏） -->
            <a-col v-if="false" :span="12">
              <a-form-item v-if="form.type === 'custom'" label="产品版本" required>
                <a-select
                  v-model:value="form.productVersion"
                  :options="versionOptions"
                  :placeholder="form.products.length ? '请选择产品版本' : '请先选择所属产品'"
                  :disabled="!form.products.length"
                  data-marker="元事件-产品版本下拉-按所选产品版本选择，自定义事件必填"
                  allow-clear
                />
              </a-form-item>
              <a-form-item v-else label="产品版本">
                <a-input value="—" disabled placeholder="通用事件无需版本" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="是否应用内事件" required>
                <a-switch
                  v-model:checked="form.isAppEvent"
                  checked-children="是"
                  un-checked-children="否"
                  data-marker="元事件-应用内事件开关-是否仅 App 内可触发"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="事件描述" required>
            <a-textarea v-model:value="form.description" :rows="3" placeholder="描述事件触发时机、统计口径" data-marker="元事件-事件描述输入框-必填" />
          </a-form-item>
        </a-form>
      </div>

      <!-- 2. 事件属性绑定 -->
      <div class="ev-drawer-section">
        <div class="section-title">
          事件属性绑定
          <span style="margin-left: 8px">
            <a-button size="small" type="primary" ghost @click="openPropModal" data-marker="元事件-添加属性按钮-从属性库批量勾选绑定">+ 添加属性</a-button>
            <a-button size="small" danger ghost @click="clearBoundProps" :disabled="!form.boundProps.length" data-marker="元事件-清空绑定按钮-移除全部已绑定属性">清空绑定</a-button>
          </span>
        </div>
        <a-table
          :columns="boundPropColumns"
          :data-source="boundPropList"
          row-key="id"
          size="small"
          bordered
          :pagination="false"
          class="ev-bind-table"
          data-marker="元事件-已绑定属性表格-展示当前事件绑定的属性"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'dataType'">
              <a-tag :color="dataTypeColor[record.dataType]">{{ record.dataType }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button type="link" size="small" danger @click="removeBoundProp(record.id)" :data-marker="'元事件-移除属性-' + record.name">移除</a-button>
            </template>
          </template>
        </a-table>
        <a-empty v-if="!form.boundProps.length" description="尚未绑定任何属性" />
      </div>

      <!-- 3. 版本控制（先隐藏） -->
      <div v-if="false" class="ev-drawer-section">
        <div class="section-title">版本控制</div>
        <div class="ev-version-current">
          当前版本：
          <span class="version-no">{{ form.version || 'v1.0' }}</span>
          <a-tag :color="form.versionStatus === 'published' ? 'green' : 'orange'">{{ form.versionStatus === 'published' ? '已发布' : '草稿' }}</a-tag>
        </div>
        <div class="ev-version-actions">
          <a-popconfirm title="确认继承上一版本配置？" @confirm="inheritPrevVersion">
            <a-button data-marker="元事件-继承上一版本按钮-复制上一版本配置到当前">继承上一版本</a-button>
          </a-popconfirm>
          <a-button
            type="primary"
            :disabled="form.versionStatus === 'published'"
            @click="publishCurrent"
            data-marker="元事件-发布当前版本按钮-正式生效，已发布会禁用"
          >
            发布当前版本
          </a-button>
        </div>
        <div class="ev-version-history">
          <div class="history-label">版本历史</div>
          <a-timeline>
            <a-timeline-item
              v-for="v in versionHistoryData"
              :key="v.version"
              :color="v.status === 'published' ? 'green' : 'orange'"
            >
              <div>
                <span style="font-weight: 600">{{ v.version }}</span>
                <a-tag :color="v.status === 'published' ? 'green' : 'orange'" style="margin-left: 6px">{{ v.status === 'published' ? '已发布' : '草稿' }}</a-tag>
              </div>
              <div class="history-meta">{{ v.updatedAt }} · {{ v.updatedBy }}</div>
              <div class="history-changes">{{ v.changes }}</div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>

      <template #footer>
        <a-button @click="drawerVisible = false" data-marker="元事件-取消按钮-关闭抽屉不保存">取消</a-button>
        <a-button @click="handleSave" data-marker="元事件-保存事件按钮-提交当前事件配置">保存</a-button>
        <a-button type="primary" @click="handlePublish" data-marker="元事件-发布事件按钮-保存并发布当前事件配置">发布</a-button>
      </template>
    </a-drawer>

    <!-- 添加属性 弹窗 -->
    <a-modal
      v-model:open="propModalVisible"
      title="添加属性"
      width="720px"
      ok-text="确认添加"
      cancel-text="取消"
      @ok="confirmAddProps"
    >
      <div class="ev-prop-modal-filter">
        <a-input
          v-model:value="propCodeKw"
          placeholder="按属性编码/显示名搜索"
          allow-clear
          style="width: 220px; margin-right: 8px"
          data-marker="元事件-添加属性弹窗-属性编码搜索-按属性编码/显示名快速检索"
        />
        <a-select
          v-model:value="propTypeFilter"
          placeholder="按类型筛选"
          allow-clear
          style="width: 160px"
          data-marker="元事件-添加属性弹窗-类型筛选-通用/自定义"
        >
          <a-select-option value="common">通用</a-select-option>
          <a-select-option value="custom">自定义</a-select-option>
        </a-select>
      </div>
      <a-table
        :columns="propModalColumns"
        :data-source="filteredPropertyList"
        row-key="id"
        size="small"
        bordered
        :pagination="{ pageSize: 5 }"
        :row-selection="{ selectedRowKeys: propSelectedKeys, onChange: onPropSelectChange, getCheckboxProps: r => ({ disabled: form.boundProps.includes(r.id) }) }"
        data-marker="元事件-属性选择表格-批量勾选要绑定的属性"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.type === 'common' ? 'green' : 'orange'">{{ record.type === 'common' ? '通用' : '自定义' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'dataType'">
            <a-tag :color="dataTypeColor[record.dataType]">{{ record.dataType }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 新增/编辑 组织树节点 弹窗 -->
    <a-modal
      v-model:open="nodeModalVisible"
      :title="editingNode ? '编辑节点' : '新增节点'"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleNodeSave"
    >
      <a-form :model="nodeForm" layout="vertical">
        <a-form-item label="节点类型" required>
          <a-select
            v-model:value="nodeForm.type"
            placeholder="选择节点类型"
            :disabled="!!editingNode"
            data-marker="元事件-组织树-节点类型-产品组/品类/主题域"
          >
            <a-select-option value="group">产品组</a-select-option>
            <a-select-option value="category">品类</a-select-option>
            <a-select-option value="domain">主题域</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="名称" required>
          <a-input v-model:value="nodeForm.title" placeholder="请输入节点名称" data-marker="元事件-组织树-节点名称-必填" />
        </a-form-item>
        <a-form-item label="备注" required>
          <a-textarea v-model:value="nodeForm.remark" placeholder="请输入备注" :rows="3" data-marker="元事件-组织树-节点备注-必填" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 导入事件 弹窗 -->
    <a-modal
      v-model:open="importModalVisible"
      title="导入事件"
      ok-text="导入"
      cancel-text="取消"
      @ok="confirmImport"
    >
      <a-alert
        type="warning"
        show-icon
        message="导入事件后，对应事件的关联事件属性和编码集也会一并导入"
        class="import-tip"
        data-marker="元事件-导入弹窗-导入提示-关联事件属性与编码集一并导入"
      />
      <a-form layout="vertical">
        <a-form-item label="事件文件" required extra="仅支持 .xlsx / .xls 格式的 Excel 文件">
          <a-upload
            v-model:file-list="importFileList"
            accept=".xlsx,.xls"
            :max-count="1"
            :before-upload="beforeImportUpload"
            data-marker="元事件-导入弹窗-文件选择框-选择要导入的事件 Excel 文件"
          >
            <a-button data-marker="元事件-导入弹窗-选择文件按钮-打开本地文件选择器">
              <template #icon><UploadOutlined /></template>
              选择 Excel 文件
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="导入至产品组" required>
          <a-select
            v-model:value="importGroup"
            :options="groupOptions"
            placeholder="请选择产品组"
            data-marker="元事件-导入弹窗-产品组选择-级联过滤品类选项"
            @change="onImportGroupChange"
          />
        </a-form-item>
        <a-form-item label="导入至产品品类" required>
          <a-select
            v-model:value="importCategory"
            :options="importCategoryOptions"
            :disabled="!importGroup"
            :placeholder="importGroup ? '请选择产品品类' : '请先选择产品组'"
            data-marker="元事件-导入弹窗-产品品类选择-按所选产品组级联"
          />
        </a-form-item>
        <a-form-item label="业务类型" required>
          <a-select
            v-model:value="importBusinessType"
            :options="businessTypeOptions"
            placeholder="请选择业务类型"
            data-marker="元事件-导入弹窗-业务类型单选-IAP/IAA/网赚"
            allow-clear
          />
        </a-form-item>
      </a-form>
      <div v-if="importFileName" class="import-preview" data-marker="元事件-导入弹窗-导入预览-展示所选文件与导入目标">
        将把 <b>{{ importFileName }}</b> 中的事件导入至 <b>{{ importTargetText }}</b>，事件属性与编码集随事件一并导入
      </div>
    </a-modal>

    <!-- 导出事件 弹窗 -->
    <a-modal
      v-model:open="exportModalVisible"
      title="导出事件"
      ok-text="导出"
      cancel-text="取消"
      @ok="confirmExport"
    >
      <a-form layout="vertical">
        <a-form-item label="产品组" required>
          <a-select
            v-model:value="exportGroup"
            :options="groupOptions"
            placeholder="请选择产品组"
            data-marker="元事件-导出弹窗-产品组选择-级联过滤品类选项"
            @change="onExportGroupChange"
          />
        </a-form-item>
        <a-form-item label="产品品类" required>
          <a-select
            v-model:value="exportCategory"
            :options="exportCategoryOptions"
            :disabled="!exportGroup"
            :placeholder="exportGroup ? '请选择产品品类' : '请先选择产品组'"
            data-marker="元事件-导出弹窗-产品品类选择-按所选产品组级联"
          />
        </a-form-item>
        <a-form-item label="事件类型" extra="留空则导出通用与自定义全部点位">
          <a-select
            v-model:value="exportType"
            :options="[{ value: 'common', label: '通用' }, { value: 'custom', label: '自定义' }]"
            placeholder="全部类型"
            allow-clear
            data-marker="元事件-导出弹窗-事件类型选择-通用/自定义，留空导出全部点位"
          />
        </a-form-item>
        <a-form-item label="业务类型" extra="可多选，留空则导出全部业务类型">
          <a-select
            v-model:value="exportBusinessTypes"
            mode="multiple"
            :options="businessTypeOptions"
            placeholder="全部业务类型"
            allow-clear
            data-marker="元事件-导出弹窗-业务类型多选-IAP/IAA/网赚，留空导出全部"
          />
        </a-form-item>
      </a-form>
      <div v-if="exportPreviewCount > 0" class="import-preview" data-marker="元事件-导出弹窗-导出预览-展示符合条件的点位数量">
        符合条件的点位 <b>{{ exportPreviewCount }}</b> 个，将导出为 CSV 文件（Excel 可直接打开）
      </div>
    </a-modal>

    <!-- 交互说明 -->
    <details class="anno-details">
      <summary>📌 交互说明</summary>
      <ul>
        <li>元事件-组织树-新增节点/右键菜单-产品组→品类→主题域 三级 CRUD</li>
        <li>元事件-组织树-节点搜索-按名称模糊匹配</li>
        <li>元事件-组织树-点击节点-联动右侧该子树下事件列表</li>
        <li>元事件-组织树-节点备注-必填</li>
        <li>元事件-事件类型筛选-通用/自定义</li>
        <li>元事件-业务类型筛选-IAP/IAA/网赚，联动过滤列表数据</li>
        <li>元事件-业务类型选择-新增/编辑事件必填业务类型（IAP/IAA/网赚）</li>
        <li>元事件-产品筛选多选-按产品过滤事件列表</li>
        <li>元事件-事件ID搜索-按 eventId 模糊匹配</li>
        <li>元事件-新建事件按钮-创建一个新的元事件</li>
        <li>元事件-导入事件按钮-通过 Excel 文件导入事件，关联事件属性与编码集一并导入</li>
        <li>元事件-导入弹窗-提示：导入事件后，关联事件属性和编码集也会一并导入</li>
        <li>元事件-导入弹窗-文件选择框-仅支持 .xlsx/.xls 单文件，非 Excel 文件被拒绝</li>
        <li>元事件-导入弹窗-导入至产品组→产品品类 级联选择，导入事件以草稿态落入所选品类</li>
        <li>元事件-导入弹窗-业务类型单选-IAP/IAA/网赚，导入事件归属该业务类型</li>
        <li>元事件-导出弹窗-业务类型多选-IAP/IAA/网赚，留空导出全部业务类型</li>
        <li>元事件-导出事件按钮-按产品组/品类/事件类型导出事件点位 CSV（Excel 可打开）</li>
        <li>元事件-导出弹窗-产品组→产品品类 级联选择 + 事件类型（通用/自定义，留空导出全部）</li>
        <li>元事件-导出弹窗-导出预览-展示符合条件的点位数量，文件名含组/品类/类型</li>
        <li>元事件-事件列表表格-元事件库主表（含所属产品列）</li>
        <li>元事件-编辑事件 / 删除事件-行内操作（通用事件不允许删除，仅可编辑；删除二次确认）</li>
        <li>元事件-事件ID/事件名称输入框-必填</li>
        <li>元事件-事件类型单选-通用/自定义（必填）</li>
        <li>元事件-埋点平台多选-Android/iOS/Web（必填）</li>
        <li>元事件-主题域树选择-仅 domain 层级可选，事件挂载到主题域</li>
        <li>元事件-所属产品多选-支持勾选品类全选下级产品</li>
        <li>元事件-应用内事件开关-是否仅 App 内可触发（必填）</li>
        <li>元事件-事件描述输入框-必填</li>
        <li>元事件-添加属性按钮-从属性库批量勾选绑定</li>
        <li>元事件-添加属性弹窗-类型筛选-通用/自定义</li>
        <li>元事件-添加属性弹窗-属性编码搜索-按属性编码/显示名快速检索</li>
        <li>元事件-清空绑定按钮-移除全部已绑定属性</li>
        <li>元事件-已绑定属性表格-展示当前事件绑定的属性</li>
        <li>元事件-移除属性-行内移除单个属性</li>
        <li>元事件-属性选择表格-批量勾选要绑定的属性</li>
        <li>元事件-保存事件按钮-提交当前事件配置</li>
        <li>元事件-发布事件按钮-保存并发布当前事件配置</li>
        <li>元事件-取消按钮-关闭抽屉不保存</li>
      </ul>
    </details>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { message, Upload } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { orgTreeData, products, eventProperties, events, versionHistory } from './mock.js'

/* ====== 组织树（产品组 → 品类 → 主题域） ====== */
const treeData = ref(JSON.parse(JSON.stringify(orgTreeData)))
const iconMap = { group: '🏢', category: '📂', product: '📦', domain: '🏷' }
const treeSearch = ref('')
const treeSelectedKeys = ref([])
const treeExpandedKeys = ref([])

const collectAllKeys = (nodes) => {
  const keys = []
  const walk = (list) => list.forEach(n => {
    keys.push(n.key)
    if (n.children && n.children.length) walk(n.children)
  })
  walk(nodes)
  return keys
}
treeExpandedKeys.value = collectAllKeys(treeData.value)

const filteredTreeData = computed(() => {
  const kw = treeSearch.value.trim()
  if (!kw) return treeData.value
  const filter = (nodes) => {
    const result = []
    nodes.forEach(n => {
      const children = n.children ? filter(n.children) : []
      if (n.title.includes(kw) || children.length > 0) result.push({ ...n, children })
    })
    return result
  }
  return filter(treeData.value)
})

const findNode = (nodes, key) => {
  for (const n of nodes) {
    if (n.key === key) return n
    if (n.children) {
      const f = findNode(n.children, key)
      if (f) return f
    }
  }
  return null
}

const findPath = (nodes, key, path = []) => {
  for (const n of nodes) {
    const cur = [...path, n.title]
    if (n.key === key) return cur
    if (n.children) {
      const f = findPath(n.children, key, cur)
      if (f) return f
    }
  }
  return null
}

const selectedNode = computed(() => {
  if (!treeSelectedKeys.value.length) return null
  return findNode(treeData.value, treeSelectedKeys.value[0])
})

const nodePath = computed(() => {
  if (!treeSelectedKeys.value.length) return ''
  const p = findPath(treeData.value, treeSelectedKeys.value[0])
  return p ? p.join(' > ') : ''
})

/* 收集某节点子树下所有 domain key（含自身若为 domain） */
const collectDomainKeys = (node) => {
  const keys = []
  const walk = (n) => {
    if (n.type === 'domain') keys.push(n.key)
    if (n.children) n.children.forEach(walk)
  }
  walk(node)
  return keys
}

const onTreeSelect = (keys) => {
  treeSelectedKeys.value = keys
}

/* 节点 CRUD 弹窗 */
const nodeModalVisible = ref(false)
const editingNode = ref(null)
const nodeForm = reactive({ type: 'group', title: '', remark: '', parentKey: null })

const nextChildType = (parentType) => {
  const map = { group: 'category', category: 'domain' }
  return map[parentType] || 'group'
}

const openNodeModal = (parentNode) => {
  editingNode.value = null
  nodeForm.type = parentNode ? nextChildType(parentNode.type) : 'group'
  nodeForm.title = ''
  nodeForm.remark = ''
  nodeForm.parentKey = parentNode ? parentNode.key : null
  nodeModalVisible.value = true
}

const openEditNodeModal = (node) => {
  editingNode.value = node
  nodeForm.type = node.type
  nodeForm.title = node.title
  nodeForm.remark = node.remark || ''
  nodeForm.parentKey = null
  nodeModalVisible.value = true
}

const handleNodeSave = () => {
  if (!nodeForm.title.trim()) {
    message.warning('请输入节点名称')
    return
  }
  if (!nodeForm.remark.trim()) {
    message.warning('请输入备注')
    return
  }
  if (editingNode.value) {
    const node = findNode(treeData.value, editingNode.value.key)
    if (node) {
      node.title = nodeForm.title.trim()
      node.remark = nodeForm.remark
    }
    message.success('节点已更新')
  } else {
    const newNode = {
      key: 'node_' + Date.now(),
      title: nodeForm.title.trim(),
      type: nodeForm.type,
      remark: nodeForm.remark,
      children: []
    }
    if (nodeForm.parentKey) {
      const parent = findNode(treeData.value, nodeForm.parentKey)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(newNode)
        treeExpandedKeys.value = [...treeExpandedKeys.value, parent.key]
      }
    } else {
      treeData.value.push(newNode)
    }
    message.success('节点已新增')
  }
  nodeModalVisible.value = false
}

const deleteNode = (node) => {
  const remove = (nodes, key) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].key === key) {
        nodes.splice(i, 1)
        return true
      }
      if (nodes[i].children && remove(nodes[i].children, key)) return true
    }
    return false
  }
  remove(treeData.value, node.key)
  if (treeSelectedKeys.value.includes(node.key)) treeSelectedKeys.value = []
  message.success('节点已删除')
}

const onContextMenuClick = (action, nodeData) => {
  if (action === 'add') openNodeModal(nodeData)
  else if (action === 'edit') openEditNodeModal(nodeData)
  else if (action === 'delete') deleteNode(nodeData)
}

/* ====== 事件列表 ====== */
const eventList = ref(JSON.parse(JSON.stringify(events)))
const propertyList = ref(JSON.parse(JSON.stringify(eventProperties)))
const productList = ref(JSON.parse(JSON.stringify(products)))
const versionHistoryData = ref(JSON.parse(JSON.stringify(versionHistory)))

/* 产品树（产品组→品类→产品）：用于所属产品多选 + 产品筛选，勾选品类可全选下级产品 */
const productTreeData = computed(() => {
  return treeData.value.map(g => ({
    key: g.key,
    title: g.title,
    value: g.key,
    children: (g.children || []).map(c => ({
      key: c.key,
      title: c.title,
      value: c.key,
      children: productList.value
        .filter(p => p.categoryId === c.key)
        .map(p => ({ key: p.id, title: p.name, value: p.id }))
    }))
  }))
})

const getProductName = (id) => {
  const p = productList.value.find(x => x.id === id)
  return p ? p.name : id
}

/* 产品版本下拉选项 = 所选产品的版本并集 */
const versionOptions = computed(() => {
  const selected = productList.value.filter(p => form.products.includes(p.id))
  const versions = new Set()
  selected.forEach(p => (p.versions || []).forEach(v => versions.add(v)))
  return Array.from(versions).sort().map(v => ({ value: v, label: v }))
})

const dataTypeColor = {
  string: 'blue',
  int: 'cyan',
  float: 'green',
  bool: 'orange',
  list: 'purple',
  enum: 'geekblue'
}

/* 业务类型：IAP（内购）/ IAA（广告变现）/ 网赚 */
const businessTypeOptions = [
  { value: 'IAP', label: 'IAP' },
  { value: 'IAA', label: 'IAA' },
  { value: '网赚', label: '网赚' }
]
const businessTypeColor = { IAP: 'purple', IAA: 'blue', 网赚: 'orange' }

/* 主题域 tree-select 数据：仅 domain 层级可选 */
const domainTreeData = computed(() => {
  const map = (nodes) => {
    return nodes.map(n => {
      const r = { ...n }
      if (n.children && n.children.length) {
        r.disabled = true
        r.children = map(n.children)
      }
      return r
    })
  }
  return map(treeData.value)
})

const getDomainTitle = (key) => {
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.key === key) return n.title
      if (n.children) {
        const t = walk(n.children)
        if (t) return t
      }
    }
    return null
  }
  return walk(treeData.value) || key
}

/* 通过 domain key 反查 group/category */
const findDomainPath = (key) => {
  const result = { group: '', category: '' }
  const walk = (nodes, g = '', c = '') => {
    for (const n of nodes) {
      let ng = g, nc = c
      if (n.type === 'group') ng = n.key
      else if (n.type === 'category') nc = n.key
      else if (n.type === 'domain' && n.key === key) {
        result.group = ng
        result.category = nc
        return true
      }
      if (n.children && walk(n.children, ng, nc)) return true
    }
    return false
  }
  walk(treeData.value)
  return result
}

const typeFilter = ref(undefined)
const businessTypeFilter = ref(undefined)
const searchText = ref('')
const productFilter = ref([])

const filteredEvents = computed(() => {
  let list = eventList.value
  if (selectedNode.value) {
    const domainKeys = collectDomainKeys(selectedNode.value)
    list = list.filter(e => domainKeys.includes(e.domain))
  }
  if (typeFilter.value) list = list.filter(e => e.type === typeFilter.value)
  if (businessTypeFilter.value) list = list.filter(e => e.businessType === businessTypeFilter.value)
  if (searchText.value) {
    const kw = searchText.value.trim().toLowerCase()
    list = list.filter(e => e.eventId.toLowerCase().includes(kw))
  }
  if (productFilter.value.length) {
    list = list.filter(e => (e.products || []).some(p => productFilter.value.includes(p)))
  }
  return list
})

/* ====== 导入事件弹窗 ====== */
const importModalVisible = ref(false)
const importFileList = ref([])
const importGroup = ref(undefined)
const importCategory = ref(undefined)
const importBusinessType = ref(undefined)

const importGroupOptions = computed(() =>
  treeData.value
    .filter(n => n.type === 'group')
    .map(g => ({ value: g.key, label: g.title }))
)
const groupOptions = importGroupOptions

const importCategoryOptions = computed(() => {
  if (!importGroup.value) return []
  const g = findNode(treeData.value, importGroup.value)
  return (g?.children || [])
    .filter(c => c.type === 'category')
    .map(c => ({ value: c.key, label: c.title }))
})

const onImportGroupChange = () => {
  importCategory.value = undefined
}

const importFileName = computed(() => importFileList.value[0]?.name || '')

const importTargetText = computed(() => {
  const g = importGroup.value ? findNode(treeData.value, importGroup.value) : null
  const c = importCategory.value ? findNode(treeData.value, importCategory.value) : null
  return [g?.title, c?.title].filter(Boolean).join(' / ')
})

const beforeImportUpload = (file) => {
  const ok = /\.(xlsx|xls)$/i.test(file.name)
  if (!ok) {
    message.error('仅支持 .xlsx / .xls 格式的 Excel 文件')
    return Upload.LIST_IGNORE
  }
  return false // 阻止自动上传，仅加入待导入列表
}

const openImportModal = () => {
  importFileList.value = []
  importGroup.value = undefined
  importCategory.value = undefined
  importBusinessType.value = undefined
  importModalVisible.value = true
}

const confirmImport = () => {
  if (!importFileList.value.length) { message.warning('请选择要导入的 Excel 文件'); return }
  if (!importGroup.value) { message.warning('请选择产品组'); return }
  if (!importCategory.value) { message.warning('请选择产品品类'); return }
  if (!importBusinessType.value) { message.warning('请选择业务类型'); return }
  /* 目标主题域：所选品类下第一个主题域 */
  const cat = findNode(treeData.value, importCategory.value)
  const firstDomain = (cat?.children || []).find(n => n.type === 'domain')
  const catProducts = productList.value.filter(p => p.categoryId === importCategory.value).map(p => p.id)
  /* 原型阶段模拟解析 Excel：固定示例事件 */
  const demoEvents = [
    { eventId: 'in_app_review', name: '应用内评价', platforms: ['Android', 'iOS'], isAppEvent: true, boundProps: ['ep_4', 'ep_8'], description: '用户提交应用内评价时触发（模拟 Excel 导入）。按 UV 统计。' },
    { eventId: 'share_click', name: '分享点击', platforms: ['Android', 'iOS', 'Web'], isAppEvent: true, boundProps: ['ep_3', 'ep_9'], description: '用户点击分享按钮时触发（模拟 Excel 导入）。按 PV 统计。' }
  ]
  const existIds = new Set(eventList.value.map(e => e.eventId))
  const toImport = demoEvents.filter(e => !existIds.has(e.eventId))
  if (!toImport.length) {
    message.warning('文件中的事件均已存在，无需重复导入')
    return
  }
  toImport.forEach(e => {
    eventList.value.push({
      ...e,
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: 'custom',
      businessType: importBusinessType.value,
      group: importGroup.value,
      category: importCategory.value,
      products: catProducts,
      productVersion: '',
      domain: firstDomain ? firstDomain.key : '',
      status: 'draft',
      version: 'v1.0',
      versionStatus: 'draft'
    })
  })
  const propIds = new Set()
  toImport.forEach(e => (e.boundProps || []).forEach(pid => propIds.add(pid)))
  const codeSetIds = new Set()
  propIds.forEach(pid => {
    const prop = propertyList.value.find(p => p.id === pid)
    if (prop && prop.codeSetId) codeSetIds.add(prop.codeSetId)
  })
  message.success(`已从 ${importFileName.value} 导入 ${toImport.length} 个事件，关联的 ${propIds.size} 个事件属性、${codeSetIds.size} 个编码集已一并导入`)
  importModalVisible.value = false
}

/* ====== 导出事件弹窗 ====== */
const exportModalVisible = ref(false)
const exportGroup = ref(undefined)
const exportCategory = ref(undefined)
const exportType = ref(undefined)
const exportBusinessTypes = ref([])

const exportCategoryOptions = computed(() => {
  if (!exportGroup.value) return []
  const g = findNode(treeData.value, exportGroup.value)
  return (g?.children || [])
    .filter(c => c.type === 'category')
    .map(c => ({ value: c.key, label: c.title }))
})

const onExportGroupChange = () => {
  exportCategory.value = undefined
}

/* 业务类型多选过滤：留空导出全部 */
const matchBusinessType = (e) => !exportBusinessTypes.value.length || exportBusinessTypes.value.includes(e.businessType)

const exportPreviewCount = computed(() => {
  if (!exportGroup.value || !exportCategory.value) return 0
  return eventList.value.filter(e => e.group === exportGroup.value && e.category === exportCategory.value && (!exportType.value || e.type === exportType.value) && matchBusinessType(e)).length
})

const openExportModal = () => {
  exportGroup.value = undefined
  exportCategory.value = undefined
  exportType.value = undefined
  exportBusinessTypes.value = []
  exportModalVisible.value = true
}

const confirmExport = () => {
  if (!exportGroup.value) { message.warning('请选择产品组'); return }
  if (!exportCategory.value) { message.warning('请选择产品品类'); return }
  const rows = eventList.value.filter(e => e.group === exportGroup.value && e.category === exportCategory.value && (!exportType.value || e.type === exportType.value) && matchBusinessType(e))
  if (!rows.length) {
    message.warning('所选条件下暂无可导出的事件点位')
    return
  }
  /* 列结构对齐 PRD 事件元数据标准结构 */
  const header = ['事件ID', '事件名称', '事件类型', '业务类型', '埋点平台', '产品组', '产品品类', '主题域', '所属产品', '应用内事件', '状态', '事件描述', '事件属性集']
  const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  const lines = [header.map(esc).join(',')]
  rows.forEach(e => {
    const props = (e.boundProps || []).map(pid => {
      const p = propertyList.value.find(x => x.id === pid)
      return p ? `${p.name}(${p.displayName})` : pid
    }).join('; ')
    lines.push([
      e.eventId,
      e.name,
      e.type === 'common' ? '通用' : '自定义',
      e.businessType || '—',
      (e.platforms || []).join('; '),
      getDomainTitle(e.group),
      getDomainTitle(e.category),
      getDomainTitle(e.domain),
      (e.products || []).map(getProductName).join('; '),
      e.isAppEvent ? '是' : '否',
      e.status === 'published' ? '已发布' : '草稿',
      e.description,
      props
    ].map(esc).join(','))
  })
  const g = findNode(treeData.value, exportGroup.value)
  const c = findNode(treeData.value, exportCategory.value)
  const typeText = exportType.value === 'common' ? '_通用' : exportType.value === 'custom' ? '_自定义' : ''
  const bizText = exportBusinessTypes.value.length ? '_' + exportBusinessTypes.value.join('-') : ''
  const fileName = `事件点位_${g?.title || ''}-${c?.title || ''}${typeText}${bizText}.csv`
  /* UTF-8 BOM 保证 Excel 直接打开中文不乱码 */
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
  message.success(`已导出 ${rows.length} 个事件点位：${fileName}`)
  exportModalVisible.value = false
}

/* ====== 事件抽屉 ====== */
const drawerVisible = ref(false)
const editingEvent = ref(null)
const form = reactive({
  id: '',
  eventId: '',
  name: '',
  type: 'common',
  businessType: undefined,
  platforms: [],
  domain: '',
  products: [],
  productVersion: '',
  isAppEvent: false,
  description: '',
  boundProps: [],
  version: 'v1.0',
  versionStatus: 'draft'
})

const resetForm = () => {
  Object.assign(form, {
    id: '',
    eventId: '',
    name: '',
    type: 'common',
    businessType: undefined,
    platforms: [],
    domain: '',
    products: [],
    productVersion: '',
    isAppEvent: false,
    description: '',
    boundProps: [],
    version: 'v1.0',
    versionStatus: 'draft'
  })
}

const openCreateDrawer = () => {
  editingEvent.value = null
  resetForm()
  /* 若左侧选中了主题域，预填 */
  if (selectedNode.value && selectedNode.value.type === 'domain') {
    form.domain = selectedNode.value.key
  }
  drawerVisible.value = true
}

const openEditDrawer = (record) => {
  editingEvent.value = record
  Object.assign(form, JSON.parse(JSON.stringify(record)))
  drawerVisible.value = true
}

const validateForm = () => {
  if (!form.eventId.trim()) { message.warning('请输入事件ID'); return false }
  if (!form.name.trim()) { message.warning('请输入事件名称'); return false }
  if (!form.type) { message.warning('请选择事件类型'); return false }
  if (!form.businessType) { message.warning('请选择业务类型'); return false }
  if (!form.platforms.length) { message.warning('请选择埋点平台'); return false }
  if (!form.domain) { message.warning('请选择主题域'); return false }
  if (!form.products.length) { message.warning('请选择所属产品'); return false }
  if (!form.description.trim()) { message.warning('请输入事件描述'); return false }
  return true
}

const saveEvent = (publish = false) => {
  if (!validateForm()) return
  const status = publish ? 'published' : 'draft'
  form.versionStatus = status
  form.status = status
  if (editingEvent.value) {
    const idx = eventList.value.findIndex(e => e.id === editingEvent.value.id)
    if (idx >= 0) {
      eventList.value[idx] = { ...eventList.value[idx], ...form }
    }
    message.success(publish ? '事件已发布' : '事件已更新')
  } else {
    const path = findDomainPath(form.domain)
    const newEvent = {
      ...form,
      id: 'ev_' + Date.now(),
      group: path.group,
      category: path.category,
      status
    }
    eventList.value.push(newEvent)
    message.success(publish ? '事件已发布' : '事件已新增')
  }
  drawerVisible.value = false
}

const handleSave = () => saveEvent(false)
const handlePublish = () => saveEvent(true)

const deleteEvent = (id) => {
  const ev = eventList.value.find(e => e.id === id)
  if (ev && ev.type === 'common') {
    message.warning('通用事件为系统初始化点位，不允许删除')
    return
  }
  eventList.value = eventList.value.filter(e => e.id !== id)
  message.success('事件已删除')
}

/* 已绑定属性 */
const boundPropList = computed(() => {
  return form.boundProps
    .map(id => propertyList.value.find(p => p.id === id))
    .filter(Boolean)
})

const removeBoundProp = (id) => {
  form.boundProps = form.boundProps.filter(k => k !== id)
}

const clearBoundProps = () => {
  form.boundProps = []
  message.success('已清空绑定')
}

/* 添加属性弹窗 */
const propModalVisible = ref(false)
const propSelectedKeys = ref([])
const propTypeFilter = ref(undefined)
const propCodeKw = ref('')

const filteredPropertyList = computed(() => {
  let list = propertyList.value
  if (propTypeFilter.value) list = list.filter(p => p.type === propTypeFilter.value)
  const kw = propCodeKw.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(p =>
      (p.name || '').toLowerCase().includes(kw) ||
      (p.displayName || '').toLowerCase().includes(kw)
    )
  }
  return list
})

const openPropModal = () => {
  propSelectedKeys.value = []
  propTypeFilter.value = undefined
  propCodeKw.value = ''
  propModalVisible.value = true
}

const onPropSelectChange = (keys) => {
  propSelectedKeys.value = keys
}

const confirmAddProps = () => {
  const newKeys = propSelectedKeys.value.filter(k => !form.boundProps.includes(k))
  form.boundProps.push(...newKeys)
  propSelectedKeys.value = []
  propModalVisible.value = false
  if (newKeys.length) {
    message.success(`已添加 ${newKeys.length} 个属性`)
  } else {
    message.info('未选择新属性')
  }
}

/* 版本控制 */
const inheritPrevVersion = () => {
  if (versionHistoryData.value.length < 2) {
    message.warning('暂无上一版本可继承')
    return
  }
  const prev = versionHistoryData.value[1]
  form.version = prev.version
  form.versionStatus = prev.status
  message.success(`已继承 ${prev.version} 配置`)
}

const publishCurrent = () => {
  if (form.versionStatus === 'published') {
    message.warning('当前版本已发布')
    return
  }
  form.versionStatus = 'published'
  form.status = 'published'
  message.success('当前版本已发布')
}

/* 列定义 */
const columns = [
  { title: '事件ID', dataIndex: 'eventId', key: 'eventId', width: 180, customHeaderCell: () => ({ title: '事件唯一标识符，同一品类下的事件ID唯一，不可重复' }) },
  { title: '事件名称', dataIndex: 'name', key: 'name', width: 140, customHeaderCell: () => ({ title: '业务可读的事件名称' }) },
  { title: '事件类型', key: 'type', width: 90, customHeaderCell: () => ({ title: '通用=跨产品复用；自定义=绑定到具体产品' }) },
  { title: '业务类型', key: 'businessType', width: 90, customHeaderCell: () => ({ title: '事件所属业务类型：IAP（内购）/ IAA（广告变现）/ 网赚' }) },
  { title: '埋点平台', key: 'platforms', customHeaderCell: () => ({ title: '该事件采集的端，多 tag 展示' }) },
  { title: '主题域', key: 'domain', width: 120, customHeaderCell: () => ({ title: '事件归属的主题域名称（挂载到主题域）' }) },
  { title: '所属产品', key: 'products', customHeaderCell: () => ({ title: '事件归属的产品，可多选' }) },
  // { title: '产品版本', key: 'productVersion', width: 100, customHeaderCell: () => ({ title: '自定义事件绑定的产品版本，通用事件显示 —' }) }, // 先隐藏
  { title: '应用内事件', key: 'isAppEvent', width: 100, customHeaderCell: () => ({ title: '是否仅在 App 内可触发' }) },
  { title: '状态', key: 'status', width: 90, customHeaderCell: () => ({ title: '已发布=正式生效；草稿=未上线' }) },
  { title: '操作', key: 'action', width: 130, fixed: 'right', customHeaderCell: () => ({ title: '编辑 / 删除该事件（删除二次确认）' }) }
]

const boundPropColumns = [
  { title: '属性名', dataIndex: 'name', key: 'name', customHeaderCell: () => ({ title: '已绑定属性的英文标识' }) },
  { title: '显示名', dataIndex: 'displayName', key: 'displayName', customHeaderCell: () => ({ title: '属性的业务可读名称' }) },
  { title: '数据类型', key: 'dataType', width: 100, customHeaderCell: () => ({ title: '属性的数据类型' }) },
  { title: '操作', key: 'action', width: 80, customHeaderCell: () => ({ title: '解除该属性与事件的绑定' }) }
]

const propModalColumns = [
  { title: '属性编码', dataIndex: 'name', key: 'name' },
  { title: '显示名', dataIndex: 'displayName', key: 'displayName' },
  { title: '类型', key: 'type', width: 90 },
  { title: '数据类型', key: 'dataType', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark' }
]
</script>

<style scoped>
.ev-prop-modal-filter {
  margin-bottom: 12px;
}
.ev-page {
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: 0;
}

/* 左侧组织树 */
.ev-left {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ev-left-header {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}
.ev-left-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.ev-tree-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
.ev-tree {
  font-size: 14px;
}
.tree-node {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 4px;
}
.tree-node.active {
  background: #e6f4ff;
  color: #1677ff;
}
.tree-icon {
  font-size: 14px;
}
.ev-left-note {
  margin-top: 12px;
  padding: 8px 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
}

/* 右侧列表 */
.ev-right {
  flex: 1;
  padding: 12px 24px;
  overflow: auto;
}
.ev-right-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}
.ev-right-header .page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.ev-right-header .breadcrumb {
  font-size: 13px;
  color: #64748b;
}
.ev-filter {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}
.ev-drawer-section {
  margin-bottom: 24px;
}
.ev-drawer-section .section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  border-left: 3px solid #1677ff;
  padding-left: 8px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.ev-bind-table {
  margin: 12px 0;
}
.ev-version-current {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ev-version-current .version-no {
  font-weight: 600;
  font-size: 16px;
  color: #1677ff;
}
.ev-version-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.ev-version-history {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
}
.ev-version-history .history-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 600;
}
.ev-version-history .history-meta {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.ev-version-history .history-changes {
  font-size: 12px;
  color: #475569;
  margin-top: 2px;
}
.anno-details {
  position: fixed;
  bottom: 12px;
  right: 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  max-width: 360px;
}
.anno-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #1677ff;
}
.import-tip {
  margin-bottom: 16px;
}
.import-preview {
  font-size: 13px;
  color: #475569;
}
.anno-details ul {
  margin-top: 8px;
  padding-left: 18px;
  line-height: 1.8;
}
</style>
