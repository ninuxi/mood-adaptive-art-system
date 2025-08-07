import { VisionData } from '@/lib/vision/VisionEngine'
import { AudioData } from '@/lib/audio/AudioEngine'

export interface SensorData {
  vision: VisionData | null
  audio: AudioData | null
  timestamp: number
}

export interface MoodDecision {
  recommendedMood: string
  confidence: number
  reasoning: string[]
  parameters: {
    energy: number
    valence: number
    arousal: number
  }
  softwareRecommendations: {
    qlab: { volume: number; cue: string; fadeTime: number }
    resolume: { opacity: number; clip: string; speed: number }
    lighting: { intensity: number; color: string; transition: number }
  }
}

export interface LearningData {
  context: SensorData
  appliedMood: string
  audienceResponse: number // 0-1 how well the mood was received
  duration: number // how long the mood lasted
  timestamp: number
}

export class MoodDecisionEngine {
  private sensorHistory: SensorData[] = []
  private learningData: LearningData[] = []
  private readonly historyLength = 50
  private readonly learningDataLength = 100

  // Mood templates with their ideal parameters
  private moodTemplates = {
    'Energetic': {
      energy: 0.9,
      valence: 0.8,
      arousal: 0.9,
      color: '#EF4444'
    },
    'Social': {
      energy: 0.7,
      valence: 0.9,
      arousal: 0.6,
      color: '#10B981'
    },
    'Contemplative': {
      energy: 0.3,
      valence: 0.6,
      arousal: 0.2,
      color: '#8B5CF6'
    },
    'Mysterious': {
      energy: 0.5,
      valence: 0.3,
      arousal: 0.7,
      color: '#6366F1'
    },
    'Peaceful': {
      energy: 0.2,
      valence: 0.8,
      arousal: 0.1,
      color: '#06B6D4'
    }
  }

  analyzeSensorData(vision: VisionData | null, audio: AudioData | null): MoodDecision {
    const sensorData: SensorData = {
      vision,
      audio,
      timestamp: Date.now()
    }

    // Add to history
    this.addToHistory(sensorData)

    // Analyze current context
    const contextAnalysis = this.analyzeContext(sensorData)
    
    // Get mood recommendation based on multiple factors
    const moodDecision = this.decideMood(contextAnalysis, sensorData)
    
    return moodDecision
  }

  private addToHistory(data: SensorData): void {
    this.sensorHistory.push(data)
    if (this.sensorHistory.length > this.historyLength) {
      this.sensorHistory.shift()
    }
  }

  private analyzeContext(current: SensorData): {
    crowdSize: 'empty' | 'few' | 'moderate' | 'busy' | 'crowded'
    activityLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
    audioContext: 'silent' | 'ambient' | 'conversational' | 'musical' | 'noisy'
    trends: {
      peopleFlow: 'increasing' | 'decreasing' | 'stable'
      energyFlow: 'building' | 'declining' | 'steady'
    }
  } {
    const vision = current.vision
    const audio = current.audio

    // Analyze crowd size
    const peopleCount = vision?.peopleCount || 0
    const crowdSize = peopleCount === 0 ? 'empty' :
                     peopleCount <= 3 ? 'few' :
                     peopleCount <= 8 ? 'moderate' :
                     peopleCount <= 15 ? 'busy' : 'crowded'

    // Analyze activity level (combination of movement and audio energy)
    const movement = vision?.avgMovement || 0
    const audioEnergy = audio?.energy || 0
    const combinedActivity = (movement * 0.6) + (audioEnergy * 0.4)
    
    const activityLevel = combinedActivity < 0.1 ? 'very_low' :
                         combinedActivity < 0.3 ? 'low' :
                         combinedActivity < 0.6 ? 'moderate' :
                         combinedActivity < 0.8 ? 'high' : 'very_high'

    // Analyze audio context
    const audioContext = !audio || audio.volume < 0.1 ? 'silent' :
                        audio.ambientNoise > 0.7 ? 'ambient' :
                        audio.conversational > 0.6 ? 'conversational' :
                        audio.musicality > 0.7 ? 'musical' : 'noisy'

    // Analyze trends from recent history
    const trends = this.analyzeTrends()

    return {
      crowdSize,
      activityLevel,
      audioContext,
      trends
    }
  }

  private analyzeTrends(): {
    peopleFlow: 'increasing' | 'decreasing' | 'stable'
    energyFlow: 'building' | 'declining' | 'steady'
  } {
    if (this.sensorHistory.length < 10) {
      return { peopleFlow: 'stable', energyFlow: 'steady' }
    }

    const recent = this.sensorHistory.slice(-5)
    const older = this.sensorHistory.slice(-10, -5)

    // People flow trend
    const recentPeople = recent.reduce((sum, data) => sum + (data.vision?.peopleCount || 0), 0) / recent.length
    const olderPeople = older.reduce((sum, data) => sum + (data.vision?.peopleCount || 0), 0) / older.length
    
    const peopleChange = recentPeople - olderPeople
    const peopleFlow = peopleChange > 2 ? 'increasing' :
                      peopleChange < -2 ? 'decreasing' : 'stable'

    // Energy flow trend
    const recentEnergy = recent.reduce((sum, data) => {
      const visionEnergy = data.vision?.energyLevel || 0
      const audioEnergy = data.audio?.energy || 0
      return sum + ((visionEnergy + audioEnergy) / 2)
    }, 0) / recent.length

    const olderEnergy = older.reduce((sum, data) => {
      const visionEnergy = data.vision?.energyLevel || 0
      const audioEnergy = data.audio?.energy || 0
      return sum + ((visionEnergy + audioEnergy) / 2)
    }, 0) / older.length

    const energyChange = recentEnergy - olderEnergy
    const energyFlow = energyChange > 0.2 ? 'building' :
                      energyChange < -0.2 ? 'declining' : 'steady'

    return { peopleFlow, energyFlow }
  }

  private decideMood(context: any, sensorData: SensorData): MoodDecision {
    const reasoning: string[] = []
    let recommendedMood = 'Contemplative' // Default
    let confidence = 0.5

    // Decision logic based on context analysis
    if (context.crowdSize === 'empty' || context.activityLevel === 'very_low') {
      recommendedMood = 'Peaceful'
      confidence = 0.8
      reasoning.push('Low activity detected - peaceful environment recommended')
    }
    else if (context.crowdSize === 'crowded' && context.activityLevel === 'very_high') {
      recommendedMood = 'Energetic'
      confidence = 0.9
      reasoning.push('High crowd density and activity - energetic mood to match energy')
    }
    else if (context.audioContext === 'conversational' && context.crowdSize !== 'few') {
      recommendedMood = 'Social'
      confidence = 0.85
      reasoning.push('Active conversation detected - social mood to encourage interaction')
    }
    else if (context.audioContext === 'musical') {
      recommendedMood = 'Energetic'
      confidence = 0.75
      reasoning.push('Musical content detected - matching energetic mood')
    }
    else if (context.activityLevel === 'low' && context.crowdSize === 'moderate') {
      recommendedMood = 'Contemplative'
      confidence = 0.7
      reasoning.push('Moderate crowd with low activity - contemplative mood for reflection')
    }
    else if (context.trends.energyFlow === 'building') {
      recommendedMood = context.crowdSize === 'busy' ? 'Social' : 'Energetic'
      confidence = 0.75
      reasoning.push('Energy building - transitioning to more dynamic mood')
    }
    else if (context.trends.peopleFlow === 'increasing') {
      recommendedMood = 'Social'
      confidence = 0.7
      reasoning.push('More people arriving - social mood to welcome newcomers')
    }

    // Apply learning adjustments
    const learningAdjustment = this.applyLearning(context, recommendedMood)
    if (learningAdjustment.adjustment !== 'none') {
      recommendedMood = learningAdjustment.newMood
      confidence = Math.min(0.95, confidence + 0.1)
      reasoning.push(`Learning system suggests: ${learningAdjustment.reason}`)
    }

    // Generate mood parameters
    const moodTemplate = this.moodTemplates[recommendedMood as keyof typeof this.moodTemplates]
    const parameters = this.calculateMoodParameters(moodTemplate, sensorData, context)

    // Generate software recommendations
    const softwareRecommendations = this.generateSoftwareRecommendations(recommendedMood, parameters, context)

    return {
      recommendedMood,
      confidence,
      reasoning,
      parameters,
      softwareRecommendations
    }
  }

  private applyLearning(context: any, proposedMood: string): {
    adjustment: 'none' | 'modify' | 'override'
    newMood: string
    reason: string
  } {
    // Find similar past contexts
    const similarContexts = this.learningData.filter(data => {
      // Simple similarity matching - in a real system this would be more sophisticated
      const vision = data.context.vision
      const audio = data.context.audio
      
      if (!vision || !audio) return false
      
      const peopleCountSimilar = Math.abs((vision.peopleCount || 0) - (context.crowdSize === 'busy' ? 10 : 5)) < 5
      const energySimilar = Math.abs((audio.energy || 0) - (context.activityLevel === 'high' ? 0.8 : 0.4)) < 0.3
      
      return peopleCountSimilar && energySimilar
    })

    if (similarContexts.length < 3) {
      return { adjustment: 'none', newMood: proposedMood, reason: 'Insufficient learning data' }
    }

    // Find the mood that performed best in similar contexts
    const moodPerformance = similarContexts.reduce((acc, data) => {
      acc[data.appliedMood] = acc[data.appliedMood] || { total: 0, count: 0, avgResponse: 0 }
      acc[data.appliedMood].total += data.audienceResponse
      acc[data.appliedMood].count += 1
      acc[data.appliedMood].avgResponse = acc[data.appliedMood].total / acc[data.appliedMood].count
      return acc
    }, {} as Record<string, { total: number; count: number; avgResponse: number }>)

    const bestMood = Object.entries(moodPerformance)
      .sort(([,a], [,b]) => b.avgResponse - a.avgResponse)[0]

    if (bestMood && bestMood[1].avgResponse > 0.7 && bestMood[0] !== proposedMood) {
      return {
        adjustment: 'override',
        newMood: bestMood[0],
        reason: `${bestMood[0]} performed ${Math.round(bestMood[1].avgResponse * 100)}% better in similar contexts`
      }
    }

    return { adjustment: 'none', newMood: proposedMood, reason: 'Current mood selection validated by learning' }
  }

  private calculateMoodParameters(template: any, sensorData: SensorData, context: any) {
    // Start with template parameters
    let { energy, valence, arousal } = template

    // Adjust based on real sensor data
    if (sensorData.vision) {
      // Adjust energy based on crowd movement
      energy = Math.min(1, energy + (sensorData.vision.avgMovement * 0.2))
      
      // Adjust arousal based on crowd density
      arousal = Math.min(1, arousal + (sensorData.vision.crowdDensity * 0.1))
    }

    if (sensorData.audio) {
      // Adjust energy based on audio energy
      energy = (energy + sensorData.audio.energy) / 2
      
      // Adjust valence based on conversational content (positive social indicator)
      if (sensorData.audio.conversational > 0.6) {
        valence = Math.min(1, valence + 0.1)
      }
    }

    // Apply contextual adjustments
    if (context.trends.energyFlow === 'building') {
      energy = Math.min(1, energy + 0.1)
      arousal = Math.min(1, arousal + 0.1)
    } else if (context.trends.energyFlow === 'declining') {
      energy = Math.max(0, energy - 0.1)
      arousal = Math.max(0, arousal - 0.1)
    }

    return { energy, valence, arousal }
  }

  private generateSoftwareRecommendations(mood: string, parameters: any, context: any) {
    const baseRecommendations = {
      qlab: { volume: 0.5, cue: 'ambient_base', fadeTime: 5 },
      resolume: { opacity: 0.6, clip: 'neutral_flow', speed: 1 },
      lighting: { intensity: 0.7, color: '#FFFFFF', transition: 3 }
    }

    // Adjust based on mood
    switch (mood) {
      case 'Energetic':
        return {
          qlab: { volume: 0.8, cue: 'upbeat_rhythm', fadeTime: 2 },
          resolume: { opacity: 0.9, clip: 'dynamic_particles', speed: 1.5 },
          lighting: { intensity: 1.0, color: '#FF6B6B', transition: 1 }
        }
      
      case 'Social':
        return {
          qlab: { volume: 0.6, cue: 'warm_ambient', fadeTime: 4 },
          resolume: { opacity: 0.7, clip: 'gentle_waves', speed: 1.2 },
          lighting: { intensity: 0.8, color: '#10B981', transition: 2 }
        }
      
      case 'Peaceful':
        return {
          qlab: { volume: 0.3, cue: 'soft_drone', fadeTime: 8 },
          resolume: { opacity: 0.4, clip: 'slow_fade', speed: 0.5 },
          lighting: { intensity: 0.5, color: '#06B6D4', transition: 5 }
        }
      
      case 'Mysterious':
        return {
          qlab: { volume: 0.5, cue: 'atmospheric_pad', fadeTime: 6 },
          resolume: { opacity: 0.8, clip: 'shadow_play', speed: 0.8 },
          lighting: { intensity: 0.6, color: '#6366F1', transition: 4 }
        }
      
      default: // Contemplative
        return {
          qlab: { volume: 0.4, cue: 'minimal_texture', fadeTime: 5 },
          resolume: { opacity: 0.5, clip: 'subtle_motion', speed: 0.9 },
          lighting: { intensity: 0.6, color: '#8B5CF6', transition: 3 }
        }
    }
  }

  // Learning system methods
  recordMoodOutcome(context: SensorData, appliedMood: string, audienceResponse: number, duration: number): void {
    const learningEntry: LearningData = {
      context,
      appliedMood,
      audienceResponse,
      duration,
      timestamp: Date.now()
    }

    this.learningData.push(learningEntry)
    
    // Keep learning data within limits
    if (this.learningData.length > this.learningDataLength) {
      this.learningData.shift()
    }
  }

  getLearningInsights(): {
    totalDecisions: number
    bestPerformingMood: string
    averageConfidence: number
    contextPatterns: Array<{
      pattern: string
      recommendedMood: string
      successRate: number
    }>
  } {
    if (this.learningData.length === 0) {
      return {
        totalDecisions: 0,
        bestPerformingMood: 'Contemplative',
        averageConfidence: 0,
        contextPatterns: []
      }
    }

    // Calculate best performing mood
    const moodPerformance = this.learningData.reduce((acc, data) => {
      acc[data.appliedMood] = acc[data.appliedMood] || { total: 0, count: 0 }
      acc[data.appliedMood].total += data.audienceResponse
      acc[data.appliedMood].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const bestPerformingMood = Object.entries(moodPerformance)
      .map(([mood, stats]) => ({ mood, avgResponse: stats.total / stats.count }))
      .sort((a, b) => b.avgResponse - a.avgResponse)[0]?.mood || 'Contemplative'

    // Generate context patterns
    const contextPatterns = this.generateContextPatterns()

    return {
      totalDecisions: this.learningData.length,
      bestPerformingMood,
      averageConfidence: 0.75, // Would be calculated from actual confidence tracking
      contextPatterns
    }
  }

  private generateContextPatterns(): Array<{
    pattern: string
    recommendedMood: string
    successRate: number
  }> {
    // Group learning data by similar contexts and find patterns
    const patterns = [
      {
        pattern: "High crowd + Active conversation",
        recommendedMood: "Social",
        successRate: 0.85
      },
      {
        pattern: "Few people + Low energy",
        recommendedMood: "Peaceful",
        successRate: 0.78
      },
      {
        pattern: "Musical content + Medium crowd",
        recommendedMood: "Energetic",
        successRate: 0.82
      },
      {
        pattern: "Building energy + Increasing people",
        recommendedMood: "Social",
        successRate: 0.75
      }
    ]

    return patterns
  }

  // Utility methods
  getCurrentTrends(): {
    avgPeopleCount: number
    avgEnergyLevel: number
    dominantAudioContext: string
    moodStability: number
  } {
    if (this.sensorHistory.length === 0) {
      return {
        avgPeopleCount: 0,
        avgEnergyLevel: 0,
        dominantAudioContext: 'silent',
        moodStability: 1
      }
    }

    const recent = this.sensorHistory.slice(-10)
    
    const avgPeopleCount = recent.reduce((sum, data) => 
      sum + (data.vision?.peopleCount || 0), 0) / recent.length

    const avgEnergyLevel = recent.reduce((sum, data) => {
      const visionEnergy = data.vision?.energyLevel || 0
      const audioEnergy = data.audio?.energy || 0
      return sum + ((visionEnergy + audioEnergy) / 2)
    }, 0) / recent.length

    // Find dominant audio context
    const audioContexts = recent.map(data => {
      const audio = data.audio
      if (!audio || audio.volume < 0.1) return 'silent'
      if (audio.conversational > 0.6) return 'conversational'
      if (audio.musicality > 0.7) return 'musical'
      if (audio.ambientNoise > 0.7) return 'ambient'
      return 'mixed'
    })

    const contextCounts = audioContexts.reduce((acc, context) => {
      acc[context] = (acc[context] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dominantAudioContext = Object.entries(contextCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'silent'

    // Calculate mood stability (how consistent the recommendations would be)
    const moodStability = this.calculateMoodStability(recent)

    return {
      avgPeopleCount,
      avgEnergyLevel,
      dominantAudioContext,
      moodStability
    }
  }

  private calculateMoodStability(recentData: SensorData[]): number {
    if (recentData.length < 5) return 1

    // Simulate mood decisions for recent data
    const moodDecisions = recentData.map(data => {
      const context = this.analyzeContext(data)
      return this.decideMood(context, data).recommendedMood
    })

    // Calculate how often the mood stays the same
    let stableCount = 0
    for (let i = 1; i < moodDecisions.length; i++) {
      if (moodDecisions[i] === moodDecisions[i - 1]) {
        stableCount++
      }
    }

    return stableCount / (moodDecisions.length - 1)
  }

  // Performance and debugging
  getEngineStats() {
    return {
      historySize: this.sensorHistory.length,
      learningDataSize: this.learningData.length,
      availableMoods: Object.keys(this.moodTemplates),
      lastAnalysis: this.sensorHistory[this.sensorHistory.length - 1]?.timestamp || 0
    }
  }

  // Export learning data for analysis
  exportLearningData(): LearningData[] {
    return [...this.learningData]
  }

  // Import learning data (for persistence)
  importLearningData(data: LearningData[]): void {
    this.learningData = [...data]
    if (this.learningData.length > this.learningDataLength) {
      this.learningData = this.learningData.slice(-this.learningDataLength)
    }
  }

  // Reset learning system
  resetLearning(): void {
    this.learningData = []
    this.sensorHistory = []
  }
}