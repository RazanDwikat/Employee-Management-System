import apiClient from './apiClient'

const departmentService = {
  async getDepartments() {
    const response = await apiClient.get('/departments')
    return response.data
  },

  async getDepartment(departmentId) {
    const response = await apiClient.get(`/departments/${departmentId}`)
    return response.data
  },

  async createDepartment(departmentData) {
   
    const response = await apiClient.post('/departments', departmentData)
    return response.data
  },

  async updateDepartment(departmentId, departmentData) {
    const response = await apiClient.put(`/departments/${departmentId}`, departmentData)
    return response.data
  },

  async deleteDepartment(departmentId) {
    const response = await apiClient.delete(`/departments/${departmentId}`)
    return response.data
  },

  async assignManager(departmentId, managerId) {
    const response = await apiClient.put(`/departments/${departmentId}/assign-manager`, {
      manager_id: managerId
    })
    return response.data
  },

  async getDepartmentEmployees(departmentId) {console.log(`Fetching employees for department ${departmentId}`)
    const response = await apiClient.get(`/departments/${departmentId}/employees`)
    return response.data
  },

  async getManagers() {
   
    const response = await apiClient.get('/managers')
    return response.data
  }
}

export default departmentService
