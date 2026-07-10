<template>
  <div class="ai-workbench-wrapper">
    <a-button
      type="primary"
      shape="circle"
      size="large"
      class="ai-trigger-btn"
      @click="showDrawer = true"
      data-marker="ai_workbench_trigger"
    >
      🤖
    </a-button>

    <a-drawer
      v-model:open="showDrawer"
      title="AI 辅助分析工作台"
      placement="right"
      :width="900"
      data-marker="ai_workbench_drawer"
    >
      <div class="ai-workspace">
        <div class="left-panel">
          <div class="panel-header">
            <h3>📋 历史对话</h3>
          </div>
          <div class="task-list">
            <div
              v-for="task in historyTasks"
              :key="task.id"
              :class="['task-item', { active: selectedTask?.id === task.id }]"
              @click="selectHistoryTask(task)"
              data-marker="ai_workbench_history_task"
            >
              <div class="task-title">{{ task.title }}</div>
              <div class="task-time">{{ task.time }}</div>
            </div>
            <div v-if="historyTasks.length === 0" class="empty-tasks">
              暂无历史对话记录
            </div>
          </div>
        </div>

        <div class="right-panel">
          <div class="mode-selector">
            <a-space :size="16">
              <a-button
                :type="currentMode === 'scene' ? 'primary' : 'default'"
                @click="switchMode('scene')"
                data-marker="ai_workbench_mode_scene"
              >
                📊 常用场景分析
              </a-button>
              <a-button
                :type="currentMode === 'chat' ? 'primary' : 'default'"
                @click="switchMode('chat')"
                data-marker="ai_workbench_mode_chat"
              >
                💬 自由对话分析
              </a-button>
            </a-space>
          </div>

          <div class="context-summary" v-if="currentMode === 'chat'" data-marker="ai_workbench_context">
            <a-collapse default-active-key="['context']" :bordered="false">
              <a-collapse-panel key="context" header="当前查询上下文">
                <div class="context-info">
                  <div class="context-item">
                    <span class="context-label">时间范围:</span>
                    <span class="context-value">{{ contextSummary.timeRange }}</span>
                  </div>
                  <div class="context-item">
                    <span class="context-label">筛选条件:</span>
                    <span class="context-value">{{ contextSummary.filters }}</span>
                  </div>
                  <div class="context-item">
                    <span class="context-label">样本行数:</span>
                    <span class="context-value">{{ contextSummary.sampleSize }}</span>
                  </div>
                  <div class="context-item">
                    <span class="context-label">分析指标:</span>
                    <span class="context-value">{{ contextSummary.metrics }}</span>
                  </div>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </div>

          <div class="scene-cards" v-if="currentMode === 'scene'" data-marker="ai_workbench_scene_cards">
            <div class="scene-title">📊 分析场景</div>
            <div class="scene-category-selector">
              <span class="category-label">场景分类：</span>
              <a-select
                v-model:value="sceneCategory"
                style="width: 180px"
                data-marker="ai_workbench_scene_category"
              >
                <a-select-option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </a-select-option>
              </a-select>
            </div>
            <a-space wrap>
              <a-button
                v-for="scene in sceneCards"
                :key="scene.key"
                :type="activeScene === scene.key ? 'primary' : 'default'"
                @click="selectScene(scene.key)"
                data-marker="ai_workbench_scene_card"
              >
                {{ scene.icon }} {{ scene.label }}
              </a-button>
            </a-space>
            <div v-if="sceneCards.length === 0" class="empty-scenes">
              该分类下暂无分析场景
            </div>

            <div class="scene-form" v-if="activeScene" data-marker="ai_workbench_scene_form">
              <a-form :model="sceneForm" layout="inline">
                <template v-if="activeScene === 'product-compare'">
                  <a-form-item label="基准产品">
                    <a-select
                      v-model:value="sceneForm.baselineProduct"
                      placeholder="选择基准产品"
                      style="width: 150px"
                      data-marker="ai_workbench_scene_baseline"
                    >
                      <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
                      <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
                      <a-select-option value="CleanMaster">CleanMaster</a-select-option>
                      <a-select-option value="Security">Security</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="对比产品">
                    <a-select
                      v-model:value="sceneForm.compareProducts"
                      placeholder="选择对比产品"
                      style="width: 180px"
                      mode="multiple"
                      data-marker="ai_workbench_scene_compare_products"
                    >
                      <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
                      <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
                      <a-select-option value="CleanMaster">CleanMaster</a-select-option>
                      <a-select-option value="Security">Security</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="对比日期">
                    <a-range-picker
                      v-model:value="sceneForm.compareDateRange"
                      format="MM/DD/YYYY"
                      style="width: 220px"
                      data-marker="ai_workbench_scene_compare_date"
                    />
                  </a-form-item>
                </template>
                <template v-if="activeScene === 'dimension-compare'">
                  <a-form-item label="基准产品">
                    <a-select
                      v-model:value="sceneForm.dimensionBaselineProduct"
                      placeholder="选择基准产品"
                      style="width: 150px"
                      data-marker="ai_workbench_scene_dimension_baseline"
                    >
                      <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
                      <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
                      <a-select-option value="CleanMaster">CleanMaster</a-select-option>
                      <a-select-option value="Security">Security</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="对比产品">
                    <a-select
                      v-model:value="sceneForm.dimensionCompareProducts"
                      placeholder="选择对比产品"
                      style="width: 180px"
                      mode="multiple"
                      data-marker="ai_workbench_scene_dimension_compare_products"
                    >
                      <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
                      <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
                      <a-select-option value="CleanMaster">CleanMaster</a-select-option>
                      <a-select-option value="Security">Security</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="细分维度">
                    <a-select
                      v-model:value="sceneForm.dimension"
                      placeholder="选择维度"
                      style="width: 180px"
                      mode="multiple"
                      data-marker="ai_workbench_scene_dimension"
                    >
                      <a-select-option value="country">国家</a-select-option>
                      <a-select-option value="channel">渠道</a-select-option>
                      <a-select-option value="operator">投放人员</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="用户类型">
                    <a-select
                      v-model:value="sceneForm.userType"
                      placeholder="选择用户类型"
                      style="width: 100px"
                      data-marker="ai_workbench_scene_user_type"
                    >
                      <a-select-option value="new">新用户</a-select-option>
                      <a-select-option value="old">老用户</a-select-option>
                      <a-select-option value="all">全部用户</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="对比日期">
                    <a-range-picker
                      v-model:value="sceneForm.dimensionDateRange"
                      format="MM/DD/YYYY"
                      style="width: 220px"
                      data-marker="ai_workbench_scene_dimension_date"
                    />
                  </a-form-item>
                </template>
                <template v-if="activeScene === 'trend-compare'">
                  <a-form-item label="目标产品">
                    <a-select
                      v-model:value="sceneForm.trendProduct"
                      placeholder="选择目标产品"
                      style="width: 150px"
                      data-marker="ai_workbench_scene_trend_product"
                    >
                      <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
                      <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
                      <a-select-option value="CleanMaster">CleanMaster</a-select-option>
                      <a-select-option value="Security">Security</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="环比日期">
                    <a-date-picker
                      v-model:value="sceneForm.trendDate"
                      format="MM/DD/YYYY"
                      style="width: 150px"
                      data-marker="ai_workbench_scene_trend_date"
                    />
                  </a-form-item>
                  <a-form-item label="环比天数">
                    <a-input-number
                      v-model:value="sceneForm.trendDays"
                      :min="1"
                      :max="90"
                      placeholder="输入天数"
                      style="width: 120px"
                      data-marker="ai_workbench_scene_trend_days"
                    />
                  </a-form-item>
                </template>
                <template v-if="activeScene === 'version-compare'">
                  <a-form-item label="目标产品">
                    <a-select
                      v-model:value="sceneForm.versionProduct"
                      placeholder="选择目标产品"
                      style="width: 150px"
                      data-marker="ai_workbench_scene_version_product"
                    >
                      <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
                      <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
                      <a-select-option value="CleanMaster">CleanMaster</a-select-option>
                      <a-select-option value="Security">Security</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="基准版本号">
                    <a-select
                      v-model:value="sceneForm.versionBaseline"
                      placeholder="选择基准版本"
                      style="width: 150px"
                      data-marker="ai_workbench_scene_version_baseline"
                    >
                      <a-select-option value="v1.9.0">v1.9.0</a-select-option>
                      <a-select-option value="v1.8.0">v1.8.0</a-select-option>
                      <a-select-option value="v1.7.5">v1.7.5</a-select-option>
                      <a-select-option value="v1.7.0">v1.7.0</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="对比版本号">
                    <a-select
                      v-model:value="sceneForm.version"
                      placeholder="选择版本"
                      style="width: 180px"
                      mode="multiple"
                      data-marker="ai_workbench_scene_version"
                    >
                      <a-select-option value="v1.9.0">v1.9.0</a-select-option>
                      <a-select-option value="v1.8.0">v1.8.0</a-select-option>
                      <a-select-option value="v1.7.5">v1.7.5</a-select-option>
                      <a-select-option value="v1.7.0">v1.7.0</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="发版窗口期天数">
                    <a-input-number
                      v-model:value="sceneForm.versionDays"
                      :min="1"
                      :max="30"
                      placeholder="输入天数"
                      style="width: 120px"
                      data-marker="ai_workbench_scene_version_days"
                    />
                  </a-form-item>
                  <a-form-item label="用户类型">
                    <a-select
                      v-model:value="sceneForm.versionUserType"
                      placeholder="选择用户类型"
                      style="width: 100px"
                      data-marker="ai_workbench_scene_version_user_type"
                    >
                      <a-select-option value="new">新用户</a-select-option>
                      <a-select-option value="old">老用户</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="对比日期">
                    <a-range-picker
                      v-model:value="sceneForm.versionDateRange"
                      format="MM/DD/YYYY"
                      style="width: 220px"
                      data-marker="ai_workbench_scene_version_date"
                    />
                  </a-form-item>
                </template>
                <template v-if="activeScene === 'cohort-gold-paid'">
                  <a-form-item label="基准产品">
                    <a-select
                      v-model:value="sceneForm.baselineProduct"
                      placeholder="选择基准产品"
                      style="width: 150px"
                      data-marker="ai_workbench_scene_cohort_baseline"
                    >
                      <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
                      <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
                      <a-select-option value="CleanMaster">CleanMaster</a-select-option>
                      <a-select-option value="Security">Security</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="对比产品">
                    <a-select
                      v-model:value="sceneForm.cohortCompareProducts"
                      placeholder="选择对比产品"
                      style="width: 180px"
                      mode="multiple"
                      data-marker="ai_workbench_scene_cohort_compare_products"
                    >
                      <a-select-option value="PhoneRecover">PhoneRecover</a-select-option>
                      <a-select-option value="PhotoRescue">PhotoRescue</a-select-option>
                      <a-select-option value="CleanMaster">CleanMaster</a-select-option>
                      <a-select-option value="Security">Security</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="对比日期">
                    <a-range-picker
                      v-model:value="sceneForm.cohortDateRange"
                      format="MM/DD/YYYY"
                      style="width: 220px"
                      data-marker="ai_workbench_scene_cohort_date"
                    />
                  </a-form-item>
                </template>
                <a-button
                  type="primary"
                  @click="executeScene"
                  data-marker="ai_workbench_scene_execute"
                >
                  执行分析
                </a-button>
              </a-form>
            </div>
          </div>

          <div class="chat-container">
            <div class="chat-messages" ref="chatMessagesRef">
              <div
                v-for="(msg, index) in chatMessages"
                :key="index"
                :class="['message-item', msg.role]"
              >
                <div class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
                <div class="message-content">
                  <div class="message-text">{{ msg.content }}</div>
                  <div v-if="msg.type === 'table'" class="message-table" v-html="msg.content"></div>
                </div>
              </div>
            </div>

            <div class="input-area">
              <a-input
                v-model:value="inputMessage"
                placeholder="输入您的分析需求..."
                @keyup.enter="sendMessage"
                data-marker="ai_workbench_input"
              >
                <template #suffix>
                  <a-button
                    type="primary"
                    @click="sendMessage"
                    :disabled="!inputMessage.trim()"
                    data-marker="ai_workbench_send"
                  >
                    发送
                  </a-button>
                </template>
              </a-input>
              <div class="input-actions">
                <a-button type="text" @click="clearContext" data-marker="ai_workbench_clear_context">
                  @清除上下文
                </a-button>
              </div>
            </div>
          </div>

          <div class="tool-bar">
            <a-space :size="8">
              <a-dropdown>
                <a-button type="text" data-marker="ai_workbench_output_format">
                  📊 输出格式
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="switchOutputFormat('table')">表格</a-menu-item>
                    <a-menu-item @click="switchOutputFormat('line')">折线图</a-menu-item>
                    <a-menu-item @click="switchOutputFormat('pie')">饼图</a-menu-item>
                    <a-menu-item @click="switchOutputFormat('scatter')">散点图</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>

              <a-dropdown>
                <a-button type="text" data-marker="ai_workbench_export">
                  📤 导出
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="exportAsPng">导出为PNG</a-menu-item>
                    <a-menu-item @click="exportAsXlsx">导出为XLSX</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>

              <a-button type="text" @click="regenerateResponse" data-marker="ai_workbench_regenerate">
                🔄 重新生成
              </a-button>

              <a-button type="text" @click="saveTask" data-marker="ai_workbench_save_task">
                💾 转存任务
              </a-button>

              <a-dropdown>
                <a-button type="text" data-marker="ai_workbench_add_skill">
                  ➕ 添加技能
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item-group title="已添加技能">
                      <a-menu-item v-for="skill in skills" :key="skill.name">
                        {{ skill.name }}
                      </a-menu-item>
                    </a-menu-item-group>
                    <a-menu-divider />
                    <a-menu-item @click="showSkillUpload = true">
                      📁 上传新技能 (.skill)
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </div>
      </div>
    </a-drawer>

    <a-modal
      v-model:open="showSkillUpload"
      title="上传技能文件"
      :footer="null"
      data-marker="ai_workbench_skill_upload_modal"
    >
      <div class="skill-upload-content">
        <p>请选择 .skill 文件上传：</p>
        <a-upload
          :show-upload-list="false"
          :before-upload="handleSkillUpload"
          accept=".skill"
          data-marker="ai_workbench_skill_upload"
        >
          <a-button type="primary">选择文件</a-button>
        </a-upload>
        <div v-if="uploadedSkill" class="uploaded-skill">
          <span>已选择: {{ uploadedSkill.name }}</span>
          <a-button type="text" @click="uploadedSkill = null">移除</a-button>
        </div>
        <div class="upload-actions">
          <a-button @click="showSkillUpload = false">取消</a-button>
          <a-button type="primary" @click="confirmSkillUpload">确认上传</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>import { ref, reactive, computed, nextTick, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { useAITaskStore } from '../../stores/aiTaskStore';
import dayjs from 'dayjs';
const props = defineProps({
 reportContext: {
 type: Object,
 default: () => ({
 timeRange: '05/12/2026 - 05/18/2026',
 filters: 'APP: PhotoRescue',
 sampleSize: '50',
 metrics: 'Cost, Revenue, Profit, CDNU, RR D1, RR D3, RR D7, In-RR, In-RR D1, In-RR D2, In-RR D3, AIPU, AIPU D0, ECPM, CPI, ROAS, ROI0, ROI3, ROI7'
 })
 }
});
const router = useRouter();
const aiTaskStore = useAITaskStore();
const showDrawer = ref(false);
const currentMode = ref('scene');
const activeScene = ref(null);
const inputMessage = ref('');
const chatMessagesRef = ref(null);
const selectedTask = ref(null);
const chatMessages = ref([
 {
 role: 'ai',
 content: '您好！我是您的AI数据分析助手。请问需要我帮您分析什么？您可以选择上方的固定场景卡片，或直接输入自然语言查询。',
 type: 'text'
 }
]);
const historyTasks = ref([
 { id: 1, title: '产品对比分析报告', time: '2026-05-18 09:58' },
 { id: 2, title: '用户留存趋势分析', time: '2026-05-17 14:32' },
 { id: 3, title: '版本迭代效果评估', time: '2026-05-16 11:20' }
]);
const sceneCategory = ref('basic');
const categoryOptions = [
 { value: 'basic', label: '产品基础分析' },
 { value: 'paid', label: '付费分析' }
];
const allScenes = {
 basic: [
 { key: 'product-compare', label: '同品类多产品对比', icon: '📊' },
 { key: 'dimension-compare', label: '产品细分维度对比', icon: '🔍' },
 { key: 'trend-compare', label: '产品指标趋势对比', icon: '📈' },
 { key: 'version-compare', label: '产品版本对比', icon: '🔄' }
 ],
 paid: [
 { key: 'cohort-gold-paid', label: '同期群金币付费分析', icon: '💰' }
 ]
};
const sceneCards = computed(() => allScenes[sceneCategory.value] || []);
const sceneForm = reactive({
 baselineProduct: 'PhoneRecover',
 compareProducts: [],
 compareDateRange: [],
 dimensionBaselineProduct: 'PhoneRecover',
 dimensionCompareProducts: [],
 dimension: [],
 userType: 'all',
 dimensionDateRange: [],
 trendProduct: 'PhoneRecover',
 trendDate: null,
 trendDays: 7,
 metricType: '',
 version: [],
 cohortCompareProducts: [],
 cohortDateRange: [],
 versionProduct: 'PhoneRecover',
 versionBaseline: '',
 versionDays: 7,
 versionUserType: 'new',
 versionDateRange: []
});
const skills = ref([
 { name: '数据分析技能.skill' },
 { name: '报告生成技能.skill' },
 { name: '趋势分析技能.skill' }
]);
const showSkillUpload = ref(false);
const uploadedSkill = ref(null);
const outputFormat = ref('table');
const contextSummary = computed(() => ({
 timeRange: props.reportContext.timeRange || '05/12/2026 - 05/18/2026',
 filters: props.reportContext.filters || 'APP: PhotoRescue',
 sampleSize: props.reportContext.sampleSize || '50',
 metrics: props.reportContext.metrics || 'Cost, Revenue, Profit, CDNU, RR D1, RR D3, RR D7, In-RR, In-RR D1, In-RR D2, In-RR D3, AIPU, AIPU D0, ECPM, CPI, ROAS, ROI0, ROI3, ROI7'
}));
const switchMode = (mode) => {
 currentMode.value = mode;
};
const selectScene = (sceneKey) => {
 activeScene.value = activeScene.value === sceneKey ? null : sceneKey;
};
const selectHistoryTask = (task) => {
 selectedTask.value = task;
 chatMessages.value = [
 {
 role: 'ai',
 content: `已加载历史任务：${task.title}\n\n可以继续基于此任务进行分析，或查看之前的分析结果。`,
 type: 'text'
 }
 ];
};
watch(sceneCategory, () => {
 activeScene.value = null;
});
const executeScene = () => {
 if (!activeScene.value)
 return;
 const dateRangeStr = sceneForm.compareDateRange.length > 0 
 ? `${sceneForm.compareDateRange[0].format('MM/DD/YYYY')} - ${sceneForm.compareDateRange[1].format('MM/DD/YYYY')}` 
 : '默认时间范围';
 const dimensionDateRangeStr = sceneForm.dimensionDateRange.length > 0 
 ? `${sceneForm.dimensionDateRange[0].format('MM/DD/YYYY')} - ${sceneForm.dimensionDateRange[1].format('MM/DD/YYYY')}` 
 : '默认时间范围';
 const dimensionLabels = sceneForm.dimension.map(d => {
 const labelMap = { country: '国家', channel: '渠道', operator: '投放人员' };
 return labelMap[d] || d;
 });
 const trendDateStr = sceneForm.trendDate ? sceneForm.trendDate.format('MM/DD/YYYY') : '当前日期';
 const versionDateRangeStr = sceneForm.versionDateRange.length > 0 
 ? `${sceneForm.versionDateRange[0].format('MM/DD/YYYY')} - ${sceneForm.versionDateRange[1].format('MM/DD/YYYY')}` 
 : '默认时间范围';
 const cohortDateRangeStr = sceneForm.cohortDateRange.length > 0 
 ? `${sceneForm.cohortDateRange[0].format('MM/DD/YYYY')} - ${sceneForm.cohortDateRange[1].format('MM/DD/YYYY')}` 
 : '默认时间范围';
 const scenePrompts = {
 'product-compare': `请帮我对比同品类下多个APP的Local Overview核心指标，包括DAU、ROI和金币复购率。\n\n基准产品：${sceneForm.baselineProduct || 'PhoneRecover'}\n对比产品：${sceneForm.compareProducts.length > 0 ? sceneForm.compareProducts.join('、') : '全部产品'}\n时间范围：${dateRangeStr}`,
 'dimension-compare': `请帮我按细分维度分析用户行为特征。\n\n基准产品：${sceneForm.dimensionBaselineProduct || 'PhoneRecover'}\n对比产品：${sceneForm.dimensionCompareProducts.length > 0 ? sceneForm.dimensionCompareProducts.join('、') : '全部产品'}\n细分维度：${dimensionLabels.length > 0 ? dimensionLabels.join('、') : '全部维度'}\n用户类型：${sceneForm.userType === 'new' ? '新用户' : sceneForm.userType === 'old' ? '老用户' : '全部用户'}\n时间范围：${dimensionDateRangeStr}`,
 'trend-compare': `请帮我分析产品指标的趋势变化。\n\n目标产品：${sceneForm.trendProduct || 'PhoneRecover'}\n环比日期：${trendDateStr}\n环比天数：${sceneForm.trendDays || 7}天\n\n请进行环比分析，对比当前周期与${sceneForm.trendDays || 7}天前的指标变化。`,
 'version-compare': `请帮我分析产品版本对比。\n\n目标产品：${sceneForm.versionProduct || 'PhoneRecover'}\n基准版本：${sceneForm.versionBaseline || '无'}\n对比版本：${sceneForm.version.length > 0 ? sceneForm.version.join(' vs ') : '全部版本'}\n发版窗口期：${sceneForm.versionDays || 7}天\n用户类型：${sceneForm.versionUserType === 'new' ? '新用户' : '老用户'}\n时间范围：${versionDateRangeStr}\n\n请分析不同版本发布后的核心指标变化，评估版本迭代效果。`,
 'cohort-gold-paid': `请帮我进行同期群金币付费分析。\n\n基准产品：${sceneForm.baselineProduct || 'PhoneRecover'}\n对比产品：${sceneForm.cohortCompareProducts.length > 0 ? sceneForm.cohortCompareProducts.join('、') : '全部产品'}\n时间范围：${cohortDateRangeStr}\n\n请分析不同同期群用户的金币付费行为，包括付费率、付费金额、复购周期等指标。`
 };
 chatMessages.value.push({
 role: 'user',
 content: scenePrompts[activeScene.value],
 type: 'text'
 });
 inputMessage.value = '';
 nextTick(() => {
 if (chatMessagesRef.value) {
 chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
 }
 });
 setTimeout(() => {
 const responses = {
 'product-compare': generateProductCompareResponse(),
 'dimension-compare': generateDimensionCompareResponse(),
 'trend-compare': generateTrendCompareResponse(),
 'version-compare': generateVersionCompareResponse(),
 'cohort-gold-paid': generateCohortGoldPaidResponse()
 };
 chatMessages.value.push({
 role: 'ai',
 content: responses[activeScene.value],
 type: 'text'
 });
 nextTick(() => {
 if (chatMessagesRef.value) {
 chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
 }
 });
 }, 1500);
};
const generateProductCompareResponse = () => {
 const table = `
 <div class="ant-table-wrapper">
 <table>
 <thead>
 <tr><th>APP</th><th>DAU</th><th>DNU</th><th>ROI</th><th>金币复购率</th></tr>
 </thead>
 <tbody>
 <tr><td>PhoneRecover</td><td>45,230</td><td>6,230</td><td>25.34%</td><td>13.56%</td></tr>
 <tr><td>CleanMaster</td><td>38,560</td><td>5,120</td><td>22.18%</td><td>11.23%</td></tr>
 <tr><td>Security</td><td>28,650</td><td>4,120</td><td>18.76%</td><td>9.23%</td></tr>
 </tbody>
 </table>
 </div>
 `;
 chatMessages.value.push({
 role: 'ai',
 content: table,
 type: 'table'
 });
 return '**分析结论：**\n\n1. **PhoneRecover** 表现最佳，DAU领先其他产品约17%\n2. **CleanMaster** 表现稳定，各项指标处于中等水平\n3. **Security** 相对较弱，建议重点关注用户增长策略';
};
const generateDimensionCompareResponse = () => {
 return '**按维度分析结果：**\n\n- 高价值用户主要集中在北美和欧洲市场\n- 渠道A贡献了60%的新增用户\n- 品牌认知度在目标用户群体中达到75%';
};
const generateTrendCompareResponse = () => {
 return '**趋势分析结果：**\n\n- 日环比增长：+5.2%\n- 周环比增长：+18.3%\n- 同比增长：+45.6%\n\n**趋势预测：**\n未来两周预计继续保持增长态势';
};
const generateVersionCompareResponse = () => {
 return '**版本对比分析：**\n\n- v1.9.0 相比 v1.8.0，DAU提升了12%\n- 核心功能使用率提升了8%\n- 用户留存率(D7)提升了5个百分点';
};
const generateCohortGoldPaidResponse = () => {
 const table = `
 <div class="ant-table-wrapper">
 <table>
 <thead>
 <tr><th>同期群</th><th>付费用户数</th><th>付费率</th><th>人均付费</th><th>复购周期</th></tr>
 </thead>
 <tbody>
 <tr><td>第1周</td><td>1,230</td><td>8.5%</td><td>$12.30</td><td>4.2天</td></tr>
 <tr><td>第2周</td><td>1,560</td><td>9.2%</td><td>$15.80</td><td>3.8天</td></tr>
 <tr><td>第3周</td><td>1,890</td><td>10.1%</td><td>$18.50</td><td>3.5天</td></tr>
 </tbody>
 </table>
 </div>
 `;
 chatMessages.value.push({
 role: 'ai',
 content: table,
 type: 'table'
 });
 return '**同期群金币付费分析结论：**\n\n1. **付费率持续提升**：随同期群周次增长，付费率从8.5%提升至10.1%\n2. **人均付费增长显著**：第3周人均付费达到$18.50，环比增长17%\n3. **复购周期缩短**：用户复购频率增加，复购周期从4.2天缩短至3.5天';
};
const sendMessage = () => {
 if (!inputMessage.value.trim())
 return;
 chatMessages.value.push({
 role: 'user',
 content: inputMessage.value.trim(),
 type: 'text'
 });
 inputMessage.value = '';
 nextTick(() => {
 if (chatMessagesRef.value) {
 chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
 }
 });
 setTimeout(() => {
 chatMessages.value.push({
 role: 'ai',
 content: '基于当前报表数据，我来为您分析...\n\n**分析结果：**\n\n数据显示整体趋势保持稳定，建议关注以下关键点：\n\n1. 核心指标表现正常\n2. 建议继续优化用户体验\n3. 保持当前运营策略',
 type: 'text'
 });
 nextTick(() => {
 if (chatMessagesRef.value) {
 chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
 }
 });
 }, 1500);
};
const clearContext = () => {
 chatMessages.value = [
 {
 role: 'ai',
 content: '上下文已清除！请问还有什么需要我帮您分析的？',
 type: 'text'
 }
 ];
};
const switchOutputFormat = (format) => {
 outputFormat.value = format;
 const formatNames = {
 table: '表格',
 line: '折线图',
 pie: '饼图',
 scatter: '散点图'
 };
 message.success(`输出格式已切换为：${formatNames[format]}`);
};
const exportAsPng = () => {
 message.info('正在生成PNG图片...');
 setTimeout(() => {
 message.success('PNG图片导出成功');
 }, 1500);
};
const exportAsXlsx = () => {
 message.info('正在生成Excel文件...');
 setTimeout(() => {
 message.success('Excel文件导出成功');
 }, 1500);
};
const regenerateResponse = () => {
 if (chatMessages.value.length < 2) {
 message.warning('没有可重新生成的回复');
 return;
 }
 message.info('正在重新生成...');
};
const saveTask = () => {
 const chatContainer = document.querySelector('.chat-messages');
 const htmlSnapshot = chatContainer ? chatContainer.innerHTML : '';
 const taskData = {
 title: `AI Analysis - ${dayjs().format('YYYY-MM-DD HH:mm')}`,
 baselineProduct: sceneForm.baselineProduct || '',
 context: {
 timeRange: contextSummary.value.timeRange,
 filters: contextSummary.value.filters,
 metrics: contextSummary.value.metrics
 },
 messages: JSON.parse(JSON.stringify(chatMessages.value)),
 htmlSnapshot: generateHtmlSnapshot(),
 filters: {
 app: 'PhotoRescue',
 country: 'All',
 version: sceneForm.version,
 metrics: contextSummary.value.metrics.split(', ')
 }
 };
 const taskId = aiTaskStore.addTask(taskData);
 message.success('任务已转存，可在任务列表中查看');
 router.push(`/ai-analyses-task/${taskId}`);
};
const generateHtmlSnapshot = () => {
 const tables = document.querySelectorAll('.message-table');
 let html = '<div class="analysis-dashboard">';
 if (tables.length > 0) {
 html += '<div class="dashboard-section"><h3>分析结果</h3>';
 tables.forEach((table, index) => {
 html += `<div class="result-item">${table.outerHTML}</div>`;
 });
 html += '</div>';
 }
 html += '</div>';
 return html;
};
const handleSkillUpload = (file) => {
 uploadedSkill.value = file;
 return false;
};
const confirmSkillUpload = () => {
 if (uploadedSkill.value) {
 skills.value.push({ name: uploadedSkill.value.name });
 message.success(`技能 ${uploadedSkill.value.name} 上传成功`);
 uploadedSkill.value = null;
 showSkillUpload.value = false;
 }
};
</script>

<style scoped>
.ai-workbench-wrapper {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 9999;
}

.ai-trigger-btn {
  width: 56px;
  height: 56px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.ai-workspace {
  height: calc(100vh - 80px);
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 280px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.task-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.task-item:hover {
  background: #f0f0f0;
}

.task-item.active {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.task-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.task-time {
  font-size: 12px;
  color: #999;
}

.empty-tasks {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 13px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 16px;
}

.mode-selector {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.mode-selector .ant-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mode-selector .ant-btn-primary {
  background: linear-gradient(135deg, #1677ff 0%, #096dd9 100%);
  border-color: #1677ff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.mode-selector .ant-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.4);
}

.mode-selector .ant-btn-default {
  background: #f8f9fa;
  border-color: #e9ecef;
  color: #646a73;
}

.mode-selector .ant-btn-default:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.mode-selector .ant-space {
  flex: 1;
  justify-content: center;
}

.context-summary {
  margin-bottom: 12px;
}

.context-info {
  padding: 8px 0;
}

.context-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
}

.context-label {
  color: #666;
  min-width: 70px;
}

.context-value {
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 8px;
  word-break: break-all;
}

.scene-cards {
  margin-bottom: 12px;
}

.scene-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.scene-category-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.category-label {
  font-size: 13px;
  color: #666;
}

.empty-scenes {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

.scene-form {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.message-item {
  display: flex;
  margin-bottom: 12px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: #1677ff;
  color: #fff;
}

.message-item.ai .message-avatar {
  background: #52c41a;
  color: #fff;
}

.message-content {
  max-width: 85%;
  margin: 0 8px;
}

.message-text {
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-item.user .message-text {
  background: #1677ff;
  color: #fff;
  border-radius: 16px 0 16px 16px;
}

.message-item.ai .message-text {
  background: #f5f5f5;
  color: #333;
  border-radius: 0 16px 16px 16px;
}

.message-table {
  margin-top: 8px;
  overflow-x: auto;
}

.message-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.message-table th,
.message-table td {
  border: 1px solid #e8e8e8;
  padding: 6px 8px;
  text-align: left;
}

.message-table th {
  background: #fafafa;
  font-weight: 500;
}

.input-area {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  margin-bottom: 4px;
}

.input-actions {
  margin-top: 4px;
  text-align: right;
}

.tool-bar {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  padding-bottom: 16px;
}

.skill-upload-content {
  padding: 16px;
}

.skill-upload-content p {
  margin-bottom: 16px;
}

.uploaded-skill {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>