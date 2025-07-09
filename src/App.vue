<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CameraView from './components/CameraView.vue'
import AccessorySelector from './components/AccessorySelector.vue'
import { AccessoryType } from './types/accessories'

const selectedAccessory = ref<AccessoryType>('necklace')
const isTracking = ref(false)

const handleAccessoryChange = (accessory: AccessoryType) => {
  selectedAccessory.value = accessory
}

const handleTrackingChange = (tracking: boolean) => {
  isTracking.value = tracking
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Virtual Accessories Try-On</h1>
      <div class="status">
        <span :class="['status-indicator', { active: isTracking }]"></span>
        {{ isTracking ? 'Tracking Active' : 'No Tracking' }}
      </div>
    </header>

    <main class="app-main">
      <div class="camera-container">
        <CameraView 
          :selected-accessory="selectedAccessory"
          @tracking-change="handleTrackingChange"
        />
      </div>
      
      <div class="controls">
        <AccessorySelector 
          :selected="selectedAccessory"
          @change="handleAccessoryChange"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.app-header {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: background-color 0.3s ease;
}

.status-indicator.active {
  background: #10b981;
}

.app-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 2rem;
}

.camera-container {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.controls {
  width: 100%;
  max-width: 640px;
}

@media (min-width: 1024px) {
  .app-main {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
  }
  
  .controls {
    width: 300px;
    margin-left: 2rem;
  }
}
</style>