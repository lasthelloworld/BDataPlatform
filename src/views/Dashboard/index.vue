<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Welcome to Hopemobi Mind Dashboard</h1>
      <p>Select a report from the sidebar to start analyzing</p>
    </div>
    <div class="dashboard-cards">
      <div class="dashboard-card" data-marker="dashboard_card_overview">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <div class="card-title">Local Overview Report</div>
          <div class="card-desc">View comprehensive app performance metrics</div>
        </div>
      </div>
      <div class="dashboard-card" data-marker="dashboard_card_ad">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <div class="card-title">Local Ad Performance</div>
          <div class="card-desc">Analyze ad exposure and ECPM data</div>
        </div>
      </div>
      <div class="dashboard-card" data-marker="dashboard_card_ai">
        <div class="card-icon">🤖</div>
        <div class="card-content">
          <div class="card-title">AI Analyses</div>
          <div class="card-desc">Leverage AI for data analysis</div>
        </div>
      </div>
      <div class="dashboard-card" data-marker="dashboard_card_iap">
        <div class="card-icon">🔍</div>
        <div class="card-content">
          <div class="card-title">IAP Web Report</div>
          <div class="card-desc">Track keyword performance</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 8px 0;
}

.dashboard-header p {
  font-size: 14px;
  color: #646a73;
  margin: 0;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.dashboard-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 40px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f5ff;
  border-radius: 12px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 4px 0;
}

.card-desc {
  font-size: 13px;
  color: #646a73;
  margin: 0;
}
</style>
