<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Pose, Results as PoseResults } from '@mediapipe/pose'
import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh'
import { Camera } from '@mediapipe/camera_utils'
import { AccessoryType } from '../types/accessories'
import { AccessoryRenderer } from '../utils/AccessoryRenderer'
import { SmoothTracker } from '../utils/SmoothTracker'

interface Props {
  selectedAccessory: AccessoryType
}

const props = defineProps<Props>()
const emit = defineEmits<{
  trackingChange: [tracking: boolean]
}>()

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const overlayCanvasRef = ref<HTMLCanvasElement>()

let pose: Pose | null = null
let faceMesh: FaceMesh | null = null
let camera: Camera | null = null
let accessoryRenderer: AccessoryRenderer | null = null
let smoothTracker: SmoothTracker | null = null

let isInitialized = false
let isCameraActive = ref(false)
let lastPoseResults: PoseResults | null = null
let lastFaceMeshResults: FaceMeshResults | null = null

const initializeMediaPipe = async () => {
  if (!videoRef.value || !canvasRef.value || !overlayCanvasRef.value) return

  try {
    // Initialize Pose
    pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    })
    
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    pose.onResults(onPoseResults)

    // Initialize Face Mesh
    faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    faceMesh.onResults(onFaceMeshResults)

    // Initialize camera
    camera = new Camera(videoRef.value, {
      onFrame: async () => {
        if (pose && faceMesh && videoRef.value && isCameraActive.value) {
          await pose.send({ image: videoRef.value })
          await faceMesh.send({ image: videoRef.value })
        }
      },
      width: 640,
      height: 480
    })

    // Initialize accessory renderer and smooth tracker
    accessoryRenderer = new AccessoryRenderer(overlayCanvasRef.value)
    smoothTracker = new SmoothTracker()

    await camera.start()
    isInitialized = true
    isCameraActive.value = true
    emit('trackingChange', true)

  } catch (error) {
    console.error('Failed to initialize MediaPipe:', error)
    emit('trackingChange', false)
  }
}

const onPoseResults = (results: PoseResults) => {
  if (!isCameraActive.value) return
  lastPoseResults = results
  renderAccessories()
}

const onFaceMeshResults = (results: FaceMeshResults) => {
  if (!isCameraActive.value) return
  lastFaceMeshResults = results
  renderAccessories()
}

const renderAccessories = () => {
  if (!accessoryRenderer || !smoothTracker || !canvasRef.value || !overlayCanvasRef.value) return

  const canvas = canvasRef.value
  const overlayCanvas = overlayCanvasRef.value
  const ctx = canvas.getContext('2d')
  const overlayCtx = overlayCanvas.getContext('2d')

  if (!ctx || !overlayCtx) return

  // Clear canvases
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)

  // Draw video frame
  if (videoRef.value && isCameraActive.value) {
    ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
  }

  // Process and smooth tracking data
  const trackingData = isCameraActive.value ? smoothTracker.process({
    pose: lastPoseResults,
    faceMesh: lastFaceMeshResults
  }) : null

  if (trackingData) {
    // Render selected accessory
    accessoryRenderer.render(props.selectedAccessory, trackingData, overlayCtx)
    emit('trackingChange', true)
  } else {
    emit('trackingChange', false)
  }
}

const toggleCamera = async () => {
  if (!isInitialized) return
  
  isCameraActive.value = !isCameraActive.value
  
  if (isCameraActive.value) {
    // Resume camera
    if (camera) {
      await camera.start()
    }
    emit('trackingChange', true)
  } else {
    // Pause camera
    if (camera) {
      camera.stop()
    }
    // Clear canvases when camera is off
    if (canvasRef.value && overlayCanvasRef.value) {
      const canvas = canvasRef.value
      const overlayCanvas = overlayCanvasRef.value
      const ctx = canvas.getContext('2d')
      const overlayCtx = overlayCanvas.getContext('2d')
      
      if (ctx && overlayCtx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
        
        // Show camera off message
        ctx.fillStyle = '#333'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Camera Off', canvas.width / 2, canvas.height / 2)
      }
    }
    emit('trackingChange', false)
  }
}

const takeScreenshot = () => {
  if (!canvasRef.value || !overlayCanvasRef.value || !isCameraActive.value) return
  
  // Create a temporary canvas to combine both layers
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvasRef.value.width
  tempCanvas.height = canvasRef.value.height
  const tempCtx = tempCanvas.getContext('2d')
  
  if (!tempCtx) return
  
  // Draw video frame
  tempCtx.drawImage(canvasRef.value, 0, 0)
  
  // Draw accessories overlay
  tempCtx.drawImage(overlayCanvasRef.value, 0, 0)
  
  // Download the screenshot
  const link = document.createElement('a')
  link.download = `virtual-accessory-${Date.now()}.png`
  link.href = tempCanvas.toDataURL()
  link.click()
}
const cleanup = () => {
  if (camera) {
    camera.stop()
  }
  if (pose) {
    pose.close()
  }
  if (faceMesh) {
    faceMesh.close()
  }
  isInitialized = false
  isCameraActive.value = false
  emit('trackingChange', false)
}

// Watch for accessory changes
watch(() => props.selectedAccessory, () => {
  if (isInitialized) {
    renderAccessories()
  }
})

onMounted(() => {
  initializeMediaPipe()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="camera-view">
    <video 
      ref="videoRef" 
      class="video-input"
      autoplay 
      muted 
      playsinline
    ></video>
    
    <canvas 
      ref="canvasRef"
      class="video-canvas"
      width="640" 
      height="480"
    ></canvas>
    
    <canvas 
      ref="overlayCanvasRef"
      class="overlay-canvas"
      width="640" 
      height="480"
    ></canvas>

    <div class="camera-controls">
      <button 
        class="camera-toggle-btn"
        @click="toggleCamera"
        :disabled="!isInitialized"
        :class="{ active: isCameraActive }"
      >
        {{ isCameraActive ? '📹' : '📷' }} {{ isCameraActive ? 'Turn Off' : 'Turn On' }}
      </button>
      
      <button 
        class="screenshot-btn"
        @click="takeScreenshot"
        :disabled="!isInitialized || !isCameraActive"
      >
        📸 Screenshot
      </button>
    </div>
  </div>
</template>

<style scoped>
.camera-view {
  position: relative;
  width: 640px;
  height: 480px;
  background: #000;
  border-radius: 1rem;
  overflow: hidden;
}

.video-input {
  display: none;
}

.video-canvas,
.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.overlay-canvas {
  pointer-events: none;
}

.camera-controls {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.screenshot-btn,
.camera-toggle-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.screenshot-btn:hover:not(:disabled),
.camera-toggle-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-1px);
}

.screenshot-btn:disabled,
.camera-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.camera-toggle-btn.active {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.camera-toggle-btn.active:hover:not(:disabled) {
  background: rgba(16, 185, 129, 1);
}
</style>