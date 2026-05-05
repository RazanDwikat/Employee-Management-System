import apiClient from './apiClient'

export default {

  async getLeaveTypes(params = {}) {
    console.log('Fetching leave types with params:', params)
    const response = await apiClient.get('/leave-types', { params })
    console.log('Leave types response:', response)
    return response.data
  },

 
  async getLeaveType(id) {
    console.log(`Fetching leave type ${id}`)
    const response = await apiClient.get(`/leave-types/${id}`)
    console.log('Leave type response:', response)
    return response.data
  },

  async createLeaveType(leaveTypeData) {
    console.log('Creating leave type:', leaveTypeData)
    const response = await apiClient.post('/leave-types', leaveTypeData)
    console.log('Leave type created:', response)
    return response.data
  },

  
  async updateLeaveType(id, leaveTypeData) {
    console.log(`Updating leave type ${id}:`, leaveTypeData)
    const response = await apiClient.put(`/leave-types/${id}`, leaveTypeData)
    console.log('Leave type updated:', response)
    return response.data
  },

  async deleteLeaveType(id) {
    console.log(`Deleting leave type ${id}`)
    const response = await apiClient.delete(`/leave-types/${id}`)
    console.log('Leave type deleted:', response)
    return response.data
  },

  async getLeaveRequests(params = {}) {
    console.log('Fetching leave requests with params:', params)
    const response = await apiClient.get('/leaves', { params })
    console.log('Leave requests response:', response)
    return response.data
  },

  async getLeaveRequest(id) {
    console.log(`Fetching leave request ${id}`)
    const response = await apiClient.get(`/leaves/${id}`)
    console.log('Leave request response:', response)
    return response.data
  },

  async updateLeaveStatus(id, action, reason = '') {
    console.log(`Updating leave ${id} status to: ${action}`)
    const response = await apiClient.put(`/admin/leaves/${id}/status`, {
      action,
      reason
    })
    console.log('Leave status updated:', response)
    return response.data
  },

  async getLeaveStatistics(params = {}) {
    console.log('Fetching leave statistics with params:', params)
    const response = await apiClient.get('/leave-statistics', { params })
    console.log('Leave statistics response:', response)
    return response.data
  },

  async getLeaveCalendar(params = {}) {
    console.log('Fetching leave calendar with params:', params)
    const response = await apiClient.get('/leave-calendar', { params })
    console.log('Leave calendar response:', response)
    return response.data
  },


  async getEmployeeLeaveBalance(employeeId) {
    console.log(`Fetching leave balance for employee ${employeeId}`)
    const response = await apiClient.get(`/employees/${employeeId}/leave-balance`)
    console.log('Leave balance response:', response)
    return response.data
  },

  async exportLeaveRequests(params = {}) {
    console.log('Exporting leave requests with params:', params)
    const response = await apiClient.get('/leaves/export', { 
      params,
      responseType: 'blob'
    })
    console.log('Leave requests exported:', response)
    return response.data
  }
}
