<template>
  <div class="em-fields">
    <div class="page-header">
      <div>
        <div class="page-title">字段管理-暂无</div>
        <div class="page-desc">管理标准字段与自定义字段的映射、索引分级（S/A/B）</div>
      </div>
      <div style="display:flex;gap:10px">
        <a-button data-marker="字段管理-从样本探查">从样本探查</a-button>
        <a-button type="primary" data-marker="字段管理-添加自定义字段">+ 添加自定义字段</a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="fields"
      :pagination="{ current: 1, pageSize: 20, total: fields.length }"
      :row-key="'path'"
      size="middle"
      bordered
      data-marker="字段列表表格"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'path'">
          <code class="mono">{{ record.path }}</code>
        </template>
        <template v-else-if="column.key === 'type'">
          <a-tag :color="typeColorMap[record.type] || 'default'">{{ record.type }}</a-tag>
        </template>
        <template v-else-if="column.key === 'index'">
          <span class="index-badge" :class="'index-' + record.index">{{ record.index }}</span>
        </template>
        <template v-else-if="column.key === 'projects'">
          <a-tag v-for="p in record.projects" :key="p" class="project-tag" color="blue" style="margin-right:4px">{{ p }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" type="link">编辑</a-button>
            <a-popconfirm title="确定删除此字段？">
              <a-button size="small" type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <div class="legend-card">
      <div class="legend-title">索引级别说明</div>
      <div class="legend-list">
        <div class="legend-item"><span class="index-badge index-s">S</span><span>S级：支持聚合（SUM/AVG）、分组，存入列式存储</span></div>
        <div class="legend-item"><span class="index-badge index-a">A</span><span>A级：仅支持过滤（WHERE），不支持聚合</span></div>
        <div class="legend-item"><span class="index-badge index-b">B</span><span>B级：仅用于明细展示，不参与计算</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const typeColorMap = { string: 'blue', double: 'geekblue', integer: 'orange', timestamp: 'red' }

const fields = ref([
  { path: 'event_id', name: '事件ID', type: 'string', index: 'S', projects: ['广告聚合', '用户增长'], updated: '2026-07-28' },
  { path: 'user_pseudo_id', name: '用户伪ID', type: 'string', index: 'S', projects: ['广告聚合', '用户增长', '内容中台'], updated: '2026-07-28' },
  { path: 'country', name: '国家', type: 'string', index: 'S', projects: ['广告聚合', '用户增长'], updated: '2026-07-25' },
  { path: 'event_time', name: '事件时间', type: 'timestamp', index: 'S', projects: ['全部项目'], updated: '2026-07-20' },
  { path: 'client_time', name: '客户端时间', type: 'timestamp', index: 'A', projects: ['广告聚合'], updated: '2026-07-20' },
  { path: 'params.ecpm', name: 'eCPM', type: 'double', index: 'S', projects: ['广告聚合'], updated: '2026-07-30' },
  { path: 'params.account_id', name: '账户ID', type: 'string', index: 'S', projects: ['广告聚合'], updated: '2026-07-29' },
  { path: 'params.type1', name: '类型1', type: 'string', index: 'A', projects: ['广告聚合', '内容中台'], updated: '2026-07-26' },
  { path: 'params.unit_id', name: '单元ID', type: 'string', index: 'A', projects: ['广告聚合'], updated: '2026-07-26' },
  { path: 'delay', name: '延迟（派生）', type: 'integer', index: 'S', projects: ['内容中台'], updated: '2026-07-31' },
  { path: 'params.channel', name: '投放渠道', type: 'string', index: 'A', projects: ['广告聚合'], updated: '2026-07-22' },
  { path: 'params.campaign_name', name: '活动名称', type: 'string', index: 'B', projects: ['广告聚合'], updated: '2026-07-22' },
  { path: 'params.device_model', name: '设备型号', type: 'string', index: 'B', projects: ['用户增长'], updated: '2026-07-18' },
  { path: 'params.app_version', name: '应用版本', type: 'string', index: 'B', projects: ['全部项目'], updated: '2026-07-18' }
])

const columns = [
  { title: '字段路径', dataIndex: 'path', key: 'path', width: 220 },
  { title: '字段名称', dataIndex: 'name', key: 'name' },
  { title: '数据类型', key: 'type', width: 100 },
  { title: '索引级别', key: 'index', width: 100 },
  { title: '所属项目组', key: 'projects' },
  { title: '最后更新时间', dataIndex: 'updated', key: 'updated' },
  { title: '操作', key: 'action', width: 140, fixed: 'right' }
]
</script>

<style scoped>
.em-fields { padding: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1E293B; }
.page-desc { font-size: 13px; color: #64748B; margin-top: 4px; }
.mono { font-family: monospace; font-size: 13px; color: #4F46E5; background: #EEF2FF; padding: 2px 6px; border-radius: 4px; }
.index-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.index-s { background: #FEF2F2; color: #EF4444; }
.index-a { background: #FFFBEB; color: #F59E0B; }
.index-b { background: #F1F5F9; color: #64748B; }
.project-tag { font-size: 12px; }
.legend-card { background: #fff; border-radius: 8px; border: 1px solid #E2E8F0; padding: 20px; margin-top: 16px; }
.legend-title { font-size: 15px; font-weight: 600; color: #1E293B; margin-bottom: 12px; }
.legend-list { display: flex; flex-wrap: wrap; gap: 24px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748B; }
</style>
