import { defineStore } from 'pinia'
import departmentService from '@/services/departmentService'

export const useDepartmentStore = defineStore('department', {

  state: () => ({
    departments: [],
    managers: [],
    departmentEmployees: [],
    loading: false,
    loadingEmployees: false,
    error: ''
  }),

 
  actions: {

    async fetchDepartments() {
      this.loading = true
      this.error = ''

      try {
        const response = await departmentService.getDepartments()
        this.departments = response.departments || response
      } catch (err) {
        this.error = 'Failed to fetch departments'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchManagers() {
      try {
        const response = await departmentService.getManagers()
        this.managers = response.managers || response
      } catch (err) {
        console.error(err)
        this.managers = []
      }
    },

    async createDepartment(data) {
      this.loading = true
      try {
        await departmentService.createDepartment(data)
        await this.fetchDepartments()
      } finally {
        this.loading = false
      }
    },

    async updateDepartment(id, data) {
      this.loading = true
      try {
        await departmentService.updateDepartment(id, data)
        await this.fetchDepartments()
      } finally {
        this.loading = false
      }
    },

    async deleteDepartment(id) {
      this.loading = true
      try {
        await departmentService.deleteDepartment(id)
        await this.fetchDepartments()
      } finally {
        this.loading = false
      }
    },

    async assignManager(departmentId, managerId) {
      this.loading = true
      try {
        await departmentService.assignManager(departmentId, managerId)
        await this.fetchDepartments()
      } finally {
        this.loading = false
      }
    },

    async fetchDepartmentEmployees(departmentId) {
      this.loadingEmployees = true

      try {
        const response = await departmentService.getDepartmentEmployees(departmentId)
        this.departmentEmployees = response.employees || response
      } catch (err) {
        console.error(err)
        this.departmentEmployees = []
      } finally {
        this.loadingEmployees = false
      }
    }
  }
})