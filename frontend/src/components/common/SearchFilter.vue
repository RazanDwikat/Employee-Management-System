<template>
  <div class="search-filters">
    <div class="search-box">
      <input 
        v-model="localSearchQuery" 
        @input="handleSearch"
        type="text" 
        :placeholder="searchPlaceholder"
        class="search-input"
        :disabled="loading"
      />
    </div>
    
    <div class="filter-controls">
      <div 
        v-for="filter in filters" 
        :key="filter.key"
        class="filter-group"
      >
        <select 
          v-model="localFilters[filter.key]" 
          @change="handleFilterChange"
          class="filter-select"
          :disabled="loading"
        >
          <option value="">{{ filter.placeholder }}</option>
          <option 
            v-for="option in filter.options" 
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <button 
        v-if="showClearButton"
        @click="handleClearFilters"
        class="clear-btn"
        :disabled="loading || !hasActiveFilters"
      >
        {{ clearButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchFilter',
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    },
    filters: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    showClearButton: {
      type: Boolean,
      default: true
    },
    clearButtonText: {
      type: String,
      default: 'Clear Filters'
    }
  },
  emits: ['update:searchQuery', 'filter-change', 'clear-filters'],
  data() {
    return {
      localSearchQuery: this.searchQuery,
      localFilters: {}
    }
  },
  computed: {
    hasActiveFilters() {
      return this.localSearchQuery || 
             Object.values(this.localFilters).some(value => value !== '')
    }
  },
  watch: {
    searchQuery(newVal) {
      this.localSearchQuery = newVal
    },
    filters: {
      handler(newFilters) {
        // Initialize local filters
        newFilters.forEach(filter => {
          if (!(filter.key in this.localFilters)) {
            this.localFilters[filter.key] = ''
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    handleSearch() {
      this.$emit('update:searchQuery', this.localSearchQuery)
      this.emitFilterChange()
    },
    
    handleFilterChange() {
      this.emitFilterChange()
    },
    
    handleClearFilters() {
      this.localSearchQuery = ''
      this.localFilters = {}
      
      // Reset all filter keys
      this.filters.forEach(filter => {
        this.localFilters[filter.key] = ''
      })
      
      this.$emit('update:searchQuery', '')
      this.$emit('clear-filters')
      this.emitFilterChange()
    },
    
    emitFilterChange() {
      this.$emit('filter-change', {
        search: this.localSearchQuery,
        filters: { ...this.localFilters }
      })
    }
  }
}
</script>

<style scoped>
.search-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  width: 100%;
}

.search-box {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.search-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  min-width: 140px;
}

.filter-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #f1f3f4;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
  box-sizing: border-box;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #dee2e6;
  box-shadow: 0 0 0 3px rgba(222, 226, 230, 0.2);
}

.filter-select:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.clear-btn {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
  white-space: nowrap;
}

.clear-btn:hover:not(:disabled) {
  background: #f5c6cb;
  transform: translateY(-1px);
}

.clear-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .filter-controls {
    justify-content: flex-start;
  }
  
  .filter-group {
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .filter-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-group {
    min-width: 100%;
  }
}
</style>
