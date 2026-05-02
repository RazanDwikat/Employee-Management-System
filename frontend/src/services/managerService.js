import apiClient from './apiClient'
class ManagerService {

  async getEmployees() {
    try {
      const response = await apiClient.get('/manager/employees')
      return response.data
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  }

  async assignEmployee(employeeId) {
    try {
      const response = await apiClient.put(`/manager/employees/${employeeId}/assign`)
      return response.data
    } catch (error) {
      console.error('Error assigning employee:', error)
      throw error
    }
  }
  
  async removeEmployee(employeeId) {
    try {
      const response = await apiClient.delete(`/manager/employees/${employeeId}/assign`)
      return response.data
    } catch (error) {
      console.error('Error removing employee:', error)
      throw error
    }
  }
  

  async updateEmployeeSchedule(employeeId, scheduleId) {
    try {
      const response = await apiClient.put(`/manager/employees/${employeeId}/schedule`, {
        work_schedule_id: scheduleId
      })
      return response.data
    } catch (error) {
      console.error('Error updating schedule:', error)
      throw error
    }
  }
  

  async getDepartmentAttendance() {
    try {
      const response = await apiClient.get('/manager/attendance')
      return response.data
    } catch (error) {
      console.error('Error fetching department attendance:', error)
      throw error
    }
  }
  

  async getWorkSchedules() {
    try {
      const response = await apiClient.get('/manager/work-schedules')
      return response.data
    } catch (error) {
      console.error('Error fetching work schedules:', error)
      throw error
    }
  }
  
  async updateLeaveStatus(leaveId, status, reason = '') {
    try {
     
      const action = status === 'approved' ? 'approve' : 'reject'
      
      const response = await apiClient.put(`/leaves/${leaveId}/status`, {
        action,
        reason
      })
      return response.data
    } catch (error) {
      console.error('Error updating leave status:', error)
      throw error
    }
  }
  
  

  async getPendingLeaves() {
    try {
      const response = await apiClient.get('/department-leaves')
      return response.data
    } catch (error) {
      console.error('Error fetching department leaves:', error)
      throw error
    }
  }

  async getTeamAttendance(filters = {}) {
    try {
      const response = await apiClient.get('/manager/attendance', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching team attendance:', error)
      throw error
    }
  }
  

  async assignEmployee(employeeId) {
    try {
      const response = await apiClient.put(`/manager/employees/${employeeId}/assign`)
      return response.data
    } catch (error) {
      console.error('Error assigning employee:', error)
      throw error
    }
  }
  
  async getEmployeesForAssignment() {
    try {
      const response = await apiClient.get('/manager/employees/available-for-assignment')
      return response.data
    } catch (error) {
      console.error('Error fetching employees for assignment:', error)
      throw error
    }
  }
  

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  

  getLeaveStatusColor(status) {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }
  
  getAttendanceStatusColor(status) {
    const colors = {
      present: 'text-green-600 bg-green-100',
      late: 'text-yellow-600 bg-yellow-100',
      absent: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }
}

export default new ManagerService()
