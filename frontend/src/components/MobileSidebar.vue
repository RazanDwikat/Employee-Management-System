<template>
  <div class="mobile-sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-overlay" @click="closeSidebar"></div>
    <nav class="sidebar-content">
      <div class="sidebar-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeSidebar">✕</button>
      </div>
      
      <ul class="nav-menu">
        <slot></slot>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'MobileSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Menu'
    }
  },
  emits: ['close'],
  methods: {
    closeSidebar() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: none;
}

.mobile-sidebar.is-open {
  pointer-events: auto;
}

.sidebar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.mobile-sidebar.is-open .sidebar-overlay {
  opacity: 1;
}

.sidebar-content {
  position: absolute;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100%;
  background: #3d7d73;
  color: white;
  transition: left 0.3s;
  overflow-y: auto;
}

.mobile-sidebar.is-open .sidebar-content {
  left: 0;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-section {
  margin: 20px 0 10px 0;
}

.nav-section-title {
  display: block;
  padding: 15px 20px 5px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.nav-menu li {
  margin-bottom: 2px;
}

.nav-link {
  display: block;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: background-color 0.3s;
  font-size: 14px;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.1);
}

@media (min-width: 768px) {
  .mobile-sidebar {
    display: none;
  }
}
</style>
