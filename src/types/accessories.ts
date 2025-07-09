export type AccessoryType = 'ring' | 'necklace' | 'tiara'

export interface TrackingData {
  // Pose landmarks
  leftShoulder?: { x: number; y: number; z?: number }
  rightShoulder?: { x: number; y: number; z?: number }
  leftWrist?: { x: number; y: number; z?: number }
  rightWrist?: { x: number; y: number; z?: number }
  leftIndex?: { x: number; y: number; z?: number }
  rightIndex?: { x: number; y: number; z?: number }
  
  // Face landmarks
  forehead?: { x: number; y: number; z?: number }
  chin?: { x: number; y: number; z?: number }
  
  // Calculated positions
  neckCenter?: { x: number; y: number; z?: number }
  shoulderWidth?: number
  faceWidth?: number
  
  // Confidence scores
  poseConfidence?: number
  faceConfidence?: number
}

export interface AccessoryConfig {
  type: AccessoryType
  color: string
  size: number
  opacity: number
}