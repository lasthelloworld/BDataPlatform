<template>
  <div class="ai-chat-page">
    <!-- ============ 左侧会话侧边栏 ============ -->
    <aside class="chat-sidebar" :class="{ collapsed: sidebarCollapsed }" data-marker="ai-chat-sidebar">
      <div class="sidebar-header" data-marker="sidebar-collapse-header" @click="toggleSidebar">
        <span class="header-icon">💬</span>
        <span v-show="!sidebarCollapsed" class="header-title">Hopemobi Mind</span>
        <span class="collapse-arrow" :class="{ rotated: sidebarCollapsed }">◀</span>
      </div>

      <div v-show="!sidebarCollapsed" class="sidebar-body">
        <button class="new-chat-btn" data-marker="btn-new-chat" @click="newChat">
          <span class="plus">＋</span> 新对话
        </button>

        <div class="common-questions">
          <div class="cq-header" data-marker="menu-common-questions" @click="commonOpen = !commonOpen">
            <span>常看问题</span>
            <span class="cq-arrow" :class="{ open: commonOpen }">▸</span>
          </div>
          <div v-show="commonOpen" class="cq-list">
            <div
              v-for="(q, i) in sampleQuestions.slice(0, 3)"
              :key="'cq' + i"
              class="cq-item"
              @click="fillSample(q)"
            >
              {{ q.length > 22 ? q.slice(0, 22) + '…' : q }}
            </div>
          </div>
        </div>

        <div class="history-section" data-marker="history-group">
          <div class="history-title">历史记录</div>
          <div class="history-group-label">今天</div>
          <div class="history-list">
            <div
              v-for="s in sessions"
              :key="s.id"
              class="history-item"
              :class="{ active: s.id === currentSessionId }"
              :data-marker="'history-item-' + s.id"
              @click="selectSession(s.id)"
            >
              <template v-if="renameTargetId === s.id">
                <input
                  class="hi-input"
                  v-model="renameText"
                  ref="renameInputRef"
                  :data-marker="'history-item-rename-input-' + s.id"
                  @click.stop
                  @keydown.enter="confirmRename"
                  @keydown.esc="cancelRename"
                  @blur="confirmRename"
                />
              </template>
              <template v-else>
                <span class="hi-text">{{ s.title }}</span>
                <span class="hi-actions">
                  <span class="hi-edit" :data-marker="'history-item-edit-' + s.id" @click.stop="openRename(s)" title="重命名">✎</span>
                  <a-popconfirm
                    title="确定删除该会话？"
                    ok-text="删除"
                    cancel-text="取消"
                    @confirm="deleteSession(s.id)"
                  >
                    <span class="hi-del" @click.stop title="删除">🗑</span>
                  </a-popconfirm>
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-show="!sidebarCollapsed" class="sidebar-footer" data-marker="sidebar-user-info">
        <div class="avatar">👤</div>
        <div class="user-detail">
          <div class="user-name">运营总监</div>
          <div class="user-role">管理员</div>
        </div>
      </div>
    </aside>

    <!-- ============ 右侧对话主区域 ============ -->
    <section class="chat-main" data-marker="ai-chat-main">
      <div class="main-topbar"></div>

      <div class="message-area" ref="messageAreaRef">
        <!-- 欢迎卡片 -->
        <div v-if="showWelcome" class="welcome-card" data-marker="welcome-card">
          <div class="wc-header">
            <div class="wc-icon">🤖</div>
            <div class="wc-title">嗨～我是 Hopemobi Mind 数据分析助手！</div>
          </div>
          <div class="wc-guide">
            <p> 请描述您的数据分析需求或待排查问题，我将自动规划任务并调用工具为您处理。</p>
            <p>输入 <code>@</code> 可唤起 Skills 能力，辅助完成专项任务。如需了解全部能力，可发送：<strong>支持什么技能</strong>。</p>
            <div class="wc-tip">👉 问题定位格式：时间 + 包名 + 分析维度 + 数据异常现象，我将快速帮您定位根因。</div>
            <div class="wc-tip">👉 数据查询格式：时间 + 包名 + 分析维度 + 查询字段 + 数据展现形式，直接获取明细结果。</div>
            <p class="wc-footer">AI 能力持续进化中，您的每一次使用，都将帮助 Hopemobi Mind Agent 持续扩充知识储备，不断强化问题解决能力；</p>
          </div>
        </div>

        <!-- 消息流 -->
        <div v-else class="message-list" ref="messageListRef" data-marker="message-list">
          <div
            v-for="msg in currentMessages"
            :key="msg.id"
            class="message-row"
            :class="msg.role"
          >
            <div class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
            <div class="message-bubble">
              <!-- AI 消息的「智能分析过程」折叠条 -->
              <div
                v-if="msg.role === 'ai' && msg.reasoning"
                class="reasoning-bar"
                :class="{ expanded: expandedReasoningId === msg.id }"
                @click="toggleReasoning(msg)"
              >
                <span class="reasoning-status">✓ 已完成</span>
                <span class="reasoning-label">智能分析</span>
                <span class="reasoning-time" v-if="msg.elapsed">耗时 {{ msg.elapsed }}s</span>
                <span class="reasoning-arrow" :class="{ open: expandedReasoningId === msg.id }">›</span>
              </div>
              <template v-for="(b, bi) in msg.blocks" :key="bi">
                <div v-if="b.type === 'text'" class="block-text">{{ b.content }}</div>
                <div v-else-if="b.type === 'table'" class="block-table">
                  <table>
                    <thead>
                      <tr>
                        <th
                          v-for="(h, hi) in b.headers"
                          :key="hi"
                          :title="b.tooltips ? b.tooltips[hi] : h"
                        >{{ h }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(r, ri) in b.rows" :key="ri">
                        <td v-for="(c, ci) in r" :key="ci">{{ c }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else-if="b.type === 'image'" class="block-image">
                  <img :src="b.url" :alt="b.name" class="msg-img" />
                </div>
                <div v-else-if="b.type === 'file'" class="block-file">
                  <span class="msg-file-icon">📄</span>
                  <span class="msg-file-name" :title="b.name">{{ b.name }}</span>
                  <span class="msg-file-size">{{ b.size }}</span>
                </div>
                <div v-else-if="b.type === 'chart'" class="block-chart">
                  <div
                    class="ai-chart-box"
                    :data-chart-id="b.chartId"
                    :data-marker="'ai-chart-' + b.chartId"
                  ></div>
                </div>
              </template>
            </div>
          </div>

          <div v-if="loading" class="message-row ai">
            <div class="message-avatar">🤖</div>
            <div class="message-bubble loading-bubble">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部输入操作区 -->
      <div
        class="input-area"
        :class="{ 'has-attachments': attachments.length }"
        :data-marker="dragOver ? 'chat-input-area-dragover' : 'chat-input-area'"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
      >
        <!-- 附件预览区 -->
        <div v-if="attachments.length" class="attachment-preview" data-marker="attachment-preview">
          <div
            v-for="(att, i) in attachments"
            :key="att.id"
            class="attachment-item"
          >
            <template v-if="att.kind === 'image'">
              <img :src="att.url" :alt="att.name" class="att-img" />
            </template>
            <template v-else>
              <div class="att-file">
                <span class="att-file-icon">📄</span>
                <span class="att-file-name" :title="att.name">{{ att.name }}</span>
                <span class="att-file-size">{{ att.size }}</span>
              </div>
            </template>
            <span class="att-remove" :data-marker="'attachment-remove-' + att.id" @click="removeAttachment(i)" title="移除">×</span>
          </div>
        </div>

        <textarea
          ref="inputRef"
          v-model="inputText"
          class="chat-input"
          placeholder="输入你的问题，或使用 &quot;/&quot; 选择常用语"
          data-marker="chat-input"
          @keydown.enter.exact.prevent="handleEnter"
        ></textarea>

        <div class="input-toolbar">
          <label class="upload-btn" :data-marker="btn-upload" title="上传图片或 Excel 文件">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
            <input
              type="file"
              ref="fileInputRef"
              accept="image/png,image/jpeg,.csv,.xls,.xlsx"
              multiple
              style="display:none"
              @change="handleFileChange"
            />
          </label>
          <button
            class="beautify-btn"
            :disabled="!inputText.trim() || loading || beautifying"
            :title="beautifying ? '美化中…' : '一键美化提示词'"
            data-marker="btn-beautify"
            @click="beautifyPrompt"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h0"/><path d="M17.8 6.2L19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2L11 5"/>
            </svg>
          </button>
          <button
            class="send-btn"
            :disabled="(!inputText.trim() && !attachments.length) || loading"
            data-marker="btn-send"
            @click="sendMessage"
          >
            <span class="send-arrow">➤</span>
          </button>
        </div>
      </div>
      <div class="footer-tip" data-marker="footer-tip">
        您正在使用AI工具，请注意保护个人隐私及敏感数据，并审慎核实AI生成的内容。
      </div>

      <!-- data-marker 清单 -->
      <details class="marker-details">
        <summary>📌 元素 data-marker 清单</summary>
        <table class="marker-table">
          <thead>
            <tr>
              <th title="可交互元素的标识名称">元素标识</th>
              <th title="data-marker 属性值">data-marker</th>
              <th title="元素交互说明">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in markerList" :key="m.marker">
              <td>{{ m.element }}</td>
              <td>{{ m.marker }}</td>
              <td>{{ m.desc }}</td>
            </tr>
          </tbody>
        </table>
      </details>

      <!-- 智能分析过程侧滑抽屉 -->
      <a-drawer
        v-model:open="drawerVisible"
        title="智能分析过程"
        placement="right"
        :width="520"
        :footer="null"
        :closable="true"
        data-marker="reasoning-drawer"
      >
        <div v-if="currentReasoning" class="reasoning-drawer">
          <div class="rd-header">
            <span class="rd-status">✓ 已完成</span>
            <span v-if="currentReasoning.elapsed" class="rd-time">耗时 {{ currentReasoning.elapsed }}s</span>
          </div>
          <div class="rd-question">
            <div class="rd-q-label">用户问题</div>
            <div class="rd-q-text">{{ currentReasoning.question }}</div>
          </div>
          <div class="rd-steps">
            <div
              v-for="(step, i) in currentReasoning.steps"
              :key="i"
              class="rd-step"
              :class="step.status"
            >
              <div class="rd-step-head">
                <span class="rd-step-num">{{ i + 1 }}</span>
                <span class="rd-step-title">{{ step.title }}</span>
                <span class="rd-step-status">{{ step.status === 'done' ? '✓' : step.status === 'running' ? '…' : '✗' }}</span>
              </div>
              <div v-if="step.desc" class="rd-step-desc">{{ step.desc }}</div>
              <div v-if="step.sql" class="rd-step-code">
                <pre><code>{{ step.sql }}</code></pre>
              </div>
              <div v-if="step.code" class="rd-step-code">
                <pre><code>{{ step.code }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </a-drawer>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

/* ---------- 7 条标准业务示例问题（一字不差） ---------- */
const sampleQuestions = [
  '列出每年的总销售额，总利润，总数量，总订单数，以及平均折扣，用表格展现',
  '2021年第四季度东北地区各城市的销售额，利润总和，以及平均折扣',
  '分别列出一线城市和新一线城市的销售额，以及他们的差值',
  '利润率=利润/销售额，请列出每个省利润率最高的产品名称，以及其销售额和利润，以及利润率',
  '我要预测2025年的各省的销售目标值，计算方法是在2021年各省的销售额基础上增加一定的百分比，具体来说，东北地区增加10%，华北地区增加14%，华东地区增加20%，其他地区增加12%。列出各地区，省份，2021年销售额，预测增加百分比，和2025年预计销售额',
  '根据RFM原理，计算总销售额最高的top100客户的购买次数（按照订单ID统计），总购买金额，以及最近一次购买距今天数，用表格展示',
  '按照销售额和利润将各省市市场按照四象限分为四组，给每个组命名符合业务特征的标签，输出分组，省份，销售额和利润'
]

/* ---------- 图表实例与选项管理 ---------- */
const chartOptionMap = new Map()   // chartId -> echarts option
const chartInstances = new Map()   // dom el -> echarts instance
let chartSeq = 0
function makeChart(option) {
  const id = 'chart_' + (++chartSeq)
  chartOptionMap.set(id, option)
  return { type: 'chart', chartId: id }
}

/* ---------- mock 响应生成 ---------- */
function buildMockReasoning(question, elapsed) {
  const t = question.trim()
  const isIssue = /异常|下降|暴跌|飙升|故障|骤降|突增|突降|波动/.test(t)
  const hasChart = /四象限|预测|趋势|图表|柱状|折线|饼图/.test(t)

  const steps = [
    {
      title: '意图识别',
      status: 'done',
      desc: `用户输入已解析为 ${isIssue ? '问题定位' : '数据查询'} 场景，抽取关键维度与指标`
    },
    {
      title: '数据源路由',
      status: 'done',
      desc: '匹配销售数据集 sales_order_fact，联动地区维表 region_dim、产品维表 product_dim',
      code: `-- 检索可用数据源
SELECT dataset_id, dataset_name, table_name
FROM data_catalog
WHERE dataset_name LIKE '%销售%' OR tags LIKE '%sales%';
-- → sales_order_fact, region_dim, product_dim`
    },
    {
      title: 'SQL 生成与执行',
      status: 'done',
      desc: '根据意图生成 SQL 并提交查询引擎',
      sql: `-- 生成的查询 SQL（示意）
SELECT
  r.region_name AS 地区,
  SUM(o.sales_amount) AS 销售额,
  SUM(o.profit)      AS 利润,
  AVG(o.discount)    AS 平均折扣
FROM sales_order_fact o
JOIN region_dim r    ON o.region_id = r.region_id
WHERE o.order_date BETWEEN '2021-10-01' AND '2021-12-31'
GROUP BY r.region_name
ORDER BY 销售额 DESC;`
    }
  ]

  if (isIssue) {
    steps.push({
      title: '异常归因分析',
      status: 'done',
      desc: '对异常指标执行维度下钻，定位驱动因子',
      code: `# 归因分析伪代码
def attribution(metric, dims):
    baseline = query(metric, dims)
    for dim in dims:
        sliced = query(metric, [dim])
        contribution = sliced.pct_change() * baseline.share(dim)
    return rank_by_abs(contribution)`
    })
  }

  if (hasChart) {
    steps.push({
      title: '图表渲染',
      status: 'done',
      desc: '基于查询结果生成 ECharts option 并绑定 DOM'
    })
  }

  steps.push({
    title: '结果汇总',
    status: 'done',
    desc: '将查询结果与分析结论拼装为用户可读的文本/表格/图表组合'
  })

  return { question: t, elapsed, steps }
}

function generateMockResponse(question) {
  const q = question.trim()

  // 1. 每年汇总（表格 + 柱状图）
  if (q.includes('每年') && q.includes('总销售额')) {
    return {
      blocks: [
        { type: 'text', content: '已为您统计 2019—2024 年度核心销售指标，并附趋势图表：' },
        {
          type: 'table',
          headers: ['年份', '总销售额(万元)', '总利润(万元)', '总数量', '总订单数', '平均折扣'],
          tooltips: ['统计年份', '销售总额', '利润总额', '销售数量', '订单数', '平均折扣率'],
          rows: [
            ['2019', '1,286,450', '186,320', '542,310', '38,210', '14.2%'],
            ['2020', '1,452,780', '214,560', '612,450', '42,180', '14.8%'],
            ['2021', '1,738,920', '286,740', '728,930', '51,460', '15.1%'],
            ['2022', '1,965,240', '312,860', '821,570', '58,320', '15.6%'],
            ['2023', '2,184,560', '358,920', '912,340', '64,780', '16.2%'],
            ['2024', '2,416,780', '402,150', '1,018,260', '72,140', '16.8%']
          ]
        },
        makeChart({
          tooltip: { trigger: 'axis' },
          legend: { data: ['总销售额', '总利润'], top: 0 },
          grid: { left: 64, right: 24, top: 36, bottom: 32 },
          xAxis: { type: 'category', data: ['2019', '2020', '2021', '2022', '2023', '2024'] },
          yAxis: { type: 'value', name: '万元' },
          series: [
            { name: '总销售额', type: 'bar', data: [1286450, 1452780, 1738920, 1965240, 2184560, 2416780], itemStyle: { color: '#1677ff' } },
            { name: '总利润', type: 'bar', data: [186320, 214560, 286740, 312860, 358920, 402150], itemStyle: { color: '#52c41a' } }
          ]
        })
      ]
    }
  }

  // 2. 2021 Q4 东北地区各城市
  if (q.includes('2021年第四季度') && q.includes('东北地区')) {
    return {
      blocks: [
        { type: 'text', content: '2021 年第四季度东北地区各城市销售与利润统计：' },
        {
          type: 'table',
          headers: ['城市', '销售额(万元)', '利润总和(万元)', '平均折扣'],
          tooltips: ['城市', '该城市销售额', '利润总和', '平均折扣率'],
          rows: [
            ['沈阳', '86,420', '12,180', '15.4%'],
            ['大连', '72,860', '10,540', '14.9%'],
            ['长春', '54,320', '7,210', '13.8%'],
            ['哈尔滨', '48,760', '6,480', '13.5%'],
            ['鞍山', '21,540', '2,680', '12.7%']
          ]
        }
      ]
    }
  }

  // 3. 一线 vs 新一线 差值
  if (q.includes('一线城市') && q.includes('新一线')) {
    return {
      blocks: [
        { type: 'text', content: '已分别汇总一线与新一线城市销售额，并计算差值：' },
        {
          type: 'table',
          headers: ['城市级别', '城市', '销售额(万元)', '与对比级差值(万元)'],
          tooltips: ['城市级别', '城市', '销售额', '与另一级别合计的差值'],
          rows: [
            ['一线城市', '北京', '152,000', '—'],
            ['一线城市', '上海', '168,000', '—'],
            ['一线城市', '广州', '132,000', '—'],
            ['一线城市', '深圳', '124,000', '—'],
            ['一线城市合计', '—', '576,000', '+210,000'],
            ['新一线城市', '成都', '96,000', '—'],
            ['新一线城市', '杭州', '108,000', '—'],
            ['新一线城市', '武汉', '84,000', '—'],
            ['新一线城市', '苏州', '78,000', '—'],
            ['新一线城市合计', '—', '366,000', '-210,000']
          ]
        }
      ]
    }
  }

  // 4. 每个省利润率最高的产品
  if (q.includes('利润率') && q.includes('每个省')) {
    return {
      blocks: [
        { type: 'text', content: '按利润率=利润/销售额计算，各省利润率最高的产品如下：' },
        {
          type: 'table',
          headers: ['省份', '产品名称', '销售额(万元)', '利润(万元)', '利润率'],
          tooltips: ['省份', '该省利润率最高的产品', '产品销售额', '产品利润', '利润率=利润/销售额'],
          rows: [
            ['广东', '智能办公套装 Pro', '24,560', '6,890', '28.0%'],
            ['江苏', '企业版协作工具', '21,340', '5,720', '26.8%'],
            ['浙江', '数据可视化模版', '18,920', '5,210', '27.5%'],
            ['上海', 'AI 自动化方案', '17,860', '5,040', '28.2%'],
            ['北京', '商业分析套件', '16,420', '4,860', '29.6%'],
            ['四川', '轻量财务工具', '9,820', '2,580', '26.3%'],
            ['湖北', '智能客服系统', '8,760', '2,210', '25.2%'],
            ['福建', '营销自动化', '7,540', '1,920', '25.5%']
          ]
        }
      ]
    }
  }

  // 5. 2025 年预测
  if (q.includes('预测2025年')) {
    return {
      blocks: [
        { type: 'text', content: '基于 2021 年各省销售额，按指定增长率预测 2025 年销售目标值：' },
        {
          type: 'table',
          headers: ['地区', '省份', '2021年销售额(万元)', '预测增加百分比', '2025年预计销售额(万元)'],
          tooltips: ['地区', '省份', '2021年销售额', '增长百分比', '2025年预计销售额=2021年×(1+百分比)'],
          rows: [
            ['东北地区', '辽宁', '52,400', '10%', '57,640'],
            ['东北地区', '吉林', '38,600', '10%', '42,460'],
            ['东北地区', '黑龙江', '34,200', '10%', '37,620'],
            ['华北地区', '北京', '138,600', '14%', '158,004'],
            ['华北地区', '天津', '46,200', '14%', '52,668'],
            ['华东地区', '上海', '152,000', '20%', '182,400'],
            ['华东地区', '浙江', '126,400', '20%', '151,680'],
            ['华东地区', '江苏', '134,800', '20%', '161,760'],
            ['其他地区', '广东', '186,000', '12%', '208,320'],
            ['其他地区', '四川', '72,600', '12%', '81,312']
          ]
        }
      ]
    }
  }

  // 6. RFM top100
  if (q.includes('RFM')) {
    return {
      blocks: [
        { type: 'text', content: '按总销售额降序取 Top100 客户（此处展示前 8 名作为样例）的 RFM 指标：' },
        {
          type: 'table',
          headers: ['排名', '客户ID', '购买次数', '总购买金额(万元)', '最近一次购买距今天数'],
          tooltips: ['排名', '客户唯一标识', '按订单ID统计的购买次数', '总购买金额', '最近一次购买距今天数'],
          rows: [
            ['1', 'C-10293', '48', '186.5', '3'],
            ['2', 'C-20581', '42', '172.4', '7'],
            ['3', 'C-30874', '39', '168.9', '12'],
            ['4', 'C-41029', '36', '154.2', '5'],
            ['5', 'C-51238', '33', '148.7', '18'],
            ['6', 'C-61347', '31', '142.3', '9'],
            ['7', 'C-71560', '29', '136.8', '22'],
            ['8', 'C-81793', '27', '128.5', '15']
          ]
        }
      ]
    }
  }

  // 7. 四象限分组
  if (q.includes('四象限')) {
    return {
      blocks: [
        { type: 'text', content: '以销售额、利润中位数为界，将各省市划分为四象限分组：' },
        makeChart({
          tooltip: {
            trigger: 'item',
            formatter: (p) => `${p.data.name}<br/>销售额: ${p.value[0].toLocaleString()} 万<br/>利润: ${p.value[1].toLocaleString()} 万`
          },
          legend: { data: ['明星市场', '规模市场', '潜力市场', '长尾市场'], top: 0 },
          grid: { left: 72, right: 32, top: 36, bottom: 48 },
          xAxis: { name: '销售额(万元)', type: 'value', scale: true, splitLine: { lineStyle: { color: '#f0f0f0' } } },
          yAxis: { name: '利润(万元)', type: 'value', scale: true, splitLine: { lineStyle: { color: '#f0f0f0' } } },
          series: [
            {
              name: '明星市场', type: 'scatter', symbolSize: 14, itemStyle: { color: '#52c41a' },
              label: { show: true, formatter: (p) => p.data.name, position: 'top', fontSize: 11 },
              data: [{ name: '广东', value: [245000, 32000] }, { name: '江苏', value: [198000, 26000] }, { name: '浙江', value: [176000, 24000] }],
              markLine: { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#bfbfbf' }, data: [{ xAxis: 120000 }, { yAxis: 13000 }] }
            },
            { name: '规模市场', type: 'scatter', symbolSize: 14, itemStyle: { color: '#1677ff' }, label: { show: true, formatter: (p) => p.data.name, position: 'top', fontSize: 11 }, data: [{ name: '上海', value: [168000, 14000] }, { name: '北京', value: [152000, 12000] }] },
            { name: '潜力市场', type: 'scatter', symbolSize: 14, itemStyle: { color: '#fa8c16' }, label: { show: true, formatter: (p) => p.data.name, position: 'top', fontSize: 11 }, data: [{ name: '福建', value: [86000, 15000] }, { name: '湖北', value: [92000, 16000] }, { name: '四川', value: [88000, 14500] }] },
            { name: '长尾市场', type: 'scatter', symbolSize: 12, itemStyle: { color: '#8c8c8c' }, label: { show: true, formatter: (p) => p.data.name, position: 'top', fontSize: 11 }, data: [{ name: '辽宁', value: [64000, 7000] }, { name: '吉林', value: [52000, 5200] }, { name: '黑龙江', value: [48000, 4600] }, { name: '内蒙古', value: [42000, 3800] }] }
          ]
        }),
        {
          type: 'table',
          headers: ['分组', '省份', '销售额(万元)', '利润(万元)'],
          tooltips: ['象限分组', '省份', '销售额', '利润'],
          rows: [
            ['明星市场（高销高利）', '广东', '245,000', '32,000'],
            ['明星市场（高销高利）', '江苏', '198,000', '26,000'],
            ['明星市场（高销高利）', '浙江', '176,000', '24,000'],
            ['规模市场（高销低利）', '上海', '168,000', '14,000'],
            ['规模市场（高销低利）', '北京', '152,000', '12,000'],
            ['潜力市场（低销高利）', '福建', '86,000', '15,000'],
            ['潜力市场（低销高利）', '湖北', '92,000', '16,000'],
            ['潜力市场（低销低利）', '四川', '88,000', '14,500'],
            ['长尾市场（低销低利）', '辽宁', '64,000', '7,000'],
            ['长尾市场（低销低利）', '吉林', '52,000', '5,200'],
            ['长尾市场（低销低利）', '黑龙江', '48,000', '4,600'],
            ['长尾市场（低销低利）', '内蒙古', '42,000', '3,800']
          ]
        }
      ]
    }
  }

  // 通用兜底响应
  return {
    blocks: [
      {
        type: 'text',
        content: '已收到您的问题，基于销售数据分析如下：\n\n• 整体销售保持稳步上升，华东、华南贡献最高\n• 2024 年总销售额同比增长 10.6%，利润率提升至 16.6%\n• 建议关注高利润率产品线与潜力省份市场\n\n如需具体指标或图表，可点击上方示例问题，或直接描述维度（地区/时间/产品）。'
      }
    ]
  }
}

/* ---------- 会话状态 ---------- */
let sessionSeq = 0
function createSession(title = '新会话') {
  return { id: 'sess_' + (++sessionSeq), title, messages: [], createdAt: new Date() }
}

const sessions = reactive([createSession()])
const currentSessionId = ref(sessions[0].id)
const inputText = ref('')
const loading = ref(false)
const beautifying = ref(false)
const sidebarCollapsed = ref(false)
const commonOpen = ref(false)
const messageAreaRef = ref(null)
const messageListRef = ref(null)
const inputRef = ref(null)
const fileInputRef = ref(null)
const attachments = ref([])
const dragOver = ref(false)
const drawerVisible = ref(false)
const expandedReasoningId = ref(null)
const currentReasoning = ref(null)
let attSeq = 0

function toggleReasoning(msg) {
  expandedReasoningId.value = msg.id
  currentReasoning.value = msg.reasoning
  drawerVisible.value = true
}

const ACCEPTED_EXT = ['png', 'jpg', 'jpeg', 'csv', 'xls', 'xlsx']
const MAX_ATTACH_SIZE = 20 * 1024 * 1024 // 20MB

function isValidFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  return ACCEPTED_EXT.includes(ext)
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function addFiles(files) {
  for (const file of files) {
    if (!isValidFile(file)) continue
    if (file.size > MAX_ATTACH_SIZE) continue
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    const isImage = ['png', 'jpg', 'jpeg'].includes(ext)
    const att = {
      id: 'att_' + (++attSeq),
      name: file.name,
      size: formatSize(file.size),
      kind: isImage ? 'image' : 'file',
      raw: file,
      url: isImage ? URL.createObjectURL(file) : ''
    }
    attachments.value.push(att)
  }
}

function handleFileChange(e) {
  const files = Array.from(e.target.files || [])
  addFiles(files)
  e.target.value = ''
}

function handleDrop(e) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  addFiles(files)
}

function removeAttachment(idx) {
  const att = attachments.value[idx]
  if (att?.url) URL.revokeObjectURL(att.url)
  attachments.value.splice(idx, 1)
}
let msgSeq = 0

const currentSession = computed(() => sessions.find((s) => s.id === currentSessionId.value))
const currentMessages = computed(() => currentSession.value?.messages || [])
const showWelcome = computed(() => currentMessages.value.length === 0)

/* ---------- 交互方法 ---------- */
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function newChat() {
  const s = createSession()
  sessions.unshift(s)
  currentSessionId.value = s.id
  inputText.value = ''
  loading.value = false
}

function selectSession(id) {
  currentSessionId.value = id
  loading.value = false
  nextTick(() => { renderCharts(); scrollToBottom() })
}

const renameTargetId = ref(null)
const renameText = ref('')
const renameInputRef = ref(null)

function openRename(s) {
  renameTargetId.value = s.id
  renameText.value = s.title
  nextTick(() => {
    const el = renameInputRef.value
    if (el && el.focus) {
      el.focus()
      if (el.select) el.select()
    }
  })
}

function confirmRename() {
  const id = renameTargetId.value
  if (!id) return
  const sess = sessions.find((s) => s.id === id)
  if (sess) {
    const val = renameText.value.trim()
    if (val) sess.title = val
  }
  renameTargetId.value = null
  renameText.value = ''
}

function cancelRename() {
  renameTargetId.value = null
  renameText.value = ''
}

function deleteSession(id) {
  const idx = sessions.findIndex((s) => s.id === id)
  if (idx === -1) return
  sessions.splice(idx, 1)
  if (currentSessionId.value === id) {
    if (sessions.length) {
      currentSessionId.value = sessions[0].id
      nextTick(() => { renderCharts(); scrollToBottom() })
    } else {
      const s = createSession()
      sessions.unshift(s)
      currentSessionId.value = s.id
    }
  }
}

function fillSample(q) {
  inputText.value = q
  nextTick(() => inputRef.value?.focus())
}

function handleEnter() {
  sendMessage()
}

/* ---------- 提示词美化 ---------- */
function beautifyPrompt() {
  const text = inputText.value.trim()
  if (!text || loading.value || beautifying.value) return
  beautifying.value = true
  setTimeout(() => {
    const beautified = doBeautify(text)
    inputText.value = beautified
    beautifying.value = false
    nextTick(() => inputRef.value?.focus())
  }, 400)
}

function doBeautify(raw) {
  const t = raw.trim()
  // 已含「时间 + 包名 + 分析维度 + …」结构化标记 → 原样返回，避免二次美化
  if (/【时间】|【包名】|【分析维度】/.test(t)) return t

  // 识别时间
  const timeKeywords = ['今天', '昨天', '近7天', '近7日', '近14天', '近30天', '近90天', '本周', '上周', '本月', '上月', '今年', '去年', '近一年', '近半年']
  const timeRegex = /\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}日?|\d{4}年|\d{1,2}月|\d{1,2}日|Q[1-4]|第[一二三四]季度|\d{1,2}月\d{1,2}日/g
  let time = ''
  const timeMatch = t.match(timeRegex) || []
  for (const kw of timeKeywords) { if (t.includes(kw) && !time) time = kw }
  if (!time && timeMatch.length) time = timeMatch.join('、')
  if (!time) time = '近7天（请确认具体时间范围）'

  // 识别包名
  const pkgRegex = /[A-Za-z][A-Za-z0-9_.]{2,}/g
  const pkgMatch = t.match(pkgRegex) || []
  const stopWords = ['http', 'https', 'com', 'cn', 'www', 'api', 'app', 'ios', 'android', 'v1', 'v2', 'bug', 'list', 'detail', 'status', 'type', 'name', 'count', 'rate', 'total', 'sum', 'avg', 'max', 'min']
  const packages = pkgMatch.filter((p) => !stopWords.includes(p.toLowerCase())).slice(0, 3)
  let packageName = packages.length ? packages.join('、') : '（请指定具体包名，如 com.xxx.game）'

  // 识别分析维度
  const dimensionKeywords = ['国家', '地区', '省市', '城市', '渠道', '平台', '版本', '设备', '用户', '性别', '年龄', '新老用户', '用户类型', '流量来源', 'campaign', 'adgroup', 'creative']
  const dimensions = dimensionKeywords.filter((k) => t.toLowerCase().includes(k.toLowerCase()))
  let dimension = dimensions.length ? dimensions.join('、') : '（请指定分析维度，如国家/渠道/版本/用户类型等）'

  // 判断是「查询」还是「定位问题」
  const issueKeywords = ['异常', '下降', '下跌', '暴跌', '飙升', '上涨', '问题', '故障', '骤降', '突增', '突降', '波动', '低了', '高了', '减少', '增加', '下滑']
  const isIssue = issueKeywords.some((k) => t.includes(k))

  if (isIssue) {
    const issuePhrases = []
    for (const kw of issueKeywords) {
      const idx = t.indexOf(kw)
      if (idx >= 0) {
        const start = Math.max(0, idx - 10)
        const end = Math.min(t.length, idx + kw.length + 10)
        issuePhrases.push(t.slice(start, end).replace(/[,，。.!！?？;；]/g, '').trim())
      }
    }
    const phenomenon = issuePhrases.length ? [...new Set(issuePhrases)].join('；') : '（请描述具体异常现象，如 XX 指标较昨日下降 XX%）'
    return `【时间】${time}\n【包名】${packageName}\n【分析维度】${dimension}\n【数据异常现象】${phenomenon}\n\n请帮我定位根因并给出修复建议。`
  } else {
    // 识别查询字段
    const fieldKeywords = ['次留', '7留', '留存', 'DAU', 'MAU', '新增', '激活', '付费', 'ARPU', 'ARPPU', '收入', 'eCPM', 'ecpm', 'CTR', 'ctr', 'CVR', 'cvr', '展示', '点击', '下载', '注册', '转化率', '跳出率', '时长', '会话', 'session', '留存率']
    const fields = fieldKeywords.filter((k) => new RegExp(k, 'i').test(t))
    let queryField = fields.length ? fields.join('、') : '（请指定查询字段，如 DAU/留存率/付费金额 等）'

    // 识别展现形式
    const chartKeywords = ['表格', '柱状图', '折线图', '饼图', '堆叠图', '漏斗图', '散点图', '热力图', '四象限', '矩阵']
    const chartMatch = chartKeywords.find((k) => t.includes(k))
    let displayForm = chartMatch || '表格 + 趋势图（可按需调整）'

    return `【时间】${time}\n【包名】${packageName}\n【分析维度】${dimension}\n【查询字段】${queryField}\n【数据展现形式】${displayForm}\n\n请返回明细结果。`
  }
}

function sendMessage() {
  const text = inputText.value.trim()
  const atts = attachments.value.slice()
  if ((!text && !atts.length) || loading.value) return
  const sess = currentSession.value
  if (!sess) return
  // 组装 blocks：文本 + 附件预览
  const blocks = []
  if (text) blocks.push({ type: 'text', content: text })
  for (const a of atts) {
    if (a.kind === 'image') blocks.push({ type: 'image', url: a.url, name: a.name })
    else blocks.push({ type: 'file', name: a.name, size: a.size })
  }
  sess.messages.push({ id: 'msg_' + (++msgSeq), role: 'user', blocks })
  // 新建会话时，用首条消息文本或首个附件名命名
  if (sess.title === '新会话') {
    const firstLabel = text || (atts[0]?.name || '')
    sess.title = firstLabel.length > 12 ? firstLabel.slice(0, 12) + '…' : firstLabel
  }
  inputText.value = ''
  attachments.value = []
  loading.value = true
  nextTick(scrollToBottom)
  setTimeout(() => {
    const q = text || (atts.length ? `分析附件：${atts.map(a => a.name).join('、')}` : '')
    const startedAt = Date.now()
    const resp = generateMockResponse(q)
    const elapsed = ((Date.now() - startedAt) / 1000 + Math.random() * 2 + 3).toFixed(2)
    sess.messages.push({
      id: 'msg_' + (++msgSeq),
      role: 'ai',
      blocks: resp.blocks,
      elapsed,
      reasoning: buildMockReasoning(q, elapsed)
    })
    loading.value = false
    nextTick(() => { renderCharts(); scrollToBottom() })
  }, 1200)
}

/* ---------- 图表渲染 ---------- */
function renderCharts() {
  nextTick(() => {
    const container = messageListRef.value
    if (!container) return
    // 清理已脱离 DOM 的实例
    chartInstances.forEach((inst, el) => {
      if (!el.isConnected) { inst.dispose(); chartInstances.delete(el) }
    })
    container.querySelectorAll('.ai-chart-box:not([data-init])').forEach((el) => {
      el.setAttribute('data-init', '1')
      const id = el.getAttribute('data-chart-id')
      const opt = chartOptionMap.get(id)
      if (!opt) return
      const inst = echarts.init(el)
      inst.setOption(opt)
      chartInstances.set(el, inst)
    })
  })
}

function scrollToBottom() {
  nextTick(() => {
    const el = messageAreaRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function handleResize() {
  chartInstances.forEach((inst) => inst.resize())
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstances.forEach((inst) => inst.dispose())
  chartInstances.clear()
  chartOptionMap.clear()
  attachments.value.forEach((a) => { if (a.url) URL.revokeObjectURL(a.url) })
})

/* ---------- data-marker 清单 ---------- */
const markerList = [
  { element: '侧边栏整体', marker: 'ai-chat-sidebar', desc: '左侧会话侧边栏容器' },
  { element: '侧边栏头部折叠', marker: 'sidebar-collapse-header', desc: '点击折叠/展开侧边栏' },
  { element: '新对话按钮', marker: 'btn-new-chat', desc: '新建空白会话，重置为欢迎状态' },
  { element: '常看问题菜单', marker: 'menu-common-questions', desc: '展开/收起常看问题列表' },
  { element: '历史记录分组', marker: 'history-group', desc: '历史会话列表区域' },
  { element: '单条历史会话', marker: 'history-item-{id}', desc: '点击切换会话；hover 显示编辑/删除按钮' },
  { element: '重命名按钮', marker: 'history-item-edit-{id}', desc: 'hover 出现；点击进入 inline 重命名输入框' },
  { element: '重命名输入框', marker: 'history-item-rename-input-{id}', desc: '回车/失焦确认；ESC 取消' },
  { element: '侧边栏用户信息', marker: 'sidebar-user-info', desc: '当前登录用户账号信息' },
  { element: '右侧主区域', marker: 'ai-chat-main', desc: '对话主区域容器' },
  { element: '欢迎卡片', marker: 'welcome-card', desc: '初始欢迎卡片，展示助手介绍与使用指引' },
  { element: '消息流列表', marker: 'message-list', desc: '用户与 AI 的问答消息流' },
  { element: '输入操作区', marker: 'chat-input-area', desc: '底部输入与发送区域' },
  { element: '多行输入框', marker: 'chat-input', desc: '问题输入框，支持回车发送' },
  { element: '文件上传按钮', marker: 'btn-upload', desc: '支持 png/jpg/csv/xls/xlsx；也可拖拽文件到输入区' },
  { element: '附件预览区', marker: 'attachment-preview', desc: '已上传附件缩略/文件卡片，每项可 × 移除' },
  { element: '提示词美化按钮', marker: 'btn-beautify', desc: '一键按「时间+包名+分析维度+…」结构化美化输入' },
  { element: '发送按钮', marker: 'btn-send', desc: '无文本且无附件时置灰；点击/回车发送' },
  { element: '底部隐私提示', marker: 'footer-tip', desc: '隐私与敏感数据提示文案' },
  { element: '智能分析过程折叠条', marker: 'reasoning-bar（动态）', desc: 'AI 消息顶部显示「✓ 已完成 智能分析 耗时 Xs」，点击打开右侧侧滑抽屉' },
  { element: '分析过程侧滑抽屉', marker: 'reasoning-drawer', desc: '展示意图识别→数据源路由→SQL 执行→归因分析→图表渲染等内部步骤' }
]
</script>

<style scoped>
.ai-chat-page {
  height: calc(100vh - 48px);
  display: flex;
  gap: 16px;
}

/* ===== 左侧侧边栏 ===== */
.chat-sidebar {
  flex: 0 0 240px;
  width: 240px;
  max-width: 300px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: flex-basis 0.2s, width 0.2s, max-width 0.2s;
}
.chat-sidebar.collapsed {
  flex: 0 0 56px;
  width: 56px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  user-select: none;
}
.header-icon { font-size: 16px; }
.header-title { font-size: 15px; font-weight: 600; color: #1f2937; flex: 1; }
.collapse-arrow { font-size: 12px; color: #9ca3af; transition: transform 0.2s; }
.collapse-arrow.rotated { transform: rotate(180deg); }

.sidebar-body { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; }

.new-chat-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 8px 12px; border: 1px dashed #1677ff; border-radius: 6px;
  background: #eef5ff; color: #1677ff; font-size: 14px; cursor: pointer; transition: all 0.2s;
}
.new-chat-btn:hover { background: #1677ff; color: #fff; border-style: solid; }
.new-chat-btn .plus { font-size: 16px; line-height: 1; }

.common-questions { border: 1px solid #f0f0f0; border-radius: 6px; overflow: hidden; }
.cq-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; background: #fafafa; font-size: 13px; color: #4b5563; cursor: pointer;
}
.cq-arrow { transition: transform 0.2s; color: #9ca3af; }
.cq-arrow.open { transform: rotate(90deg); }
.cq-list { padding: 4px 0; }
.cq-item {
  padding: 6px 12px; font-size: 12px; color: #6b7280; cursor: pointer; line-height: 1.5;
}
.cq-item:hover { background: #f5faff; color: #1677ff; }

.history-section { display: flex; flex-direction: column; gap: 4px; }
.history-title { font-size: 13px; font-weight: 600; color: #1f2937; padding: 0 4px; }
.history-group-label { font-size: 12px; color: #9ca3af; padding: 0 4px; }
.history-list { display: flex; flex-direction: column; gap: 2px; }
.history-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 10px; border-radius: 6px; font-size: 13px; color: #374151;
  cursor: pointer; transition: background 0.2s;
}
.history-item:hover { background: #f5faff; }
.history-item.active { background: #e6f0ff; color: #1677ff; }
.hi-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hi-actions { display: none; align-items: center; gap: 4px; margin-left: 4px; flex-shrink: 0; }
.history-item:hover .hi-actions { display: flex; }
.history-item.active .hi-actions { display: flex; }
.hi-edit, .hi-del {
  width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 4px;
  font-size: 13px; cursor: pointer; transition: background 0.15s, color 0.15s;
  color: #9ca3af;
}
.hi-edit:hover { background: #e6f0ff; color: #1677ff; }
.hi-del:hover { background: #fee; color: #ef4444; }
.hi-input {
  flex: 1; min-width: 0; padding: 2px 8px; border: 1px solid #1677ff; border-radius: 4px;
  font-size: 13px; outline: none; background: #fff; color: #1f2937;
}

.sidebar-footer {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-top: 1px solid #f0f0f0;
}
.avatar {
  width: 32px; height: 32px; border-radius: 50%; background: #eef0f4;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.user-name { font-size: 13px; font-weight: 500; color: #1f2937; }
.user-role { font-size: 12px; color: #9ca3af; }

/* ===== 右侧主区域 ===== */
.chat-main {
  flex: 3 1 0;
  min-width: 0;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: visible;
}
.main-topbar {
  padding: 12px 20px; border-bottom: 1px solid #f0f0f0;
  display: flex; align-items: center; justify-content: flex-end;
}
.main-title { font-size: 16px; font-weight: 600; color: #1f2937; }

.message-area { flex: 1; overflow-y: auto; padding: 20px; }

/* 欢迎卡片 */
.welcome-card {
  max-width: 760px; margin: 24px auto; background: #fff; border: 1px solid #eef0f4;
  border-radius: 8px; padding: 28px 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.wc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.wc-icon {
  width: 44px; height: 44px; border-radius: 50%; background: #e8f8ee;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.wc-title { font-size: 18px; font-weight: 600; color: #1f2937; }
.wc-guide { font-size: 13px; color: #6b7280; margin-bottom: 16px; line-height: 1.8; }
.wc-guide p { margin: 0 0 8px; }
.wc-guide code {
  background: #eef2f7; padding: 1px 6px; border-radius: 4px;
  font-size: 12px; color: #1677ff; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.wc-guide strong { color: #1f2937; font-weight: 600; }
.wc-tip { margin: 6px 0; color: #4b5563; }
.wc-footer { margin-top: 10px; color: #9ca3af; }
.wc-questions { display: flex; flex-direction: column; gap: 8px; }
.wc-q {
  display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px;
  border: 1px solid #eef0f4; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.wc-q:hover { border-color: #1677ff; background: #f5faff; }
.wc-q-num {
  flex: 0 0 20px; width: 20px; height: 20px; line-height: 20px; text-align: center;
  border-radius: 50%; background: #1677ff; color: #fff; font-size: 12px;
}
.wc-q-text { font-size: 13px; color: #374151; line-height: 1.6; }

/* 消息流 */
.message-list { display: flex; flex-direction: column; gap: 20px; }
.message-row { display: flex; gap: 10px; }
.message-row.user { flex-direction: row-reverse; }
.message-avatar {
  flex: 0 0 32px; width: 32px; height: 32px; border-radius: 50%;
  background: #f0f2f5; display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.message-bubble {
  max-width: 75%; padding: 12px 16px; border-radius: 8px; font-size: 14px; line-height: 1.7;
  word-break: break-word;
}
.message-row.ai .message-bubble { background: #f7f8fa; color: #1f2937; border: 1px solid #eef0f4; }
.message-row.user .message-bubble { background: #1677ff; color: #fff; }

/* AI 消息顶部的分析过程折叠条 */
.reasoning-bar {
  display: flex; align-items: center; gap: 8px;
  margin: -12px -16px 10px; padding: 8px 12px;
  background: #fff; border-bottom: 1px solid #eef0f4; border-radius: 8px 8px 0 0;
  cursor: pointer; user-select: none; font-size: 12px; color: #4b5563;
  transition: background 0.2s;
}
.reasoning-bar:hover { background: #f5faff; }
.reasoning-status { color: #52c41a; font-weight: 600; }
.reasoning-label { color: #1f2937; font-weight: 600; }
.reasoning-time { color: #9ca3af; margin-left: 4px; }
.reasoning-arrow { margin-left: auto; color: #9ca3af; font-size: 16px; transition: transform 0.2s; }
.reasoning-arrow.open { transform: rotate(90deg); }

/* 侧滑抽屉内部 */
.reasoning-drawer { display: flex; flex-direction: column; gap: 16px; }
.rd-header { display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.rd-status { color: #52c41a; font-weight: 600; font-size: 13px; }
.rd-time { color: #9ca3af; font-size: 12px; }
.rd-question { padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #1677ff; }
.rd-q-label { font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.rd-q-text { font-size: 13px; color: #1f2937; line-height: 1.6; word-break: break-word; }
.rd-steps { display: flex; flex-direction: column; gap: 10px; }
.rd-step { border: 1px solid #eef0f4; border-radius: 6px; overflow: hidden; }
.rd-step.done { border-color: #e6ffed; }
.rd-step-head {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #fafafa;
  font-size: 13px;
}
.rd-step.done .rd-step-head { background: #f6ffed; }
.rd-step-num {
  width: 20px; height: 20px; line-height: 20px; text-align: center;
  border-radius: 50%; background: #e5e7eb; color: #6b7280; font-size: 11px; font-weight: 600;
}
.rd-step.done .rd-step-num { background: #52c41a; color: #fff; }
.rd-step-title { flex: 1; font-weight: 600; color: #1f2937; }
.rd-step-status { color: #52c41a; font-weight: 600; }
.rd-step-desc { padding: 6px 12px; font-size: 12px; color: #6b7280; line-height: 1.6; }
.rd-step-code {
  margin: 0; padding: 10px 12px; background: #1e293b; color: #e2e8f0;
  font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  overflow-x: auto; white-space: pre-wrap; word-break: break-all; line-height: 1.6;
}
.rd-step-code pre { margin: 0; }
.rd-step-code code { background: transparent; padding: 0; }
.block-text { white-space: pre-wrap; }
.block-text + .block-table, .block-text + .block-chart,
.block-table + .block-chart { margin-top: 12px; }

.block-table { overflow-x: auto; }
.block-table table { border-collapse: collapse; width: 100%; font-size: 13px; }
.message-row.user .block-table { color: #1f2937; }
.block-table th, .block-table td {
  border: 1px solid #e5e7eb; padding: 6px 12px; text-align: left; white-space: nowrap;
}
.block-table th { background: #fafafa; font-weight: 600; color: #374151; }
.block-table td { color: #4b5563; }

.block-chart { margin-top: 12px; }
.ai-chart-box { width: 100%; height: 320px; }

.loading-bubble { display: flex; align-items: center; gap: 4px; }
.dot {
  width: 6px; height: 6px; border-radius: 50%; background: #9ca3af;
  animation: dot-blink 1.2s infinite ease-in-out both;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

/* 输入区 */
.input-area {
  margin: 0 20px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: #fff; display: flex; flex-direction: column; overflow: visible;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-area:focus-within { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,0.1); }
.chat-input {
  flex: 0 0 auto; width: 100%; border: none; outline: none; resize: vertical;
  min-height: 72px; max-height: 320px; height: 72px;
  padding: 12px 110px 12px 14px; font-size: 14px; line-height: 1.7;
  background: transparent; color: #1f2937; font-family: inherit;
  overflow-y: auto; box-sizing: border-box;
  cursor: text;
}
.chat-input::placeholder { color: #9ca3af; }
.input-toolbar {
  display: flex; align-items: center; gap: 6px; padding: 4px 10px 8px; flex-shrink: 0;
}
.upload-btn {
  width: 32px; height: 32px; border: none; border-radius: 6px; background: #f6ffed;
  color: #52c41a; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.upload-btn:hover { background: #e6ffd4; color: #389e0d; }
.beautify-btn {
  width: 32px; height: 32px; border: none; border-radius: 6px; background: #f0f5ff;
  color: #1677ff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.beautify-btn:hover:not(:disabled) { background: #e6f0ff; color: #4096ff; }
.beautify-btn:disabled { background: #f5f5f5; color: #bfbfbf; cursor: not-allowed; }
.send-btn {
  width: 34px; height: 34px; border: none; border-radius: 6px; background: #1677ff;
  color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.send-btn:hover:not(:disabled) { background: #4096ff; }
.send-btn:disabled { background: #d1d5db; cursor: not-allowed; }
.send-arrow { display: inline-block; transform: rotate(-90deg); font-size: 14px; }

/* 拖拽高亮 */
.input-area[data-marker*='dragover'] { border-color: #1677ff; background: #f0f5ff; outline: 2px dashed #1677ff; outline-offset: -4px; }

/* 附件预览 */
.attachment-preview {
  display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 12px 4px; border-bottom: 1px solid #f0f0f0;
}
.attachment-item {
  position: relative; display: flex; align-items: center; gap: 8px;
  padding: 6px 24px 6px 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fafafa;
  max-width: 200px;
}
.att-img { width: 56px; height: 56px; object-fit: cover; border-radius: 4px; }
.att-file { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.att-file-icon { font-size: 18px; }
.att-file-name { font-size: 12px; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
.att-file-size { font-size: 11px; color: #9ca3af; }
.att-remove {
  position: absolute; top: 2px; right: 4px; width: 18px; height: 18px; line-height: 16px;
  text-align: center; border-radius: 50%; font-size: 14px; color: #9ca3af;
  cursor: pointer; background: rgba(255,255,255,0.9);
}
.att-remove:hover { background: #fee; color: #ef4444; }

/* 消息块中的附件渲染 */
.block-image { margin-top: 8px; }
.block-image .msg-img { max-width: 240px; max-height: 240px; border-radius: 6px; border: 1px solid #e5e7eb; }
.block-file {
  display: flex; align-items: center; gap: 8px; margin-top: 8px;
  padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fafafa;
}
.msg-file-icon { font-size: 20px; }
.msg-file-name { font-size: 13px; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
.msg-file-size { font-size: 12px; color: #9ca3af; }

.footer-tip { padding: 8px 20px 12px; font-size: 12px; color: #9ca3af; }

/* data-marker 清单 */
.marker-details {
  margin: 0 20px 16px; border: 1px solid #eef0f4; border-radius: 6px; background: #fafafa;
}
.marker-details > summary {
  padding: 8px 12px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer;
  list-style: none;
}
.marker-details > summary::-webkit-details-marker { display: none; }
.marker-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.marker-table th, .marker-table td {
  border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left;
}
.marker-table th { background: #f0f2f5; color: #374151; }
.marker-table td { color: #6b7280; }
</style>
