import { defineStore } from 'pinia'
import managerService from '../services/managerService'

export const useManagerStore = defineStore('manager', {
  state: () => ({
   
    employees: [],
    employeesForAssignment: [],
    
    
    pendingLeaves: [],
    departmentLeaves: [],
    
    
    teamAttendance: [],
    departmentAttendance: [],
    
  
    workSchedules: [],
    
    
    dashboardStats: {
      teamMembers: 0,
      pendingLeaves: 0,
      attendanceRate: 0
    },
  
    attendanceFilters: {
      date: '',
      status: ''
    },
    
   
    loading: {
      employees: false,
      assignment: false,
      leaves: false,
      attendance: false,
      schedules: false,
      dashboard: false
    },
    
    
    message: '',
    messageType: 'success'
  }),
  
  getters: {
 
    presentCount: (state) => {
      if (!Array.isArray(state.employees)) return 0
      return state.employees.filter(emp => emp.attendance_status === 'present').length
    },
    
    onLeaveCount: (state) => {
      if (!Array.isArray(state.employees)) return 0
      return state.employees.filter(emp => emp.attendance_status === 'on_leave').length
    },
    
   
    approvedCount: (state) => {
      if (!Array.isArray(state.departmentLeaves)) return 0
      return state.departmentLeaves.filter(leave => leave.status === 'approved').length
    },
    
    rejectedCount: (state) => {
      if (!Array.isArray(state.departmentLeaves)) return 0
      return state.departmentLeaves.filter(leave => leave.status === 'rejected').length
    },
    
   
    attendanceStats: (state) => {
      const attendance = state.teamAttendance
      if (!Array.isArray(attendance)) {
        return {
          totalEmployees: 0,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0
        }
      }
      return {
        totalEmployees: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        halfDay: attendance.filter(a => a.status === 'half_day').length
      }
    }
  },
  
  actions: {
  
    async loadEmployees() {
      try {
        this.loading.employees = true
        
        const response = await managerService.getEmployees()
        this.employees = response.employees || response.data || response
        
      } catch (error) {
        console.error('Error loading employees:', error)
        this.showMessage('Error loading employees', 'error')
      } finally {
        this.loading.employees = false
      }
    },
    
    async loadEmployeesForAssignment() {
      try {
        this.loading.assignment = true
        
        const response = await managerService.getEmployeesForAssignment()
        this.employeesForAssignment = response.employees || response.data || response
        
      } catch (error) {
        console.error('Error loading employees for assignment:', error)
        this.showMessage('Error loading employees for assignment', 'error')
      } finally {
        this.loading.assignment = false
      }
    },
    
    async assignEmployee(employeeId) {
      try {
        this.loading.assignment = true
        
        await managerService.assignEmployee(employeeId)
        
       
        await this.loadEmployees()
        
        this.showMessage('Employee assigned successfully!', 'success')
        
      } catch (error) {
        console.error('Error assigning employee:', error)
        this.showMessage('Error assigning employee', 'error')
      } finally {
        this.loading.assignment = false
      }
    },
    
    async removeEmployee(employeeId) {
      try {
        this.loading.assignment = true
        
        await managerService.removeEmployee(employeeId)
       
        await this.loadEmployees()
        
        this.showMessage('Employee removed successfully!', 'success')
        
      } catch (error) {
        console.error('Error removing employee:', error)
        this.showMessage('Error removing employee', 'error')
      } finally {
        this.loading.assignment = false
      }
    },
    
    async updateEmployeeSchedule(employeeId, scheduleId) {
      try {
        this.loading.assignment = true
        
        await managerService.updateEmployeeSchedule(employeeId, scheduleId)
        
       
        await this.loadEmployees()
        
        this.showMessage('Employee schedule updated successfully!', 'success')
        
      } catch (error) {
        console.error('Error updating employee schedule:', error)
        this.showMessage('Error updating employee schedule', 'error')
      } finally {
        this.loading.assignment = false
      }
    },
    
   
    async loadPendingLeaves() {
      try {
        this.loading.leaves = true
        
        const response = await managerService.getPendingLeaves()
        this.pendingLeaves = response.data || response
        
      } catch (error) {
        console.error('Error loading pending leaves:', error)
        this.showMessage('Error loading pending leaves', 'error')
      } finally {
        this.loading.leaves = false
      }
    },
    
    async loadDepartmentLeaves() {
      try {
        this.loading.leaves = true
        
        const response = await managerService.getPendingLeaves()
        this.departmentLeaves = response.data || response
        
      } catch (error) {
        console.error('Error loading department leaves:', error)
        this.showMessage('Error loading department leaves', 'error')
      } finally {
        this.loading.leaves = false
      }
    },
    
    async updateLeaveStatus(leaveId, status, reason = '') {
      try {
        this.loading.leaves = true
        
        await managerService.updateLeaveStatus(leaveId, status, reason)
        
        // Reload leaves
        await this.loadDepartmentLeaves()
        
        this.showMessage(`Leave ${status} successfully!`, 'success')
        
      } catch (error) {
        console.error('Error updating leave status:', error)
        this.showMessage('Error updating leave status', 'error')
      } finally {
        this.loading.leaves = false
      }
    },
    
   
    async loadTeamAttendance() {
      try {
        this.loading.attendance = true
        
        const response = await managerService.getTeamAttendance(this.attendanceFilters)
        this.teamAttendance = response.data || response
        
      } catch (error) {
        console.error('Error loading team attendance:', error)
        this.showMessage('Error loading team attendance', 'error')
      } finally {
        this.loading.attendance = false
      }
    },
    
    async loadDepartmentAttendance() {
      try {
        this.loading.attendance = true
        
        const response = await managerService.getDepartmentAttendance()
        this.departmentAttendance = response.data || response
        
      } catch (error) {
        console.error('Error loading department attendance:', error)
        this.showMessage('Error loading department attendance', 'error')
      } finally {
        this.loading.attendance = false
      }
    },
    
   
    async loadWorkSchedules() {
      try {
        this.loading.schedules = true
        
        const response = await managerService.getWorkSchedules()
        this.workSchedules = response.data || response
        
      } catch (error) {
        console.error('Error loading work schedules:', error)
        this.showMessage('Error loading work schedules', 'error')
      } finally {
        this.loading.schedules = false
      }
    },
  
    async loadDashboardStats() {
      try {
        this.loading.dashboard = true
        
      
        await this.loadEmployees()
        
        
        await this.loadPendingLeaves()
        
      
        await this.loadTeamAttendance()
        
      
        this.dashboardStats = {
          teamMembers: this.employees.length,
          pendingLeaves: this.pendingLeaves.length,
          attendanceRate: this.calculateAttendanceRate()
        }
        
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
        this.showMessage('Error loading dashboard stats', 'error')
      } finally {
        this.loading.dashboard = false
      }
    },
    
   
    updateAttendanceFilters(field, value) {
      this.attendanceFilters[field] = value
    },
    
    resetAttendanceFilters() {
      this.attendanceFilters = {
        date: '',
        status: ''
      }
    },
    
    
    calculateAttendanceRate() {
      if (this.teamAttendance.length === 0) return 0
      
      const presentCount = this.teamAttendance.filter(a => a.status === 'present').length
      return Math.round((presentCount / this.teamAttendance.length) * 100)
    },
    
    showMessage(text, type = 'success') {
      this.message = text
      this.messageType = type
      
     
      setTimeout(() => {
        this.message = ''
      }, 5000)
    },
    
    
    formatDate(dateString) {
      return managerService.formatDate(dateString)
    },
    
    getLeaveStatusColor(status) {
      return managerService.getLeaveStatusColor(status)
    },
    
    getAttendanceStatusColor(status) {
      return managerService.getAttendanceStatusColor(status)
    }
  }
})
