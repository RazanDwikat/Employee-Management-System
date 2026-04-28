<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  PieController,
  BarController,
  LineController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
Chart.register(
  PieController,
  BarController,
  LineController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'ChartContainer',
  props: {
    chartType: {
      type: String,
      default: 'bar'
    },
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {
      chartInstance: null
    }
  },
  watch: {
    chartData: {
      handler() {
        this.$nextTick(() => {
          this.updateChart()
        })
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.createChart()
    })
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy()
    }
  },
  methods: {
    createChart() {
      if (!this.$refs.chartCanvas) return
      
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
      
      this.chartInstance = new Chart(this.$refs.chartCanvas, {
        type: this.chartType,
        data: this.chartData,
        options: { ...defaultOptions, ...this.chartOptions }
      })
    },
    updateChart() {
      if (this.chartInstance) {
        this.chartInstance.data = this.chartData
        this.chartInstance.update()
      } else {
        this.createChart()
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: v-bind(height);
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
