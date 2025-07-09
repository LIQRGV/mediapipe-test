import { Results as PoseResults } from '@mediapipe/pose'
import { Results as FaceMeshResults } from '@mediapipe/face_mesh'
import { TrackingData } from '../types/accessories'

interface HistoryPoint {
  x: number
  y: number
  z?: number
  timestamp: number
}

export class SmoothTracker {
  private poseHistory: Map<string, HistoryPoint[]> = new Map()
  private faceHistory: Map<string, HistoryPoint[]> = new Map()
  private readonly historySize = 5
  private readonly confidenceThreshold = 0.5

  process(results: { pose: PoseResults | null; faceMesh: FaceMeshResults | null }): TrackingData | null {
    const trackingData: TrackingData = {}
    let hasValidData = false

    // Process pose data
    if (results.pose?.poseLandmarks) {
      const pose = results.pose.poseLandmarks
      
      // Key pose landmarks (MediaPipe Pose landmark indices)
      const leftShoulder = this.smoothLandmark('leftShoulder', pose[11])
      const rightShoulder = this.smoothLandmark('rightShoulder', pose[12])
      const leftWrist = this.smoothLandmark('leftWrist', pose[15])
      const rightWrist = this.smoothLandmark('rightWrist', pose[16])
      const leftIndex = this.smoothLandmark('leftIndex', pose[19])
      const rightIndex = this.smoothLandmark('rightIndex', pose[20])

      if (leftShoulder && rightShoulder) {
        trackingData.leftShoulder = leftShoulder
        trackingData.rightShoulder = rightShoulder
        trackingData.neckCenter = {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: (leftShoulder.y + rightShoulder.y) / 2,
          z: ((leftShoulder.z || 0) + (rightShoulder.z || 0)) / 2
        }
        trackingData.shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x)
        hasValidData = true
      }

      if (leftWrist) trackingData.leftWrist = leftWrist
      if (rightWrist) trackingData.rightWrist = rightWrist
      if (leftIndex) trackingData.leftIndex = leftIndex
      if (rightIndex) trackingData.rightIndex = rightIndex

      trackingData.poseConfidence = this.calculateAverageVisibility(pose)
    }

    // Process face mesh data
    if (results.faceMesh?.multiFaceLandmarks?.[0]) {
      const face = results.faceMesh.multiFaceLandmarks[0]
      
      // Key face landmarks for forehead and face width
      const forehead = this.smoothFaceLandmark('forehead', face[10]) // Top of forehead
      const chin = this.smoothFaceLandmark('chin', face[152]) // Bottom of chin
      const leftFace = this.smoothFaceLandmark('leftFace', face[234]) // Left face edge
      const rightFace = this.smoothFaceLandmark('rightFace', face[454]) // Right face edge

      if (forehead) {
        trackingData.forehead = forehead
        hasValidData = true
      }
      
      if (chin) trackingData.chin = chin
      
      if (leftFace && rightFace) {
        trackingData.faceWidth = Math.abs(rightFace.x - leftFace.x)
      }

      trackingData.faceConfidence = 0.8 // Face mesh doesn't provide visibility scores
    }

    return hasValidData ? trackingData : null
  }

  private smoothLandmark(key: string, landmark: any): { x: number; y: number; z?: number } | null {
    if (!landmark || landmark.visibility < this.confidenceThreshold) {
      return null
    }

    const point: HistoryPoint = {
      x: landmark.x,
      y: landmark.y,
      z: landmark.z,
      timestamp: Date.now()
    }

    return this.addToHistory(this.poseHistory, key, point)
  }

  private smoothFaceLandmark(key: string, landmark: any): { x: number; y: number; z?: number } | null {
    if (!landmark) return null

    const point: HistoryPoint = {
      x: landmark.x,
      y: landmark.y,
      z: landmark.z,
      timestamp: Date.now()
    }

    return this.addToHistory(this.faceHistory, key, point)
  }

  private addToHistory(history: Map<string, HistoryPoint[]>, key: string, point: HistoryPoint): { x: number; y: number; z?: number } {
    if (!history.has(key)) {
      history.set(key, [])
    }

    const points = history.get(key)!
    points.push(point)

    // Keep only recent points
    if (points.length > this.historySize) {
      points.shift()
    }

    // Calculate smoothed position using weighted average (more recent = higher weight)
    let totalWeight = 0
    let smoothedX = 0
    let smoothedY = 0
    let smoothedZ = 0

    points.forEach((p, index) => {
      const weight = (index + 1) / points.length // Linear weighting
      totalWeight += weight
      smoothedX += p.x * weight
      smoothedY += p.y * weight
      smoothedZ += (p.z || 0) * weight
    })

    return {
      x: smoothedX / totalWeight,
      y: smoothedY / totalWeight,
      z: smoothedZ / totalWeight
    }
  }

  private calculateAverageVisibility(landmarks: any[]): number {
    const visibleLandmarks = landmarks.filter(l => l.visibility > this.confidenceThreshold)
    return visibleLandmarks.length / landmarks.length
  }

  reset(): void {
    this.poseHistory.clear()
    this.faceHistory.clear()
  }
}