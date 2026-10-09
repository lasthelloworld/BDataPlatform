/* 元事件管理 — mock 数据 */

/* ====== 事件组织结构树（产品组→品类→主题域，三级） ====== */
export const orgTreeData = [
  {
    key: 'group_hope',
    title: '产品二组',
    type: 'group',
    children: [
      {
        key: 'cat_tool',
        title: '工具品类',
        type: 'category',
        children: [
          { key: 'domain_dau', title: '用户活跃', type: 'domain' },
          { key: 'domain_ad', title: '广告变现', type: 'domain' },
          { key: 'domain_retention', title: '留存分析', type: 'domain' }
        ]
      },
      {
        key: 'cat_drama',
        title: '短剧品类',
        type: 'category',
        children: [
          { key: 'domain_play', title: '播放互动', type: 'domain' },
          { key: 'domain_pay', title: '付费转化', type: 'domain' }
        ]
      }
    ]
  },
  {
    key: 'group_star',
    title: 'IAP-重庆',
    type: 'group',
    children: [
      {
        key: 'cat_game',
        title: '游戏品类',
        type: 'category',
        children: [
          { key: 'domain_game_dau', title: '用户活跃', type: 'domain' },
          { key: 'domain_game_iap', title: '内购分析', type: 'domain' }
        ]
      }
    ]
  }
]

/* ====== 产品列表（挂载于品类下，不在组织树中） ====== */
export const products = [
  { id: 'prod_recover', name: 'Photo Recover', groupId: 'group_hope', categoryId: 'cat_tool', versions: ['v1.0.0', 'v1.1.0', 'v2.0.0'] },
  { id: 'prod_clean', name: 'Phone Clean', groupId: 'group_hope', categoryId: 'cat_tool', versions: ['v1.2.0', 'v1.3.0'] },
  { id: 'prod_onedrama', name: 'OneDrama', groupId: 'group_hope', categoryId: 'cat_drama', versions: ['v3.0.0', 'v3.1.0'] },
  { id: 'prod_puzzle', name: 'Puzzle Master', groupId: 'group_star', categoryId: 'cat_game', versions: ['v2.0.0'] }
]

/* ====== 编码集分类树（二级） ====== */
export const codeSetCategories = [
  {
    key: 'cat_iaa',
    title: 'IAA 广告变现',
    children: [
      { key: 'cat_ad_platform', title: '广告平台' },
      { key: 'cat_ad_format', title: '广告样式' },
      { key: 'cat_ad_placement', title: '广告位类型' }
    ]
  },
  {
    key: 'cat_iap',
    title: 'IAP 内购',
    children: [
      { key: 'cat_iap_type', title: '内购类型' },
      { key: 'cat_pay_method', title: '支付方式' }
    ]
  },
  {
    key: 'cat_traffic',
    title: '投放获客',
    children: [
      { key: 'cat_channel', title: '投放渠道' },
      { key: 'cat_country', title: '国家地区' }
    ]
  },
  { key: 'cat_common', title: '通用枚举' }
]

/* ====== 编码集 ====== */
export const codeSets = [
  {
    id: 'cs_1',
    code: 'AD_PLATFORM',
    name: '广告平台枚举',
    categoryId: 'cat_ad_platform',
    dataType: 'int',
    creator: '管理员',
    createdAt: '2026-08-15 10:00:00',
    description: '常用广告 SDK 平台标识',
    values: [
      { id: 'cv_1', key: 'admob', value: '1', desc: 'Google AdMob' },
      { id: 'cv_2', key: 'meta', value: '2', desc: 'Meta Audience Network' },
      { id: 'cv_3', key: 'applovin', value: '3', desc: 'AppLovin MAX' },
      { id: 'cv_4', key: 'unity', value: '4', desc: 'Unity Ads' },
      { id: 'cv_5', key: 'ironsource', value: '5', desc: 'ironSource' }
    ]
  },
  {
    id: 'cs_2',
    code: 'AD_FORMAT',
    name: '广告样式枚举',
    categoryId: 'cat_ad_format',
    dataType: 'int',
    creator: '管理员',
    createdAt: '2026-08-16 11:30:00',
    description: '广告展示样式类型',
    values: [
      { id: 'cv_6', key: 'interstitial', value: '1', desc: '插屏广告' },
      { id: 'cv_7', key: 'reward', value: '2', desc: '激励视频' },
      { id: 'cv_8', key: 'native', value: '3', desc: '原生广告' },
      { id: 'cv_9', key: 'banner', value: '4', desc: '横幅广告' },
      { id: 'cv_10', key: 'appopen', value: '5', desc: '开屏广告' }
    ]
  },
  {
    id: 'cs_3',
    code: 'AD_PLACEMENT',
    name: '广告位类型',
    categoryId: 'cat_ad_placement',
    dataType: 'string',
    creator: '张三',
    createdAt: '2026-08-20 14:00:00',
    description: '广告位位置标识',
    values: [
      { id: 'cv_11', key: 'home_banner', value: '101', desc: '首页底部横幅' },
      { id: 'cv_12', key: 'interstitial_level', value: '102', desc: '关卡结束插屏' },
      { id: 'cv_13', key: 'reward_double', value: '103', desc: '翻倍激励' },
      { id: 'cv_14', key: 'native_feed', value: '104', desc: '信息流原生' }
    ]
  },
  {
    id: 'cs_4',
    code: 'IAP_TYPE',
    name: '内购类型枚举',
    categoryId: 'cat_iap_type',
    dataType: 'int',
    creator: '管理员',
    createdAt: '2026-08-22 09:00:00',
    description: 'IAP 商品类型',
    values: [
      { id: 'cv_15', key: 'consumable', value: '1', desc: '消耗型（金币/钻石）' },
      { id: 'cv_16', key: 'non_consumable', value: '2', desc: '非消耗型（去广告）' },
      { id: 'cv_17', key: 'subscription', value: '3', desc: '订阅型（VIP）' }
    ]
  },
  {
    id: 'cs_5',
    code: 'PAY_METHOD',
    name: '支付方式枚举',
    categoryId: 'cat_pay_method',
    dataType: 'int',
    creator: '李四',
    createdAt: '2026-09-01 16:20:00',
    description: '用户支付渠道',
    values: [
      { id: 'cv_18', key: 'google_play', value: '1', desc: 'Google Play' },
      { id: 'cv_19', key: 'apple_iap', value: '2', desc: 'Apple IAP' },
      { id: 'cv_20', key: 'stripe', value: '3', desc: 'Stripe' },
      { id: 'cv_21', key: 'paypal', value: '4', desc: 'PayPal' }
    ]
  },
  {
    id: 'cs_6',
    code: 'TRAFFIC_CHANNEL',
    name: '投放渠道枚举',
    categoryId: 'cat_channel',
    dataType: 'int',
    creator: '张三',
    createdAt: '2026-09-05 10:00:00',
    description: '买量投放平台',
    values: [
      { id: 'cv_22', key: 'google_ads', value: '1', desc: 'Google Ads' },
      { id: 'cv_23', key: 'meta_ads', value: '2', desc: 'Meta Ads' },
      { id: 'cv_24', key: 'tiktok_ads', value: '3', desc: 'TikTok Ads' },
      { id: 'cv_25', key: 'applovin_ads', value: '4', desc: 'AppLovin' }
    ]
  },
  {
    id: 'cs_7',
    code: 'COUNTRY_CODE',
    name: '国家地区枚举',
    categoryId: 'cat_country',
    dataType: 'string',
    creator: '管理员',
    createdAt: '2026-09-10 14:30:00',
    description: '投放国家与地区',
    values: [
      { id: 'cv_26', key: 'US', value: '840', desc: '美国' },
      { id: 'cv_27', key: 'BR', value: '076', desc: '巴西' },
      { id: 'cv_28', key: 'IN', value: '356', desc: '印度' },
      { id: 'cv_29', key: 'ID', value: '360', desc: '印度尼西亚' },
      { id: 'cv_30', key: 'TH', value: '764', desc: '泰国' },
      { id: 'cv_31', key: 'VN', value: '704', desc: '越南' }
    ]
  },
  {
    id: 'cs_8',
    code: 'EVENT_STATUS',
    name: '事件状态码',
    categoryId: 'cat_common',
    dataType: 'int',
    creator: '管理员',
    createdAt: '2026-09-12 08:00:00',
    description: '通用事件触发结果',
    values: [
      { id: 'cv_32', key: 'success', value: '1', desc: '成功' },
      { id: 'cv_33', key: 'fail', value: '0', desc: '失败' },
      { id: 'cv_34', key: 'timeout', value: '-1', desc: '超时' }
    ]
  }
]

/* ====== 事件属性库 ====== */
export const eventProperties = [
  { id: 'ep_1', name: 'ad_platform', displayName: '广告平台', dataType: 'list', codeSetId: 'cs_1', valueRange: '', remark: '广告 SDK 平台标识' },
  { id: 'ep_2', name: 'country_code', displayName: '国家代码', dataType: 'list', codeSetId: 'cs_2', valueRange: '', remark: 'ISO 国家代码' },
  { id: 'ep_3', name: 'channel', displayName: '获客渠道', dataType: 'list', codeSetId: 'cs_3', valueRange: '', remark: '用户来源渠道' },
  { id: 'ep_4', name: 'event_status', displayName: '事件状态', dataType: 'list', codeSetId: 'cs_4', valueRange: '', remark: '触发结果' },
  { id: 'ep_5', name: 'sub_type', displayName: '订阅类型', dataType: 'list', codeSetId: 'cs_5', valueRange: '', remark: 'VIP 档位' },
  { id: 'ep_6', name: 'revenue', displayName: '收入金额', dataType: 'float', codeSetId: '', valueRange: '0~999999.99', remark: '单位美元' },
  { id: 'ep_7', name: 'click_count', displayName: '点击次数', dataType: 'int', codeSetId: '', valueRange: '0~100', remark: '当日累计点击' },
  { id: 'ep_8', name: 'is_first', displayName: '是否首次', dataType: 'bool', codeSetId: '', valueRange: 'true/false', remark: '首次触发标记' },
  { id: 'ep_9', name: 'session_id', displayName: '会话ID', dataType: 'string', codeSetId: '', valueRange: 'UUID', remark: '设备会话标识' },
  { id: 'ep_10', name: 'duration', displayName: '停留时长', dataType: 'int', codeSetId: '', valueRange: '0~86400', remark: '单位秒' },
  { id: 'ep_11', name: 'placement', displayName: '广告位', dataType: 'string', codeSetId: '', valueRange: '', remark: '广告位标识符' },
  { id: 'ep_12', name: 'ep_level', displayName: '用户等级', dataType: 'enum', codeSetId: '', valueRange: '1;2;3;4;5', remark: '枚举值用分号分隔' },
  { id: 'ep_13', name: 'pay_amount', displayName: '支付金额', dataType: 'float', codeSetId: '', valueRange: '0.01~9999.99', remark: '单笔支付金额' },
  { id: 'ep_14', name: 'content_id', displayName: '内容ID', dataType: 'string', codeSetId: '', valueRange: '', remark: '短剧/剧集 ID' },
  { id: 'ep_15', name: 'watch_progress', displayName: '观看进度', dataType: 'float', codeSetId: '', valueRange: '0~100', remark: '百分比' }
]

/* ====== 事件库 ====== */
export const events = [
  {
    id: 'ev_1',
    eventId: 'app_open',
    name: '应用启动',
    type: 'common',
    platforms: ['Android', 'iOS', 'Web'],
    group: 'group_hope',
    category: 'cat_tool',
    products: ['prod_recover', 'prod_clean'],
    productVersion: '',
    domain: 'domain_dau',
    isAppEvent: true,
    status: 'published',
    description: '用户打开 App 时触发，用于统计 DAU 和应用内激活。按 UV 统计，设备状态为前台活跃。',
    boundProps: ['ep_9', 'ep_3', 'ep_2', 'ep_8'],
    version: 'v1.0',
    versionStatus: 'published'
  },
  {
    id: 'ev_2',
    eventId: 'ad_click',
    name: '广告点击',
    type: 'common',
    platforms: ['Android', 'iOS'],
    group: 'group_hope',
    category: 'cat_tool',
    products: ['prod_recover', 'prod_clean'],
    productVersion: '',
    domain: 'domain_ad',
    isAppEvent: true,
    status: 'published',
    description: '用户点击广告时触发，记录广告平台、广告位、渠道。按 PV 统计。',
    boundProps: ['ep_1', 'ep_11', 'ep_3', 'ep_7'],
    version: 'v1.1',
    versionStatus: 'published'
  },
  {
    id: 'ev_3',
    eventId: 'ad_revenue',
    name: '广告收入',
    type: 'common',
    platforms: ['Android', 'iOS'],
    group: 'group_hope',
    category: 'cat_tool',
    products: ['prod_recover', 'prod_clean'],
    productVersion: '',
    domain: 'domain_ad',
    isAppEvent: true,
    status: 'published',
    description: '广告展示产生收入时触发，记录平台、金额、广告位。按 PV 统计。',
    boundProps: ['ep_1', 'ep_6', 'ep_11', 'ep_4'],
    version: 'v1.1',
    versionStatus: 'published'
  },
  {
    id: 'ev_4',
    eventId: 'subscribe_success',
    name: '订阅成功',
    type: 'custom',
    platforms: ['Android', 'iOS'],
    group: 'group_hope',
    category: 'cat_drama',
    products: ['prod_onedrama'],
    productVersion: 'v3.0.0',
    domain: 'domain_pay',
    isAppEvent: true,
    status: 'draft',
    description: '用户完成 VIP 订阅支付时触发，记录订阅类型、金额、是否首次。按 UV 统计。',
    boundProps: ['ep_5', 'ep_13', 'ep_8', 'ep_2', 'ep_9'],
    version: 'v3.0',
    versionStatus: 'draft'
  },
  {
    id: 'ev_5',
    eventId: 'video_play',
    name: '视频播放',
    type: 'custom',
    platforms: ['Android', 'iOS', 'Web'],
    group: 'group_hope',
    category: 'cat_drama',
    products: ['prod_onedrama'],
    productVersion: 'v3.0.0',
    domain: 'domain_play',
    isAppEvent: true,
    status: 'published',
    description: '用户点击播放短剧时触发，记录内容ID、观看进度。按 PV 统计。',
    boundProps: ['ep_14', 'ep_15', 'ep_9'],
    version: 'v3.0',
    versionStatus: 'published'
  },
  {
    id: 'ev_6',
    eventId: 'video_complete',
    name: '视频播放完成',
    type: 'custom',
    platforms: ['Android', 'iOS', 'Web'],
    group: 'group_hope',
    category: 'cat_drama',
    products: ['prod_onedrama'],
    productVersion: 'v3.1.0',
    domain: 'domain_play',
    isAppEvent: true,
    status: 'draft',
    description: '短剧单集播放完成时触发，记录内容ID、停留时长。按 PV 统计。',
    boundProps: ['ep_14', 'ep_10', 'ep_9'],
    version: 'v3.1',
    versionStatus: 'draft'
  },
  {
    id: 'ev_7',
    eventId: 'install',
    name: '应用安装',
    type: 'common',
    platforms: ['Android', 'iOS'],
    group: 'group_star',
    category: 'cat_game',
    products: ['prod_puzzle'],
    productVersion: '',
    domain: 'domain_game_dau',
    isAppEvent: false,
    status: 'published',
    description: '用户首次安装 App 时触发，用于计算新增和归因。按 UV 统计。',
    boundProps: ['ep_3', 'ep_2', 'ep_9'],
    version: 'v2.0',
    versionStatus: 'published'
  },
  {
    id: 'ev_8',
    eventId: 'iap_purchase',
    name: '内购完成',
    type: 'custom',
    platforms: ['Android', 'iOS'],
    group: 'group_star',
    category: 'cat_game',
    products: ['prod_puzzle'],
    productVersion: 'v2.0.0',
    domain: 'domain_game_iap',
    isAppEvent: true,
    status: 'published',
    description: '用户完成游戏内购支付时触发，记录金额、是否首次。按 UV 统计。',
    boundProps: ['ep_13', 'ep_8', 'ep_2', 'ep_9'],
    version: 'v2.0',
    versionStatus: 'published'
  }
]

/* 版本历史 mock */
export const versionHistory = [
  { version: 'v3.1', status: 'draft', updatedAt: '2026-09-28 14:20', updatedBy: '张三', changes: '新增 video_complete 事件，移除 video_pause' },
  { version: 'v3.0', status: 'published', updatedAt: '2026-08-15 10:00', updatedBy: '李四', changes: '初始版本，包含 5 个核心事件' },
  { version: 'v2.9', status: 'published', updatedAt: '2026-06-20 16:30', updatedBy: '张三', changes: '移除旧版播放事件，统一为 video_play' }
]
