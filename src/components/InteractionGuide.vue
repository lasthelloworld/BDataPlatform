<template>
  <details class="interaction-guide" open>
    <summary class="guide-header">
      <span class="guide-icon">💡</span>
      <span class="guide-title">交互说明</span>
    </summary>
    <div class="guide-content">
      <div class="guide-section">
        <h4>筛选区域</h4>
        <ul>
          <li><strong>日期范围选择器</strong>：点击选择自定义时间范围，默认展示近30天数据</li>
          <li><strong>区域级联选择器</strong>：支持省/市二级联动选择</li>
          <li><strong>重置按钮</strong>：恢复默认筛选条件</li>
        </ul>
      </div>
      <div class="guide-section">
        <h4>核心指标</h4>
        <ul>
          <li><strong>指标卡片</strong>：展示总销售额、订单量、客单价、同比增长率</li>
          <li><strong>同比标识</strong>：绿色↑表示增长，红色↓表示下降</li>
        </ul>
      </div>
      <div class="guide-section">
        <h4>可视化图表</h4>
        <ul>
          <li><strong>月度趋势折线图</strong>：点击月份可联动饼图切换数据</li>
          <li><strong>区域占比饼图</strong>：点击扇区可下钻至下级城市数据</li>
          <li><strong>面包屑导航</strong>：支持点击返回上级区域</li>
        </ul>
      </div>
      <div class="guide-section">
        <h4>订单明细</h4>
        <ul>
          <li><strong>搜索框</strong>：支持订单号/客户名关键字搜索</li>
          <li><strong>表头排序</strong>：点击可按对应字段排序</li>
          <li><strong>分页器</strong>：支持切换页码和每页条数</li>
        </ul>
      </div>
      <div class="guide-section">
        <h4>数据导出</h4>
        <ul>
          <li><strong>导出按钮</strong>：点击打开导出配置弹窗</li>
          <li><strong>导出选项</strong>：可选择导出指标摘要、图表数据、明细表格</li>
        </ul>
      </div>
    </div>
  </details>
</template>

<script setup>
</script>

<style scoped>
.interaction-guide {
  margin-top: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.guide-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  cursor: pointer;
  font-weight: 500;
}

.guide-icon {
  margin-right: 8px;
}

.guide-title {
  font-size: 14px;
  color: #333;
}

.guide-content {
  padding: 20px;
}

.guide-section {
  margin-bottom: 16px;
}

.guide-section:last-child {
  margin-bottom: 0;
}

.guide-section h4 {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.guide-section ul {
  list-style: none;
  padding-left: 12px;
}

.guide-section li {
  font-size: 13px;
  color: #888;
  line-height: 1.8;
}

.guide-section li strong {
  color: #333;
}
</style>