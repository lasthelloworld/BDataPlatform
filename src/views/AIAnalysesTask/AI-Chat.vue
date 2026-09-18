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
      <!-- 对话区顶部工具栏 -->
      <header class="chat-topbar" data-marker="chat-top-toolbar">
        <button
          class="chat-topbar-btn"
          type="button"
          title="对话大纲"
          data-marker="btn-chat-outline"
          @click="outlineVisible = true"
        >
          <svg viewBox="0 0 1126 1024" width="20" height="20" fill="currentColor">
            <path d="M142.2336 0a142.2336 142.2336 0 0 1 56.8832 272.5888v210.944H312.832c15.7184 0 28.4672 12.8 28.4672 28.4672v56.8832a28.4672 28.4672 0 0 1-28.4672 28.4672H199.168v263.1168c0 16.5376 3.4304 31.488 8.704 42.0864l2.048 3.6864a34.0992 34.0992 0 0 0 1.8944 2.9184l0.8704 1.024H312.832c15.7184 0 28.4672 12.8 28.4672 28.4672v56.8832A28.4672 28.4672 0 0 1 312.832 1024H207.2576c-72.8064 0-119.3984-73.2672-121.856-156.7744l-0.0512-6.7584V272.5888A142.2336 142.2336 0 0 1 142.1824 0z m886.9888 853.3504a51.2 51.2 0 0 1 51.2 51.2V972.8a51.2 51.2 0 0 1-51.2 51.2h-466.432a51.2 51.2 0 0 1-51.2-51.2v-68.2496a51.2 51.2 0 0 1 51.2-51.2h466.432z m0-398.2336a51.2 51.2 0 0 1 51.2 51.2v68.2496a51.2 51.2 0 0 1-51.2 51.2h-466.432a51.2 51.2 0 0 1-51.2-51.2V506.368a51.2 51.2 0 0 1 51.2-51.2h466.432z m0-398.2336a51.2 51.2 0 0 1 51.2 51.2v68.2496a51.2 51.2 0 0 1-51.2 51.2h-466.432a51.2 51.2 0 0 1-51.2-51.2V108.0832a51.2 51.2 0 0 1 51.2-51.2h466.432z"/>
          </svg>
        </button>
      </header>

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
            :class="[msg.role, { 'msg-highlight': highlightMsgId === msg.id }]"
            :data-msg-id="msg.id"
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
              <!-- 单条回答操作栏 -->
              <div v-if="msg.role === 'ai'" class="msg-actions" data-marker="msg-feedback">
                <button class="ma-btn" data-marker="msg-copy" title="复制" @click="copyAnswer(msg)">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>复制</span>
                </button>
                <button class="ma-btn" data-marker="msg-share" title="分享" @click="shareAnswer(msg)">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  <span>分享</span>
                </button>
                <a-dropdown :trigger="['click']" placement="topLeft">
                  <button class="ma-btn ma-icon-btn" data-marker="msg-more" title="更多">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="5" cy="12" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="19" cy="12" r="1.6"></circle></svg>
                  </button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="regenerate" data-marker="msg-regenerate" @click="regenerateAnswer(msg)">🔄 重新生成</a-menu-item>
                      <a-menu-item key="report" data-marker="msg-report" @click="reportAnswer(msg)">⚠️ 报告问题</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>

                <span class="ma-divider"></span>

                <button
                  class="ma-icon-btn"
                  :class="{ active: msg.feedback === 'up' }"
                  title="有帮助"
                  data-marker="msg-feedback-up"
                  @click="setFeedback(msg, 'up')"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3z"></path><path d="M7 10l4.5-7.5a2 2 0 0 1 3.6 1.7L14 8h5.2a2 2 0 0 1 1.96 2.4l-1.3 6.5A2 2 0 0 1 17.9 18.6H7"></path></svg>
                </button>

                <a-popover
                  v-model:open="msg.feedbackPopOpen"
                  trigger="click"
                  placement="topLeft"
                  :overlay-style="{ padding: 0 }"
                  overlay-class-name="fb-popover"
                >
                  <button
                    class="ma-icon-btn"
                    :class="{ active: msg.feedback === 'down' }"
                    title="没帮助"
                    data-marker="msg-feedback-down"
                  >
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3z"></path><path d="M17 14l-4.5 7.5a2 2 0 0 1-3.6-1.7L10 16H4.8a2 2 0 0 1-1.96-2.4l1.3-6.5A2 2 0 0 1 6.1 5.4H17"></path></svg>
                  </button>
                  <template #content>
                    <div class="fb-pop" data-marker="msg-feedback-panel">
                      <div class="fb-head">
                        <span class="fb-title">反馈提交</span>
                        <button class="fb-close" data-marker="msg-feedback-close" @click="msg.feedbackPopOpen = false">×</button>
                      </div>
                      <div class="fb-tip">请选择理由帮助我们做的更好:</div>
                      <div class="fb-chips" data-marker="msg-feedback-reasons">
                        <button
                          v-for="r in feedbackReasonOptions"
                          :key="r"
                          type="button"
                          class="fb-chip"
                          :class="{ active: (msg.feedbackReasons || []).includes(r) }"
                          :data-marker="'msg-feedback-reason-' + r"
                          @click="toggleFeedbackReason(msg, r)"
                        >{{ r }}</button>
                      </div>
                      <textarea
                        v-model="msg.feedbackComment"
                        class="fb-textarea"
                        placeholder="我们想知道您对此回答的哪个部分不满意，您认为更好的回答是什么?"
                        rows="6"
                        maxlength="300"
                        data-marker="msg-feedback-comment"
                      ></textarea>
                      <div class="fb-foot">
                        <button class="fb-btn" data-marker="msg-feedback-clear" @click="clearFeedbackDraft(msg)">清空</button>
                        <button
                          class="fb-btn fb-btn-primary"
                          :disabled="!(msg.feedbackReasons && msg.feedbackReasons.length)"
                          data-marker="msg-feedback-confirm"
                          @click="submitFeedback(msg)"
                        >确定</button>
                      </div>
                    </div>
                  </template>
                </a-popover>

                <span class="ma-time">{{ msg.time }}</span>
              </div>
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

      <!-- 推荐示例上滑面板 -->
      <div
        class="reco-panel"
        :class="{ open: recommendPanelOpen }"
        data-marker="recommend-panel"
      >
        <div class="reco-panel-inner">
          <div class="reco-panel-title">
            <span class="reco-panel-line"></span>
            <span class="reco-panel-text">推荐示例</span>
            <span class="reco-panel-line"></span>
          </div>
          <div class="reco-grid">
            <div
              v-for="(item, i) in featuredExamples"
              :key="i"
              class="reco-tile"
              :class="'reco-tile-' + item.theme"
              :data-marker="'recommend-tile-' + i"
              @click="openRecoDetail(item)"
            >
              <span class="reco-tile-icon">
                <svg v-if="item.icon === 'chart'" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>
                </svg>
                <svg v-else-if="item.icon === 'debug'" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <!-- 放大镜 -->
                  <circle cx="10" cy="10" r="6.5"/>
                  <path d="M15 15l6 6"/>
                  <!-- 镜片内的扳手（问题排查） -->
                  <g transform="translate(4.96,4.96) scale(0.42)">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </g>
                </svg>
                <svg v-else-if="item.icon === 'trend'" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15l4-4 3 3 5-6"/>
                </svg>
                <svg v-else-if="item.icon === 'pie'" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
                </svg>
                <svg v-else-if="item.icon === 'wallet'" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4z"/>
                </svg>
              </span>
              <div class="reco-tile-body">
                <div class="reco-tile-title">{{ item.title }}</div>
                <div class="reco-tile-desc">{{ item.desc }}</div>
              </div>
            </div>
            <!-- 查看全部入口 -->
            <div
              v-if="recommendExamples.length > featuredExamples.length"
              class="reco-tile reco-tile-more"
              data-marker="recommend-library-open"
              @click="openLibrary"
            >
              <span class="reco-tile-more-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14.5v6M14.5 17.5h6"/>
                </svg>
              </span>
              <div class="reco-tile-body">
                <div class="reco-tile-title">查看全部示例</div>
                <div class="reco-tile-desc">共 {{ recommendExamples.length }} 个分析场景，支持分类与搜索</div>
              </div>
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
        <!-- 顶部工具栏 -->
        <div class="input-toolbar-top" data-marker="input-toolbar-top">
          <button
            class="spec-btn"
            data-marker="btn-recommend-examples"
            @click="toggleRecommendPanel"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <!-- 圆角方框 -->
              <rect x="3" y="3" width="18" height="18" rx="4"/>
              <!-- 打开的书本 -->
              <path d="M12 8.2c-1.3-1-2.9-1.4-4.5-1.2v8.6c1.6-.2 3.2.2 4.5 1.2"/>
              <path d="M12 8.2c1.3-1 2.9-1.4 4.5-1.2v8.6c-1.6-.2-3.2.2-4.5 1.2"/>
            </svg>
            推荐示例
          </button>
          <button
            class="spec-btn"
            data-marker="btn-spec-examples"
            @click="specModalVisible = true"
          >
            <svg viewBox="0 0 1024 1024" width="15" height="15" fill="currentColor">
              <path d="M553.358222 154.282667v81.351111H181.020444a41.016889 41.016889 0 0 0-41.358222 40.561778v569.002666a40.96 40.96 0 0 0 41.358222 40.618667h579.242667c22.812444-0.056889 41.301333-18.204444 41.358222-40.618667V519.964444h82.773334v325.176889c0 67.356444-55.580444 121.912889-124.131556 121.912889H181.020444C112.469333 967.111111 56.888889 912.497778 56.888889 845.198222V276.195556c0-67.299556 55.580444-121.912889 124.131555-121.912889h372.337778z m267.605334 272.042666l10.24-22.983111a178.915556 178.915556 0 0 1 91.818666-91.420444l31.402667-13.767111A21.560889 21.560889 0 0 0 967.111111 278.584889a21.560889 21.560889 0 0 0-12.686222-19.569778l-29.696-12.970667a178.858667 178.858667 0 0 1-93.127111-94.492444l-10.524445-24.860444A20.992 20.992 0 0 0 801.621333 113.777778c-8.533333 0-16.213333 5.12-19.456 12.913778l-10.524444 24.803555a178.858667 178.858667 0 0 1-93.070222 94.549333l-29.696 12.970667a21.560889 21.560889 0 0 0-12.686223 19.569778c0 8.419556 4.949333 16.042667 12.686223 19.569778l31.402666 13.710222c41.187556 18.147556 73.955556 50.744889 91.875556 91.420444l10.183111 23.04c7.395556 16.839111 31.118222 16.839111 38.684444 0z m-140.515556-30.435555v100.465778H531.456v297.756444H430.990222V496.355556H282.168889V395.946667h398.222222z"/>
            </svg>
            示范
          </button>
        </div>

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
          <label class="upload-btn" data-marker="btn-upload" title="上传图片或 Excel 文件">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <!-- 托盘（顶部中间留口） -->
              <path d="M7.5 10H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-3.5"/>
              <!-- 向上箭头 -->
              <path d="M12 17V4"/>
              <path d="M7 9l5-5 5 5"/>
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

      <!-- 对话大纲侧滑抽屉 -->
      <a-drawer
        v-model:open="outlineVisible"
        title="对话大纲"
        placement="right"
        :width="380"
        :footer="null"
        :closable="true"
        data-marker="outline-drawer"
      >
        <div class="outline-wrap">
          <div
            v-if="!outlineUserTurns.length && !outlineFiles.length"
            class="outline-empty"
          >
            <div class="outline-empty-icon">🗂️</div>
            <div>暂无对话内容</div>
            <div class="outline-empty-sub">开始提问后，这里会自动生成提问、系统输出与文件记录大纲</div>
          </div>

          <template v-else>
            <!-- （1）用户对话记录大纲 -->
            <section class="ol-section" data-marker="outline-section-user">
              <div class="ol-section-head">
                <span class="ol-section-title">用户提问</span>
                <span class="ol-section-count">{{ outlineUserTurns.length }}</span>
              </div>
              <ul v-if="outlineUserTurns.length" class="ol-list">
                <li
                  v-for="t in outlineUserTurns"
                  :key="t.id"
                  class="ol-item"
                  data-marker="outline-user-item"
                  @click="scrollToMessage(t.id)"
                >
                  <span class="ol-item-index">{{ t.index }}</span>
                  <div class="ol-item-body">
                    <div class="ol-item-text" :title="t.text">{{ t.text }}</div>
                    <div class="ol-item-meta">
                      <span>{{ t.time }}</span>
                      <span v-if="t.files.length" class="ol-item-files">📎 {{ t.files.length }} 个附件</span>
                    </div>
                  </div>
                </li>
              </ul>
              <div v-else class="ol-section-empty">暂无提问记录</div>
            </section>

            <!-- （2）系统输出大纲 -->
            <section class="ol-section" data-marker="outline-section-ai">
              <div class="ol-section-head">
                <span class="ol-section-title">系统输出</span>
                <span class="ol-section-count">{{ outlineAiTurns.length }}</span>
              </div>
              <ul v-if="outlineAiTurns.length" class="ol-list">
                <li
                  v-for="t in outlineAiTurns"
                  :key="t.id"
                  class="ol-item"
                  data-marker="outline-ai-item"
                  @click="scrollToMessage(t.id)"
                >
                  <span class="ol-item-index ai">{{ t.index }}</span>
                  <div class="ol-item-body">
                    <div class="ol-item-tags">
                      <span v-if="t.counts.text" class="ol-tag">文本 ×{{ t.counts.text }}</span>
                      <span v-if="t.counts.table" class="ol-tag">表格 ×{{ t.counts.table }}</span>
                      <span v-if="t.counts.chart" class="ol-tag">图表 ×{{ t.counts.chart }}</span>
                    </div>
                    <div v-if="t.summary" class="ol-item-summary" :title="t.summary">{{ t.summary }}</div>
                    <div class="ol-item-meta">
                      <span>{{ t.time }}</span>
                      <span v-if="t.elapsed">耗时 {{ t.elapsed }}s</span>
                    </div>
                  </div>
                </li>
              </ul>
              <div v-else class="ol-section-empty">暂无系统输出</div>
            </section>

            <!-- （3）文件记录 -->
            <section class="ol-section" data-marker="outline-section-files">
              <div class="ol-section-head">
                <span class="ol-section-title">文件记录</span>
                <span class="ol-section-count">{{ outlineFiles.length }}</span>
              </div>
              <ul v-if="outlineFiles.length" class="ol-file-list">
                <li
                  v-for="f in outlineFiles"
                  :key="f.key"
                  class="ol-file"
                  :class="{ pending: f.pending }"
                  data-marker="outline-file-item"
                  @click="scrollToMessage(f.msgId)"
                >
                  <span class="ol-file-icon">{{ f.kind === '图片' ? '🖼️' : '📄' }}</span>
                  <div class="ol-file-body">
                    <div class="ol-file-name" :title="f.name">{{ f.name }}</div>
                    <div class="ol-file-meta">
                      <span>{{ f.kind }}</span>
                      <span v-if="f.size">{{ f.size }}</span>
                      <span>{{ f.turnLabel }}</span>
                    </div>
                  </div>
                  <span v-if="f.pending" class="ol-file-badge">待发送</span>
                </li>
              </ul>
              <div v-else class="ol-section-empty">对话中暂无文件，可在输入框上传图片或 Excel</div>
            </section>
          </template>
        </div>
      </a-drawer>

      <!-- 离开会话评分弹框 -->
      <a-modal
        v-model:open="ratingVisible"
        :width="520"
        :footer="null"
        :closable="true"
        :mask-closable="false"
        :destroy-on-close="true"
        data-marker="rating-modal"
        @cancel="snoozeAndLeave"
      >
        <!-- 星级打分 + 备注 -->
        <div v-if="ratingStep === 'score'" class="rt-score" data-marker="rating-step-score">
          <div class="rt-header">
            <div class="rt-title">为本次数据分析打分</div>
            <div class="rt-subtitle">请对以下三个维度分别打星，您的评分将帮助 Hopemobi Mind 持续改进</div>
          </div>

          <div
            v-for="dim in ratingDims"
            :key="dim.key"
            class="rt-dim"
            :data-marker="'rating-dim-' + dim.key"
          >
            <div class="rt-dim-head">
              <span class="rt-dim-name">{{ dim.name }}</span>
              <span class="rt-dim-tip">{{ dim.tip }}</span>
            </div>
            <a-rate
              v-model:value="ratingForm[dim.key]"
              class="rt-stars"
              :data-marker="'rating-stars-' + dim.key"
            />
          </div>

          <div class="rt-total">
            <span class="rt-total-label">当前评分</span>
            <span class="rt-total-value">{{ ratingTotal }}</span>
            <span class="rt-total-max">/ 15 分</span>
            <span class="rt-total-hint">（每个维度 1~5 星，共三个维度）</span>
          </div>

          <div class="rt-reason-wrap" data-marker="rating-reasons-wrap">
            <div class="rt-reason-label">问题原因<span class="rt-reason-optional">（选填，可多选）</span></div>
            <a-checkbox-group
              v-model:value="ratingReasons"
              :options="ratingReasonOptions"
              class="rt-reason-group"
              data-marker="rating-reasons"
            />
          </div>

          <div class="rt-comment-wrap" data-marker="rating-comment-wrap">
            <div class="rt-comment-label">备注</div>
            <a-textarea
              v-model:value="ratingComment"
              class="rt-comment"
              placeholder="补充说明或具体问题（选填）"
              :rows="3"
              :maxlength="300"
              show-count
              data-marker="rating-comment"
            />
          </div>

          <div class="rt-actions">
            <a-button data-marker="rating-later" @click="snoozeAndLeave">稍后评价</a-button>
            <a-button
              type="primary"
              :disabled="!ratingCanSubmit"
              data-marker="rating-submit"
              @click="submitScores"
            >提交评分</a-button>
          </div>
        </div>

        <!-- 感谢 -->
        <div v-else class="rt-thanks" data-marker="rating-step-thanks">
          <div class="rt-thanks-icon">🙏</div>
          <div class="rt-thanks-title">感谢您的反馈！</div>
          <div class="rt-thanks-sub">本次评分 <b>{{ lastRatingTotal }}</b> / 15 分，我们已记录</div>
          <a-button type="primary" data-marker="rating-finish" @click="finishRating">完成</a-button>
        </div>
      </a-modal>

      <!-- 规范示例弹窗 -->
      <a-modal
        v-model:open="specModalVisible"
        title="规范示例"
        :width="780"
        :footer="null"
        :closable="true"
        :mask-closable="true"
        data-marker="spec-modal"
      >
        <div class="spec-list">
          <div
            v-for="(item, i) in specExamples"
            :key="i"
            class="spec-card"
          >
            <div class="spec-card-head">
              <span class="spec-card-title">{{ item.title }}</span>
              <span class="spec-card-toggle" @click="item.expanded = !item.expanded">
                {{ item.expanded ? '收起' : '展开' }}
              </span>
            </div>
            <div v-if="item.expanded" class="spec-card-body">
              <div class="spec-cols">
                <div class="spec-col">
                  <div class="spec-col-label">不规范</div>
                  <div class="spec-bad">{{ item.bad }}</div>
                </div>
                <div class="spec-col">
                  <div class="spec-col-label">规范</div>
                  <div class="spec-good">{{ item.good || '（该案例未提供规范示例）' }}</div>
                </div>
              </div>
              <div class="spec-explain-label" @click="item.showExplain = !item.showExplain">
                {{ item.showExplain ? '收起错误说明' : '查看错误说明' }}
              </div>
              <div v-if="item.showExplain" class="spec-explain">
                <div class="spec-explain-item">
                  <span class="explain-tag">错误示例:</span>
                  <span class="explain-text">{{ item.badExplain }}</span>
                </div>
                <div class="spec-explain-item">
                  <span class="explain-tag">正确规范:</span>
                  <span class="explain-text">{{ item.goodExplain }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-modal>

      <!-- 推荐示例·全量示例库弹窗 -->
      <a-modal
        v-model:open="libraryVisible"
        title="全部推荐示例"
        :width="880"
        :footer="null"
        :closable="true"
        :mask-closable="true"
        data-marker="recommend-library-modal"
      >
        <div class="lib-body">
          <!-- 左侧分类 -->
          <aside class="lib-aside">
            <div
              class="lib-cat"
              :class="{ active: activeCategory === '全部' }"
              data-marker="lib-cat-all"
              @click="activeCategory = '全部'"
            >
              <span>全部</span><span class="lib-cat-count">{{ recommendExamples.length }}</span>
            </div>
            <div
              v-for="cat in categories"
              :key="cat.name"
              class="lib-cat"
              :class="{ active: activeCategory === cat.name }"
              :data-marker="'lib-cat-' + cat.name"
              @click="activeCategory = cat.name"
            >
              <span>{{ cat.name }}</span><span class="lib-cat-count">{{ cat.count }}</span>
            </div>
          </aside>
          <!-- 右侧列表 -->
          <section class="lib-main">
            <div class="lib-search">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
              <input
                v-model="libKeyword"
                class="lib-search-input"
                placeholder="搜索场景名称、描述或关键词"
                data-marker="lib-search"
              />
            </div>
            <div class="lib-list">
              <div
                v-for="(item, i) in filteredExamples"
                :key="i"
                class="lib-row"
                :data-marker="'lib-row-' + i"
                @click="openRecoDetail(item)"
              >
                <span class="lib-row-icon" :class="'lib-icon-' + item.theme">
                  <svg v-if="item.icon === 'chart'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>
                  </svg>
                  <svg v-else-if="item.icon === 'debug'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="10" cy="10" r="6.5"/><path d="M15 15l6 6"/>
                  </svg>
                  <svg v-else-if="item.icon === 'trend'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15l4-4 3 3 5-6"/>
                  </svg>
                  <svg v-else-if="item.icon === 'pie'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
                  </svg>
                </span>
                <div class="lib-row-body">
                  <div class="lib-row-title">{{ item.title }}</div>
                  <div class="lib-row-desc">{{ item.desc }}</div>
                </div>
                <span class="lib-row-cat">{{ item.category }}</span>
                <span class="lib-row-arrow">›</span>
              </div>
              <div v-if="filteredExamples.length === 0" class="lib-empty">未找到匹配的示例，换个关键词试试</div>
            </div>
          </section>
        </div>
      </a-modal>

      <!-- 推荐示例·AI 对话详情弹窗 -->
      <a-modal
        v-model:open="recoDetailVisible"
        :title="currentReco ? currentReco.title : 'AI 对话示例'"
        :width="780"
        :footer="null"
        :closable="true"
        :mask-closable="true"
        wrap-class-name="reco-detail-wrap"
        data-marker="recommend-detail-modal"
      >
        <div v-if="currentReco" class="reco-chat-dialog">
          <div class="rcd-scroll">
          <div
            v-for="(round, ri) in currentReco.rounds"
            :key="ri"
            class="rcd-round"
          >
            <!-- 用户轮次 -->
            <div v-if="round.role === 'user'" class="rcd-row rcd-row-user">
              <span class="rcd-user-name">我</span>
              <div class="rcd-bubble rcd-bubble-user">{{ round.text }}</div>
            </div>
            <!-- AI 轮次 -->
            <div v-else class="rcd-row rcd-row-ai">
              <span class="rcd-ai-avatar">🤖</span>
              <div class="rcd-bubble rcd-bubble-ai">
                <p v-for="(line, li) in round.lines" :key="li" class="rcd-line">{{ line }}</p>
                <div v-if="round.table" class="rcd-table-wrap">
                  <table class="rcd-table">
                    <thead>
                      <tr>
                        <th v-for="(col, ci) in round.table.columns" :key="ci" :title="col.tip || col.label">{{ col.label }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rwi) in round.table.rows" :key="rwi">
                        <td v-for="(cell, rci) in row" :key="rci" :class="{ 'rcd-warn': round.table.warnCols && round.table.warnCols.includes(rci) }">{{ cell }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="round.note" class="rcd-note">{{ round.note }}</div>
              </div>
            </div>
          </div>
          </div>
          <div class="rcd-footer">
            <span class="rcd-tip">点击下方按钮，将首轮提问填入输入框（不会自动发送）</span>
            <button class="rcd-use-btn" data-marker="recommend-detail-use" @click="useRecommendQuestion(currentReco.question)">
              使用此提问 ↵
            </button>
          </div>
        </div>
      </a-modal>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import * as echarts from 'echarts'
import { message } from 'ant-design-vue'

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
const specModalVisible = ref(false)
const recommendPanelOpen = ref(true)

function toggleRecommendPanel() {
  recommendPanelOpen.value = !recommendPanelOpen.value
}

const recoDetailVisible = ref(false)
const currentReco = ref(null)

/* 全量示例库 */
const libraryVisible = ref(false)
const activeCategory = ref('全部')
const libKeyword = ref('')

function openLibrary() {
  activeCategory.value = '全部'
  libKeyword.value = ''
  libraryVisible.value = true
}

function openRecoDetail(item) {
  currentReco.value = item
  recoDetailVisible.value = true
}

/* 面板精选：按 hot 升序取前 3 个（第 4 格固定为「查看全部」入口） */
const featuredExamples = computed(() =>
  [...recommendExamples].sort((a, b) => (a.hot ?? 99) - (b.hot ?? 99)).slice(0, 3)
)

/* 分类聚合（按首次出现顺序） */
const categories = computed(() => {
  const map = new Map()
  recommendExamples.forEach(item => {
    map.set(item.category, (map.get(item.category) || 0) + 1)
  })
  return Array.from(map, ([name, count]) => ({ name, count }))
})

/* 分类 + 关键词过滤 */
const filteredExamples = computed(() => {
  const kw = libKeyword.value.trim().toLowerCase()
  return recommendExamples.filter(item => {
    const matchCat = activeCategory.value === '全部' || item.category === activeCategory.value
    if (!matchCat) return false
    if (!kw) return true
    const hay = [item.title, item.desc, item.category, ...(item.keywords || [])]
      .join(' ').toLowerCase()
    return hay.includes(kw)
  })
})

const recommendExamples = [
  {
    theme: 'blue',
    icon: 'chart',
    category: '日常巡检',
    hot: 1,
    keywords: ['DAU', '留存', '大盘', '新增', '广告收入', '巡检', '环比'],
    title: '【日常巡检】宏观数据表现分析',
    desc: '巡检产品整体 DAU、留存、收入等宏观指标表现，快速掌握大盘趋势',
    question: '请对 onedrama 近 7 天的宏观数据进行日常巡检，分析 DAU、新增用户、留存率、广告收入等核心指标的环比趋势，标注异常波动并生成可视化分析报告。',
    rounds: [
      {
        role: 'user',
        text: '请对 onedrama 近 7 天（2026-09-09~09-15）的宏观数据做日常巡检，核心指标包括 DAU、新增用户、次日留存率、广告收入，按天给出环比趋势并标注异常。'
      },
      {
        role: 'ai',
        lines: [
          '已完成 onedrama 近 7 天宏观数据巡检，整体结论：大盘运行平稳，仅 09-14 出现一次 DAU 波动，需重点关注。',
          '① 09-13 前 DAU 稳步上升（12.8w → 14.2w），周末效应明显；',
          '② 09-14 DAU 环比下跌 8.6%，次日留存同步下降 3.2pct，属于异常点；',
          '③ 广告收入周环比 +6.4%，仍保持增长。明细如下：'
        ],
        table: {
          columns: [
            { label: '日期' }, { label: 'DAU(万)' }, { label: '新增(万)' },
            { label: 'DAU环比' }, { label: '次日留存' }, { label: '广告收入($)' }
          ],
          warnCols: [3, 4],
          rows: [
            ['09-09', '12.8', '1.31', '—', '38.5%', '21,430'],
            ['09-10', '13.1', '1.34', '+2.3%', '39.1%', '22,080'],
            ['09-11', '13.6', '1.42', '+3.8%', '39.6%', '23,150'],
            ['09-12', '14.0', '1.45', '+2.9%', '40.2%', '24,360'],
            ['09-13', '14.2', '1.48', '+1.4%', '40.8%', '25,020'],
            ['09-14', '13.0', '1.29', '-8.6%', '37.6%', '22,870'],
            ['09-15', '13.9', '1.40', '+6.9%', '40.1%', '24,610']
          ]
        },
        note: '注：红色列为异常波动项；09-14 为美国地区工作日，需进一步下钻确认是否为版本或渠道因素。'
      },
      {
        role: 'user',
        text: '09-14 的 DAU 下跌，帮我按国家和渠道拆一下，看看主要是哪里掉的。'
      },
      {
        role: 'ai',
        lines: [
          '已按国家 × 渠道下钻 09-14 DAU 下跌贡献度：',
          '① 美国地区贡献了整体跌幅的 71%，其中 Admob 渠道单日 DAU 减少 0.62w；',
          '② 对应版本 1.7.5.0 在 09-14 推送了灰度扩量，该版本在美国 Admob 的启动崩溃率升至 1.8%（前版本 0.6%）；',
          '③ 初步判定为版本灰度引发的启动崩溃导致用户流失，而非投放量下降（当日 Admob 展示量基本持平）。'
        ]
      },
      {
        role: 'user',
        text: '给出后续处理建议。'
      },
      {
        role: 'ai',
        lines: [
          '建议如下：',
          '1. 立即暂停 1.7.5.0 在美国 Admob 的灰度扩量，回滚至崩溃率正常的 1.7.4.2；',
          '2. 联系客户端排查 09-14 灰度包启动崩溃堆栈，重点关注新增的 SDK 初始化逻辑；',
          '3. 修复后以 5%→20%→50% 小步灰度，每档观察 24 小时崩溃率与留存；',
          '4. 后续巡检增加「版本发布后 48h 崩溃率/留存联动监控」自动告警，避免同类问题复发。'
        ]
      }
    ]
  },
  {
    theme: 'green',
    icon: 'debug',
    category: '日常排查',
    hot: 2,
    keywords: ['IAA', 'eCPM', 'ARPDAU', '填充率', '广告', '变现', 'Admob', '底价'],
    title: '【日常排查】IAA 广告投放与变现日常问题排查',
    desc: '排查 IAA 广告填充、展示、eCPM、ARPDAU 等变现链路异常，定位大盘收入涨跌根因',
    question: '请排查 Photo Recover 近 3 天 IAA 广告投放与变现情况，从填充率、展示率、eCPM、ARPDAU 等指标逐层定位异常环节，并给出可能原因与优化建议。',
    rounds: [
      {
        role: 'user',
        text: '排查 Photo Recover 近 3 天（09-13~09-15）IAA 广告变现情况，按广告漏斗（请求→填充→展示→点击→收入）逐层看，定位异常环节。'
      },
      {
        role: 'ai',
        lines: [
          '已完成 IAA 变现链路排查，核心结论：收入下跌发生在「填充→展示」和「单价」两个环节。',
          '① ARPDAU 从 $0.182 降至 $0.169，环比 -7.1%；',
          '② 填充率基本稳定（96.2% → 95.8%），但展示率下降 5.4pct；',
          '③ eCPM $14.6 → $12.3，环比 -15.8%，是收入下跌主因。明细：'
        ],
        table: {
          columns: [
            { label: '指标' }, { label: '09-13' }, { label: '09-14' }, { label: '09-15' }, { label: '环比' }
          ],
          warnCols: [4],
          rows: [
            ['填充率', '96.2%', '95.8%', '95.9%', '-0.3pct'],
            ['展示率', '78.4%', '73.0%', '72.6%', '-5.4pct'],
            ['人均展示', '4.8', '4.5', '4.4', '-6.3%'],
            ['eCPM($)', '14.6', '12.3', '12.1', '-15.8%'],
            ['点击率', '2.1%', '2.0%', '2.0%', '-0.1pct'],
            ['ARPDAU($)', '0.182', '0.170', '0.169', '-7.1%']
          ]
        }
      },
      {
        role: 'user',
        text: 'eCPM 跌得最多，按国家和广告位再拆一下，是哪里的问题？'
      },
      {
        role: 'ai',
        lines: [
          '已按国家 × 广告位拆解 eCPM 跌幅贡献：',
          '① 美国插屏广告位 eCPM $22.4 → $16.8，贡献整体跌幅的 64%，该广告位 09-14 起新增了 Admob Bidding 底价策略调整（底价由 $18 提至 $45）；',
          '② 底价上调导致低价竞价被过滤，填充未明显下降但展示率被压缩（与漏斗表现一致），成交价并未提升；',
          '③ 激励视频与原生广告位 eCPM 波动均在 ±3% 以内，可排除大盘广告需求侧波动。'
        ]
      },
      {
        role: 'user',
        text: '那应该怎么处理？'
      },
      {
        role: 'ai',
        lines: [
          '处理建议：',
          '1. 将美国插屏 Bidding 底价回退至 $18，或改用分时段底价（美区高峰时段 $30、其余时段 $18）；',
          '2. 回退后观察 48h，对比展示率、eCPM 与 ARPDAU 的综合收益（以 ARPDAU 而非单一 eCPM 为决策口径）；',
          '3. 增加「底价调整后 24h 展示率跌幅 >5% 自动告警」，并沉淀底价调整的灰度发布流程；',
          '4. 中期可接入 Admob 实时 Bidding 与中介 A/B 测试，用实验数据决定最优底价。'
        ]
      }
    ]
  },
  {
    theme: 'purple',
    icon: 'trend',
    category: '应用内事件',
    hot: 3,
    keywords: ['漏斗', '流失', '转化', '事件', '行为路径', '模版', '权限'],
    title: '【应用内事件】应用类事件漏斗流失与行为分析',
    desc: '分析应用内关键事件漏斗转化、流失节点与用户行为路径',
    question: '请分析 onedrama 应用内关键事件（启动→引导曝光→引导点击→模版制作→模版应用）的漏斗转化与流失情况，定位流失率最高的节点并结合用户行为路径给出优化建议。',
    rounds: [
      {
        role: 'user',
        text: '分析 onedrama 2026-09-09~09-15 应用内核心事件漏斗：启动→引导曝光→引导点击→模版制作→模版应用，给出每步转化率和流失率。'
      },
      {
        role: 'ai',
        lines: [
          '已完成核心事件漏斗分析（周期内去重用户口径）：',
          '① 整体应用率（启动→模版应用）为 18.7%；',
          '② 流失最严重节点为「引导点击→模版制作」，流失率 39.4%；',
          '③ 其次为「引导曝光→引导点击」，流失率 34.8%。明细：'
        ],
        table: {
          columns: [
            { label: '漏斗步骤' }, { label: '事件用户数' }, { label: '步长转化率' }, { label: '流失率' }, { label: '累计转化率' }
          ],
          warnCols: [3],
          rows: [
            ['App 启动', '386,200', '—', '—', '100%'],
            ['引导曝光', '352,800', '91.4%', '8.6%', '91.4%'],
            ['引导点击', '230,100', '65.2%', '34.8%', '59.6%'],
            ['模版制作', '139,400', '60.6%', '39.4%', '36.1%'],
            ['模版应用', '72,200', '51.8%', '48.2%', '18.7%']
          ]
        }
      },
      {
        role: 'user',
        text: '「引导点击→模版制作」流失最严重，帮我分析这部分流失用户的行为路径，看看他们卡点在哪。'
      },
      {
        role: 'ai',
        lines: [
          '已对「引导点击后未制作模版」的 90,700 名用户做行为路径分析：',
          '① 57% 的用户点击引导后进入「模版选择页」，但在素材加载等待 >3s 后直接退出（该页 P90 加载耗时 3.8s）；',
          '② 23% 的用户进入制作页后因「未授予相册权限」中断，权限弹窗仅出现 1 次且无二次引导；',
          '③ 14% 的用户反复切换分类 Tab 但未选中模版，推测为模版封面与预期不符；',
          '④ 其余 6% 为其他零散原因。核心卡点集中在加载性能与权限引导。'
        ]
      },
      {
        role: 'user',
        text: '基于这些发现输出优化方案。'
      },
      {
        role: 'ai',
        lines: [
          '优化方案（按预期收益排序）：',
          '1. 模版素材预加载：在引导曝光阶段预取首屏模版资源，将选择页 P90 加载压到 1.5s 内，预计回收 57% 流失中的大部分；',
          '2. 权限二次引导：首次拒绝后在制作页内提供「去开启权限」内嵌卡片，替代系统弹窗只能触发一次的限制；',
          '3. 模版封面优化：对高曝光低点击模版做封面 A/B（成品效果图替代素材图），并按点击/制作转化率排序；',
          '4. 建立漏斗周度巡检看板，重点监控「引导点击→模版制作」与加载耗时、权限授予率的联动，验证上述改动收益。'
        ]
      }
    ]
  },
  {
    theme: 'blue',
    icon: 'pie',
    category: '多维分析',
    hot: 4,
    keywords: ['占比', '渠道', '国家', 'ROI', '结构', '付费率', '投放'],
    title: '【多维分析】分国家渠道结构占比与 ROI 分析',
    desc: '按国家、渠道拆解新增/收入结构占比与投放 ROI，识别高效市场',
    question: '分析 onedrama 2026-09 月各国家 × 渠道的新增用户占比、收入占比与 ROI，找出投入产出最高和需要优化的渠道组合，输出结构占比图表与建议。',
    rounds: [
      {
        role: 'user',
        text: '分析 onedrama 2026-09 月分国家 × 渠道的新增占比、收入占比和 ROI，帮我找出最值得加投和需要优化的组合。'
      },
      {
        role: 'ai',
        lines: [
          '已完成国家 × 渠道结构与 ROI 分析，Top 组合如下（收入口径为广告+内购）：',
          '① 美国 × Meta 新增占比 16.2%、收入占比 24.8%，ROI 187%，为最高效组合；',
          '② 巴西 × AppLovin 新增占比 9.5% 但 ROI 仅 72%，属于量大质低；',
          '③ 日本 × Google UAC 收入占比 8.1%、ROI 156%，有加投空间。明细：'
        ],
        table: {
          columns: [
            { label: '国家' }, { label: '渠道' }, { label: '新增占比' }, { label: '收入占比' }, { label: 'ROI' }
          ],
          warnCols: [4],
          rows: [
            ['美国', 'Meta', '16.2%', '24.8%', '187%'],
            ['日本', 'Google UAC', '6.4%', '8.1%', '156%'],
            ['德国', 'Meta', '5.1%', '6.8%', '142%'],
            ['印尼', 'AppLovin', '11.3%', '6.9%', '88%'],
            ['巴西', 'AppLovin', '9.5%', '4.2%', '72%']
          ]
        },
        note: '注：ROI = 周期内回收收入 / 投放花费；红色为低于 100% 回本线的组合。'
      },
      {
        role: 'user',
        text: '巴西 AppLovin 量很大但不回本，帮我下钻看看是素材问题还是人群问题。'
      },
      {
        role: 'ai',
        lines: [
          '巴西 × AppLovin 下钻结论：',
          '① 次留 31%（大盘均值 39%），新客质量偏低，主要投放到了低机型激励流量；',
          '② 素材 A（强福利诱导）占花费 63%，其用户次留仅 27%、广告展示意愿低；素材 B（功能演示）次留 36%、ROI 94%；',
          '③ 判断主因是素材吸引的人群不匹配，而非市场本身问题。'
        ]
      },
      {
        role: 'user',
        text: '基于这些结论给出预算和素材的优化建议。'
      },
      {
        role: 'ai',
        lines: [
          '优化建议：',
          '1. 预算向美国 × Meta、日本 × Google UAC 倾斜，在 ROI 不低于 140% 的前提下逐步加投 20%；',
          '2. 巴西市场停投强福利素材 A，将预算切给功能演示素材 B，并测试 2~3 组新素材；',
          '3. 在 AppLovin 侧将流量定向从激励位调整为插屏/原生位，观察次留与 ROI；',
          '4. 建立「新增占比 vs 收入占比」偏离度周监控，对连续两周 ROI<90% 的组合自动预警。'
        ]
      }
    ]
  },
  {
    theme: 'green',
    icon: 'wallet',
    category: '收入分析',
    hot: 5,
    keywords: ['收入', 'IAP', '内购', '广告收入', 'ARPPU', '构成', '订阅'],
    title: '【收入分析】广告与内购收入构成及趋势分析',
    desc: '拆解 IAA 广告与 IAP 内购收入构成、ARPPU 与订阅趋势',
    question: '分析 onedrama 2026-08 月总收入构成（IAA 广告 / IAP 内购占比）、近 8 周收入趋势及内购 ARPPU、订阅续费率，输出收入健康度评估与提升建议。',
    rounds: [
      {
        role: 'user',
        text: '分析 onedrama 2026-08 月收入构成，IAA 和 IAP 各占多少？再看下近 8 周趋势和订阅续费情况。'
      },
      {
        role: 'ai',
        lines: [
          '已完成收入构成与趋势分析：',
          '① 08 月总收入 $386,200，其中 IAA 广告 $301,300（78.0%）、IAP 内购 $84,900（22.0%），仍是典型广告变现模型；',
          '② 近 8 周总收入周环比平均 +2.1%，增长主要由 IAA 驱动，IAP 连续 3 周持平；',
          '③ 订阅首月续费率 41%，ARPPU $6.8。构成明细：'
        ],
        table: {
          columns: [
            { label: '收入类型' }, { label: '08月收入($)' }, { label: '占比' }, { label: '环比' }, { label: '备注' }
          ],
          rows: [
            ['IAA 广告', '301,300', '78.0%', '+5.6%', '增长主力'],
            ['IAP-订阅', '62,100', '16.1%', '+0.8%', '续费率41%'],
            ['IAP-单次购买', '22,800', '5.9%', '-2.4%', '小幅下滑'],
            ['合计', '386,200', '100%', '+4.3%', '—']
          ]
        }
      },
      {
        role: 'user',
        text: 'IAP 一直不温不火，问题可能出在哪？'
      },
      {
        role: 'ai',
        lines: [
          'IAP 链路诊断：',
          '① 付费率仅 1.9%，付费入口集中在制作结果页，引导曝光到点击转化率只有 2.3%；',
          '② 订阅页 68% 的用户在价格区停留 <3s 即退出，缺少月付/年付的价值对比锚点；',
          '③ 单次购买商品与订阅权益区分不清晰，存在互相稀释；',
          '④ 首月续费率 41% 低于行业 45%~50% 区间，主要流失发生在订阅后第 2 周（高级模版使用频次低）。'
        ]
      },
      {
        role: 'user',
        text: '给出收入提升方案。'
      },
      {
        role: 'ai',
        lines: [
          '收入提升方案：',
          '1. 订阅页增加年付省 40% 的价格锚点与权益对比，目标将付费页转化率从 2.3% 提升到 3.5%；',
          '2. 在用户第 2~3 次使用免费模版后推送限时升级引导，提高付费触达频次；',
          '3. 订阅后第 2 周推送高级模版精选与使用提醒，将续费率目标设为 46%；',
          '4. 梳理单次购买与订阅权益，用单次包做低价引流、订阅做长期转化，避免相互稀释；',
          '5. 建立 IAA/IAP 双轮收入看板，跟踪付费率、ARPPU、续费率三大 IAP 指标的周变化。'
        ]
      }
    ]
  }
]

const specExamples = reactive([
  {
    title: '指代不明，组内黑话',
    expanded: true,
    showExplain: true,
    bad: '查看 onedrama 9-5 9-6 两天的新人用户漏斗',
    good: '查看 onedrama 9-5 9-6 两天的新人引导漏斗事件情况。',
    badExplain: '【新人用户漏斗】是组内业务黑话，存在含义指代不明，漏斗有很多，如"付费转化漏斗、广告链路漏斗"。',
    goodExplain: '需指明业务名词含义，要求与实际产品组上报点位内容（事件类型/事件名称/事件备注等）保持一致。'
  },
  {
    title: '判断线上行为，需指明数据判断条件',
    expanded: true,
    showExplain: false,
    bad: '查一下所有的包中，哪些包是在灰度测试。',
    good: 'Photo Recover 产品在 2026.8.15~2026.8.19 进行了全量灰度，灰度版本是 1.7.5.0，调整点改动：广告做了 webview 防护，防止网页下载 apk 文件，请环比灰度前 1.7.3.0 核心数据涨跌情况。',
    badExplain: '未指明如何判断"灰度中"，是通过版本号、开关还是其他条件？',
    goodExplain: '需给出明确的判断条件，如版本号范围、灰度开关状态、灰度时间区间等，让 AI 能据此构造正确的查询条件。'
  },
  {
    title: '判断线上行为，需指明数据判断条件',
    expanded: true,
    showExplain: false,
    bad: '目前有哪些应用正在灰度测试',
    good: '',
    badExplain: '"正在灰度测试"缺少判断依据，AI 无法识别哪些应用属于灰度状态。',
    goodExplain: '需补充灰度的判断逻辑（如版本号规则、灰度标记字段等），否则无法正确查询。'
  }
])
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

/* ---------- 对话大纲侧滑 ---------- */
const outlineVisible = ref(false)
const highlightMsgId = ref(null)
let highlightTimer = null

function nowTime() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/* (1) 用户每轮提问大纲 */
const outlineUserTurns = computed(() => {
  let idx = 0
  return currentMessages.value
    .filter((m) => m.role === 'user')
    .map((m) => {
      idx += 1
      const textBlock = m.blocks.find((b) => b.type === 'text')
      const files = m.blocks.filter((b) => b.type === 'image' || b.type === 'file')
      return {
        id: m.id,
        index: idx,
        text: textBlock?.content || '（仅发送了附件）',
        time: m.time || '',
        files
      }
    })
})

/* (2) 系统输出大纲（按轮汇总输出内容构成） */
const outlineAiTurns = computed(() => {
  let idx = 0
  return currentMessages.value
    .filter((m) => m.role === 'ai')
    .map((m) => {
      idx += 1
      const counts = { text: 0, table: 0, chart: 0 }
      m.blocks.forEach((b) => { if (counts[b.type] !== undefined) counts[b.type] += 1 })
      const summary = m.blocks.find((b) => b.type === 'text')?.content || ''
      return { id: m.id, index: idx, time: m.time || '', elapsed: m.elapsed || '', counts, summary }
    })
})

/* (3) 文件记录（对话中已发送 + 输入框待发送） */
const outlineFiles = computed(() => {
  const list = []
  let turn = 0
  currentMessages.value.forEach((m) => {
    if (m.role !== 'user') return
    turn += 1
    m.blocks.forEach((b) => {
      if (b.type === 'image' || b.type === 'file') {
        list.push({
          key: m.id + '_' + b.name,
          name: b.name,
          kind: b.type === 'image' ? '图片' : '文件',
          size: b.size || '',
          turnLabel: '第 ' + turn + ' 轮提问',
          pending: false,
          msgId: m.id
        })
      }
    })
  })
  attachments.value.forEach((a) => {
    list.push({
      key: a.id,
      name: a.name,
      kind: a.kind === 'image' ? '图片' : '文件',
      size: a.size || '',
      turnLabel: '待发送',
      pending: true,
      msgId: null
    })
  })
  return list
})

/* 点击大纲项：滚动定位到对应消息并短暂高亮 */
function scrollToMessage(id) {
  if (!id) return
  const el = messageListRef.value?.querySelector(`[data-msg-id="${id}"]`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  highlightMsgId.value = id
  clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => { highlightMsgId.value = null }, 1800)
}

/* ---------- 单条回答操作与反馈 ---------- */
const feedbackReasonOptions = ['不是我想要的数据', '答非所问', '不符合业务常识', '加载过慢', '其他']

/* 提取回答纯文本（用于复制） */
function answerPlainText(msg) {
  const parts = []
  for (const b of msg.blocks || []) {
    if (b.type === 'text' && b.content) parts.push(b.content)
    if (b.type === 'table') parts.push(`（表格：${(b.columns || []).map(c => c.title).join(' / ')}，共 ${(b.rows || []).length} 行）`)
  }
  return parts.join('\n\n')
}

function copyAnswer(msg) {
  const text = answerPlainText(msg)
  if (navigator.clipboard && text) navigator.clipboard.writeText(text)
  message.success('回答内容已复制')
}

function shareAnswer(msg) {
  console.log('[msg-share]', { msgId: msg.id })
  message.info('演示环境：分享功能待接入')
}

function regenerateAnswer(msg) {
  console.log('[msg-regenerate]', { msgId: msg.id })
  message.info('演示环境：将基于上一个问题重新生成')
}

function reportAnswer(msg) {
  console.log('[msg-report]', { msgId: msg.id })
  message.info('演示环境：问题已记录')
}

/* 点赞：直接切换；点踩通过 popover 提交 */
function setFeedback(msg, type) {
  if (type === 'up') {
    msg.feedback = msg.feedback === 'up' ? null : 'up'
    console.log('[msg-feedback]', { msgId: msg.id, feedback: msg.feedback })
  }
}

function toggleFeedbackReason(msg, r) {
  if (!Array.isArray(msg.feedbackReasons)) msg.feedbackReasons = []
  const i = msg.feedbackReasons.indexOf(r)
  if (i >= 0) msg.feedbackReasons.splice(i, 1)
  else msg.feedbackReasons.push(r)
}

function clearFeedbackDraft(msg) {
  msg.feedbackReasons = []
  msg.feedbackComment = ''
}

function submitFeedback(msg) {
  if (!msg.feedbackReasons || !msg.feedbackReasons.length) return
  msg.feedback = 'down'
  msg.feedbackPopOpen = false
  // mock：单轮差评采集（后续接后端接口）
  console.log('[msg-feedback]', {
    msgId: msg.id,
    feedback: 'down',
    reasons: msg.feedbackReasons,
    comment: (msg.feedbackComment || '').trim()
  })
  message.success('反馈已提交，感谢你的建议')
}

/* ---------- 离开会话评分（三维 10 分制） ---------- */
const router = useRouter()
const RATING_SNOOZE_KEY = 'ai-chat-rating-snooze-date'

const ratingVisible = ref(false)
const ratingStep = ref('score') // score | thanks
const ratingStepEnteredAt = ref(0)
/* 三个维度均为 1~5 星，10 分制换算由服务端按 4/4/2 权重处理 */
const ratingForm = ref({ accuracy: 0, rationality: 0, conciseness: 0 })
const ratingReasons = ref([])
const ratingReasonOptions = ['数据错误', '逻辑不通', '没定位到问题', '图表不直观', '其他']
const ratingComment = ref('')
const lastRatingTotal = ref(0)
let pendingLeaveAction = null
let pendingRoutePath = null

/* 三维度星级评价 */
const ratingDims = [
  { key: 'accuracy', name: '① 输出数据准确性', tip: '数据是否准确、口径是否一致' },
  { key: 'rationality', name: '② 分析逻辑与问题定位', tip: '分析是否合理、问题定位是否准确' },
  { key: 'conciseness', name: '③ 交互与内容简洁直观', tip: '输出是否简洁易懂、图表是否直观' }
]

/* 三项都打星后才能提交 */
const ratingCanSubmit = computed(() =>
  ratingForm.value.accuracy > 0 &&
  ratingForm.value.rationality > 0 &&
  ratingForm.value.conciseness > 0
)

/* 原始总分：三维度星数相加，满分 15（10 分制由服务端折算） */
const ratingTotal = computed(() =>
  ratingForm.value.accuracy + ratingForm.value.rationality + ratingForm.value.conciseness
)

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* 是否需要弹评分：有消息、非 loading、本会话未评、今天没点过稍后 */
function shouldShowRating() {
  const sess = currentSession.value
  if (!sess) return false
  if (currentMessages.value.length === 0) return false // 空对话不评价
  if (loading.value) return false
  if (sess.rating) return false
  if (localStorage.getItem(RATING_SNOOZE_KEY) === todayStr()) return false
  return true
}

/* 离开动作统一入口：需要评价则暂存动作并弹框，否则直接放行 */
function guardLeave(action) {
  if (shouldShowRating()) {
    pendingLeaveAction = action
    openRating()
  } else {
    action()
  }
}

/* 路由离开 AI-Chat 同样拦截（关闭标签页/刷新无法弹自定义框，不处理） */
onBeforeRouteLeave((to) => {
  if (shouldShowRating()) {
    pendingRoutePath = to.fullPath
    openRating()
    return false
  }
  return true
})

function openRating() {
  ratingForm.value = { accuracy: 0, rationality: 0, conciseness: 0 }
  ratingReasons.value = []
  ratingComment.value = ''
  ratingStep.value = 'score'
  ratingStepEnteredAt.value = performance.now()
  ratingVisible.value = true
}

/* 步骤刚切换的 350ms 内忽略按钮点击，防止同位置按钮被同一次点击手势穿透触发 */
function isFreshStepClick() {
  return performance.now() - ratingStepEnteredAt.value < 350
}

function submitScores() {
  if (!ratingCanSubmit.value) return
  const f = ratingForm.value
  const total = ratingTotal.value
  lastRatingTotal.value = total
  const record = {
    sessionId: currentSessionId.value,
    accuracyStars: f.accuracy,     // 数据准确性 1~5 星
    rationalityStars: f.rationality, // 分析逻辑与问题定位 1~5 星
    concisenessStars: f.conciseness, // 简洁直观 1~5 星
    total,                          // 原始总分，满分 15（10 分制由服务端折算）
    reasons: ratingReasons.value.slice(),
    comment: ratingComment.value.trim(),
    time: new Date().toISOString()
  }
  if (currentSession.value) currentSession.value.rating = record
  // mock：会话级评分采集（10 分制由服务端按 4/4/2 权重换算）
  console.log('[session-rating]', record)
  ratingStep.value = 'thanks'
  ratingStepEnteredAt.value = performance.now()
}

/* 稍后评价/×：当天不再弹，继续原离开动作 */
function snoozeAndLeave() {
  localStorage.setItem(RATING_SNOOZE_KEY, todayStr())
  ratingVisible.value = false
  continueLeave()
}

/* 完成评价：继续原离开动作（防同一次点击手势穿透误触发） */
function finishRating() {
  if (isFreshStepClick()) return
  ratingVisible.value = false
  continueLeave()
}

function continueLeave() {
  const action = pendingLeaveAction
  pendingLeaveAction = null
  const routePath = pendingRoutePath
  pendingRoutePath = null
  if (action) action()
  else if (routePath) router.push(routePath)
}

/* ---------- 交互方法 ---------- */
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function newChat() {
  guardLeave(() => {
    const s = createSession()
    sessions.unshift(s)
    currentSessionId.value = s.id
    inputText.value = ''
    loading.value = false
  })
}

function selectSession(id) {
  guardLeave(() => {
    currentSessionId.value = id
    loading.value = false
    nextTick(() => { renderCharts(); scrollToBottom() })
  })
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

/* ---------- 推荐示例：使用此提问 ---------- */
function useRecommendQuestion(q) {
  inputText.value = q
  recommendPanelOpen.value = false
  recoDetailVisible.value = false
  nextTick(() => inputRef.value && inputRef.value.focus())
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
    if (a.kind === 'image') blocks.push({ type: 'image', url: a.url, name: a.name, size: a.size })
    else blocks.push({ type: 'file', name: a.name, size: a.size })
  }
  sess.messages.push({ id: 'msg_' + (++msgSeq), role: 'user', blocks, time: nowTime() })
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
      time: nowTime(),
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
  { element: '输入区顶部工具栏', marker: 'input-toolbar-top', desc: '输入框上方的辅助功能工具栏' },
  { element: '推荐示例按钮', marker: 'btn-recommend-examples', desc: '输入框上方工具栏入口，点击展开/收起上滑推荐示例面板' },
  { element: '推荐示例上滑面板', marker: 'recommend-panel', desc: '输入框上方上滑展开的推荐示例卡片网格' },
  { element: '推荐示例卡片', marker: 'recommend-tile-{index}', desc: '精选卡片（Top3），点击弹出该场景的多轮 AI 对话示例弹窗' },
  { element: '查看全部示例入口', marker: 'recommend-library-open', desc: '固定位于精选区第 4 格，示例超过 3 个时出现，点击打开全量示例库弹窗' },
  { element: '全量示例库弹窗', marker: 'recommend-library-modal', desc: '左侧分类、顶部搜索、右侧场景列表' },
  { element: '全量库分类项', marker: 'lib-cat-{分类名}', desc: '按分类筛选示例列表，含数量角标' },
  { element: '全量库搜索框', marker: 'lib-search', desc: '按标题、描述、关键词模糊过滤' },
  { element: '全量库示例行', marker: 'lib-row-{index}', desc: '点击进入该场景多轮对话详情' },
  { element: '对话示例详情弹窗', marker: 'recommend-detail-modal', desc: '展示每轮用户提示词与 AI 数据分析回复（含数据表格）' },
  { element: '使用此提问', marker: 'recommend-detail-use', desc: '将示例首轮提问填充到输入框并聚焦，关闭弹窗，不自动发送' },
  { element: '示范按钮', marker: 'btn-spec-examples', desc: '输入框上方工具栏入口，点击弹出规范示例弹窗' },
  { element: '规范示例弹窗', marker: 'spec-modal', desc: '展示提问规范与正反例对比，支持展开/收起错误说明' },
  { element: '右侧主区域', marker: 'ai-chat-main', desc: '对话主区域容器' },
  { element: '对话区顶部工具栏', marker: 'chat-top-toolbar', desc: '对话区最上方的白色工具条，右置辅助功能按钮' },
  { element: '对话大纲按钮', marker: 'btn-chat-outline', desc: '顶部工具栏右侧侧滑面板图标按钮，点击从右侧滑出对话大纲抽屉' },
  { element: '对话大纲抽屉', marker: 'outline-drawer', desc: '右侧滑出的大纲面板，含用户提问、系统输出、文件记录三部分' },
  { element: '用户提问大纲', marker: 'outline-section-user', desc: '按轮汇总每次用户提问（序号、内容、时间、附件数），点击定位到对应消息' },
  { element: '系统输出大纲', marker: 'outline-section-ai', desc: '按轮汇总 AI 输出构成（文本/表格/图表数量、摘要、耗时），点击定位到对应消息' },
  { element: '文件记录', marker: 'outline-section-files', desc: '汇总对话中上传的图片/文件（类型、大小、所属轮次），含待发送附件标记' },
  { element: '欢迎卡片', marker: 'welcome-card', desc: '初始欢迎卡片，展示助手介绍与使用指引' },
  { element: '消息流列表', marker: 'message-list', desc: '用户与 AI 的问答消息流' },
  { element: '单条回答操作栏', marker: 'msg-feedback', desc: '每条 AI 回答底部操作区：复制、分享、更多、点赞、点踩、回答时间' },
  { element: '复制回答', marker: 'msg-copy', desc: '复制该条回答的文本与表格摘要到剪贴板' },
  { element: '分享回答', marker: 'msg-share', desc: '分享该条回答（演示环境待接入）' },
  { element: '更多操作', marker: 'msg-more', desc: '更多菜单：重新生成、报告问题' },
  { element: '回答有帮助', marker: 'msg-feedback-up', desc: '线性点赞图标，标记单条回答有帮助，再次点击取消' },
  { element: '回答没帮助', marker: 'msg-feedback-down', desc: '线性点踩图标，点击弹出「反馈提交」浮层' },
  { element: '反馈提交浮层', marker: 'msg-feedback-panel', desc: '点踩后弹出：理由标签多选 + 补充说明输入框 + 清空/确定' },
  { element: '反馈理由标签', marker: 'msg-feedback-reasons', desc: '不是我想要的数据/答非所问/不符合业务常识/加载过慢/其他，多选，至少选一项才能确定' },
  { element: '反馈补充说明', marker: 'msg-feedback-comment', desc: '填写不满意的部分及期望的回答，选填，最多 300 字' },
  { element: '反馈清空', marker: 'msg-feedback-clear', desc: '清空已选理由与补充说明' },
  { element: '反馈确定', marker: 'msg-feedback-confirm', desc: '提交本条回答的差评反馈，提交后点踩图标高亮' },
  { element: '离开评分弹框', marker: 'rating-modal', desc: '新对话/切换会话/路由离开且本会话有消息时弹出的会话级评分框' },
  { element: '星级打分层', marker: 'rating-step-score', desc: '三维度各 1~5 星评价（准确性/逻辑与定位/简洁直观），原始总分满分 15，服务端可折算 10 分制' },
  { element: '评分维度行', marker: 'rating-dim-{accuracy/rationality/conciseness}', desc: '展示维度名称与说明，右侧为该维度的星级评分组件' },
  { element: '维度星级', marker: 'rating-stars-{accuracy/rationality/conciseness}', desc: '对应维度的 1~5 星点选，三项均打星后才可提交' },
  { element: '实时总分', marker: 'rating-step-score', desc: '星级下方实时展示三维度星数之和（X / 15 分）' },
  { element: '问题原因多选', marker: 'rating-reasons', desc: '备注上方的问题原因复选框（数据错误/逻辑不通/没定位到问题/图表不直观/其他），选填可多选' },
  { element: '评分备注', marker: 'rating-comment', desc: '用户自定义补充说明或具体问题（选填，最多 300 字）' },
  { element: '稍后评价', marker: 'rating-later', desc: '当天不再弹出评分框，并继续原本的离开动作' },
  { element: '提交评分', marker: 'rating-submit', desc: '三个维度均已打星后可提交，保存星级、问题原因与备注后进入感谢页' },
  { element: '评分完成', marker: 'rating-finish', desc: '感谢页展示本次 X / 15 分，点击完成关闭弹框并继续原本的离开动作' },
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

/* 对话区顶部工具栏 */
.chat-topbar {
  flex: 0 0 auto;
  height: 48px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px 8px 0 0;
}
.chat-topbar-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #1f2937;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-topbar-btn:hover { background: #f5f5f5; }

/* 大纲定位时的消息高亮 */
.message-row.msg-highlight .message-bubble {
  animation: msg-flash 1.8s ease-out;
}
@keyframes msg-flash {
  0%   { box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.35); }
  70%  { box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.15); }
  100% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0); }
}

/* ===== 对话大纲抽屉 ===== */
.outline-wrap { display: flex; flex-direction: column; gap: 20px; }
.outline-empty {
  margin-top: 48px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.8;
}
.outline-empty-icon { font-size: 36px; margin-bottom: 8px; }
.outline-empty-sub { font-size: 12px; color: #c0c4cc; margin-top: 4px; }

.ol-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.ol-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}
.ol-section-head::before {
  content: '';
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: #1677ff;
}
.ol-section-head::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #f0f0f0;
}
.ol-section-count {
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  background: #f0f5ff;
  color: #1677ff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}
.ol-section-empty { font-size: 12px; color: #b6bcc6; padding: 4px 0 8px 10px; }

.ol-list, .ol-file-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ol-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.ol-item:hover {
  border-color: #91caff;
  background: #f5f9ff;
}
.ol-item-index {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border-radius: 50%;
  background: #e6f4ff;
  color: #1677ff;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}
.ol-item-index.ai { background: #f6ffed; color: #52c41a; }
.ol-item-body { flex: 1; min-width: 0; }
.ol-item-text {
  font-size: 13px;
  color: #1f2937;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ol-item-summary {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  margin: 3px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ol-item-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.ol-tag {
  display: inline-block;
  padding: 0 6px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #595959;
  font-size: 11px;
  line-height: 18px;
}
.ol-item-meta {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  font-size: 11px;
  color: #9ca3af;
}

/* 文件记录 */
.ol-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.ol-file:hover { border-color: #91caff; background: #f5f9ff; }
.ol-file.pending { background: #fafafa; border-style: dashed; cursor: default; }
.ol-file-icon { flex: 0 0 auto; font-size: 18px; }
.ol-file-body { flex: 1; min-width: 0; }
.ol-file-name {
  font-size: 13px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ol-file-meta {
  display: flex;
  gap: 8px;
  margin-top: 2px;
  font-size: 11px;
  color: #9ca3af;
}
.ol-file-badge {
  flex: 0 0 auto;
  padding: 1px 7px;
  border-radius: 4px;
  background: #fff7e6;
  color: #d46b08;
  font-size: 11px;
}

/* 单条回答操作栏 */
.msg-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  padding-top: 8px;
  color: #8a94a6;
}
.ma-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 6px;
  font-size: 13px;
  color: #8a94a6;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.ma-btn:hover { color: #1677ff; background: #f5f9ff; }
.ma-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #8a94a6;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.ma-icon-btn:hover { color: #1677ff; background: #f5f9ff; }
.ma-icon-btn.active { color: #1677ff; background: #e6f4ff; }
.ma-divider {
  width: 1px;
  height: 14px;
  margin: 0 8px;
  background: #e0e4ea;
}
.ma-time {
  margin-left: 8px;
  font-size: 12px;
  color: #a8b0bd;
  font-variant-numeric: tabular-nums;
}

/* 反馈浮层（popover 内容 teleport 到 body，样式见文件末尾非 scoped 块） */

/* ===== 离开评分弹框 ===== */
.rt-header { margin-bottom: 18px; }
.rt-title { font-size: 16px; font-weight: 600; color: #1f2937; }
.rt-subtitle { margin-top: 4px; font-size: 12px; color: #9ca3af; }

.rt-dim {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.rt-dim-head { min-width: 0; }
.rt-dim-name { display: block; font-size: 13px; font-weight: 600; color: #1f2937; }
.rt-dim-tip { display: block; margin-top: 2px; font-size: 11px; color: #9ca3af; }
.rt-stars { flex: 0 0 auto; font-size: 22px; }

.rt-total {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 14px;
  padding: 10px 14px;
  background: #f7f9fc;
  border-radius: 8px;
}
.rt-total-label { font-size: 13px; color: #6b7280; }
.rt-total-value { font-size: 22px; font-weight: 700; color: #1677ff; line-height: 1; }
.rt-total-max { font-size: 13px; color: #6b7280; }
.rt-total-hint { margin-left: auto; font-size: 11px; color: #b0b6c0; }

.rt-reason-wrap { margin-top: 16px; }
.rt-reason-label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}
.rt-reason-optional { font-weight: 400; font-size: 12px; color: #9ca3af; }
.rt-reason-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
}
.rt-reason-group :deep(.ant-checkbox-wrapper) { font-size: 13px; color: #374151; }

.rt-comment-wrap { margin-top: 16px; }
.rt-comment-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.rt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 感谢层 */
.rt-thanks {
  padding: 24px 0 12px;
  text-align: center;
}
.rt-thanks-icon { font-size: 44px; margin-bottom: 12px; }
.rt-thanks-title { font-size: 17px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
.rt-thanks-sub { font-size: 13px; color: #6b7280; margin-bottom: 22px; }
.rt-thanks-sub b { color: #1677ff; font-size: 16px; }

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
  padding: 12px 14px; font-size: 14px; line-height: 1.7;
  background: transparent; color: #1f2937; font-family: inherit;
  overflow-y: auto; box-sizing: border-box;
  cursor: text;
}
.chat-input::placeholder { color: #9ca3af; }
.input-toolbar-top {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px 4px; flex-shrink: 0;
  border-bottom: 1px solid #f5f5f5;
}
.input-toolbar-top .spec-btn {
  padding: 3px 10px; background: #fafafa;
  border: 1px solid #e5e7eb; color: #595959;
}
.input-toolbar-top .spec-btn:first-child { margin-left: auto; }
.input-toolbar-top .spec-btn:hover {
  background: #fff; border-color: #1677ff; color: #1677ff;
}
.spec-btn {
  display: inline-flex; align-items: center; gap: 5px;
  border-radius: 6px; font-size: 13px; cursor: pointer;
  transition: all 0.2s;
}
.input-toolbar {
  display: flex; align-items: center; gap: 6px; padding: 4px 10px 8px; flex-shrink: 0;
}

/* ===== 规范示例弹窗 ===== */
.spec-list { display: flex; flex-direction: column; gap: 16px; max-height: 68vh; overflow-y: auto; padding-right: 4px; }
.spec-card {
  border: 1px solid #eef0f4; border-radius: 8px; background: #fff; overflow: hidden;
}
.spec-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #eef0f4; background: #fafbfc;
}
.spec-card-title { font-size: 14px; font-weight: 600; color: #1677ff; }
.spec-card-toggle { font-size: 13px; color: #1677ff; cursor: pointer; user-select: none; }
.spec-card-toggle:hover { text-decoration: underline; }
.spec-card-body { padding: 14px 16px; }
.spec-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: stretch; }
.spec-col { display: flex; flex-direction: column; gap: 6px; }
.spec-col-label { font-size: 13px; color: #6b7280; font-weight: 500; }
.spec-bad {
  flex: 1; padding: 10px 12px; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 6px;
  font-size: 13px; color: #cf1322; line-height: 1.6; word-break: break-word; min-height: 60px;
}
.spec-good {
  flex: 1; padding: 10px 12px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px;
  font-size: 13px; color: #389e0d; line-height: 1.6; word-break: break-word; min-height: 60px;
}
.spec-explain-label {
  margin-top: 10px; font-size: 12px; color: #1677ff; cursor: pointer; user-select: none;
  display: inline-block;
}
.spec-explain-label:hover { text-decoration: underline; }
.spec-explain {
  margin-top: 8px; padding: 12px; background: #f9fafb; border-radius: 6px;
  display: flex; flex-direction: column; gap: 8px;
}
.spec-explain-item { font-size: 12px; line-height: 1.7; color: #1f2937; }
.explain-tag { color: #1f2937; font-weight: 600; }
.explain-text { color: #1f2937; }

/* ===== 推荐示例上滑面板 ===== */
.reco-panel {
  flex-shrink: 0;
  max-height: 0; opacity: 0; overflow: hidden;
  transform: translateY(24px);
  transition: max-height 0.35s ease, opacity 0.3s ease, transform 0.35s ease;
  background: #fff;
}
.reco-panel.open {
  max-height: 420px; opacity: 1; transform: translateY(0);
}
.reco-panel-inner { padding: 8px 20px 16px; }
.reco-panel-title {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 14px;
}
.reco-panel-line { flex: 1; height: 1px; background: #e5e7eb; }
.reco-panel-text { font-size: 14px; color: #8c8c8c; font-weight: 500; white-space: nowrap; }
.reco-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}
.reco-tile {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px; border-radius: 16px;
  cursor: pointer; user-select: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.reco-tile:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
.reco-tile-icon {
  flex-shrink: 0; width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.65);
}
.reco-tile-body { min-width: 0; }
.reco-tile-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
.reco-tile-desc { font-size: 13px; color: #595959; line-height: 1.5; }
.reco-tile-blue   { background: #eaf4ff; }
.reco-tile-blue   .reco-tile-icon { color: #1677ff; }
.reco-tile-green  { background: #e9f9ef; }
.reco-tile-green  .reco-tile-icon { color: #16a34a; }
.reco-tile-purple { background: #f1ecff; }
.reco-tile-purple .reco-tile-icon { color: #7c3aed; }
.reco-tile-more {
  background: #fff; border: 1.5px dashed #d9d9d9; justify-content: center; text-align: center;
}
.reco-tile-more:hover { border-color: #1677ff; background: #f5f9ff; }
.reco-tile-more-icon {
  flex-shrink: 0; color: #8c8c8c;
  display: flex; align-items: center; justify-content: center;
}
.reco-tile-more:hover .reco-tile-more-icon { color: #1677ff; }
.reco-tile-more .reco-tile-body { min-width: 0; }
.reco-tile-more .reco-tile-title { color: #595959; }
.reco-tile-more:hover .reco-tile-title { color: #1677ff; }
.reco-tile-more .reco-tile-desc { font-size: 12px; }

/* ===== 全量示例库弹窗 ===== */
.lib-body { display: flex; height: 60vh; }
.lib-aside {
  flex-shrink: 0; width: 150px; min-height: 0; padding: 6px 8px;
  border-right: 1px solid #f0f0f0; overflow-y: auto;
}
.lib-cat {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; border-radius: 6px; font-size: 13px; color: #595959;
  cursor: pointer; user-select: none; transition: all 0.15s; margin-bottom: 2px;
}
.lib-cat:hover { background: #f5f5f5; }
.lib-cat.active { background: #e6f4ff; color: #1677ff; font-weight: 600; }
.lib-cat-count { font-size: 12px; color: #bfbfbf; }
.lib-cat.active .lib-cat-count { color: #1677ff; }
.lib-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; padding-left: 16px; }
.lib-search {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  padding: 7px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
  color: #bfbfbf; margin-bottom: 12px; transition: border-color 0.2s;
}
.lib-search:focus-within { border-color: #1677ff; }
.lib-search-input {
  flex: 1; border: none; outline: none; font-size: 13px; color: #1f2937; background: transparent;
}
.lib-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px; }
.lib-row {
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  padding: 11px 14px; border: 1px solid #eef0f4; border-radius: 10px;
  cursor: pointer; transition: all 0.15s;
}
.lib-row:hover { border-color: #91caff; background: #f5f9ff; }
.lib-row-icon {
  flex-shrink: 0; width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; background: #f5f5f5;
}
.lib-icon-blue   { color: #1677ff; background: #eaf4ff; }
.lib-icon-green  { color: #16a34a; background: #e9f9ef; }
.lib-icon-purple { color: #7c3aed; background: #f1ecff; }
.lib-row-body { flex: 1; min-width: 0; }
.lib-row-title { font-size: 13.5px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
.lib-row-desc {
  font-size: 12px; color: #8c8c8c; line-height: 1.4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lib-row-cat {
  flex-shrink: 0; font-size: 12px; color: #595959;
  background: #f5f5f5; padding: 2px 9px; border-radius: 10px;
}
.lib-row-arrow { flex-shrink: 0; color: #bfbfbf; font-size: 18px; line-height: 1; }
.lib-row:hover .lib-row-arrow { color: #1677ff; }
.lib-empty { padding: 48px 0; text-align: center; color: #bfbfbf; font-size: 13px; }

/* ===== 推荐示例·AI 对话详情弹窗 ===== */
.reco-chat-dialog { padding: 4px 2px 0; }
.rcd-scroll { max-height: 62vh; overflow-y: auto; padding-right: 8px; }
.rcd-round + .rcd-round { margin-top: 18px; }
.rcd-row { display: flex; gap: 10px; align-items: flex-start; }
.rcd-row-user { flex-direction: row-reverse; }
.rcd-user-name {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: #1677ff; color: #fff; font-size: 12px;
  display: flex; align-items: center; justify-content: center; margin-top: 2px;
}
.rcd-ai-avatar {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: #f0f5ff; display: flex; align-items: center; justify-content: center;
  font-size: 15px; margin-top: 2px;
}
.rcd-bubble {
  max-width: 85%; padding: 10px 14px; border-radius: 10px;
  font-size: 13px; line-height: 1.75; word-break: break-word;
}
.rcd-bubble-user {
  background: #1677ff; color: #fff; border-top-right-radius: 3px;
}
.rcd-bubble-ai {
  background: #f7f8fa; color: #1f2937; border: 1px solid #eef0f4;
  border-top-left-radius: 3px;
}
.rcd-line { margin: 0; }
.rcd-line + .rcd-line { margin-top: 5px; }
.rcd-table-wrap {
  margin-top: 10px; overflow-x: auto;
  border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;
}
.rcd-table { width: 100%; border-collapse: collapse; font-size: 12.5px; white-space: nowrap; }
.rcd-table th {
  background: #fafafa; color: #595959; font-weight: 600;
  padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb;
}
.rcd-table td { padding: 8px 12px; border-bottom: 1px solid #f2f3f5; color: #1f2937; }
.rcd-table tr:last-child td { border-bottom: none; }
.rcd-warn { color: #cf1322 !important; font-weight: 600; }
.rcd-note {
  margin-top: 8px; font-size: 12px; color: #8c8c8c; line-height: 1.6;
}
.rcd-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: 18px; padding-top: 14px; border-top: 1px solid #f0f0f0;
}
.rcd-tip { font-size: 12px; color: #8c8c8c; }
.rcd-use-btn {
  flex-shrink: 0; padding: 6px 16px; border-radius: 6px;
  background: #1677ff; color: #fff; border: none; font-size: 13px; cursor: pointer;
  transition: background 0.2s;
}
.rcd-use-btn:hover { background: #4096ff; }
.upload-btn {
  width: 32px; height: 32px; border: 1px solid #d9d9d9; border-radius: 50%;
  background: #f5f5f5; color: #1f2937; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.upload-btn:hover { background: #e8e8e8; border-color: #8c8c8c; }
.beautify-btn {
  width: 32px; height: 32px; margin-left: auto; border: 1px solid #1f2937; border-radius: 50%;
  background: #fff; color: #1f2937; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.beautify-btn:hover:not(:disabled) { background: #1f2937; color: #fff; border-color: #1f2937; }
.beautify-btn:disabled { background: #f5f5f5; color: #8c8c8c; border-color: #d9d9d9; cursor: not-allowed; }
.send-btn {
  width: 34px; height: 34px; border: none; border-radius: 6px;
  background: #1677ff; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, opacity 0.2s;
}
.send-btn:hover:not(:disabled) { background: #4096ff; }
.send-btn:disabled { background: #91caff; color: rgba(255,255,255,0.85); cursor: not-allowed; }
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

<!-- 反馈提交浮层（a-popover 内容渲染在 body 下，需非 scoped 样式） -->
<style>
.fb-popover .ant-popover-inner {
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.12);
}
.fb-popover .ant-popover-inner-content { padding: 0; }
.fb-popover .ant-popover-arrow { display: none; }

.fb-pop {
  width: 380px;
  padding: 16px 18px 14px;
  box-sizing: border-box;
  background: #fff;
}
.fb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.fb-title { font-size: 15px; font-weight: 600; color: #1f2937; }
.fb-close {
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 18px;
  line-height: 1;
  color: #9ca3af;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.fb-close:hover { color: #4b5563; background: #f5f5f5; }
.fb-tip { margin-bottom: 10px; font-size: 13px; color: #6b7280; }
.fb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.fb-chip {
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
  color: #4b5563;
  background: #f5f6f8;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.18s;
}
.fb-chip:hover { color: #1677ff; background: #f0f7ff; }
.fb-chip.active {
  color: #1677ff;
  background: #e6f4ff;
  border-color: #91caff;
}
.fb-textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  color: #1f2937;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  resize: none;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.18s;
}
.fb-textarea::placeholder { color: #b6bcc7; }
.fb-textarea:focus { border-color: #1677ff; }
.fb-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.fb-btn {
  height: 30px;
  padding: 0 18px;
  font-size: 13px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  cursor: pointer;
}
.fb-btn:hover { border-color: #1677ff; color: #1677ff; }
.fb-btn-primary {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
}
.fb-btn-primary:hover { background: #4096ff; border-color: #4096ff; color: #fff; }
.fb-btn-primary:disabled {
  background: #f0f0f0;
  border-color: #f0f0f0;
  color: #b6bcc7;
  cursor: not-allowed;
}
</style>
