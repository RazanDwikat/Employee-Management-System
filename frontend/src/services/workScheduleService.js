import apiClient from './apiClient'

export default {

  async getWorkSchedules(params = {}) {
    console.log('Fetching work schedules with params:', params)
    const response = await apiClient.get('/work-schedules', { params })
    console.log('Work schedules response:', response)
    return response.data
  },

 
  async getWorkSchedule(id) {
    console.log(`Fetching work schedule ${id}`)
    const response = await apiClient.get(`/work-schedules/${id}`)
    console.log('Work schedule response:', response)
    return response.data
  },

  async createWorkSchedule(scheduleData) {
    console.log('Creating work schedule:', scheduleData)
    const response = await apiClient.post('/work-schedules', scheduleData)
    console.log('Work schedule created:', response)
    return response.data
  },

 
  async updateWorkSchedule(id, scheduleData) {
    console.log(`Updating work schedule ${id}:`, scheduleData)
    const response = await apiClient.put(`/work-schedules/${id}`, scheduleData)
    console.log('Work schedule updated:', response)
    return response.data
  },

  async deleteWorkSchedule(id) {
    console.log(`Deleting work schedule ${id}`)
    const response = await apiClient.delete(`/work-schedules/${id}`)
    console.log('Work schedule deleted:', response)
    return response.data
  },


  async getScheduleEmployees(scheduleId) {
    console.log(`Fetching employees for schedule ${scheduleId}`)
    const response = await apiClient.get(`/work-schedules/${scheduleId}/employees`)
    console.log('Schedule employees response:', response)
    return response.data
  },

 
  async assignScheduleToEmployees(scheduleId, employeeIds) {
    console.log(`Assigning schedule ${scheduleId} to employees:`, employeeIds)
    const response = await apiClient.post(`/work-schedules/${scheduleId}/assign`, {
      employee_ids: employeeIds
    })
    console.log('Schedule assigned:', response)
    return response.data
  },


  async removeScheduleFromEmployees(scheduleId, employeeIds) {
    console.log(`Removing schedule ${scheduleId} from employees:`, employeeIds)
    const response = await apiClient.post(`/work-schedules/${scheduleId}/remove`, {
      employee_ids: employeeIds
    })
    console.log('Schedule removed:', response)
    return response.data
  },

  async getScheduleStatistics() {
    console.log('Fetching work schedule statistics')
    const response = await apiClient.get('/work-schedules/statistics')
    console.log('Schedule statistics response:', response)
    return response.data
  },

  async exportWorkSchedules(params = {}) {
    console.log('Exporting work schedules with params:', params)
    const response = await apiClient.get('/work-schedules/export', { 
      params,
      responseType: 'blob'
    })
    console.log('Work schedules exported:', response)
    return response.data
  }
}
