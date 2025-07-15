import { AccessoryType, TrackingData } from '../types/accessories'

export class AccessoryRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  render(accessoryType: AccessoryType, trackingData: TrackingData, ctx?: CanvasRenderingContext2D): void {
    const renderCtx = ctx || this.ctx
    
    switch (accessoryType) {
      case 'ring':
        this.renderRing(trackingData, renderCtx)
        break
      case 'necklace':
        this.renderNecklace(trackingData, renderCtx)
        break
      case 'tiara':
        this.renderTiara(trackingData, renderCtx)
        break
    }
  }

  private renderRing(trackingData: TrackingData, ctx: CanvasRenderingContext2D): void {
    // Render rings on both index fingers if available
    if (trackingData.leftIndex) {
      this.drawRing(trackingData.leftIndex, ctx, '#FFD700') // Gold color
    }
    
    if (trackingData.rightIndex) {
      this.drawRing(trackingData.rightIndex, ctx, '#FFD700')
    }
  }

  private renderNecklace(trackingData: TrackingData, ctx: CanvasRenderingContext2D): void {
    if (!trackingData.neckCenter || !trackingData.shoulderWidth) return

    const centerX = trackingData.neckCenter.x * this.canvas.width
    const centerY = trackingData.neckCenter.y * this.canvas.height
    const width = trackingData.shoulderWidth * this.canvas.width * 0.6 // 60% of shoulder width

    this.drawNecklace(centerX, centerY, width, ctx)
  }

  private renderTiara(trackingData: TrackingData, ctx: CanvasRenderingContext2D): void {
    if (!trackingData.forehead || !trackingData.faceWidth) return

    const centerX = trackingData.forehead.x * this.canvas.width
    const centerY = trackingData.forehead.y * this.canvas.height
    const width = trackingData.faceWidth * this.canvas.width * 0.8 // 80% of face width

    this.drawTiara(centerX, centerY, width, ctx)
  }

  private drawRing(position: { x: number; y: number }, ctx: CanvasRenderingContext2D, color: string): void {
    const x = position.x * this.canvas.width
    const y = position.y * this.canvas.height
    const radius = 12

    // Ring base
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.stroke()

    // Ring gem (simple diamond shape)
    ctx.beginPath()
    ctx.moveTo(x, y - radius - 8)
    ctx.lineTo(x - 6, y - radius - 2)
    ctx.lineTo(x, y - radius + 4)
    ctx.lineTo(x + 6, y - radius - 2)
    ctx.closePath()
    ctx.fillStyle = '#FF69B4' // Pink gem
    ctx.fill()
    ctx.strokeStyle = '#8B008B'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  private drawNecklace(centerX: number, centerY: number, width: number, ctx: CanvasRenderingContext2D): void {
    const beadCount = 15
    const necklaceHeight = 40

    // Draw necklace chain as connected beads
    ctx.strokeStyle = '#C0C0C0' // Silver color
    ctx.lineWidth = 3

    for (let i = 0; i < beadCount; i++) {
      const angle = (i / (beadCount - 1)) * Math.PI - Math.PI / 2
      const x = centerY + Math.sin(angle) * necklaceHeight + necklaceHeight
      const y = centerX + Math.cos(angle) * (width / 2)

      console.log(angle, x, y)

      // Draw bead
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#FFD700' // Gold beads
      ctx.fill()
      ctx.stroke()

      // Connect beads with chain
      if (i > 0) {
        const prevAngle = ((i - 1) / (beadCount - 1)) * Math.PI - Math.PI / 2
        const prevX = centerX + Math.cos(prevAngle) * (width / 2)
        const prevY = centerY + Math.sin(prevAngle) * necklaceHeight + necklaceHeight

        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    }

    // Draw pendant in the center
    const pendantX = centerX + necklaceHeight + 20
    const pendantY = centerY

    ctx.beginPath()
    ctx.moveTo(pendantX, pendantY - 10)
    ctx.lineTo(pendantX - 8, pendantY + 5)
    ctx.lineTo(pendantX, pendantY + 15)
    ctx.lineTo(pendantX + 8, pendantY + 5)
    ctx.closePath()
    ctx.fillStyle = '#FF1493' // Deep pink pendant
    ctx.fill()
    ctx.strokeStyle = '#8B008B'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  private drawTiara(centerX: number, centerY: number, width: number, ctx: CanvasRenderingContext2D): void {
    const height = 30
    const peakCount = 5
    
    // Draw tiara base
    ctx.beginPath()
    ctx.moveTo(centerX - width / 2, centerY)
    
    // Create crown peaks
    for (let i = 0; i < peakCount; i++) {
      const x = centerX - width / 2 + (i * width) / (peakCount - 1)
      const peakHeight = i === Math.floor(peakCount / 2) ? height : height * 0.7 // Center peak is tallest
      
      ctx.lineTo(x, centerY - peakHeight)
      if (i < peakCount - 1) {
        const nextX = centerX - width / 2 + ((i + 1) * width) / (peakCount - 1)
        ctx.lineTo((x + nextX) / 2, centerY - 5) // Valley between peaks
      }
    }
    
    ctx.lineTo(centerX + width / 2, centerY)
    ctx.strokeStyle = '#FFD700' // Gold
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Fill with gradient
    const gradient = ctx.createLinearGradient(centerX, centerY - height, centerX, centerY)
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)')
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0.3)')
    ctx.fillStyle = gradient
    ctx.fill()
    
    // Add gems on peaks
    for (let i = 0; i < peakCount; i++) {
      const x = centerX - width / 2 + (i * width) / (peakCount - 1)
      const peakHeight = i === Math.floor(peakCount / 2) ? height : height * 0.7
      
      ctx.beginPath()
      ctx.arc(x, centerY - peakHeight, 4, 0, 2 * Math.PI)
      ctx.fillStyle = i === Math.floor(peakCount / 2) ? '#FF0000' : '#0000FF' // Red center gem, blue others
      ctx.fill()
      ctx.strokeStyle = '#8B008B'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
}