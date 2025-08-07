export interface AudioData {
  volume: number // 0-1 overall volume level
  frequency: number // Dominant frequency in Hz
  energy: number // 0-1 energy level (how "busy" the audio is)
  conversational: number // 0-1 likelihood of human conversation
  musicality: number // 0-1 likelihood of music vs speech/noise
  ambientNoise: number // 0-1 background noise level
  spectralCentroid: number // Brightness of the sound
  spectralRolloff: number // High frequency content
  zeroCrossingRate: number // Measure of percussiveness
}

export interface AudioSettings {
  sampleRate: number
  fftSize: number
  smoothingTimeConstant: number
  minDecibels: number
  maxDecibels: number
}

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private frequencyDataArray: Float32Array | null = null
  
  // Analysis state
  private isRunning = false
  private animationFrameId: number | null = null
  
  // Settings
  private settings: AudioSettings = {
    sampleRate: 44100,
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minDecibels: -90,
    maxDecibels: -10
  }
  
  // History for trend analysis
  private volumeHistory: number[] = []
  private energyHistory: number[] = []
  private readonly historyLength = 30 // Keep last 30 readings
  
  // Callbacks
  private onDataCallback?: (data: AudioData) => void
  private onErrorCallback?: (error: string) => void

  constructor(customSettings?: Partial<AudioSettings>) {
    if (customSettings) {
      this.settings = { ...this.settings, ...customSettings }
    }
  }

  async initialize(): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.settings.sampleRate
      })

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.settings.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = this.settings.fftSize
      this.analyser.smoothingTimeConstant = this.settings.smoothingTimeConstant
      this.analyser.minDecibels = this.settings.minDecibels
      this.analyser.maxDecibels = this.settings.maxDecibels

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.microphone.connect(this.analyser)

      // Initialize data arrays
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)
      this.frequencyDataArray = new Float32Array(bufferLength)

      console.log('Audio engine initialized successfully')
    } catch (error) {
      throw new Error(`Failed to initialize audio: ${error}`)
    }
  }

  startAnalysis(): void {
    if (!this.audioContext || !this.analyser || !this.dataArray) {
      throw new Error('Audio engine not initialized')
    }

    this.isRunning = true
    this.analysisLoop()
  }

  stopAnalysis(): void {
    this.isRunning = false
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    
    // Stop audio stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  private analysisLoop = (): void => {
    if (!this.isRunning || !this.analyser || !this.dataArray || !this.frequencyDataArray) {
      return
    }

    try {
      // Get frequency and time domain data
      this.analyser.getByteFrequencyData(this.dataArray)
      this.analyser.getFloatFrequencyData(this.frequencyDataArray)

      // Analyze audio data
      const audioData = this.analyzeAudioData()
      
      // Update history
      this.updateHistory(audioData)
      
      // Send data to callback
      if (this.onDataCallback) {
        this.onDataCallback(audioData)
      }

    } catch (error) {
      console.error('Audio analysis error:', error)
      if (this.onErrorCallback) {
        this.onErrorCallback(`Analysis error: ${error}`)
      }
    }

    // Continue analysis loop
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.analysisLoop)
    }
  }

  private analyzeAudioData(): AudioData {
    const data = this.dataArray!
    const freqData = this.frequencyDataArray!
    const sampleRate = this.audioContext!.sampleRate
    const nyquist = sampleRate / 2
    const binWidth = nyquist / data.length

    // Calculate volume (RMS)
    const volume = this.calculateRMS(data) / 255

    // Find dominant frequency
    let maxIndex = 0
    let maxValue = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i] > maxValue) {
        maxValue = data[i]
        maxIndex = i
      }
    }
    const frequency = maxIndex * binWidth

    // Calculate energy (sum of squared magnitudes)
    const energy = Math.min(1, data.reduce((sum, val) => sum + (val * val), 0) / (data.length * 255 * 255))

    // Analyze conversational content (voice frequency range)
    const conversational = this.analyzeConversationalContent(data, binWidth)

    // Analyze musicality (harmonic content and rhythm)
    const musicality = this.analyzeMusicality(data, freqData)

    // Calculate ambient noise (low-frequency content)
    const ambientNoise = this.calculateAmbientNoise(data)

    // Calculate spectral features
    const spectralCentroid = this.calculateSpectralCentroid(data, binWidth)
    const spectralRolloff = this.calculateSpectralRolloff(data, binWidth)
    const zeroCrossingRate = this.calculateZeroCrossingRate(data)

    return {
      volume,
      frequency,
      energy,
      conversational,
      musicality,
      ambientNoise,
      spectralCentroid,
      spectralRolloff,
      zeroCrossingRate
    }
  }

  private calculateRMS(data: Uint8Array): number {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i]
    }
    return Math.sqrt(sum / data.length)
  }

  private analyzeConversationalContent(data: Uint8Array, binWidth: number): number {
    // Human voice typically ranges from 85-255 Hz (fundamental) and 2000-4000 Hz (formants)
    const voiceLowStart = Math.floor(85 / binWidth)
    const voiceLowEnd = Math.floor(255 / binWidth)
    const voiceHighStart = Math.floor(2000 / binWidth)
    const voiceHighEnd = Math.floor(4000 / binWidth)

    let voiceEnergy = 0
    let totalEnergy = 0

    for (let i = 0; i < data.length; i++) {
      const energy = data[i]
      totalEnergy += energy

      if ((i >= voiceLowStart && i <= voiceLowEnd) || 
          (i >= voiceHighStart && i <= voiceHighEnd)) {
        voiceEnergy += energy
      }
    }

    return totalEnergy > 0 ? Math.min(1, voiceEnergy / totalEnergy) : 0
  }

  private analyzeMusicality(data: Uint8Array, freqData: Float32Array): number {
    // Look for harmonic patterns and sustained tones
    let harmonicStrength = 0
    let sustainedTones = 0

    for (let i = 1; i < data.length / 4; i++) {
      // Check for harmonics (multiples of fundamental frequencies)
      const fundamental = data[i]
      const harmonic2 = data[Math.min(i * 2, data.length - 1)]
      const harmonic3 = data[Math.min(i * 3, data.length - 1)]

      if (fundamental > 50 && harmonic2 > fundamental * 0.3 && harmonic3 > fundamental * 0.1) {
        harmonicStrength += fundamental
      }

      // Check for sustained tones (consistent energy over time)
      if (fundamental > 30) {
        sustainedTones += 1
      }
    }

    const maxHarmonic = data.length / 4 * 255
    const harmonicRatio = harmonicStrength / maxHarmonic
    const sustainedRatio = sustainedTones / (data.length / 4)

    return Math.min(1, (harmonicRatio * 0.7) + (sustainedRatio * 0.3))
  }

  private calculateAmbientNoise(data: Uint8Array): number {
    // Low frequency content (0-500 Hz typically indicates ambient noise)
    const lowFreqEnd = Math.floor(data.length * 0.1) // Roughly 0-500 Hz range
    let lowFreqEnergy = 0
    let totalEnergy = 0

    for (let i = 0; i < data.length; i++) {
      totalEnergy += data[i]
      if (i < lowFreqEnd) {
        lowFreqEnergy += data[i]
      }
    }

    return totalEnergy > 0 ? lowFreqEnergy / totalEnergy : 0
  }

  private calculateSpectralCentroid(data: Uint8Array, binWidth: number): number {
    let weightedSum = 0
    let magnitudeSum = 0

    for (let i = 0; i < data.length; i++) {
      const frequency = i * binWidth
      const magnitude = data[i]
      weightedSum += frequency * magnitude
      magnitudeSum += magnitude
    }

    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
  }

  private calculateSpectralRolloff(data: Uint8Array, binWidth: number): number {
    const totalEnergy = data.reduce((sum, val) => sum + val, 0)
    const threshold = totalEnergy * 0.85 // 85% of total energy
    
    let cumulativeEnergy = 0
    for (let i = 0; i < data.length; i++) {
      cumulativeEnergy += data[i]
      if (cumulativeEnergy >= threshold) {
        return i * binWidth
      }
    }
    
    return (data.length - 1) * binWidth
  }

  private calculateZeroCrossingRate(data: Uint8Array): number {
    let crossings = 0
    const threshold = 128 // Middle value for Uint8Array
    
    for (let i = 1; i < data.length; i++) {
      if ((data[i - 1] < threshold && data[i] >= threshold) ||
          (data[i - 1] >= threshold && data[i] < threshold)) {
        crossings++
      }
    }
    
    return crossings / (data.length - 1)
  }

  private updateHistory(audioData: AudioData): void {
    // Update volume history
    this.volumeHistory.push(audioData.volume)
    if (this.volumeHistory.length > this.historyLength) {
      this.volumeHistory.shift()
    }

    // Update energy history
    this.energyHistory.push(audioData.energy)
    if (this.energyHistory.length > this.historyLength) {
      this.energyHistory.shift()
    }
  }

  // Public methods for callbacks
  onAudioData(callback: (data: AudioData) => void): void {
    this.onDataCallback = callback
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback
  }

  // Utility methods
  isInitialized(): boolean {
    return this.audioContext !== null && this.analyser !== null
  }

  isAnalysisRunning(): boolean {
    return this.isRunning
  }

  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  // Get trend analysis
  getVolumetrend(): 'rising' | 'falling' | 'stable' {
    if (this.volumeHistory.length < 10) return 'stable'
    
    const recent = this.volumeHistory.slice(-10)
    const older = this.volumeHistory.slice(-20, -10)
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length
    
    const diff = recentAvg - olderAvg
    if (diff > 0.1) return 'rising'
    if (diff < -0.1) return 'falling'
    return 'stable'
  }

  getEnergyTrend(): 'rising' | 'falling' | 'stable' {
    if (this.energyHistory.length < 10) return 'stable'
    
    const recent = this.energyHistory.slice(-10)
    const older = this.energyHistory.slice(-20, -10)
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length
    
    const diff = recentAvg - olderAvg
    if (diff > 0.1) return 'rising'
    if (diff < -0.1) return 'falling'
    return 'stable'
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      sampleRate: this.audioContext?.sampleRate || 0,
      bufferSize: this.dataArray?.length || 0,
      isRunning: this.isRunning,
      historyLength: this.volumeHistory.length
    }
  }
}