import { defineStore } from 'pinia'
import leaveService from '@/services/leaveService'

export const useLeaveStore = defineStore('leave', {

  state: () => ({
    leaveRequests: [],
    allLeaveRequests: [],

    leaveTypes: [],

    loading: false,
    error: ''
  }),

  getters: {
    pendingCount: (state) =>
      state.allLeaveRequests.filter(r => r.status === 'pending').length,

    approvedCount: (state) =>
      state.allLeaveRequests.filter(r => r.status === 'approved').length,

    rejectedCount: (state) =>
      state.allLeaveRequests.filter(r => r.status === 'rejected').length
  },

  actions: {

 
    async fetchLeaveRequests(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const response = await leaveService.getLeaveRequests({
          per_page: 100,
          ...params
        })

        const data = response.data || response

        this.allLeaveRequests = Array.isArray(data) ? data : []
        this.leaveRequests = this.allLeaveRequests

      } catch (err) {
        this.error =
          err.response?.data?.message ||
          'Failed to fetch leave requests'
      } finally {
        this.loading = false
      }
    },

   
    applyFilters(searchQuery, filters) {
      let data = [...this.allLeaveRequests]

      // search
      if (searchQuery?.trim()) {
        const q = searchQuery.toLowerCase()
        data = data.filter(r =>
          r.employee?.user?.name?.toLowerCase().includes(q)
        )
      }

      // status filter
      if (filters?.status) {
        data = data.filter(r => r.status === filters.status)
      }

      this.leaveRequests = data
    },

    async approveRequest(id) {
      this.loading = true
      try {
        await leaveService.updateLeaveStatus(id, 'approved')
        await this.fetchLeaveRequests()
      } finally {
        this.loading = false
      }
    },

    async rejectRequest(id, reason) {
      this.loading = true
      try {
        await leaveService.updateLeaveStatus(id, 'rejected', reason)
        await this.fetchLeaveRequests()
      } finally {
        this.loading = false
      }
    },

   
    async fetchLeaveTypes(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const response = await leaveService.getLeaveTypes({
          per_page: 50,
          ...params
        })

        const data = response.data || response
        this.leaveTypes = Array.isArray(data) ? data : []

      } catch (err) {
        this.error =
          err.response?.data?.message ||
          'Failed to fetch leave types'
      } finally {
        this.loading = false
      }
    },

    async createLeaveType(payload) {
      this.loading = true
      try {
        await leaveService.createLeaveType(payload)
        await this.fetchLeaveTypes()
      } finally {
        this.loading = false
      }
    },

    async updateLeaveType(id, payload) {
      this.loading = true
      try {
        await leaveService.updateLeaveType(id, payload)
        await this.fetchLeaveTypes()
      } finally {
        this.loading = false
      }
    },

    async deleteLeaveType(id) {
      this.loading = true
      try {
        await leaveService.deleteLeaveType(id)
        await this.fetchLeaveTypes()
      } finally {
        this.loading = false
      }
    }
  }
})