import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function mediapipe_workaround() {
  return {
    name: 'mediapipe_workaround',
    load(id: string) {
      const MEDIAPIPE_EXPORT_NAMES: Record<string, string[]> = {
        'pose.js': [
          'POSE_LANDMARKS', 
          'POSE_CONNECTIONS', 
          'POSE_LANDMARKS_LEFT', 
          'POSE_LANDMARKS_RIGHT', 
          'POSE_LANDMARKS_NEUTRAL', 
          'Pose',
          'VERSION',
        ],
        'hands.js': [
          'VERSION', 
          'HAND_CONNECTIONS', 
          'Hands', 
        ],
        'camera_utils.js': [
          'Camera', 
        ],
        'drawing_utils.js': [
          'drawConnectors',
          'drawLandmarks',
          'lerp',
        ],
        'control_utils.js': [
          'drawConnectors',
          'FPS',
          'ControlPanel',
          'StaticText',
          'Toggle',
          'SourcePicker',
          
          // 'InputImage', not working with this export. Is defined in index.d.ts 
          // but is not defined in control_utils.js
          'InputImage',
          
          'Slider',
        ],
      }

      let fileName = path.basename(id)
      if (!(fileName in MEDIAPIPE_EXPORT_NAMES)) return null
      let code = fs.readFileSync(id, 'utf-8')
      for (const name of MEDIAPIPE_EXPORT_NAMES[fileName]) {
        code += `exports.${name} = ${name};`
      }
      return {code}
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mediapipe_workaround(),
    vue(),
  ],
})

