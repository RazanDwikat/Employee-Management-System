import apiClient from './apiClient'

const departmentService = {
  async getDepartments() {
    console.log('Making API call to /departments')
    const response = await apiClient.get('/departments')
    console.log('API response:', response)
    console.log('Response data:', response.data)
    return response.data
  },

  async getDepartment(departmentId) {
    const response = await apiClient.get(`/departments/${departmentId}`)
    return response.data
  },

  async createDepartment(departmentData) {
    console.log('Creating department with data:', departmentData)
    const response = await apiClient.post('/departments', departmentData)
    console.log('Create department response:', response)
    console.log('Response data:', response.data)
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

  async getDepartmentEmployees(departmentId) {
    console.log(`Fetching employees for department ${departmentId}`)
    const response = await apiClient.get(`/departments/${departmentId}/employees`)
    console.log('Department employees response:', response)
    return response.data
  },

  async getManagers() {
    console.log('Fetching managers...')
    const response = await apiClient.get('/managers')
    console.log('Managers response:', response)
    return response.data
  }
}

export default departmentService
