import apiClient from './apiClient'
class EmployeeService {
  
  async updateProfile(profileData) {
    try {
      console.log('Frontend: Sending profile update request', {
        url: '/profile',
        data: profileData
      })
      
      const response = await apiClient.put('/profile', profileData)
      
      console.log('Frontend: Profile update response', response.data)
      
      return response.data
    } catch (error) {
      console.error('Frontend: Error updating profile:', error)
      console.log('Frontend: Error details', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      throw error
    }
  }
  

  async submitLeave(leaveData) {
    try {
      const response = await apiClient.post('/leaves', leaveData)
      return response.data
    } catch (error) {
      console.error('Error submitting leave:', error)
      throw error
    }
  }
  

  async getLeaves(filters = {}) {
    try {
      const response = await apiClient.get('/leaves', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching leaves:', error)
      throw error
    }
  }
  
 
  async cancelLeave(leaveId) {
    try {
      const response = await apiClient.delete(`/leaves/${leaveId}`)
      return response.data
    } catch (error) {
      console.error('Error canceling leave:', error)
      throw error
    }
  }

  async checkIn() {
    try {
      const response = await apiClient.post('/attendance/check-in')
      return response.data
    } catch (error) {
      console.error('Error checking in:', error)
      throw error
    }
  }
  

  async checkOut() {
    try {
      const response = await apiClient.post('/attendance/check-out')
      return response.data
    } catch (error) {
      console.error('Error checking out:', error)
      throw error
    }
  }
  

  async getMySalaries(filters = {}) {
    try {
      const response = await apiClient.get('/my-salaries', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching salaries:', error)
      throw error
    }
  }

  async getProfile() {
    try {
      const response = await apiClient.get('/profile')
      return response.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }
  

  async getTodayAttendance() {
    try {
      const response = await apiClient.get('/attendance/today')
      return response.data
    } catch (error) {
      console.error('Error fetching today attendance:', error)
      throw error
    }
  }
  
 
  async getAttendanceHistory(filters = {}) {
    try {
      const response = await apiClient.get('/attendance/history', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching attendance history:', error)
      throw error
    }
  }
  

  async getLeaveTypes() {
    try {
    
      const response = await apiClient.get('/leave-types')
     
      return response.data
    } catch (error) {
  
      throw error
    }
  }

  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }
  

  async getSalaries() {
    try {
      const response = await apiClient.get('/my-salaries')
      return response.data
    } catch (error) {
      console.error('Error fetching salaries:', error)
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

  formatTime(timeString) {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
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

export default new EmployeeService()
