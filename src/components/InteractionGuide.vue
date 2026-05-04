<template>
  <details class="interaction-guide">
    <summary class="guide-header">
      <span class="guide-icon">📌</span>
      <span class="guide-title">交互说明</span>
    </summary>
    <div class="guide-content">
      <h4 class="section-title">页面可交互元素标注清单</h4>
      <table class="marker-table">
        <thead>
          <tr>
            <th>data-marker 属性值</th>
            <th>元素说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>侧边栏导航菜单</td>
            <td>侧边栏菜单项，切换页面功能模块</td>
          </tr>
          <tr>
            <td>打开数据导出配置弹窗</td>
            <td>顶部筛选栏导出数据按钮，打开导出配置弹窗</td>
          </tr>
          <tr>
            <td>选择时间范围筛选数据</td>
            <td>日期范围选择器，支持自定义起止日期，默认近30天</td>
          </tr>
          <tr>
            <td>选择省/市二级联动区域筛选数据</td>
            <td>区域级联选择器，支持省/市二级联动筛选</td>
          </tr>
          <tr>
            <td>重置筛选条件恢复默认值</td>
            <td>重置按钮，恢复日期范围为近30天，清空区域选择</td>
          </tr>
          <tr>
            <td>核心指标-总销售额卡片</td>
            <td>核心指标卡片，展示总销售额（万元），来源ODS订单事实表</td>
          </tr>
          <tr>
            <td>核心指标-订单量卡片</td>
            <td>核心指标卡片，展示订单量，来源ODS订单事实表</td>
          </tr>
          <tr>
            <td>核心指标-客单价卡片</td>
            <td>核心指标卡片，展示客单价（万元），计算逻辑：总销售额/订单量</td>
          </tr>
          <tr>
            <td>核心指标-同比增长率卡片</td>
            <td>核心指标卡片，展示同比增长率（%），计算逻辑：(本期-去年同期)/去年同期*100%</td>
          </tr>
          <tr>
            <td>月度销售趋势折线图容器</td>
            <td>月度销售趋势折线图，点击月份可联动饼图切换数据</td>
          </tr>
          <tr>
            <td>区域销售占比饼图容器</td>
            <td>区域销售占比饼图，点击扇区可下钻至下级城市数据</td>
          </tr>
          <tr>
            <td>点击面包屑返回上级区域</td>
            <td>面包屑导航项，点击可返回对应上级区域</td>
          </tr>
          <tr>
            <td>输入关键字搜索订单</td>
            <td>订单搜索框，支持订单号/客户名关键字实时搜索</td>
          </tr>
          <tr>
            <td>数据导出配置弹窗</td>
            <td>导出配置弹窗，可选择导出指标摘要/图表数据/明细表格</td>
          </tr>
          <tr>
            <td>全选/取消全选导出选项</td>
            <td>全选复选框，勾选/取消勾选所有导出选项</td>
          </tr>
          <tr>
            <td>选择导出指标摘要</td>
            <td>导出选项复选框，选择导出指标摘要数据</td>
          </tr>
          <tr>
            <td>选择导出图表数据</td>
            <td>导出选项复选框，选择导出图表数据</td>
          </tr>
          <tr>
            <td>选择导出明细表格</td>
            <td>导出选项复选框，选择导出明细表格数据</td>
          </tr>
          <tr>
            <td>取消导出</td>
            <td>导出弹窗取消按钮，关闭弹窗并重置选择</td>
          </tr>
          <tr>
            <td>确认导出选中内容</td>
            <td>导出确认按钮，生成并下载Excel文件</td>
          </tr>
        </tbody>
      </table>
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

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.marker-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.marker-table th,
.marker-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.marker-table th {
  background: #fafafa;
  font-weight: 500;
  color: #666;
}

.marker-table td:first-child {
  color: #1677ff;
  font-family: monospace;
}

.marker-table td:last-child {
  color: #666;
}

.marker-table tr:last-child td {
  border-bottom: none;
}
</style>