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
          <a-date-picker v-model:value="globalFilters.startDate" placeholder="开始日期" style="width:150px" @change="handleGlobalFilterChange" />
          <span>-</span>
          <a-date-picker v-model:value="globalFilters.endDate" placeholder="结束日期" style="width:150px" @change="handleGlobalFilterChange" />
        </div>
        <div class="filter-item">
          <span class="filter-label">国家：</span>
          <a-select v-model:value="globalFilters.countries" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="c in countryOptions" :key="c.value" :value="c.value">{{c.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">Apps：</span>
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
          <span class="filter-label">内容等级：</span>
          <a-select v-model:value="globalFilters.contentLevels" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option value="L0">L0</a-select-option>
            <a-select-option value="L2">L2</a-select-option>
            <a-select-option value="L3">L3</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">会员类型：</span>
          <a-select v-model:value="globalFilters.memberTypes" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="m in memberTypeOptions" :key="m.value" :value="m.value">{{m.label}}</a-select-option>
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
      <div class="full">
        <div class="card">
          <div class="title-row">
            <span class="title">用户分层明细数据</span>
            <div class="title-actions">
              <a-button @click="showUserColumnModal = true">列设置</a-button>
              <a-button type="primary" @click="exportUserTable">导出全量明细</a-button>
            </div>
          </div>
          <a-table
            :columns="userTableColumns"
            :data-source="userTableData"
            :pagination="userTablePagination"
            :loading="userTableLoading"
            :scroll="{x:1500}"
            :locale="{emptyText:'暂无匹配明细数据'}"
            @change="handleUserTableChange"
          />
        </div>
      </div>
    </div>
    <a-modal v-model:visible="showUserColumnModal" title="列设置" @ok="showUserColumnModal = false">
      <a-checkbox-group v-model:value="userVisibleColumns">
        <a-space :direction="'vertical'" :size="8">
          <a-checkbox v-for="col in userAllColumns" :key="col.key" :value="col.key">{{col.title}}</a-checkbox>
        </a-space>
      </a-checkbox-group>
    </a-modal>
    <a-modal v-model:visible="showFuncColumnModal" title="列设置" @ok="showFuncColumnModal = false">
      <a-checkbox-group v-model:value="funcVisibleColumns">
        <a-space :direction="'vertical'" :size="8">
          <a-checkbox v-for="col in funcAllColumns" :key="col.key" :value="col.key">{{col.title}}</a-checkbox>
        </a-space>
      </a-checkbox-group>
    </a-modal>
    <div v-show="activeTab==='func'" class="tab-content">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">日期：</span>
          <a-date-picker v-model:value="globalFilters.startDate" placeholder="开始日期" style="width:150px" @change="handleGlobalFilterChange" />
          <span>-</span>
          <a-date-picker v-model:value="globalFilters.endDate" placeholder="结束日期" style="width:150px" @change="handleGlobalFilterChange" />
        </div>
        <div class="filter-item">
          <span class="filter-label">国家：</span>
          <a-select v-model:value="globalFilters.countries" mode="multiple" style="width:140px" placeholder="全部" @change="handleGlobalFilterChange">
            <a-select-option v-for="c in countryOptions" :key="c.value" :value="c.value">{{c.label}}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">Apps：</span>
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
        <div class="kpi-card"><div>人均制作次数</div><div class="val">3.6次</div><div class="up">↑ 0.4次</div></div>
        <div class="kpi-card"><div>模板曝光率</div><div class="val">65.2%</div><div class="up">↑ 4.1pct</div></div>
        <div class="kpi-card"><div>模版提交制作率</div><div class="val">28.5%</div><div class="up">↑ 2.3pct</div></div>
        <div class="kpi-card"><div>模版提交成功率</div><div class="val">18.7%</div><div class="down">↓ 0.8pct</div></div>
      </div>
      <div class="grid">
        <div class="card"><div class="title">功能类型制作率Top5</div><div ref="funcPenetration" class="chart"></div></div>
        <div class="card"><div class="title">功能类型人均制作次数Top5</div><div ref="funcDepth" class="chart"></div></div>
      </div>
      <div class="grid">
        <div class="card">
          <div class="title-row">
            <span class="title">模版使用转化漏斗</span>
            <div class="funnel-tabs">
              <span :class="['funnel-tab', {active: funnelDimension === 'pv'}]" @click="switchFunnelDimension('pv')">PV</span>
              <span :class="['funnel-tab', {active: funnelDimension === 'uv'}]" @click="switchFunnelDimension('uv')">UV</span>
            </div>
          </div>
          <div ref="templateFunnel" class="chart"></div>
        </div>
        <div class="card"><div class="title">模版人均制作次数趋势</div><div ref="templateTrend" class="chart"></div></div>
      </div>
      <div class="full">
        <div class="card"><div class="title">各内容等级模版表现对比</div><div ref="templateLevel" class="chart tall"></div></div>
      </div>
      <div class="full">
        <div class="card">
          <div class="title-row">
            <span class="title">功能&模版明细数据</span>
            <div class="title-actions">
              <a-button @click="showFuncColumnModal = true">列设置</a-button>
              <a-button type="primary" @click="exportFuncTable">导出全量明细</a-button>
            </div>
          </div>
          <a-table
            :columns="funcTableColumns"
            :data-source="funcTableData"
            :pagination="funcTablePagination"
            :loading="funcTableLoading"
            :scroll="{x:1500}"
            :locale="{emptyText:'暂无匹配明细数据'}"
            @change="handleFuncTableChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, reactive, computed } from 'vue';
import { chartRenderers } from './chartUtils';
import { DatePicker, Select, Button, Space, FormItem, Table, Modal, Checkbox } from 'ant-design-vue';
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
const memberTypeOptions = [
  {value:'pro',label:'Pro会员'},
  {value:'max',label:'Max会员'},
  {value:'lite',label:'Lite会员'},
  {value:'none',label:'非会员'},
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
  startDate: null as Date | null,
  endDate: null as Date | null,
  countries: [] as string[],
  appTypes: [] as string[],
  channels: [] as string[],
  contentLevels: [] as string[],
  memberTypes: [] as string[],
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
  globalFilters.startDate = null;
  globalFilters.endDate = null;
  globalFilters.countries = [];
  globalFilters.appTypes = [];
  globalFilters.channels = [];
  globalFilters.contentLevels = [];
  globalFilters.memberTypes = [];
  handleGlobalFilterChange();
};
const resetFuncFilters = () => {
  globalFilters.startDate = null;
  globalFilters.endDate = null;
  globalFilters.countries = [];
  globalFilters.appTypes = [];
  globalFilters.channels = [];
  globalFilters.contentLevels = [];
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
const funnelDimension = ref<'pv' | 'uv'>('pv');
const switchFunnelDimension = (dim: 'pv' | 'uv') => {
  funnelDimension.value = dim;
  if(templateFunnel.value) chartRenderers.templateFunnel(templateFunnel.value, dim);
};
watch(activeTab, () => {
  nextTick(() => {
    if(activeTab.value === 'user') loadUser();
    else loadFunc();
  });
});

const showUserColumnModal = ref(false);
const showFuncColumnModal = ref(false);

const userAllColumns = [
  {key:'date',title:'统计日期'},
  {key:'country',title:'国家'},
  {key:'appType',title:'Apps'},
  {key:'channel',title:'投放渠道'},
  {key:'userType',title:'用户类型'},
  {key:'memberType',title:'会员类型'},
  {key:'contentLevel',title:'内容等级'},
  {key:'dau',title:'DAU',defaultSortOrder:'descend'},
  {key:'liteRate',title:'Lite会员占比'},
  {key:'proRate',title:'Pro会员占比'},
  {key:'maxRate',title:'Max会员占比'},
  {key:'l0ReachRate',title:'L0用户触达率'},
  {key:'l2ReachRate',title:'L2用户触达率'},
  {key:'l3ReachRate',title:'L3用户触达率'},
  {key:'l0MemberConv',title:'L0会员触达率'},
  {key:'l2MemberConv',title:'L2会员触达率'},
  {key:'l3MemberConv',title:'L3会员触达率'},
  {key:'reg0Day',title:'注册0天占比'},
  {key:'reg1_3Day',title:'注册1-3天占比'},
  {key:'reg4_7Day',title:'注册4-7天占比'},
  {key:'reg8_30Day',title:'注册8-30天占比'},
  {key:'reg31DayPlus',title:'注册31天+占比'},
  {key:'d1Retention',title:'次留'},
  {key:'d7Retention',title:'7留'},
  {key:'d14Retention',title:'14留'},
  {key:'d30Retention',title:'30留'},
];
const userVisibleColumns = ref(userAllColumns.map(c => c.key));
const userTableColumns = computed(() => {
  return userAllColumns.filter(c => userVisibleColumns.value.includes(c.key)).map(c => ({
    ...c,
    sorter: c.defaultSortOrder ? true : false,
  }));
});
const userTableData = ref<any[]>([]);
const userTableLoading = ref(false);
const userTablePagination = reactive({
  current: 1,
  pageSize: 20,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number) => `共 ${total} 条`,
  total: 0,
});
const generateUserTableData = () => {
  const data: any[] = [];
  const dates = ['2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20', '2026-07-21'];
  const countries = ['美国', '中国', '日本', '韩国', '英国'];
  const appTypes = ['游戏', '社交', '工具'];
  const channels = ['Google', 'Apple', 'Facebook', 'TikTok'];
  const userTypes = ['新用户', '老用户'];
  const memberTypes = ['pro', 'max', 'lite', 'none'];
  const contentLevels = ['L0', 'L2', 'L3'];
  let id = 1;
  dates.forEach(date => {
    countries.forEach(country => {
      appTypes.forEach(appType => {
        channels.forEach(channel => {
          userTypes.forEach(userType => {
            memberTypes.forEach(memberType => {
              contentLevels.forEach(contentLevel => {
                data.push({
                  key: id++,
                  date,
                  country,
                  appType,
                  channel,
                  userType,
                  memberType,
                  contentLevel,
                  dau: Math.floor(Math.random() * 50000) + 10000,
                  liteRate: (Math.random() * 20).toFixed(2) + '%',
                  proRate: (Math.random() * 15).toFixed(2) + '%',
                  maxRate: (Math.random() * 10).toFixed(2) + '%',
                  l0ReachRate: (Math.random() * 50).toFixed(2) + '%',
                  l2ReachRate: (Math.random() * 40).toFixed(2) + '%',
                  l3ReachRate: (Math.random() * 30).toFixed(2) + '%',
                  l0MemberConv: (Math.random() * 30).toFixed(2) + '%',
                  l2MemberConv: (Math.random() * 40).toFixed(2) + '%',
                  l3MemberConv: (Math.random() * 50).toFixed(2) + '%',
                  reg0Day: (Math.random() * 20).toFixed(2) + '%',
                  reg1_3Day: (Math.random() * 25).toFixed(2) + '%',
                  reg4_7Day: (Math.random() * 20).toFixed(2) + '%',
                  reg8_30Day: (Math.random() * 20).toFixed(2) + '%',
                  reg31DayPlus: (Math.random() * 15).toFixed(2) + '%',
                  d1Retention: (Math.random() * 30 + 20).toFixed(2) + '%',
                  d7Retention: (Math.random() * 20 + 10).toFixed(2) + '%',
                  d14Retention: (Math.random() * 15 + 5).toFixed(2) + '%',
                  d30Retention: (Math.random() * 10 + 2).toFixed(2) + '%',
                });
              });
            });
          });
        });
      });
    });
  });
  return data;
};
const loadUserTable = async () => {
  userTableLoading.value = true;
  userTablePagination.current = 1;
  await new Promise(resolve => setTimeout(resolve, 500));
  userTableData.value = generateUserTableData();
  userTablePagination.total = userTableData.value.length;
  userTableLoading.value = false;
};
const handleUserTableChange = (pagination: any) => {
  userTablePagination.current = pagination.current;
  userTablePagination.pageSize = pagination.pageSize;
};
const exportUserTable = () => {
  const data = generateUserTableData();
  const headers = userAllColumns.map(c => c.title).join('\t');
  const rows = data.map(row => userAllColumns.map(c => row[c.key]).join('\t')).join('\n');
  const content = headers + '\n' + rows;
  const blob = new Blob(['\ufeff' + content], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `IAP_用户分层看板_${new Date().toISOString().split('T')[0]}_明细数据.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

const funcAllColumns = [
  {key:'date',title:'统计日期'},
  {key:'country',title:'国家'},
  {key:'appType',title:'Apps'},
  {key:'channel',title:'投放渠道'},
  {key:'userType',title:'用户类型'},
  {key:'funcType',title:'功能类型'},
  {key:'contentLevel',title:'内容等级'},
  {key:'dau',title:'DAU',defaultSortOrder:'descend'},
  {key:'avgUseCount',title:'人均制作次数'},
  {key:'templateExposure',title:'模版曝光次数'},
  {key:'templateMake',title:'模版制作次数'},
  {key:'previewRate',title:'模版曝光率'},
  {key:'makeRate',title:'模版提交成功率'},
  {key:'avgPreviewCount',title:'人均曝光次数'},
  {key:'clickMakeRate',title:'模版点击制作率'},
  {key:'submitMakeRate',title:'模版提交制作率'},
  {key:'makePenetration',title:'模版提交成功率'},
  {key:'submitMakeSuccessUsers',title:'模版提交制作成功人数'},
  {key:'makeCompleteRate',title:'模版制作完成率'},
  {key:'clickMakeUsers',title:'模版点击制作人数'},
  {key:'clickMakeCount',title:'模版点击制作次数'},
  {key:'submitMakeUsers',title:'模版提交制作人数'},
  {key:'submitMakeCount',title:'模版提交制作次数'},
  {key:'makeCompleteUsers',title:'模版制作完成人数'},
  {key:'makeCompleteCount',title:'模版制作完成次数'},
  {key:'downloadUsers',title:'模版下载人数'},
  {key:'downloadCount',title:'模版下载次数'},
  {key:'downloadRate',title:'模版下载率'},
];
const funcVisibleColumns = ref(funcAllColumns.map(c => c.key).filter(k => !['clickMakeUsers','clickMakeCount','submitMakeUsers','submitMakeCount','makeCompleteUsers','makeCompleteCount','downloadUsers','downloadCount','submitMakeSuccessUsers'].includes(k)));
const funcTableColumns = computed(() => {
  return funcAllColumns.filter(c => funcVisibleColumns.value.includes(c.key)).map(c => ({
    ...c,
    sorter: c.defaultSortOrder ? true : false,
  }));
});
const funcTableData = ref<any[]>([]);
const funcTableLoading = ref(false);
const funcTablePagination = reactive({
  current: 1,
  pageSize: 20,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number) => `共 ${total} 条`,
  total: 0,
});
const generateFuncTableData = () => {
  const data: any[] = [];
  const dates = ['2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20', '2026-07-21'];
  const countries = ['美国', '中国', '日本', '韩国', '英国'];
  const appTypes = ['游戏', '社交', '工具'];
  const channels = ['Google', 'Apple', 'Facebook', 'TikTok'];
  const userTypes = ['新用户', '老用户'];
  const funcTypes = ['社区发布', '素材拼接', '滤镜编辑', '模版制作', 'AI生成', '导出分享'];
  const contentLevels = ['L0', 'L2', 'L3'];
  let id = 1;
  dates.forEach(date => {
    countries.forEach(country => {
      appTypes.forEach(appType => {
        channels.forEach(channel => {
          userTypes.forEach(userType => {
            funcTypes.forEach(funcType => {
              contentLevels.forEach(contentLevel => {
                data.push({
                  key: id++,
                  date,
                  country,
                  appType,
                  channel,
                  userType,
                  funcType,
                  contentLevel,
                  dau: Math.floor(Math.random() * 50000) + 10000,
                  makePenetration: (Math.random() * 50).toFixed(2) + '%',
                  submitMakeSuccessUsers: Math.floor(Math.random() * 3000) + 300,
                  avgUseCount: (Math.random() * 10 + 1).toFixed(2),
                  templateExposure: Math.floor(Math.random() * 100000) + 10000,
                  templatePreview: Math.floor(Math.random() * 50000) + 5000,
                  templateMake: Math.floor(Math.random() * 10000) + 1000,
                  previewRate: (Math.random() * 50).toFixed(2) + '%',
                  makeRate: (Math.random() * 20).toFixed(2) + '%',
                  avgPreviewCount: (Math.random() * 5 + 0.5).toFixed(2),
                  avgMakeCount: (Math.random() * 2 + 0.1).toFixed(2),
                  clickMakeRate: (Math.random() * 40 + 20).toFixed(2) + '%',
                  submitMakeRate: (Math.random() * 30 + 10).toFixed(2) + '%',
                  makeCompleteRate: (Math.random() * 20 + 5).toFixed(2) + '%',
                  clickMakeUsers: Math.floor(Math.random() * 20000) + 2000,
                  clickMakeCount: Math.floor(Math.random() * 50000) + 5000,
                  submitMakeUsers: Math.floor(Math.random() * 10000) + 1000,
                  submitMakeCount: Math.floor(Math.random() * 30000) + 3000,
                  makeCompleteUsers: Math.floor(Math.random() * 5000) + 500,
                  makeCompleteCount: Math.floor(Math.random() * 15000) + 1500,
                  downloadUsers: Math.floor(Math.random() * 3000) + 300,
                  downloadCount: Math.floor(Math.random() * 8000) + 800,
                  downloadRate: (Math.random() * 15 + 3).toFixed(2) + '%',
                });
              });
            });
          });
        });
      });
    });
  });
  return data;
};
const loadFuncTable = async () => {
  funcTableLoading.value = true;
  funcTablePagination.current = 1;
  await new Promise(resolve => setTimeout(resolve, 500));
  funcTableData.value = generateFuncTableData();
  funcTablePagination.total = funcTableData.value.length;
  funcTableLoading.value = false;
};
const handleFuncTableChange = (pagination: any) => {
  funcTablePagination.current = pagination.current;
  funcTablePagination.pageSize = pagination.pageSize;
};
const exportFuncTable = () => {
  const data = generateFuncTableData();
  const headers = funcAllColumns.map(c => c.title).join('\t');
  const rows = data.map(row => funcAllColumns.map(c => row[c.key]).join('\t')).join('\n');
  const content = headers + '\n' + rows;
  const blob = new Blob(['\ufeff' + content], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `IAP_功能&模版看板_${new Date().toISOString().split('T')[0]}_明细数据.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

const loadUser = async () => {
  await nextTick();
  if(memberPie.value) chartRenderers.memberPie(memberPie.value);
  if(contentBar.value) chartRenderers.contentBar(contentBar.value);
  if(registerPie.value) chartRenderers.registerPie(registerPie.value);
  if(registerStack.value) chartRenderers.registerStack(registerStack.value);
  if(retentionLine.value) chartRenderers.retentionLine(retentionLine.value);
  await loadUserTable();
};
const loadFunc = async () => {
  await nextTick();
  if(funcPenetration.value) chartRenderers.funcPenetration(funcPenetration.value);
  if(funcDepth.value) chartRenderers.funcDepth(funcDepth.value);
  if(templateFunnel.value) chartRenderers.templateFunnel(templateFunnel.value);
  if(templateTrend.value) chartRenderers.templateTrend(templateTrend.value);
  if(templateLevel.value) chartRenderers.templateLevel(templateLevel.value);
  await loadFuncTable();
};

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
.title-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.funnel-tabs{display:flex;gap:0;border:1px solid #d9d9d9;border-radius:6px;overflow:hidden}
.funnel-tab{padding:4px 14px;font-size:13px;cursor:pointer;background:white;color:#6b7280;transition:all 0.2s}
.funnel-tab:hover{color:#1890ff}
.funnel-tab.active{background:#1890ff;color:white}
.title-actions{display:flex;gap:8px}
</style>
