<template>
  <div class="order-table">
    <div class="table-header">
      <h3 class="table-title">订单明细</h3>
      <a-input 
        v-model="searchKeyword"
        placeholder="搜索订单号/客户名"
        @input="handleSearch"
        data-marker="输入关键字搜索订单"
      >
        <template #prefix>🔍</template>
      </a-input>
    </div>
    <a-table
      :columns="columns"
      :data-source="filteredOrders"
      :pagination="pagination"
      :loading="loading"
      :row-key="record => record.id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'amount'">
          {{ record.amount.toFixed(2) }} 万元
        </template>
        <template v-if="column.key === 'customer'">
          {{ maskCustomer(record.customer) }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { orderList } from '@/services/mockData'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const searchKeyword = ref('')
const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: orderList.length,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const columns = [
  {
    title: '订单号',
    dataIndex: 'id',
    key: 'id',
    width: 120,
    title: '订单号',
    sorter: true
  },
  {
    title: '下单时间',
    dataIndex: 'time',
    key: 'time',
    width: 160,
    sorter: true
  },
  {
    title: '客户名称',
    dataIndex: 'customer',
    key: 'customer',
    width: 100
  },
  {
    title: '订单金额（万元）',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    align: 'right',
    sorter: (a, b) => a.amount - b.amount
  },
  {
    title: '所属区域',
    dataIndex: 'region',
    key: 'region'
  }
]

const filteredOrders = computed(() => {
  let data = [...orderList]
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    data = data.filter(item => 
      item.id.toLowerCase().includes(keyword) || 
      item.customer.toLowerCase().includes(keyword)
    )
  }
  
  pagination.value.total = data.length
  
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  
  return data.slice(start, end)
})

const maskCustomer = (name) => {
  if (!name) return ''
  if (name.length <= 1) return name
  return name[0] + '**'
}

const handleSearch = () => {
  pagination.value.current = 1
}

const handleTableChange = (page, filters, sorter) => {
  pagination.value = {
    ...pagination.value,
    current: page.current,
    pageSize: page.pageSize
  }
}

watch(() => props.filters, () => {
  pagination.value.current = 1
}, { deep: true })
</script>

<style scoped>
.order-table {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0;
}
</style>