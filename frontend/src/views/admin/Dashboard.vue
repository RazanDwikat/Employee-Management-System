<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    
    <!-- Main Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Total Users</h3>
          <p class="stat-number">{{ stats.totalUsers }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏢</div>
        <div class="stat-content">
          <h3>Total Departments</h3>
          <p class="stat-number">{{ stats.totalDepartments }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👨‍💼</div>
        <div class="stat-content">
          <h3>Active Employees</h3>
          <p class="stat-number">{{ stats.activeEmployees }}</p>
        </div>
      </div>
    </div>
    
    <!-- Salary Stats for Current Month -->
    <div class="section-title">
      <h2>{{ getMonthName(stats.month) }} {{ stats.year }} Salary Overview</h2>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Total Salaries</h3>
          <p class="stat-number">{{ stats.currentMonthSalaries }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Finalized</h3>
          <p class="stat-number">{{ stats.finalizedSalaries }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Paid</h3>
          <p class="stat-number">{{ stats.paidSalaries }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💵</div>
        <div class="stat-content">
          <h3>Total Amount</h3>
          <p class="stat-number">{{ formatCurrency(stats.totalSalaryAmount) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="section-title">
      <h2>Quick Actions</h2>
    </div>
    <div class="quick-actions">
      <router-link 
        v-for="action in quickActions" 
        :key="action.title"
        :to="action.route" 
        class="quick-action-card"
      >
        <div class="action-icon">{{ action.icon }}</div>
        <div class="action-title">{{ action.title }}</div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import dashboardService from '@/services/dashboardService'

export default {
  name: 'AdminDashboard',
  setup() {
    const stats = ref({
      totalUsers: 0,
      totalDepartments: 0,
      activeEmployees: 0,
      currentMonthSalaries: 0,
      paidSalaries: 0,
      finalizedSalaries: 0,
      totalSalaryAmount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    })
    
    const loading = ref(false)
    const quickActions = ref(dashboardService.getQuickActions())
    
    // Fetch dashboard stats
    const fetchStats = async () => {
      loading.value = true
      try {
        const data = await dashboardService.getDashboardStats()
        stats.value = data
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        loading.value = false
      }
    }
    
    // Helper methods
    const formatCurrency = (amount) => {
      return dashboardService.formatCurrency(amount)
    }
    
    const getMonthName = (month) => {
      return dashboardService.getMonthName(month)
    }
    
    onMounted(() => {
      fetchStats()
    })
    
    return {
      stats,
      loading,
      quickActions,
      formatCurrency,
      getMonthName
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 32px;
  font-weight: 600;
}

.section-title {
  margin: 40px 0 20px 0;
  border-bottom: 2px solid #f1f3f4;
  padding-bottom: 10px;
}

.section-title h2 {
  color: #5f6368;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
  line-height: 1;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.quick-action-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  text-decoration: none;
  color: inherit;
}

.action-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f0fe;
  border-radius: 12px;
}

.action-title {
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  text-align: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 15px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}
</style>
