<template>
  <div class="reports-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Reports & Analytics</h1>
      <p class="page-subtitle">Comprehensive insights into company performance and employee metrics</p>
    </div>

    <!-- Department Distribution -->
    <div class="reports-grid">
      <div class="report-card fade-in">
        <div class="card-header">
          <h3 class="card-title">Department Distribution</h3>
          <div class="card-icon">📊</div>
        </div>
        <div class="report-card-body">
          <div v-if="loading.departments" class="text-center py-8">
            <div class="loading-spinner mx-auto"></div>
          </div>
          <div v-else-if="departmentData.length > 0">
            <ChartContainer
              chart-type="pie"
              :chart-data="departmentChartData"
              :chart-options="departmentChartOptions"
              height="200px"
            />
            <div class="department-list">
              <div v-for="dept in departmentData" :key="dept.department" class="department-item">
                <div class="info">
                  <span class="name">{{ dept.department }}</span>
                  <span class="count">{{ dept.employees_count }} employees</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="`width: ${(dept.employees_count / departmentStats.total) * 100}%`"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <p>No department data available</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance and Salary Section -->
    <div class="reports-section">
      <h2 class="section-title">Performance Metrics</h2>
      <div class="reports-grid">
        <!-- Attendance Summary -->
        <div class="report-card fade-in">
          <div class="card-header">
            <h3 class="card-title">Attendance Summary</h3>
            <div class="card-icon">📈</div>
          </div>
          <div class="card-filters">
            <div class="filter-group">
              <label class="filter-label">Month:</label>
              <select v-model="attendanceFilters.month" class="filter-select">
                <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Year:</label>
              <select v-model="attendanceFilters.year" class="filter-select">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
        <div class="report-card-body">
          <div v-if="loading.attendance" class="text-center py-8">
            <div class="loading-spinner mx-auto"></div>
          </div>
          <div v-else-if="attendanceData.daily_report">
            <StatGrid :stats="attendanceStatsData" />
            <ChartContainer
              chart-type="bar"
              :chart-data="attendanceChartData"
              :chart-options="attendanceChartOptions"
              height="180px"
            />
            <div class="attendance-list">
              <div v-for="day in attendanceData.daily_report.slice(-6)" :key="day.date" class="attendance-item">
                <span class="date">{{ formatDate(day.date) }}</span>
                <div class="stats">
                  <span class="stat present">{{ day.summary.present }}P</span>
                  <span class="stat late">{{ day.summary.late }}L</span>
                  <span class="stat absent">{{ day.summary.absent }}A</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Select month and year to view attendance data</p>
          </div>
        </div>
      </div>

      <!-- Salary Insights -->
        <div class="report-card fade-in">
          <div class="card-header">
            <h3 class="card-title">Salary Insights</h3>
            <div class="card-icon">💰</div>
          </div>
          <div class="card-filters">
            <div class="filter-group">
              <label class="filter-label">Month:</label>
              <select v-model="salaryFilters.month" class="filter-select">
                <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Year:</label>
              <select v-model="salaryFilters.year" class="filter-select">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
        <div class="report-card-body">
          <div v-if="loading.salaries" class="text-center py-8">
            <div class="loading-spinner mx-auto"></div>
          </div>
          <div v-else-if="salaryData.total_salaries">
            <ChartContainer
              chart-type="bar"
              :chart-data="salaryChartData"
              :chart-options="salaryChartOptions"
              height="180px"
            />
            <StatGrid :stats="salaryStatsData" />
          </div>
          <div v-else class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Select month and year to view salary data</p>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Leave Insights Section -->
    <div class="reports-section">
      <h2 class="section-title">Leave Management</h2>
      <div class="reports-grid">
        <!-- Leave Insights -->
        <div class="report-card fade-in">
          <div class="card-header">
            <h3 class="card-title">Leave Insights</h3>
            <div class="card-icon">🏖️</div>
          </div>
          <div class="card-filters">
            <div class="filter-group">
              <label class="filter-label">Month:</label>
              <select v-model="leaveFilters.month" class="filter-select">
                <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Year:</label>
              <select v-model="leaveFilters.year" class="filter-select">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
          <div class="report-card-body">
          <div v-if="loading.leaves" class="text-center py-8">
            <div class="loading-spinner mx-auto"></div>
          </div>
          <div v-else-if="leaveData.total_leaves > 0">
            <ChartContainer
              chart-type="doughnut"
              :chart-data="leaveChartData"
              :chart-options="leaveChartOptions"
              height="180px"
            />
            <StatGrid :stats="leaveStatsData" />
          </div>
          <div v-else class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p>Select month and year to view leave data</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Section -->
    <div class="export-section">
      <h2 class="section-title">Export Reports</h2>
      <div class="export-card">
        <div class="export-header">
          <div class="export-icon">📄</div>
          <div class="export-content">
            <h3>Download Attendance Report</h3>
            <p>Generate comprehensive PDF report for selected period</p>
          </div>
        </div>
        <button 
          @click="downloadAttendancePdf" 
          :disabled="loading.pdf"
          class="btn btn-primary"
        >
          <span v-if="loading.pdf">
            <div class="loading-spinner"></div>
            Generating PDF...
          </span>
          <span v-else>
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download PDF Report
          </span>
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import reportService from '@/services/reportService'
import ChartContainer from '@/components/reports/ChartContainer.vue'
import StatGrid from '@/components/reports/StatGrid.vue'

export default {
  name: 'Reports',
  components: {
    ChartContainer,
    StatGrid
  },
  data() {
    return {
      loading: {
        departments: false,
        attendance: false,
        salaries: false,
        leaves: false,
        pdf: false
      },
      
      // Data
      departmentData: [],
      attendanceData: {},
      salaryData: {},
      leaveData: {},
      
      // Stats
      employeeStats: {
        total: 0
      },
      departmentStats: {
        total: 0
      },
      attendanceStats: {
        present: 0,
        late: 0,
        absent: 0,
        average: 0
      },
      salaryStats: {
        total: 0
      },
      
      // Filters
      attendanceFilters: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employee_id: null,
        department_id: null
      },
      salaryFilters: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      },
      leaveFilters: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      },
      
      // Options
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      years: Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i)
    }
  },
  
  computed: {
    departmentChartData() {
      return {
        labels: this.departmentData.map(dept => dept.department),
        datasets: [{
          data: this.departmentData.map(dept => dept.employees_count),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    },
    
    departmentChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 10,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ${value} (${percentage}%)`
              }
            }
          }
        }
      }
    },
    
    attendanceChartData() {
      if (!this.attendanceData.daily_report) return { labels: [], datasets: [] }
      
      const recentDays = this.attendanceData.daily_report.slice(-6)
      return {
        labels: recentDays.map(day => this.formatDate(day.date)),
        datasets: [
          {
            label: 'Present',
            data: recentDays.map(day => day.summary.present),
            backgroundColor: '#10B981'
          },
          {
            label: 'Late',
            data: recentDays.map(day => day.summary.late),
            backgroundColor: '#F59E0B'
          },
          {
            label: 'Absent',
            data: recentDays.map(day => day.summary.absent),
            backgroundColor: '#EF4444'
          }
        ]
      }
    },
    
    attendanceChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false }
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    },
    
    attendanceStatsData() {
      return [
        { label: 'Present', value: this.attendanceStats.present, valueClass: 'text-green-600' },
        { label: 'Late', value: this.attendanceStats.late, valueClass: 'text-yellow-600' },
        { label: 'Absent', value: this.attendanceStats.absent, valueClass: 'text-red-600' },
        { label: 'Average', value: `${this.attendanceStats.average}%` }
      ]
    },
    
    salaryChartData() {
      return {
        labels: ['Total', 'Average', 'Highest', 'Lowest'],
        datasets: [{
          label: 'Salary ($)',
          data: [
            this.salaryData.total_salaries,
            this.salaryData.average_salary,
            this.salaryData.highest_salary,
            this.salaryData.lowest_salary
          ],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
        }]
      }
    },
    
    salaryChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value.toLocaleString()
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => 'Salary: ' + reportService.formatCurrency(context.parsed.y)
            }
          }
        }
      }
    },
    
    salaryStatsData() {
      return [
        { label: 'Total Salaries', value: this.formatCurrency(this.salaryData.total_salaries) },
        { label: 'Average Salary', value: this.formatCurrency(this.salaryData.average_salary) },
        { label: 'Highest Salary', value: this.formatCurrency(this.salaryData.highest_salary) },
        { label: 'Lowest Salary', value: this.formatCurrency(this.salaryData.lowest_salary) }
      ]
    },
    
    leaveChartData() {
      return {
        labels: ['Approved', 'Rejected', 'Pending'],
        datasets: [{
          data: [
            this.leaveData.approved,
            this.leaveData.rejected,
            this.leaveData.pending
          ],
          backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    },
    
    leaveChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 10,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ${value} (${percentage}%)`
              }
            }
          }
        }
      }
    },
    
    leaveStatsData() {
      return [
        { label: 'Approved', value: this.leaveData.approved, labelClass: 'text-green-600', valueClass: 'text-green-900' },
        { label: 'Rejected', value: this.leaveData.rejected, labelClass: 'text-red-600', valueClass: 'text-red-900' },
        { label: 'Pending', value: this.leaveData.pending, labelClass: 'text-yellow-600', valueClass: 'text-yellow-900' },
        { label: 'Total Leaves', value: this.leaveData.total_leaves }
      ]
    }
  },
  
  async mounted() {
    await this.loadInitialData()
  },
  
  methods: {
    async loadInitialData() {
      await Promise.all([
        this.loadDepartmentReport(),
        this.loadAttendanceReport(),
        this.loadSalaryReport(),
        this.loadLeaveReport()
      ])
    },
    
    async loadDepartmentReport() {
      this.loading.departments = true
      try {
        const data = await reportService.getDepartmentReport()
        this.departmentData = data
        this.departmentStats.total = data.reduce((sum, dept) => sum + dept.employees_count, 0)
      } catch (error) {
        console.error('Error loading department report:', error)
      } finally {
        this.loading.departments = false
      }
    },
    
    async loadAttendanceReport() {
      this.loading.attendance = true
      try {
        const data = await reportService.getAttendanceReport(this.attendanceFilters)
        this.attendanceData = data
        
        // Calculate stats
        if (data.daily_report && data.daily_report.length > 0) {
          const totals = data.daily_report.reduce((acc, day) => {
            acc.present += day.summary.present
            acc.late += day.summary.late
            acc.absent += day.summary.absent
            return acc
          }, { present: 0, late: 0, absent: 0 })
          
          this.attendanceStats = totals
          const totalDays = totals.present + totals.late + totals.absent
          this.attendanceStats.average = totalDays > 0 ? Math.round((totals.present / totalDays) * 100) : 0
        }
      } catch (error) {
        console.error('Error loading attendance report:', error)
      } finally {
        this.loading.attendance = false
      }
    },
    
    async loadSalaryReport() {
      this.loading.salaries = true
      try {
        const data = await reportService.getSalaryReport(this.salaryFilters.month, this.salaryFilters.year)
        this.salaryData = data
        this.salaryStats.total = data.total_salaries || 0
      } catch (error) {
        console.error('Error loading salary report:', error)
      } finally {
        this.loading.salaries = false
      }
    },
    
    async loadLeaveReport() {
      this.loading.leaves = true
      try {
        const data = await reportService.getLeaveReport(this.leaveFilters.month, this.leaveFilters.year)
        this.leaveData = data
      } catch (error) {
        console.error('Error loading leave report:', error)
      } finally {
        this.loading.leaves = false
      }
    },
    
    async downloadAttendancePdf() {
      this.loading.pdf = true
      try {
        await reportService.downloadAttendancePdf(this.attendanceFilters)
      } catch (error) {
        console.error('Error downloading PDF:', error)
      } finally {
        this.loading.pdf = false
      }
    },
    
    formatCurrency(amount) {
      return reportService.formatCurrency(amount)
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  },
  
  watch: {
    'attendanceFilters.month': {
      handler() {
        this.loadAttendanceReport()
      }
    },
    'attendanceFilters.year': {
      handler() {
        this.loadAttendanceReport()
      }
    },
    'salaryFilters.month': {
      handler() {
        this.loadSalaryReport()
      }
    },
    'salaryFilters.year': {
      handler() {
        this.loadSalaryReport()
      }
    },
    'leaveFilters.month': {
      handler() {
        this.loadLeaveReport()
      }
    },
    'leaveFilters.year': {
      handler() {
        this.loadLeaveReport()
      }
    }
  }
}
</script>

<style scoped>
.reports-page {
  padding: 2rem;
  background: transparent;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #50837b 0%, #3d7d73 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

/* Reports Grid */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Section Title */
.reports-section {
  margin: 3rem 0 2rem 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

/* Report Cards */
.report-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-icon {
  font-size: 1.5rem;
  opacity: 0.8;
}

/* Card Filters */
.card-filters {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select {
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 400;
  transition: all 0.2s ease;
  min-width: 120px;
  cursor: pointer;
}

.filter-select:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.filter-select:focus {
  outline: none;
  border-color: #3d7d73;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Card Body */
.report-card-body {
  padding: 1.5rem;
}

/* Loading States */
.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid#3d7d73;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #6b7280;
}

.empty-state svg {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

/* Department List */
.department-list {
  margin-top: 1.5rem;
}

.department-item {
  margin-bottom: 1rem;
}

.department-item .info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.department-item .name {
  color: #1f2937;
  font-weight: 500;
  font-size: 0.875rem;
}

.department-item .count {
  color: #6b7280;
  font-size: 0.875rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #498077 0%, #3d7d73 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Attendance List */
.attendance-list {
  max-height: 20rem;
  overflow-y: auto;
  margin-top: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.attendance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.attendance-item:hover {
  background: #f9fafb;
}

.attendance-item:last-child {
  border-bottom: none;
}

.attendance-item .date {
  color: #1f2937;
  font-weight: 500;
  font-size: 0.875rem;
}

.attendance-item .stats {
  display: flex;
  gap: 0.5rem;
}

.attendance-item .stat {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.attendance-item .present {
  color: #059669;
  background: #d1fae5;
}

.attendance-item .late {
  color: #d97706;
  background: #fed7aa;
}

.attendance-item .absent {
  color: #dc2626;
  background: #fee2e2;
}

/* Export Section */
.export-section {
  margin-top: 3rem;
}

.export-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.export-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.export-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.export-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.export-content p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #497e76 0%, #3d7d73 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #457f77 0%, #3d7d73 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .reports-page {
    padding: 1rem;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .card-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .export-header {
    flex-direction: column;
    text-align: center;
  }
}

/* Scrollbar Styling */
.attendance-list::-webkit-scrollbar {
  width: 4px;
}

.attendance-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.attendance-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.attendance-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* Section Title */
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

/* Department List */
.department-list {
  margin-top: 20px;
}

.department-item {
  margin-bottom: 15px;
}

.department-item .info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.department-item .name {
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}

.department-item .count {
  color: #5f6368;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f1f3f4;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3d7d73;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Attendance List */
.attendance-list {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.attendance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.3s ease;
}

.attendance-item:hover {
  background: #f8f9fa;
}

.attendance-item .date {
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}

.attendance-item .stats {
  display: flex;
  gap: 8px;
}

.attendance-item .stat {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.attendance-item .present {
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.attendance-item .late {
  color: #856404;
  background: #fff3cd;
  border: 1px solid #ffeeba;
}

.attendance-item .absent {
  color: #721c24;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

/* Filters */
.filters-wrapper {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  background: white;
  border: 2px solid #e8eaed;
  color: #202124;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  transition: all 0.2s ease;
  min-width: 120px;
  cursor: pointer;
}

.filter-select:hover {
  border-color: #dadce0;
  background: #f8f9fa;
}

.filter-select:focus {
  outline: none;
  border-color: #3d7d73;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.load-btn {
  background: linear-gradient(135deg, #4a837a 0%, #3d7d73 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
}

.load-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a7a73 0%, #3d7d73 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(26, 115, 232, 0.4);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 16px;
}

/* Download Button */
.download-btn {
  background: #d4edda;
  color: #155724;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.download-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reports-page {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar Styling */
.attendance-list::-webkit-scrollbar {
  width: 4px;
}

.attendance-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.attendance-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.attendance-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
