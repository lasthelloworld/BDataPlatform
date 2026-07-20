<template>
  <div class="page">
    <div class="header">
      <div class="header-left">IAP项目组 · 数据看板</div>
      <div class="header-right">数据更新时间：2026-07-20 10:00</div>
    </div>
    <div class="tabs">
      <div :class="['tab', {active:activeTab==='user'}]" @click="activeTab='user'">👥 用户分层看板</div>
      <div :class="['tab', {active:activeTab==='func'}]" @click="activeTab='func'">⚙️ 功能使用看板</div>
    </div>
    <div v-show="activeTab==='user'" class="tab-content">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">日期：</span>
          <a-date-picker v-model:value="globalFilters.dateRange" mode="range" style="width:250px" placeholder="选择日期范围" @change="handleGlobalFilterChange" />
        </div>
        <div class="filter-item">
          <span class="filter-label">国家：</span>
          <a-select v-model:value="globalFilters.countries" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="c in countryOptions" :key="c.value" :value="c.value">{{c.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">App类型：</span>
          <a-select v-model:value="globalFilters.appTypes" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="a in appTypeOptions" :key="a.value" :value="a.value">{{a.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">投放渠道：</span>
          <a-select v-model:value="globalFilters.channels" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="ch in channelOptions" :key="ch.value" :value="ch.value">{{ch.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-actions">
          <a-button @click="resetGlobalFilters">重置</a-button>
          <a-button type="primary" @click="handleGlobalFilterChange">查询</a-button>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-card"><div>DAU</div><div class="val">128,456</div><div class="up">↑ 5.2%</div></div>
        <div class="kpi-card"><div>活跃会员</div><div class="val">45,832</div><div class="up">↑ 3.8%</div></div>
        <div class="kpi-card"><div>次日留存</div><div class="val">42.6%</div><div class="up">↑ 1.2pct</div></div>
        <div class="kpi-card"><div>7日留存</div><div class="val">21.3%</div><div class="down">↓ 0.5pct</div></div>
        <div class="kpi-card"><div>会员渗透率</div><div class="val">35.7%</div><div class="up">↑ 2.1pct</div></div>
      </div>
      <div class="grid">
        <div class="card"><div class="title">会员维度分层</div><div ref="memberPie" class="chart"></div></div>
        <div class="card"><div class="title">内容等级分层</div><div ref="contentBar" class="chart"></div></div>
      </div>
      <div class="grid">
        <div class="card"><div class="title">注册时间维度分布</div><div ref="registerPie" class="chart"></div></div>
        <div class="card"><div class="title">各内容等级注册分布对比</div><div ref="registerStack" class="chart"></div></div>
      </div>
      <div class="full">
        <div class="card"><div class="title">留存维度分析</div><div ref="retentionLine" class="chart tall"></div></div>
      </div>
    </div>
    <div v-show="activeTab==='func'" class="tab-content">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">日期：</span>
          <a-date-picker v-model:value="globalFilters.dateRange" mode="range" style="width:250px" placeholder="选择日期范围" @change="handleGlobalFilterChange" />
        </div>
        <div class="filter-item">
          <span class="filter-label">国家：</span>
          <a-select v-model:value="globalFilters.countries" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="c in countryOptions" :key="c.value" :value="c.value">{{c.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">App类型：</span>
          <a-select v-model:value="globalFilters.appTypes" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="a in appTypeOptions" :key="a.value" :value="a.value">{{a.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">投放渠道：</span>
          <a-select v-model:value="globalFilters.channels" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="ch in channelOptions" :key="ch.value" :value="ch.value">{{ch.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">功能类型：</span>
          <a-select v-model:value="funcFilters.funcTypes" mode="multiple" style="width:140px" placeholder="全部" @change="loadFunc">
            <a-select-option v-for="f in funcTypeOptions" :key="f.value" :value="f.value">{{f.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">用户类型：</span>
          <a-select v-model:value="funcFilters.userType" style="width:120px" placeholder="全部" @change="loadFunc">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="new">新用户</a-select-option>
            <a-select-option value="old">老用户</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">内容等级：</span>
          <a-select v-model:value="funcFilters.contentLevels" mode="multiple" style="width:140px" placeholder="全部" @change="loadFunc">
            <a-select-option value="L0">L0</a-select-option>
            <a-select-option value="L2">L2</a-select-option>
            <a-select-option value="L3">L3</a-select-option>
          </a-select>
        </div>
        <div class="filter-actions">
          <a-button @click="resetFuncFilters">重置</a-button>
          <a-button type="primary" @click="loadFunc">查询</a-button>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-card"><div>DAU</div><div class="val">128,456</div><div class="up">↑ 5.2%</div></div>
        <div class="kpi-card"><div>制作渗透率</div><div class="val">28.5%</div><div class="up">↑ 2.3pct</div></div>
        <div class="kpi-card"><div>人均使用次数</div><div class="val">3.6次</div><div class="up">↑ 0.4次</div></div>
        <div class="kpi-card"><div>模版预览率</div><div class="val">65.2%</div><div class="up">↑ 4.1pct</div></div>
        <div class="kpi-card"><div>模版转化率</div><div class="val">18.7%</div><div class="down">↓ 0.8pct</div></div>
      </div>
      <div class="grid">
        <div class="card"><div class="title">各功能类型渗透率对比</div><div ref="funcPenetration" class="chart"></div></div>
        <div class="card"><div class="title">人均使用次数 & 人均消耗金币</div><div ref="funcDepth" class="chart"></div></div>
      </div>
      <div class="grid">
        <div class="card"><div class="title">模版使用转化漏斗</div><div ref="templateFunnel" class="chart"></div></div>
        <div class="card"><div class="title">模版人均使用次数趋势</div><div ref="templateTrend" class="chart"></div></div>
      </div>
      <div class="full">
        <div class="card"><div class="title">各内容等级模版表现对比</div><div ref="templateLevel" class="chart tall"></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, reactive } from 'vue';
import { chartRenderers } from './chartUtils';
import { DatePicker, Select, Button, Space, FormItem } from 'ant-design-vue';
const activeTab = ref('user');
const dateRange = ref('30');
const countryOptions = [
  {value:'US',label:'美国'},
  {value:'CN',label:'中国'},
  {value:'JP',label:'日本'},
  {value:'KR',label:'韩国'},
  {value:'GB',label:'英国'},
  {value:'DE',label:'德国'},
  {value:'FR',label:'法国'},
  {value:'AU',label:'澳大利亚'},
];
const appTypeOptions = [
  {value:'game',label:'游戏'},
  {value:'social',label:'社交'},
  {value:'tool',label:'工具'},
  {value:'ecom',label:'电商'},
  {value:'content',label:'内容'},
];
const channelOptions = [
  {value:'google',label:'Google'},
  {value:'apple',label:'Apple'},
  {value:'facebook',label:'Facebook'},
  {value:'tiktok',label:'TikTok'},
  {value:'twitter',label:'Twitter'},
  {value:'other',label:'其他'},
];
const funcTypeOptions = [
  {value:'community_post',label:'社区发布'},
  {value:'material_splice',label:'素材拼接'},
  {value:'filter_edit',label:'滤镜编辑'},
  {value:'template_make',label:'模版制作'},
  {value:'ai_generate',label:'AI生成'},
  {value:'export_share',label:'导出分享'},
];
const globalFilters = reactive({
  dateRange: null as [Date, Date] | null,
  countries: [] as string[],
  appTypes: [] as string[],
  channels: [] as string[],
});
const funcFilters = reactive({
  funcTypes: [] as string[],
  userType: 'all' as string,
  contentLevels: [] as string[],
});
const handleGlobalFilterChange = () => {
  if(activeTab.value === 'user') loadUser();
  else loadFunc();
};
const resetGlobalFilters = () => {
  globalFilters.dateRange = null;
  globalFilters.countries = [];
  globalFilters.appTypes = [];
  globalFilters.channels = [];
  handleGlobalFilterChange();
};
const resetFuncFilters = () => {
  globalFilters.dateRange = null;
  globalFilters.countries = [];
  globalFilters.appTypes = [];
  globalFilters.channels = [];
  funcFilters.funcTypes = [];
  funcFilters.userType = 'all';
  funcFilters.contentLevels = [];
  loadFunc();
};
const memberPie = ref<HTMLDivElement>();
const contentBar = ref<HTMLDivElement>();
const registerPie = ref<HTMLDivElement>();
const registerStack = ref<HTMLDivElement>();
const retentionLine = ref<HTMLDivElement>();
const funcPenetration = ref<HTMLDivElement>();
const funcDepth = ref<HTMLDivElement>();
const templateFunnel = ref<HTMLDivElement>();
const templateTrend = ref<HTMLDivElement>();
const templateLevel = ref<HTMLDivElement>();
const loadUser = async () => {
  await nextTick();
  if(memberPie.value) chartRenderers.memberPie(memberPie.value);
  if(contentBar.value) chartRenderers.contentBar(contentBar.value);
  if(registerPie.value) chartRenderers.registerPie(registerPie.value);
  if(registerStack.value) chartRenderers.registerStack(registerStack.value);
  if(retentionLine.value) chartRenderers.retentionLine(retentionLine.value);
};
const loadFunc = async () => {
  await nextTick();
  if(funcPenetration.value) chartRenderers.funcPenetration(funcPenetration.value);
  if(funcDepth.value) chartRenderers.funcDepth(funcDepth.value);
  if(templateFunnel.value) chartRenderers.templateFunnel(templateFunnel.value);
  if(templateTrend.value) chartRenderers.templateTrend(templateTrend.value);
  if(templateLevel.value) chartRenderers.templateLevel(templateLevel.value);
};
watch(activeTab, () => {
  nextTick(() => {
    if(activeTab.value === 'user') loadUser();
    else loadFunc();
  });
});
onMounted(() => { loadUser(); });
</script>

<style scoped>
.page{min-height:100vh;background:#f0f2f5}
.header{background:#1890ff;color:white;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between;font-size:18px;font-weight:600}
.header-left{display:flex;align-items:center;gap:8px}
.header-right{font-size:12px;color:rgba(255,255,255,0.8)}
.tabs{background:white;padding:0 24px;border-bottom:1px solid #e5e7eb;display:flex;gap:8px}
.tab{padding:14px 20px;cursor:pointer;font-size:14px;color:#6b7280;border-bottom:2px solid transparent}
.tab:hover{color:#1890ff}
.tab.active{color:#1890ff;border-bottom-color:#1890ff}
.filter-bar{background:#f5f5f5;padding:16px 24px;display:flex;align-items:center;gap:20px}
.filter-item{display:flex;align-items:center;gap:8px}
.filter-label{font-size:14px;color:#666}
.filter-actions{margin-left:auto;display:flex;gap:8px}
.kpi{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin:0 24px;padding-top:16px}
.kpi-card{background:white;padding:16px 20px;border-radius:8px}
.kpi-card .val{font-size:24px;font-weight:700;color:#111827}
.kpi-card .up{color:#10b981}
.kpi-card .down{color:#ef4444}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 24px}
.full{display:grid;grid-template-columns:1fr;margin:16px 24px}
.card{background:white;padding:20px;border-radius:8px}
.title{font-size:15px;font-weight:600;margin-bottom:12px}
.chart{width:100%;height:300px}
.chart.tall{height:360px}
</style>
