import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs'

export interface VisionData {
  peopleCount: number
  avgMovement: number
  crowdDensity: number
  dominantAge: 'children' | 'adults' | 'elderly' | 'mixed'
  energyLevel: number
  boundingBoxes: cocoSsd.DetectedObject[]
  confidence: number
}

export interface MovementTracker {
  x: number
  y: number
  timestamp: number
  id: string
}

export class VisionEngine {
  private model: cocoSsd.ObjectDetection | null = null
  private videoElement: HTMLVideoElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private isRunning = false
  private stream: MediaStream | null = null
  
  // Movement tracking
  private previousDetections: cocoSsd.DetectedObject[] = []
  private movementHistory: MovementTracker[][] = []
  private frameCount = 0
  
  // Callbacks
  private onDataCallback?: (data: VisionData) => void
  private onErrorCallback?: (error: string) => void

  constructor() {
    this.initializeTensorFlow()
  }

  private async initializeTensorFlow() {
    try {
      // Set backend to WebGL for better performance
      await tf.setBackend('webgl')
      await tf.ready()
      console.log('TensorFlow.js initialized with WebGL backend')
    } catch (error) {
      console.warn('WebGL not available, falling back to CPU')
      await tf.setBackend('cpu')
      await tf.ready()
    }
  }

  async initialize(): Promise<void> {
    try {
      // Load COCO-SSD model for object detection
      console.log('Loading computer vision model...')
      this.model = await cocoSsd.load({
        base: 'mobilenet_v2' // Faster but less accurate, good for real-time
      })
      console.log('Computer vision model loaded successfully')
    } catch (error) {
      throw new Error(`Failed to load vision model: ${error}`)
    }
  }

  async startCamera(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    try {
      this.videoElement = videoElement
      this.canvasElement = canvasElement
      this.ctx = canvasElement.getContext('2d')

      if (!this.ctx) {
        throw new Error('Cannot get canvas context')
      }

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Use back camera if available
        },
        audio: false
      })

      this.videoElement.srcObject = this.stream
      
      // Wait for video to load
      return new Promise((resolve, reject) => {
        this.videoElement!.onloadedmetadata = () => {
          this.videoElement!.play()
          
          // Set canvas dimensions to match video
          this.canvasElement!.width = this.videoElement!.videoWidth
          this.canvasElement!.height = this.videoElement!.videoHeight
          
          resolve()
        }
        
        this.videoElement!.onerror = () => {
          reject(new Error('Failed to load camera stream'))
        }
      })
    } catch (error) {
      throw new Error(`Camera access failed: ${error}`)
    }
  }

  startDetection(): void {
    if (!this.model || !this.videoElement || !this.canvasElement || !this.ctx) {
      throw new Error('Vision system not properly initialized')
    }

    this.isRunning = true
    this.detectLoop()
  }

  stopDetection(): void {
    this.isRunning = false
    
    // Stop camera stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
  }

  private async detectLoop(): Promise<void> {
    if (!this.isRunning || !this.model || !this.videoElement || !this.ctx) {
      return
    }

    try {
      // Detect objects in current frame
      const predictions = await this.model.detect(this.videoElement)
      
      // Filter for people (class 'person' has id 0)
      const people = predictions.filter(prediction => prediction.class === 'person')
      
      // Draw video frame on canvas
      this.ctx.drawImage(
        this.videoElement, 
        0, 0, 
        this.canvasElement!.width, 
        this.canvasElement!.height
      )
      
      // Draw bounding boxes
      this.drawBoundingBoxes(people)
      
      // Analyze movement and generate data
      const visionData = this.analyzeDetections(people)
      
      // Store for movement tracking
      this.previousDetections = people
      this.frameCount++
      
      // Callback with data
      if (this.onDataCallback) {
        this.onDataCallback(visionData)
      }
      
    } catch (error) {
      console.error('Detection error:', error)
      if (this.onErrorCallback) {
        this.onErrorCallback(`Detection failed: ${error}`)
      }
    }

    // Continue detection loop at ~10 FPS for performance
    if (this.isRunning) {
      setTimeout(() => this.detectLoop(), 100)
    }
  }

  private drawBoundingBoxes(detections: cocoSsd.DetectedObject[]): void {
    if (!this.ctx) return

    this.ctx.strokeStyle = '#00ff00'
    this.ctx.lineWidth = 2
    this.ctx.font = '14px Arial'
    this.ctx.fillStyle = '#00ff00'

    detections.forEach((detection, index) => {
      const [x, y, width, height] = detection.bbox
      
      // Draw bounding box
      this.ctx!.strokeRect(x, y, width, height)
      
      // Draw label
      const label = `Person ${index + 1} (${Math.round(detection.score * 100)}%)`
      this.ctx!.fillText(label, x, y - 5)
      
      // Draw center point for movement tracking
      const centerX = x + width / 2
      const centerY = y + height / 2
      this.ctx!.beginPath()
      this.ctx!.arc(centerX, centerY, 3, 0, 2 * Math.PI)
      this.ctx!.fill()
    })
  }

  private analyzeDetections(detections: cocoSsd.DetectedObject[]): VisionData {
    const peopleCount = detections.length
    
    // Calculate movement between frames
    const avgMovement = this.calculateMovement(detections)
    
    // Calculate crowd density (people per area)
    const canvasArea = this.canvasElement!.width * this.canvasElement!.height
    const crowdDensity = peopleCount / (canvasArea / 10000) // Normalize to reasonable scale
    
    // Estimate age demographics based on bounding box size (rough heuristic)
    const dominantAge = this.estimateAgeDemographics(detections)
    
    // Calculate energy level based on movement and density
    const energyLevel = Math.min(1, (avgMovement * 0.7) + (crowdDensity * 0.3))
    
    // Calculate average confidence
    const confidence = detections.length > 0 
      ? detections.reduce((sum, det) => sum + det.score, 0) / detections.length
      : 0

    return {
      peopleCount,
      avgMovement,
      crowdDensity,
      dominantAge,
      energyLevel,
      boundingBoxes: detections,
      confidence
    }
  }

  private calculateMovement(currentDetections: cocoSsd.DetectedObject[]): number {
    if (this.previousDetections.length === 0 || currentDetections.length === 0) {
      return 0
    }

    let totalMovement = 0
    let matchedDetections = 0

    // Match current detections with previous ones (simple nearest neighbor)
    currentDetections.forEach(current => {
      const [curX, curY] = this.getBoundingBoxCenter(current.bbox)
      
      let minDistance = Infinity
      let closestPrevious: cocoSsd.DetectedObject | null = null

      this.previousDetections.forEach(previous => {
        const [prevX, prevY] = this.getBoundingBoxCenter(previous.bbox)
        const distance = Math.sqrt((curX - prevX) ** 2 + (curY - prevY) ** 2)
        
        if (distance < minDistance && distance < 100) { // Max matching distance
          minDistance = distance
          closestPrevious = previous
        }
      })

      if (closestPrevious) {
        totalMovement += minDistance
        matchedDetections++
      }
    })

    // Normalize movement (0-1 scale)
    const avgMovement = matchedDetections > 0 ? totalMovement / matchedDetections : 0
    return Math.min(1, avgMovement / 50) // Scale movement to 0-1 range
  }

  private getBoundingBoxCenter(bbox: [number, number, number, number]): [number, number] {
    const [x, y, width, height] = bbox
    return [x + width / 2, y + height / 2]
  }

  private estimateAgeDemographics(detections: cocoSsd.DetectedObject[]): 'children' | 'adults' | 'elderly' | 'mixed' {
    if (detections.length === 0) return 'mixed'

    // Rough heuristic based on bounding box height
    const heights = detections.map(det => det.bbox[3])
    const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length
    
    // These thresholds would need calibration based on camera position/angle
    if (avgHeight < 80) return 'children'
    if (avgHeight > 120) return 'adults'
    return 'mixed'
  }

  // Public methods for callbacks
  onVisionData(callback: (data: VisionData) => void): void {
    this.onDataCallback = callback
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback
  }

  // Utility methods
  isInitialized(): boolean {
    return this.model !== null
  }

  isDetectionRunning(): boolean {
    return this.isRunning
  }

  getModelInfo(): string {
    return this.model ? 'COCO-SSD MobileNet v2' : 'Not loaded'
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      frameCount: this.frameCount,
      memoryUsage: tf.memory(),
      backend: tf.getBackend()
    }
  }
}