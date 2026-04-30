<template>
  <div class="pagination">
    <button
      class="pagination-btn"
      :disabled="currentPage <= 1"
      @click="handlePrevious"
    >
      Previous
    </button>
    
    <div class="pagination-info">
      <span class="page-text">Page {{ currentPage }} of {{ totalPages }}</span>
      <span class="total-text">{{ total }} items</span>
    </div>
    
    <button
      class="pagination-btn"
      :disabled="currentPage >= totalPages"
      @click="handleNext"
    >
      Next
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      default: 10
    }
  },
  methods: {
    handlePrevious() {
      if (this.currentPage > 1) {
        this.$emit('page-change', this.currentPage - 1)
      }
    },
    handleNext() {
      if (this.currentPage < this.totalPages) {
        this.$emit('page-change', this.currentPage + 1)
      }
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid #e8eaed;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  background: white;
  color: #5f6368;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #dadce0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.page-text {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.total-text {
  font-size: 12px;
  color: #5f6368;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .pagination-info {
    order: -1;
  }
}
</style>
