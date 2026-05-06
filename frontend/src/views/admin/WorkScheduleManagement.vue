<template>
  <div class="work-schedule-management">
    <h1>Work Schedule Management</h1>
    
    <div class="actions-bar">
      <div class="search-section">
        <SearchFilter 
          v-model:searchQuery="searchQuery"
          :filters="filterConfig"
          :loading="loading"
          search-placeholder="Search work schedules..."
          @filter-change="handleFilterChange"
          @clear-filters="clearFilters"
        />
      </div>
      
      <button @click="openAddModal" class="add-btn" :disabled="loading">
        Add New Schedule
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- DataTable Component -->
    <DataTable 
      :data="workSchedules" 
      :columns="scheduleColumns" 
      :loading="loading"
      :empty-message="'No work schedules found'"
    >
      <template #cell-start_time="{ item }">
        <div class="time-info">
          <div class="time-value">{{ formatTime(item.start_time) }}</div>
          <div class="time-label">Start</div>
        </div>
      </template>
      
      <template #cell-end_time="{ item }">
        <div class="time-info">
          <div class="time-value">{{ formatTime(item.end_time) }}</div>
          <div class="time-label">End</div>
        </div>
      </template>
      
      <template #cell-late_grace_minutes="{ item }">
        <div class="grace-info">
          <span class="grace-value">{{ item.late_grace_minutes || 0 }}</span>
          <span class="grace-label">minutes</span>
        </div>
      </template>
      
      <template #cell-employees_count="{ item }">
        <div class="employees-info">
          <span class="employees-count">{{ item.employees_count || 0 }}</span>
          <span class="employees-label">employees</span>
        </div>
      </template>
      
      <template #cell-actions="{ item }">
        <div class="action-buttons">
          <button @click="editSchedule(item)" class="edit-btn" :disabled="loading">
            Edit
          </button>
          <button @click="viewSchedule(item)" class="view-btn" :disabled="loading">
            View
          </button>
          <button @click="deleteSchedule(item)" class="delete-btn" :disabled="loading">
            Delete
          </button>
        </div>
      </template>
    </DataTable>
    
    <!-- Add/Edit Modal -->
    <BaseModal 
      :model-value="showAddModal"
      @update:model-value="closeAddModal"
      :title="editingSchedule ? 'Edit Work Schedule' : 'Add New Work Schedule'"
      :loading="loading"
      loading-text="Saving..."
      save-text="Save"
      @save="saveSchedule"
      @cancel="closeModal"
    >
      <template #body>
        <form class="schedule-form" @submit.prevent>
          <div class="form-group">
            <label for="name">Schedule Name</label>
            <input 
              id="name" 
              v-model="scheduleForm.name" 
              type="text" 
              placeholder="e.g., Morning Shift, Evening Shift"
              maxlength="100"
              required
              :disabled="loading"
            />
            <div v-if="validationErrors.name" class="error-text">
              {{ validationErrors.name[0] }}
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="start_time">Start Time</label>
              <input 
                id="start_time" 
                v-model="scheduleForm.start_time" 
                type="time" 
                required
                :disabled="loading"
              />
              <div v-if="validationErrors.start_time" class="error-text">
                {{ validationErrors.start_time[0] }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="end_time">End Time</label>
              <input 
                id="end_time" 
                v-model="scheduleForm.end_time" 
                type="time" 
                required
                :disabled="loading"
              />
              <div v-if="validationErrors.end_time" class="error-text">
                {{ validationErrors.end_time[0] }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="late_grace_minutes">Late Grace Minutes (Optional)</label>
            <input 
              id="late_grace_minutes" 
              v-model.number="scheduleForm.late_grace_minutes" 
              type="number" 
              min="0"
              placeholder="e.g., 15"
              :disabled="loading"
            />
            <div v-if="validationErrors.late_grace_minutes" class="error-text">
              {{ validationErrors.late_grace_minutes[0] }}
            </div>
          </div>
        </form>
      </template>
    </BaseModal>
    
    <!-- View Details Modal -->
    <BaseModal 
      :model-value="showDetailsModal"
      @update:model-value="closeDetailsModal"
      :title="'Work Schedule Details'"
      :loading="false"
      save-text=""
      @cancel="closeDetailsModal"
    >
      <template #body>
        <div class="schedule-details" v-if="selectedSchedule">
          <div class="detail-section">
            <h4>Schedule Information</h4>
            <p><strong>Name:</strong> {{ selectedSchedule.name }}</p>
            <p><strong>Start Time:</strong> {{ formatTime(selectedSchedule.start_time) }}</p>
            <p><strong>End Time:</strong> {{ formatTime(selectedSchedule.end_time) }}</p>
            <p><strong>Late Grace Minutes:</strong> {{ selectedSchedule.late_grace_minutes || 0 }} minutes</p>
          </div>
          
          <div class="detail-section">
            <h4>Working Hours</h4>
            <p><strong>Total Hours:</strong> {{ calculateWorkingHours(selectedSchedule.start_time, selectedSchedule.end_time) }} hours</p>
            <p><strong>Duration:</strong> {{ formatTime(selectedSchedule.start_time) }} - {{ formatTime(selectedSchedule.end_time) }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Assigned Employees</h4>
            <div v-if="selectedSchedule.employees && selectedSchedule.employees.length > 0">
              <div 
                v-for="employee in selectedSchedule.employees" 
                :key="employee.id"
                class="employee-item"
              >
                {{ employee.user?.name || 'N/A' }} - {{ employee.department?.name || 'N/A' }}
              </div>
            </div>
            <p v-else>No employees assigned to this schedule.</p>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import DataTable from '../../components/common/DataTable.vue'
import BaseModal from '../../components/common/BaseModal.vue'
import SearchFilter from '../../components/common/SearchFilter.vue'
import { useWorkScheduleStore } from '@/stores/workScheduleStore'

export default {
  name: 'WorkScheduleManagement',
  components: {
    DataTable,
    BaseModal,
    SearchFilter
  },
  setup() {
    const workScheduleStore = useWorkScheduleStore()
    
    onMounted(() => {
      workScheduleStore.fetchWorkSchedules()
    })
    
    return {
      // Store state as computed properties for reactivity
      workSchedules: computed(() => workScheduleStore.workSchedules),
      allWorkSchedules: computed(() => workScheduleStore.allWorkSchedules),
      loading: computed(() => workScheduleStore.loading),
      error: computed(() => workScheduleStore.error),
      showAddModal: computed(() => workScheduleStore.showAddModal),
      showDetailsModal: computed(() => workScheduleStore.showDetailsModal),
      editingSchedule: computed(() => workScheduleStore.editingSchedule),
      selectedSchedule: computed(() => workScheduleStore.selectedSchedule),
      validationErrors: computed(() => workScheduleStore.validationErrors),
      searchQuery: computed(() => workScheduleStore.searchQuery),
      filters: computed(() => workScheduleStore.filters),
      scheduleForm: computed(() => workScheduleStore.scheduleForm),
      
      // Store getters as computed properties
      scheduleColumns: computed(() => workScheduleStore.scheduleColumns),
      filterConfig: computed(() => workScheduleStore.filterConfig),
      
      // Store actions
      fetchWorkSchedules: workScheduleStore.fetchWorkSchedules,
      saveSchedule: workScheduleStore.saveSchedule,
      editSchedule: workScheduleStore.editSchedule,
      viewSchedule: workScheduleStore.viewSchedule,
      deleteSchedule: (schedule) => {
        if (!confirm(`Are you sure you want to delete "${schedule.name}"? This action cannot be undone.`)) {
          return
        }
        workScheduleStore.deleteSchedule(schedule)
      },
      closeModal: workScheduleStore.closeModal,
      closeDetailsModal: workScheduleStore.closeDetailsModal,
      applyFrontendFilters: workScheduleStore.applyFrontendFilters,
      handleFilterChange: workScheduleStore.handleFilterChange,
      clearFilters: workScheduleStore.clearFilters,
      formatTime: workScheduleStore.formatTime,
      calculateWorkingHours: workScheduleStore.calculateWorkingHours,
      openAddModal: workScheduleStore.openAddModal,
      closeAddModal: workScheduleStore.closeAddModal,
      updateScheduleForm: workScheduleStore.updateScheduleForm
    }
  }
}
</script>

<style scoped>
.work-schedule-management {
  padding: 20px;
  background: transparent;
  min-height: 100vh;
}

h1 {
  margin-bottom: 20px;
  color: #6c757d;
  font-weight: 300;
  font-size: 2rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.add-btn {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.time-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.time-value {
  font-weight: 600;
  color: #6c757d;
  font-size: 16px;
}

.time-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.grace-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.grace-value {
  font-weight: 600;
  color: #6c757d;
  font-size: 16px;
}

.grace-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.employees-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.employees-count {
  font-weight: 600;
  color: #6c757d;
  font-size: 16px;
}

.employees-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.edit-btn {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-btn:hover:not(:disabled) {
  background: #bee5eb;
  transform: translateY(-1px);
}

.view-btn {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn:hover:not(:disabled) {
  background: #d6d8db;
  transform: translateY(-1px);
}

.delete-btn {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background: #f5c6cb;
  transform: translateY(-1px);
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
}

.form-group input {
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.form-group input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.schedule-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.detail-section h4 {
  margin-bottom: 10px;
  color: #6c757d;
}

.detail-section p {
  margin-bottom: 5px;
  color: #6c757d;
}

.employee-item {
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 5px;
  border: 1px solid #e9ecef;
}

/* Responsive design */
@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    min-width: 100%;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
