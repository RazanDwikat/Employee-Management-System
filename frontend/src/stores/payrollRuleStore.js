import { defineStore } from 'pinia'
import payrollRuleService from '@/services/payrollRuleService'

export const usePayrollRuleStore = defineStore('payrollRule', {

  state: () => ({
    payrollRules: [],
    allPayrollRules: [],

    loading: false,
    error: ''
  }),

  getters: {
    lateRulesCount: (state) =>
      state.allPayrollRules.filter(r => r.rule_type === 'late').length,

    overtimeRulesCount: (state) =>
      state.allPayrollRules.filter(r => r.rule_type === 'overtime').length,

    absenceRulesCount: (state) =>
      state.allPayrollRules.filter(r => r.rule_type === 'absence').length,

    leaveRulesCount: (state) =>
      state.allPayrollRules.filter(r => r.rule_type === 'leave').length
  },

  actions: {

    async fetchPayrollRules(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const response = await payrollRuleService.getPayrollRules({
          per_page: 50,
          ...params
        })

        const data = response.data || response

        this.allPayrollRules = Array.isArray(data) ? data : []
        this.payrollRules = this.allPayrollRules

      } catch (err) {
        this.error =
          err.response?.data?.message ||
          'Failed to fetch payroll rules'
      } finally {
        this.loading = false
      }
    },

    applyFilters(searchQuery, filters) {
      let data = [...this.allPayrollRules]

      if (searchQuery?.trim()) {
        const q = searchQuery.toLowerCase()
        data = data.filter(r =>
          r.rule_name.toLowerCase().includes(q)
        )
      }

      if (filters?.rule_type) {
        data = data.filter(r => r.rule_type === filters.rule_type)
      }

      this.payrollRules = data
    },

    async createRule(payload) {
      this.loading = true
      try {
        await payrollRuleService.createPayrollRule(payload)
        await this.fetchPayrollRules()
      } finally {
        this.loading = false
      }
    },

    async updateRule(id, payload) {
      this.loading = true
      try {
        await payrollRuleService.updatePayrollRule(id, payload)
        await this.fetchPayrollRules()
      } finally {
        this.loading = false
      }
    },

    async deleteRule(id) {
      this.loading = true
      try {
        await payrollRuleService.deletePayrollRule(id)
        await this.fetchPayrollRules()
      } finally {
        this.loading = false
      }
    },

    async getRule(id) {
      return await payrollRuleService.getPayrollRule(id)
    }
  }
})