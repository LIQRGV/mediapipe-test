<script setup lang="ts">
import { AccessoryType } from '../types/accessories'

interface Props {
  selected: AccessoryType
}

defineProps<Props>() // needed later to check whether the accesory is selected or not
const emit = defineEmits<{
  change: [accessory: AccessoryType]
}>()

const accessories = [
  { type: 'ring' as AccessoryType, name: 'Ring', icon: '💍', description: 'Finger ring' },
  { type: 'necklace' as AccessoryType, name: 'Necklace', icon: '📿', description: 'Neck jewelry' },
  { type: 'tiara' as AccessoryType, name: 'Tiara', icon: '👑', description: 'Forehead crown' }
]

const selectAccessory = (accessory: AccessoryType) => {
  emit('change', accessory)
}
</script>

<template>
  <div class="accessory-selector">
    <h3>Select Accessory</h3>
    
    <div class="accessory-grid">
      <button
        v-for="accessory in accessories"
        :key="accessory.type"
        :class="['accessory-item', { active: selected === accessory.type }]"
        @click="selectAccessory(accessory.type)"
      >
        <div class="accessory-icon">{{ accessory.icon }}</div>
        <div class="accessory-info">
          <div class="accessory-name">{{ accessory.name }}</div>
          <div class="accessory-description">{{ accessory.description }}</div>
        </div>
      </button>
    </div>

    <div class="instructions">
      <h4>Instructions:</h4>
      <ul>
        <li>Allow camera access when prompted</li>
        <li>Position yourself in good lighting</li>
        <li>Keep your body visible for best tracking</li>
        <li>Try different accessories and take screenshots!</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.accessory-selector {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.accessory-selector h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.accessory-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.accessory-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: white;
}

.accessory-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.accessory-item.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
}

.accessory-icon {
  font-size: 2rem;
  min-width: 3rem;
  text-align: center;
}

.accessory-info {
  flex: 1;
}

.accessory-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.accessory-description {
  font-size: 0.85rem;
  opacity: 0.8;
}

.instructions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.instructions h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.instructions ul {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  line-height: 1.5;
  opacity: 0.9;
}

.instructions li {
  margin-bottom: 0.5rem;
}
</style>
