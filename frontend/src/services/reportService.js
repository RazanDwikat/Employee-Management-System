import apiClient from './apiClient'
class ReportService {
  
  async getEmployeeReport() {
    try {
      const response = await apiClient.get('/reports/employees')
      return response.data
    } catch (error) {
      console.error('Error fetching employee report:', error)
      throw error
    }
  }
  async getDepartmentReport() {
    try {
      const response = await apiClient.get('/reports/departments')
      return response.data
    } catch (error) {
      console.error('Error fetching department report:', error)
      throw error
    }
  }
  
 
  async getAttendanceReport(filters) {
    try {
      const response = await apiClient.get('/reports/attendance', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching attendance report:', error)
      throw error
    }
  }
  

  async getSalaryReport(month, year) {
    try {
      const response = await apiClient.get('/reports/salaries', { 
        params: { month, year } 
      })
      return response.data
    } catch (error) {
      console.error('Error fetching salary report:', error)
      throw error
    }
  }
  
  async getLeaveReport(month, year) {
    try {
      const response = await apiClient.get('/reports/leaves', { 
        params: { month, year } 
      })
      return response.data
    } catch (error) {
      console.error('Error fetching leave report:', error)
      throw error
    }
  }
  

  async downloadAttendancePdf(filters) {
    try {
      const response = await apiClient.get('/reports/attendance/pdf', { 
        params: filters,
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance-${filters.month}-${filters.year}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return response
    } catch (error) {
      console.error('Error downloading attendance PDF:', error)
      throw error
    }
  }
  

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  getMonthName(month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || 'Unknown'
  }
  

  getAttendanceStatusColor(status) {
    const colors = {
      present: 'text-green-600 bg-green-100',
      late: 'text-yellow-600 bg-yellow-100',
      absent: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  getLeaveStatusColor(status) {
    const colors = {
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      pending: 'text-yellow-600 bg-yellow-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }
}

export default new ReportService()
