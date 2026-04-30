<template>
  <span class="status-badge" :class="statusClass">
    {{ status }}
  </span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'default', // default, success, warning, error, info
      validator: (value) => ['default', 'success', 'warning', 'error', 'info'].includes(value)
    }
  },
  computed: {
    statusClass() {
      if (this.type !== 'default') {
        return `status-${this.type}`
      }
      
      // Auto-detect based on status text
      const statusLower = this.status.toLowerCase()
      if (statusLower.includes('pending') || statusLower.includes('processing')) {
        return 'status-warning'
      } else if (statusLower.includes('approved') || statusLower.includes('paid') || statusLower.includes('present')) {
        return 'status-success'
      } else if (statusLower.includes('rejected') || statusLower.includes('absent') || statusLower.includes('error')) {
        return 'status-error'
      } else {
        return 'status-default'
      }
    }
  }
}
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-default {
  background: #f3f4f6;
  color: #5f6368;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.status-info {
  background: #dbeafe;
  color: #1e40af;
}
</style>
