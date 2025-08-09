// src/lib/ai/AdvancedMoodAI.ts - FIXED TypeScript errors
import { VisionData } from '@/lib/vision/VisionEngine'
import { AudioData } from '@/lib/audio/AudioEngine'

export interface ContextData {
  vision: VisionData | null
  audio: AudioData | null
  environmental: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    dayOfWeek: 'weekday' | 'weekend'
    season: 'spring' | 'summer' | 'fall' | 'winter'
    weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
    specialEvents?: string[]
  }
  timestamp: number
}

export interface MoodPrediction {
  recommendedMood: string
  confidence: number
  probability: number
  alternativeMoods: Array<{
    mood: string
    probability: number
    reasoning: string
  }>
  reasoning: string[]
  predictedDuration: number
  expectedOutcome: {
    engagementScore: number
    audienceRetention: number
    energyLevel: number
  }
}

export interface LearningMetrics {
  totalSessions: number
  averageAccuracy: number
  moodEffectiveness: Record<string, {
    usage: number
    avgEngagement: number
    avgDuration: number
    contextSuccess: Record<string, number>
  }>
  patternRecognition: {
    timePatterns: Array<{
      timeRange: string
      preferredMood: string
      success: number
    }>
    crowdPatterns: Array<{
      crowdSize: string
      optimalMood: string
      engagementScore: number
    }>
    weatherPatterns: Array<{
      weather: string
      moodAdjustment: string
      effectiveness: number
    }>
  }
  improvements: {
    accuracyTrend: number[]
    learningRate: number
    adaptationSpeed: number
  }
}

export interface ABTestResult {
  testId: string
  moodA: string
  moodB: string
  context: string
  winnerMood: string
  confidenceLevel: number
  engagementDiff: number
  sampleSize: number
  startDate: number
  endDate: number
}

// Simplified Neural Network (fixed types)
class MoodNeuralNetwork {
  private weights: number[][][]  // ✅ FIXED: 3D array for proper matrix storage
  private biases: number[][]      // ✅ FIXED: 2D array for layer biases
  private learningRate = 0.01

  constructor() {
    // Initialize with simple 3-layer network structure
    this.weights = [
      this.randomMatrix(5, 8), // Input (5) to hidden (8)
      this.randomMatrix(8, 5)  // Hidden (8) to output (5)
    ]
    this.biases = [
      this.randomArray(8),     // Hidden layer biases
      this.randomArray(5)      // Output layer biases
    ]
  }

  private randomMatrix(rows: number, cols: number): number[][] {
    const matrix: number[][] = []
    for (let i = 0; i < rows; i++) {
      const row: number[] = []
      for (let j = 0; j < cols; j++) {
        row.push((Math.random() - 0.5) * 2)
      }
      matrix.push(row)
    }
    return matrix
  }

  private randomArray(size: number): number[] {
    const array: number[] = []
    for (let i = 0; i < size; i++) {
      array.push((Math.random() - 0.5) * 2)
    }
    return array
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  predict(inputs: number[]): number[] {
    let current = [...inputs] // Copy input array

    // Forward pass through network
    for (let layer = 0; layer < this.weights.length; layer++) {
      const layerOutput: number[] = []
      const currentWeights = this.weights[layer]
      const currentBiases = this.biases[layer]
      
      for (let neuron = 0; neuron < currentWeights[0].length; neuron++) {
        let sum = currentBiases[neuron]
        
        for (let input = 0; input < current.length; input++) {
          sum += current[input] * currentWeights[input][neuron]
        }
        
        layerOutput.push(this.sigmoid(sum))
      }
      
      current = layerOutput
    }

    return current
  }

  train(inputs: number[], expectedOutputs: number[]): void {
    // Simplified training (just for basic functionality)
    const predictions = this.predict(inputs)
    
    // Calculate basic error and adjust
    for (let i = 0; i < expectedOutputs.length; i++) {
      const error = expectedOutputs[i] - predictions[i]
      
      if (Math.abs(error) > 0.1) {
        // Simple weight adjustment for demonstration
        const outputLayerIndex = this.weights.length - 1
        const outputWeights = this.weights[outputLayerIndex]
        
        for (let j = 0; j < outputWeights.length; j++) {
          outputWeights[j][i] += this.learningRate * error * 0.1
        }
      }
    }
  }
}

export class AdvancedMoodAI {
  private sessionHistory: ContextData[] = []
  private learningDatabase: Array<{
    context: ContextData
    appliedMood: string
    outcome: {
      engagement: number
      duration: number
      audienceGrowth: number
      feedback: number
    }
    timestamp: number
  }> = []
  
  private neuralNetwork: MoodNeuralNetwork
  private abTests: ABTestResult[] = []
  private currentABTest?: {
    testId: string
    moodA: string
    moodB: string
    context: string
    sessionCount: number
    resultsA: number[]
    resultsB: number[]
  }

  private moodMappings = {
    'Energetic': 0,
    'Social': 1,
    'Contemplative': 2,
    'Mysterious': 3,
    'Peaceful': 4
  }

  private moodNames = ['Energetic', 'Social', 'Contemplative', 'Mysterious', 'Peaceful']

  constructor() {
    this.neuralNetwork = new MoodNeuralNetwork()
    this.loadLearningData()
  }

  // 🎯 MAIN PREDICTION FUNCTION (Simplified for deployment)
  predictOptimalMood(context: ContextData): MoodPrediction {
    // Simplified prediction logic for stable deployment
    const nnInputs = this.contextToInputs(context)
    const nnOutputs = this.neuralNetwork.predict(nnInputs)
    
    // Find mood with highest probability
    const maxIndex = nnOutputs.indexOf(Math.max(...nnOutputs))
    const recommendedMood = this.moodNames[maxIndex]
    const confidence = nnOutputs[maxIndex]

    // Generate basic reasoning
    const reasoning = this.generateBasicReasoning(context, recommendedMood)

    // Create basic alternative moods
    const sortedIndices = nnOutputs
      .map((prob, index) => ({ prob, index }))
      .sort((a, b) => b.prob - a.prob)
      .slice(1, 3)

    const alternativeMoods = sortedIndices.map(item => ({
      mood: this.moodNames[item.index],
      probability: item.prob,
      reasoning: `Alternative based on ${this.moodNames[item.index].toLowerCase()} context patterns`
    }))

    return {
      recommendedMood,
      confidence,
      probability: confidence,
      alternativeMoods,
      reasoning,
      predictedDuration: this.estimateDuration(recommendedMood, context),
      expectedOutcome: {
        engagementScore: 0.7 + (confidence * 0.3),
        audienceRetention: 0.6 + (confidence * 0.4),
        energyLevel: this.estimateEnergyLevel(recommendedMood)
      }
    }
  }

  private contextToInputs(context: ContextData): number[] {
    const vision = context.vision
    const audio = context.audio
    const env = context.environmental

    return [
      Math.min(1, (vision?.peopleCount || 0) / 50),
      vision?.avgMovement || 0,
      audio?.energy || 0,
      this.timeToValue(env.timeOfDay),
      this.weatherToValue(env.weather || 'sunny')
    ]
  }

  private timeToValue(timeOfDay: string): number {
    const mapping = { morning: 0.2, afternoon: 0.5, evening: 0.8, night: 0.1 }
    return mapping[timeOfDay as keyof typeof mapping] || 0.5
  }

  private weatherToValue(weather: string): number {
    const mapping = { sunny: 0.8, cloudy: 0.5, rainy: 0.2, stormy: 0.1 }
    return mapping[weather as keyof typeof mapping] || 0.5
  }

  private generateBasicReasoning(context: ContextData, mood: string): string[] {
    const reasoning: string[] = []
    const vision = context.vision
    const audio = context.audio

    if (vision?.peopleCount) {
      if (vision.peopleCount > 15) {
        reasoning.push(`High crowd density (${vision.peopleCount} people) supports ${mood} mood`)
      } else if (vision.peopleCount < 5) {
        reasoning.push(`Low crowd density (${vision.peopleCount} people) aligns with ${mood} mood`)
      }
    }

    if (audio?.energy) {
      if (audio.energy > 0.6) {
        reasoning.push(`High audio energy (${Math.round(audio.energy * 100)}%) matches ${mood} characteristics`)
      } else if (audio.energy < 0.3) {
        reasoning.push(`Low audio energy suggests ${mood} atmosphere`)
      }
    }

    const timeContext = context.environmental.timeOfDay
    reasoning.push(`${timeContext.charAt(0).toUpperCase() + timeContext.slice(1)} time period favors ${mood} mood`)

    return reasoning.length > 0 ? reasoning : [`AI recommends ${mood} based on current context`]
  }

  private estimateDuration(mood: string, context: ContextData): number {
    // Basic duration estimation (in seconds)
    const baseTime = 300 // 5 minutes
    const adjustments: Record<string, number> = {
      'Energetic': 0.8,
      'Social': 1.2,
      'Contemplative': 1.5,
      'Mysterious': 1.0,
      'Peaceful': 1.3
    }
    
    return Math.round(baseTime * (adjustments[mood] || 1.0))
  }

  private estimateEnergyLevel(mood: string): number {
    const energyMap: Record<string, number> = {
      'Energetic': 0.9,
      'Social': 0.7,
      'Contemplative': 0.3,
      'Mysterious': 0.5,
      'Peaceful': 0.2
    }
    
    return energyMap[mood] || 0.5
  }

  // 🧪 A/B TESTING (Simplified)
  startABTest(moodA: string, moodB: string, context: string): string {
    const testId = `ab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.currentABTest = {
      testId,
      moodA,
      moodB,
      context,
      sessionCount: 0,
      resultsA: [],
      resultsB: []
    }

    return testId
  }

  recordABTestResult(testId: string, mood: string, engagement: number): void {
    if (!this.currentABTest || this.currentABTest.testId !== testId) return

    this.currentABTest.sessionCount++
    
    if (mood === this.currentABTest.moodA) {
      this.currentABTest.resultsA.push(engagement)
    } else if (mood === this.currentABTest.moodB) {
      this.currentABTest.resultsB.push(engagement)
    }

    // Auto-complete test after 50 sessions
    if (this.currentABTest.sessionCount >= 50) {
      this.completeABTest()
    }
  }

  private completeABTest(): void {
    if (!this.currentABTest) return

    const avgA = this.currentABTest.resultsA.reduce((sum, r) => sum + r, 0) / this.currentABTest.resultsA.length
    const avgB = this.currentABTest.resultsB.reduce((sum, r) => sum + r, 0) / this.currentABTest.resultsB.length

    const result: ABTestResult = {
      testId: this.currentABTest.testId,
      moodA: this.currentABTest.moodA,
      moodB: this.currentABTest.moodB,
      context: this.currentABTest.context,
      winnerMood: avgA > avgB ? this.currentABTest.moodA : this.currentABTest.moodB,
      confidenceLevel: Math.abs(avgA - avgB) / Math.max(avgA, avgB),
      engagementDiff: Math.abs(avgA - avgB),
      sampleSize: this.currentABTest.sessionCount,
      startDate: parseInt(this.currentABTest.testId.split('_')[1]),
      endDate: Date.now()
    }

    this.abTests.push(result)
    this.currentABTest = undefined
  }

  // 🔄 LEARNING MANAGEMENT
  recordOutcome(context: ContextData, appliedMood: string, outcome: {
    engagement: number
    duration: number
    audienceGrowth: number
    feedback: number
  }): void {
    this.learningDatabase.push({
      context,
      appliedMood,
      outcome,
      timestamp: Date.now()
    })

    // Keep database manageable
    if (this.learningDatabase.length > 1000) {
      this.learningDatabase = this.learningDatabase.slice(-800)
    }

    // Simple neural network training
    const inputs = this.contextToInputs(context)
    const targetOutputs = new Array(5).fill(0.1)
    const moodIndex = this.moodMappings[appliedMood as keyof typeof this.moodMappings]
    if (moodIndex !== undefined) {
      targetOutputs[moodIndex] = outcome.engagement
    }

    this.neuralNetwork.train(inputs, targetOutputs)
  }

  // 📈 ANALYTICS & INSIGHTS
  getLearningMetrics(): LearningMetrics {
    const totalSessions = this.learningDatabase.length
    
    // Calculate mood effectiveness
    const moodEffectiveness: Record<string, any> = {}
    this.moodNames.forEach(mood => {
      const sessions = this.learningDatabase.filter(s => s.appliedMood === mood)
      moodEffectiveness[mood] = {
        usage: sessions.length,
        avgEngagement: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + s.outcome.engagement, 0) / sessions.length 
          : 0,
        avgDuration: sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.outcome.duration, 0) / sessions.length
          : 0,
        contextSuccess: {}
      }
    })

    return {
      totalSessions,
      averageAccuracy: this.calculateAccuracy(),
      moodEffectiveness,
      patternRecognition: {
        timePatterns: this.generateTimePatterns(),
        crowdPatterns: this.generateCrowdPatterns(),
        weatherPatterns: [
          { weather: 'sunny', moodAdjustment: 'Energetic', effectiveness: 0.8 },
          { weather: 'cloudy', moodAdjustment: 'Contemplative', effectiveness: 0.7 },
          { weather: 'rainy', moodAdjustment: 'Peaceful', effectiveness: 0.75 }
        ]
      },
      improvements: {
        accuracyTrend: this.generateAccuracyTrend(),
        learningRate: 0.75,
        adaptationSpeed: 0.85
      }
    }
  }

  private calculateAccuracy(): number {
    if (this.learningDatabase.length === 0) return 0.7
    
    // Simple accuracy calculation
    const successful = this.learningDatabase.filter(s => s.outcome.engagement > 0.7).length
    return successful / this.learningDatabase.length
  }

  private generateTimePatterns() {
    return [
      { timeRange: 'morning', preferredMood: 'Peaceful', success: 0.8 },
      { timeRange: 'afternoon', preferredMood: 'Social', success: 0.75 },
      { timeRange: 'evening', preferredMood: 'Energetic', success: 0.85 },
      { timeRange: 'night', preferredMood: 'Mysterious', success: 0.7 }
    ]
  }

  private generateCrowdPatterns() {
    return [
      { crowdSize: 'small', optimalMood: 'Contemplative', engagementScore: 0.8 },
      { crowdSize: 'medium', optimalMood: 'Social', engagementScore: 0.85 },
      { crowdSize: 'large', optimalMood: 'Energetic', engagementScore: 0.9 }
    ]
  }

  private generateAccuracyTrend(): number[] {
    // Generate sample accuracy trend
    const trend: number[] = [] // ✅ FIXED: Explicit type
    for (let i = 0; i < 10; i++) {
      trend.push(0.6 + (i * 0.02) + (Math.random() * 0.1))
    }
    return trend
  }

  getABTestResults(): ABTestResult[] {
    return [...this.abTests]
  }

  getSystemStatus(): {
    isLearning: boolean
    totalExperience: number
    confidence: number
    lastLearningUpdate: number
  } {
    return {
      isLearning: this.learningDatabase.length > 10,
      totalExperience: this.learningDatabase.length,
      confidence: this.calculateAccuracy(),
      lastLearningUpdate: this.learningDatabase[this.learningDatabase.length - 1]?.timestamp || 0
    }
  }

  exportLearningData(): {
    learningDatabase: typeof this.learningDatabase
    abTests: ABTestResult[]
  } {
    return {
      learningDatabase: [...this.learningDatabase],
      abTests: [...this.abTests]
    }
  }

  importLearningData(data: {
    learningDatabase?: typeof this.learningDatabase
    abTests?: ABTestResult[]
  }): void {
    if (data.learningDatabase) this.learningDatabase = [...data.learningDatabase]
    if (data.abTests) this.abTests = [...data.abTests]
  }

  resetLearning(): void {
    this.learningDatabase = []
    this.abTests = []
    this.neuralNetwork = new MoodNeuralNetwork()
  }

  private loadLearningData(): void {
    // Generate sample learning data for demonstration
    const sampleData = [
      { mood: 'Peaceful', engagement: 0.8, time: 'morning' },
      { mood: 'Social', engagement: 0.75, time: 'afternoon' },
      { mood: 'Energetic', engagement: 0.9, time: 'evening' },
      { mood: 'Contemplative', engagement: 0.85, time: 'morning' },
      { mood: 'Mysterious', engagement: 0.7, time: 'evening' }
    ]

    sampleData.forEach((sample, index) => {
      const context: ContextData = {
        vision: {
          peopleCount: Math.floor(Math.random() * 20),
          avgMovement: Math.random(),
          energyLevel: Math.random(),
          confidence: 0.7 + Math.random() * 0.3,
          dominantAge: 'mixed' as const,
          crowdDensity: Math.random(),
          boundingBoxes: []
        },
        audio: {
          energy: Math.random(),
          volume: Math.random(),
          spectralCentroid: 1000 + Math.random() * 2000,
          conversational: Math.random(),
          musical: Math.random(),
          complexity: Math.random(),
          lastUpdate: Date.now()
        },
        environmental: {
          timeOfDay: sample.time as any,
          dayOfWeek: index % 2 === 0 ? 'weekday' : 'weekend',
          season: 'spring'
        },
        timestamp: Date.now() - (index * 3600000)
      }

      this.learningDatabase.push({
        context,
        appliedMood: sample.mood,
        outcome: {
          engagement: sample.engagement,
          duration: 300 + Math.random() * 600,
          audienceGrowth: (sample.engagement - 0.5) * 0.4,
          feedback: sample.engagement * 0.9
        },
        timestamp: Date.now() - (index * 3600000)
      })
    })
  }
}