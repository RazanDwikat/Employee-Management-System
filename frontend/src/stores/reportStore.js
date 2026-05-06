import { defineStore } from 'pinia'
import reportService from '@/services/reportService'

export const useReportStore = defineStore('report', {
  state: () => ({
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
    
    // Loading states
    loading: {
      departments: false,
      attendance: false,
      salaries: false,
      leaves: false,
      pdf: false
    },
    
    // Error state
    error: '',
    
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
  }),

  getters: {
    departmentChartData: (state) => {
      return {
        labels: state.departmentData.map(dept => dept.department),
        datasets: [{
          data: state.departmentData.map(dept => dept.employees_count),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    },
    
    departmentChartOptions: () => {
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
    
    attendanceChartData: (state) => {
      if (!state.attendanceData.daily_report) return { labels: [], datasets: [] }
      
      const recentDays = state.attendanceData.daily_report.slice(-6)
      return {
        labels: recentDays.map(day => state.formatDate(day.date)),
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
    
    attendanceChartOptions: () => {
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
    
    attendanceStatsData: (state) => {
      return [
        { label: 'Present', value: state.attendanceStats.present, valueClass: 'text-green-600' },
        { label: 'Late', value: state.attendanceStats.late, valueClass: 'text-yellow-600' },
        { label: 'Absent', value: state.attendanceStats.absent, valueClass: 'text-red-600' },
        { label: 'Average', value: `${state.attendanceStats.average}%` }
      ]
    },
    
    salaryChartData: (state) => {
      return {
        labels: ['Total', 'Average', 'Highest', 'Lowest'],
        datasets: [{
          label: 'Salary ($)',
          data: [
            state.salaryData.total_salaries,
            state.salaryData.average_salary,
            state.salaryData.highest_salary,
            state.salaryData.lowest_salary
          ],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
        }]
      }
    },
    
    salaryChartOptions: () => {
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
    
    salaryStatsData: (state) => {
      return [
        { label: 'Total Salaries', value: state.formatCurrency(state.salaryData.total_salaries) },
        { label: 'Average Salary', value: state.formatCurrency(state.salaryData.average_salary) },
        { label: 'Highest Salary', value: state.formatCurrency(state.salaryData.highest_salary) },
        { label: 'Lowest Salary', value: state.formatCurrency(state.salaryData.lowest_salary) }
      ]
    },
    
    leaveChartData: (state) => {
      return {
        labels: ['Approved', 'Rejected', 'Pending'],
        datasets: [{
          data: [
            state.leaveData.approved,
            state.leaveData.rejected,
            state.leaveData.pending
          ],
          backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    },
    
    leaveChartOptions: () => {
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
    
    leaveStatsData: (state) => {
      return [
        { label: 'Approved', value: state.leaveData.approved, labelClass: 'text-green-600', valueClass: 'text-green-900' },
        { label: 'Rejected', value: state.leaveData.rejected, labelClass: 'text-red-600', valueClass: 'text-red-900' },
        { label: 'Pending', value: state.leaveData.pending, labelClass: 'text-yellow-600', valueClass: 'text-yellow-900' },
        { label: 'Total Leaves', value: state.leaveData.total_leaves }
      ]
    }
  },

  actions: {
    async fetchDepartmentReport() {
      this.loading.departments = true
      this.error = ''
      
      try {
        const data = await reportService.getDepartmentReport()
        this.departmentData = data
        this.departmentStats.total = data.reduce((sum, dept) => sum + dept.employees_count, 0)
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch department report'
        console.error('Error loading department report:', err)
      } finally {
        this.loading.departments = false
      }
    },
    
    async fetchAttendanceReport() {
      this.loading.attendance = true
      this.error = ''
      
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
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch attendance report'
        console.error('Error loading attendance report:', err)
      } finally {
        this.loading.attendance = false
      }
    },
    
    async fetchSalaryReport() {
      this.loading.salaries = true
      this.error = ''
      
      try {
        const data = await reportService.getSalaryReport(this.salaryFilters.month, this.salaryFilters.year)
        this.salaryData = data
        this.salaryStats.total = data.total_salaries || 0
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch salary report'
        console.error('Error loading salary report:', err)
      } finally {
        this.loading.salaries = false
      }
    },
    
    async fetchLeaveReport() {
      this.loading.leaves = true
      this.error = ''
      
      try {
        const data = await reportService.getLeaveReport(this.leaveFilters.month, this.leaveFilters.year)
        this.leaveData = data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch leave report'
        console.error('Error loading leave report:', err)
      } finally {
        this.loading.leaves = false
      }
    },
    
    async downloadAttendancePdf() {
      this.loading.pdf = true
      this.error = ''
      
      try {
        await reportService.downloadAttendancePdf(this.attendanceFilters)
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to download PDF'
        console.error('Error downloading PDF:', err)
      } finally {
        this.loading.pdf = false
      }
    },
    
    async loadAllReports() {
      await Promise.all([
        this.fetchDepartmentReport(),
        this.fetchAttendanceReport(),
        this.fetchSalaryReport(),
        this.fetchLeaveReport()
      ])
    },
    
    updateAttendanceFilters(filters) {
      this.attendanceFilters = { ...this.attendanceFilters, ...filters }
    },
    
    updateSalaryFilters(filters) {
      this.salaryFilters = { ...this.salaryFilters, ...filters }
    },
    
    updateLeaveFilters(filters) {
      this.leaveFilters = { ...this.leaveFilters, ...filters }
    },
    
    // Helper methods
    formatCurrency(amount) {
      return reportService.formatCurrency(amount)
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
})
