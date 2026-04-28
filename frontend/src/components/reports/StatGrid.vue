<template>
  <div class="stats-grid-2x2">
    <div v-for="item in stats" :key="item.label" class="stat-item">
      <div class="label" :class="item.labelClass">{{ item.label }}</div>
      <div class="value" :class="item.valueClass">{{ item.value }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatGrid',
  props: {
    stats: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.stats-grid-2x2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-item .label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-item .value {
  color: #2c3e50;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.text-green-600 { color: #28a745; }
.text-yellow-600 { color: #ffc107; }
.text-red-600 { color: #dc3545; }
.text-green-900 { color: #155724; }
.text-yellow-900 { color: #856404; }
.text-red-900 { color: #721c24; }
</style>
