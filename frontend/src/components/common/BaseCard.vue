<template>
  <div class="base-card" :class="[cardClass, { 'card-hover': hoverable }]">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    
    <div class="card-content">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    variant: {
      type: String,
      default: 'default', // default, primary, secondary, gradient
      validator: (value) => ['default', 'primary', 'secondary', 'gradient'].includes(value)
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    padding: {
      type: String,
      default: 'normal', // none, small, normal, large
      validator: (value) => ['none', 'small', 'normal', 'large'].includes(value)
    }
  },
  computed: {
    cardClass() {
      return [
        `card-${this.variant}`,
        `card-padding-${this.padding}`
      ]
    }
  }
}
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  overflow: hidden;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-primary {
  background: linear-gradient(135deg, #4c7e76 0%, #3d7d73 100%);
  color: white;
}

.card-secondary {
  background: #f8f9fa;
  border: 1px solid #e8eaed;
}

.card-gradient {
  background: linear-gradient(135deg, #548079 0%, #3d7d73 100%);
  color: white;
}

.card-padding-none .card-content {
  padding: 0;
}

.card-padding-small .card-content {
  padding: 16px;
}

.card-padding-normal .card-content {
  padding: 24px;
}

.card-padding-large .card-content {
  padding: 32px;
}

.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e8eaed;
}

.card-primary .card-header,
.card-gradient .card-header {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.card-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid #e8eaed;
}

.card-primary .card-footer,
.card-gradient .card-footer {
  border-top-color: rgba(255, 255, 255, 0.2);
}
</style>
