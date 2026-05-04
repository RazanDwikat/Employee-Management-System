// stores/dashboardAdmin.js
import { defineStore } from 'pinia'
import dashboardService from '@/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
  
  // 🟢 STATE
  state: () => ({
    stats: {
      totalUsers: 0,
      totalDepartments: 0,
      activeEmployees: 0,
      currentMonthSalaries: 0,
      paidSalaries: 0,
      finalizedSalaries: 0,
      totalSalaryAmount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    },

    loading: false
  }),

  // 🟡 GETTERS (قيم محسوبة)
  getters: {
    totalOverview: (state) => {
      return {
        users: state.stats.totalUsers,
        departments: state.stats.totalDepartments,
        employees: state.stats.activeEmployees
      }
    },

    salaryOverview: (state) => {
      return {
        total: state.stats.currentMonthSalaries,
        paid: state.stats.paidSalaries,
        finalized: state.stats.finalizedSalaries,
        amount: state.stats.totalSalaryAmount
      }
    },

    isLoading: (state) => state.loading
  },

  // 🔵 ACTIONS (API + logic)
  actions: {

    // fetch dashboard data
    async fetchStats() {
      this.loading = true

      try {
        const data = await dashboardService.getDashboardStats()
        this.stats = data
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        this.loading = false
      }
    },

    // reset stats (optional)
    resetStats() {
      this.stats = {
        totalUsers: 0,
        totalDepartments: 0,
        activeEmployees: 0,
        currentMonthSalaries: 0,
        paidSalaries: 0,
        finalizedSalaries: 0,
        totalSalaryAmount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }
    }
  }
})