import axios from 'axios'

const API_URL = '/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Simple Dashboard Service
 * Uses existing APIs to get basic statistics
 */
class DashboardService {
  
  /**
   * Get basic dashboard statistics
   * @returns {Promise} Dashboard statistics
   */
  async getDashboardStats() {
    console.log('Fetching dashboard stats...')
    
    try {
      // Get users count
      const usersResponse = await apiClient.get('/users', {
        params: { per_page: 100 }  // Get all users, not just 5
      })
      console.log('Users API response:', usersResponse.data)
      // Users API returns paginated data with 'data' array and 'total'
      const totalUsers = usersResponse.data?.total || usersResponse.data?.data?.length || 
                        (Array.isArray(usersResponse.data) ? usersResponse.data.length : 0)
      
      // Get departments count
      const departmentsResponse = await apiClient.get('/departments')
      console.log('Departments API response:', departmentsResponse.data)
      // Departments API returns {message, departments: [...]}
      const totalDepartments = departmentsResponse.data?.departments?.length || 
                              departmentsResponse.data?.data?.length || 
                              (Array.isArray(departmentsResponse.data) ? departmentsResponse.data.length : 0)
      
      // Get active employees count
      const employeesResponse = await apiClient.get('/employees', { 
        params: { employment_status: 'active' } 
      })
      console.log('Employees API response:', employeesResponse.data)
      const activeEmployees = employeesResponse.data?.total || 
                            employeesResponse.data?.data?.length || 
                            (Array.isArray(employeesResponse.data) ? employeesResponse.data.length : 0)
      
      // Get current month salaries stats
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const salariesResponse = await apiClient.get('/salaries', {
        params: { 
          month: currentMonth,
          year: currentYear 
        }
      })
      const currentMonthSalaries = salariesResponse.data?.data || []
      
      // Calculate salary stats
      const paidSalaries = currentMonthSalaries.filter(s => s.status === 'paid').length
      const finalizedSalaries = currentMonthSalaries.filter(s => s.status === 'finalized').length
      const totalSalaryAmount = currentMonthSalaries.reduce((sum, s) => sum + (parseFloat(s.net_salary) || 0), 0)
      
      const stats = {
        totalUsers,
        totalDepartments,
        activeEmployees,
        currentMonthSalaries: currentMonthSalaries.length,
        paidSalaries,
        finalizedSalaries,
        totalSalaryAmount,
        month: currentMonth,
        year: currentYear
      }
      
      console.log('Dashboard stats fetched:', stats)
      return stats
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      
      // Return default values on error
      return {
        totalUsers: 0,
        totalDepartments: 0,
        activeEmployees: 0,
        currentMonthSalaries: 0,
        paidSalaries: 0,
        finalizedSalaries: 0,
        totalSalaryAmount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }
    }
  }
  
  /**
   * Format currency amount
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }
  
  /**
   * Get month name
   * @param {number} month - Month number (1-12)
   * @returns {string} Month name
   */
  getMonthName(month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || 'Unknown'
  }
  
  /**
   * Get quick actions data
   * @returns {Array} Quick actions with counts
   */
  getQuickActions() {
    return [
      {
        title: 'Manage Users',
        count: null,
        icon: '👥',
        route: '/admin/users'
      },
      {
        title: 'Manage Departments',
        count: null,
        icon: '🏢',
        route: '/admin/departments'
      },
      {
        title: 'Leave Requests',
        count: null,
        icon: '📋',
        route: '/admin/leave-requests'
      },
      {
        title: 'Salary Management',
        count: null,
        icon: '💰',
        route: '/admin/salary-management'
      }
    ]
  }
}

export default new DashboardService()
