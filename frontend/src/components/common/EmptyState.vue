<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <div v-if="$slots.actions" class="empty-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: '📄'
    },
    title: {
      type: String,
      default: 'No data found'
    },
    description: {
      type: String,
      default: 'There is no data to display at this time.'
    }
  }
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #5f6368;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #5f6368;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .empty-state {
    padding: 40px 16px;
  }
  
  .empty-icon {
    font-size: 36px;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
