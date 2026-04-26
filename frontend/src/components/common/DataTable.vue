<template>
  <div class="data-table-container">
    <div v-if="loading" class="loading">
      Loading data...
    </div>
    
    <div v-else-if="data.length === 0" class="no-data">
      <p>No data available</p>
    </div>
    
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :class="column.headerClass"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.id">
            <td 
              v-for="column in columns" 
              :key="column.key"
              :class="column.cellClass"
            >
              <!-- Custom slot for specific column rendering -->
              <slot 
                :name="`cell-${column.key}`" 
                :item="item" 
                :column="column"
              >
                <!-- Default rendering -->
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyMessage: {
      type: String,
      default: 'No data available'
    }
  },
  methods: {
    getNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => {
        return current ? current[key] : null
      }, obj)
    }
  }
}
</script>

<style scoped>
.data-table-container {
  width: 100%;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #f1f3f4;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #fafbfc;
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
  border-bottom: 1px solid #f1f3f4;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.data-table td {
  color: #495057;
  font-size: 14px;
}
</style>
