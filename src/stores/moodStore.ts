// src/stores/moodStore.ts - INTEGRATED con Advanced AI & Learning
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { AdvancedMoodAI, ContextData, MoodPrediction, LearningMetrics, ABTestResult } from '@/lib/ai/AdvancedMoodAI'

export interface MoodState {
  name: string
  energy: number
  valence: number
  arousal: number
  color: string
  description: string
}

export interface EnvironmentData {
  peopleCount: number
  avgMovement: number
  audioLevel: number
  lightLevel: number
  temperature: number
  // ⭐ NEW: Extended environment data
  conversationalLevel: number
  musicalContent: number
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek: 'weekday' | 'weekend'
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
  specialEvents: string[]
}

export interface SoftwareConnection {
  id: string
  name: string
  connected: boolean
  lastPing: number
  status: 'online' | 'offline' | 'error'
  ip?: string
  port?: number
  protocol?: 'OSC' | 'MIDI' | 'ArtNet'
}

// ⭐ NEW: AI Prediction State
export interface AIPredictionState {
  currentPrediction: MoodPrediction | null
  predictionHistory: Array<{
    timestamp: number
    prediction: MoodPrediction
    actualOutcome?: {
      engagement: number
      duration: number
      feedback: number
    }
  }>
  confidence: number
  learningActive: boolean
  totalExperience: number
}

// ⭐ NEW: A/B Testing State
export interface ABTestState {
  currentTest: {
    id: string
    moodA: string
    moodB: string
    context: string
    sessionCount: number
    isActive: boolean
  } | null
  testHistory: ABTestResult[]
  isTestingEnabled: boolean
}

// Existing mood mappings (enhanced)
export interface MoodMappings {
  [moodName: string]: {
    qlab?: {
      cue?: string
      volume: number
      fadeTime: number
      rate?: number
      playback?: 'go' | 'pause' | 'stop'
    }
    resolume?: {
      clip?: number
      opacity: number
      speed: number
      crossfader?: number
      effects?: Array<{
        layer: number
        effect: number
        param: number
        value: number
      }>
    }
    lighting?: {
      playback?: number
      intensity: number
      color: string
      transition: number
      fixtures?: Array<{
        id: number
        intensity: number
        color: string
      }>
    }
    grandma3?: {
      sequence?: number
      executors?: Array<{
        id: number
        level: number
      }>
      command?: string
    }
  }
}

// Enhanced mood mappings
export const MOOD_MAPPINGS: MoodMappings = {
  'Energetic': {
    qlab: {
      cue: 'energy-music',
      volume: 0.8,
      fadeTime: 2,
      rate: 1.2,
      playback: 'go'
    },
    resolume: {
      clip: 3,
      opacity: 0.9,
      speed: 1.5,
      crossfader: 0.8,
      effects: [
        { layer: 1, effect: 1, param: 1, value: 0.7 },
        { layer: 1, effect: 2, param: 1, value: 0.5 }
      ]
    },
    lighting: {
      playback: 1,
      intensity: 0.9,
      color: '#FF4444',
      transition: 2,
      fixtures: [
        { id: 1, intensity: 0.9, color: '#FF4444' },
        { id: 2, intensity: 0.7, color: '#FF6600' },
        { id: 3, intensity: 1.0, color: '#FFFF00' }
      ]
    },
    grandma3: {
      sequence: 101,
      executors: [
        { id: 1, level: 0.8 },
        { id: 2, level: 0.6 }
      ],
      command: 'Go+ Sequence 101'
    }
  },

  'Contemplative': {
    qlab: {
      cue: 'ambient-drone',
      volume: 0.3,
      fadeTime: 8,
      rate: 0.8,
      playback: 'go'
    },
    resolume: {
      clip: 1,
      opacity: 0.4,
      speed: 0.6,
      crossfader: 0.2,
      effects: [
        { layer: 1, effect: 3, param: 1, value: 0.3 },
        { layer: 1, effect: 1, param: 1, value: 0.4 }
      ]
    },
    lighting: {
      playback: 2,
      intensity: 0.4,
      color: '#8B5CF6',
      transition: 8,
      fixtures: [
        { id: 1, intensity: 0.3, color: '#8B5CF6' },
        { id: 2, intensity: 0.4, color: '#A855F7' },
        { id: 3, intensity: 0.2, color: '#C084FC' }
      ]
    },
    grandma3: {
      sequence: 102,
      executors: [
        { id: 1, level: 0.3 },
        { id: 4, level: 0.5 }
      ],
      command: 'Fade 8 Sequence 102'
    }
  },

  'Social': {
    qlab: {
      cue: 'conversation-bg',
      volume: 0.5,
      fadeTime: 3,
      rate: 1.0,
      playback: 'go'
    },
    resolume: {
      clip: 5,
      opacity: 0.7,
      speed: 1.1,
      crossfader: 0.5,
      effects: [
        { layer: 1, effect: 1, param: 1, value: 0.6 },
        { layer: 1, effect: 4, param: 1, value: 0.3 }
      ]
    },
    lighting: {
      playback: 3,
      intensity: 0.7,
      color: '#10B981',
      transition: 3,
      fixtures: [
        { id: 1, intensity: 0.6, color: '#10B981' },
        { id: 2, intensity: 0.7, color: '#34D399' },
        { id: 3, intensity: 0.8, color: '#6EE7B7' }
      ]
    },
    grandma3: {
      sequence: 103,
      executors: [
        { id: 2, level: 0.7 },
        { id: 3, level: 0.5 }
      ],
      command: 'Go Sequence 103'
    }
  },

  'Mysterious': {
    qlab: {
      cue: 'mysterious-soundscape',
      volume: 0.6,
      fadeTime: 5,
      rate: 0.9,
      playback: 'go'
    },
    resolume: {
      clip: 7,
      opacity: 0.6,
      speed: 0.7,
      crossfader: 0.3,
      effects: [
        { layer: 1, effect: 3, param: 1, value: 0.8 },
        { layer: 1, effect: 1, param: 1, value: 0.2 }
      ]
    },
    lighting: {
      playback: 4,
      intensity: 0.5,
      color: '#6366F1',
      transition: 5,
      fixtures: [
        { id: 1, intensity: 0.4, color: '#6366F1' },
        { id: 2, intensity: 0.6, color: '#4F46E5' },
        { id: 3, intensity: 0.3, color: '#7C3AED' }
      ]
    },
    grandma3: {
      sequence: 104,
      executors: [
        { id: 5, level: 0.5 },
        { id: 6, level: 0.4 }
      ],
      command: 'Fade 5 Sequence 104'
    }
  },

  'Peaceful': {
    qlab: {
      cue: 'nature-ambient',
      volume: 0.25,
      fadeTime: 10,
      rate: 0.7,
      playback: 'go'
    },
    resolume: {
      clip: 2,
      opacity: 0.3,
      speed: 0.5,
      crossfader: 0.1,
      effects: [
        { layer: 1, effect: 1, param: 1, value: 0.3 },
        { layer: 1, effect: 5, param: 1, value: 0.2 }
      ]
    },
    lighting: {
      playback: 5,
      intensity: 0.3,
      color: '#06B6D4',
      transition: 10,
      fixtures: [
        { id: 1, intensity: 0.2, color: '#06B6D4' },
        { id: 2, intensity: 0.3, color: '#22D3EE' },
        { id: 3, intensity: 0.25, color: '#67E8F9' }
      ]
    },
    grandma3: {
      sequence: 105,
      executors: [
        { id: 1, level: 0.2 },
        { id: 7, level: 0.3 }
      ],
      command: 'Fade 10 Sequence 105'
    }
  }
}

interface MoodStore {
  // ===== EXISTING STATE =====
  systemActive: boolean
  currentMood: MoodState
  environmentData: EnvironmentData
  softwareConnections: SoftwareConnection[]
  
  // OSC Controller integration
  oscController: any | null
  oscEnabled: boolean
  lastOSCMessage: { software: string, message: string, timestamp: number } | null
  
  // Analytics data
  moodHistory: Array<{ timestamp: number; mood: string; duration: number }>
  audienceMetrics: {
    totalVisitors: number
    averageStayTime: number
    peakOccupancy: number
    engagementScore: number
  }
  
  // Simulation controls
  simulationMode: boolean
  emergencyActive: boolean

  // ===== NEW AI STATE =====
  
  // Advanced AI Engine
  advancedAI: AdvancedMoodAI | null
  aiEnabled: boolean
  
  // AI Predictions
  aiPrediction: AIPredictionState
  
  // Learning Metrics
  learningMetrics: LearningMetrics | null
  
  // A/B Testing
  abTesting: ABTestState

  // ===== EXISTING ACTIONS =====
  setSystemActive: (active: boolean) => void
  updateCurrentMood: (mood: MoodState) => void
  updateEnvironmentData: (data: Partial<EnvironmentData>) => void
  updateSoftwareConnection: (id: string, updates: Partial<SoftwareConnection>) => void
  addMoodToHistory: (mood: string) => void
  
  // OSC Actions
  initializeOSC: () => Promise<void>
  connectToSoftware: (softwareId: string) => Promise<boolean>
  disconnectFromSoftware: (softwareId: string) => Promise<void>
  applyCurrentMoodToSoftware: () => Promise<void>
  sendOSCCommand: (software: string, command: string, args: any[]) => Promise<void>
  
  // Individual software application functions
  applyMoodToQLab: (config: any) => Promise<void>
  applyMoodToResolume: (config: any) => Promise<void>
  applyMoodToChamsys: (config: any) => Promise<void>
  applyMoodToGrandMA3: (config: any) => Promise<void>
  
  setSimulationMode: (enabled: boolean) => void
  emergencyStop: () => void

  // ===== NEW AI ACTIONS =====
  
  // AI Engine Management
  initializeAdvancedAI: () => Promise<void>
  setAIEnabled: (enabled: boolean) => void
  
  // AI Predictions
  requestAIPrediction: () => Promise<MoodPrediction | null>
  applyAIPrediction: (prediction: MoodPrediction) => Promise<void>
  recordMoodOutcome: (engagement: number, duration: number, feedback: number) => void
  
  // Learning Management
  updateLearningMetrics: () => Promise<void>
  exportLearningData: () => any
  importLearningData: (data: any) => Promise<void>
  resetLearning: () => Promise<void>
  
  // A/B Testing
  startABTest: (moodA: string, moodB: string, context: string) => Promise<string>
  recordABTestResult: (mood: string, engagement: number) => void
  completeCurrentABTest: () => Promise<void>
  setABTestingEnabled: (enabled: boolean) => void
  
  // AI Analytics
  getAIInsights: () => {
    predictionAccuracy: number
    learningProgress: number
    moodEffectiveness: Record<string, number>
    recommendations: string[]
  }
}

export const useMoodStore = create<MoodStore>()(
  subscribeWithSelector((set, get) => ({
    // ===== INITIAL STATE =====
    systemActive: false,
    currentMood: {
      name: 'Contemplative',
      energy: 0.3,
      valence: 0.6,
      arousal: 0.2,
      color: '#8B5CF6',
      description: 'Quiet reflection and thoughtful observation'
    },
    environmentData: {
      peopleCount: 12,
      avgMovement: 0.4,
      audioLevel: 0.25,
      lightLevel: 0.7,
      temperature: 22,
      // New fields
      conversationalLevel: 0.3,
      musicalContent: 0.2,
      timeOfDay: 'afternoon',
      dayOfWeek: 'weekday',
      weather: 'sunny',
      specialEvents: []
    },
    softwareConnections: [
      {
        id: 'qlab',
        name: 'QLab',
        connected: false,
        lastPing: 0,
        status: 'offline',
        ip: '192.168.1.10',
        port: 53000,
        protocol: 'OSC'
      },
      {
        id: 'resolume',
        name: 'Resolume Arena',
        connected: false,
        lastPing: 0,
        status: 'offline',
        ip: '192.168.1.11',
        port: 7000,
        protocol: 'OSC'
      },
      {
        id: 'touchosc',
        name: 'TouchOSC',
        connected: false,
        lastPing: 0,
        status: 'offline',
        ip: '192.168.1.13',
        port: 9000,
        protocol: 'OSC'
      },
      {
        id: 'chamsys',
        name: 'Chamsys MagicQ',
        connected: false,
        lastPing: 0,
        status: 'offline',
        ip: '192.168.1.12',
        port: 6454,
        protocol: 'OSC'
      },
      {
        id: 'grandma3',
        name: 'GrandMA3',
        connected: false,
        lastPing: 0,
        status: 'offline',
        ip: '192.168.1.14',
        port: 8000,
        protocol: 'OSC'
      }
    ],
    
    // OSC state
    oscController: null,
    oscEnabled: false,
    lastOSCMessage: null,
    
    moodHistory: [
      { timestamp: Date.now() - 480000, mood: 'Social', duration: 8 },
      { timestamp: Date.now() - 720000, mood: 'Contemplative', duration: 12 },
      { timestamp: Date.now() - 1020000, mood: 'Energetic', duration: 5 }
    ],
    
    audienceMetrics: {
      totalVisitors: 156,
      averageStayTime: 18.5,
      peakOccupancy: 23,
      engagementScore: 0.78
    },
    
    simulationMode: true,
    emergencyActive: false,

    // ===== NEW AI STATE =====
    advancedAI: null,
    aiEnabled: false,
    
    aiPrediction: {
      currentPrediction: null,
      predictionHistory: [],
      confidence: 0,
      learningActive: false,
      totalExperience: 0
    },
    
    learningMetrics: null,
    
    abTesting: {
      currentTest: null,
      testHistory: [],
      isTestingEnabled: false
    },

    // ===== EXISTING ACTIONS =====
    setSystemActive: (active) => set({ systemActive: active }),
    
    updateCurrentMood: (mood) => {
      const prevMood = get().currentMood
      set({ currentMood: mood })
      
      if (prevMood.name !== mood.name) {
        get().addMoodToHistory(prevMood.name)
        
        // Apply mood to software if OSC enabled
        if (get().oscEnabled && !get().simulationMode) {
          get().applyCurrentMoodToSoftware()
        }
      }
    },
    
    updateEnvironmentData: (data) => {
      const newData = { ...get().environmentData, ...data }
      set({ environmentData: newData })
      
      // ⭐ NEW: Trigger AI prediction if AI is enabled
      if (get().aiEnabled && get().systemActive) {
        setTimeout(() => {
          get().requestAIPrediction()
        }, 1000) // Debounce predictions
      }
    },
    
    updateSoftwareConnection: (id, updates) =>
      set((state) => ({
        softwareConnections: state.softwareConnections.map((conn) =>
          conn.id === id ? { ...conn, ...updates } : conn
        )
      })),
    
    addMoodToHistory: (mood) => {
      const now = Date.now()
      const history = get().moodHistory
      const lastEntry = history[0]
      
      const duration = lastEntry 
        ? Math.round((now - lastEntry.timestamp) / 60000) 
        : 0
      
      const newHistory = [
        { timestamp: now, mood: get().currentMood.name, duration: 0 },
        ...history.slice(0, 9).map((entry, index) => 
          index === 0 ? { ...entry, duration } : entry
        )
      ]
      
      set({ moodHistory: newHistory })
    },

    // ===== OSC ACTIONS (Existing) =====
    initializeOSC: async () => {
      try {
        set({ oscEnabled: true })
        console.log('✅ OSC Controller initialized')
      } catch (error) {
        console.error('❌ Failed to initialize OSC:', error)
        set({ oscEnabled: false })
      }
    },

    connectToSoftware: async (softwareId: string) => {
      get().updateSoftwareConnection(softwareId, { 
        connected: true, 
        status: 'online', 
        lastPing: Date.now() 
      })
      return true
    },

    disconnectFromSoftware: async (softwareId: string) => {
      get().updateSoftwareConnection(softwareId, { 
        connected: false, 
        status: 'offline', 
        lastPing: 0 
      })
    },

    applyCurrentMoodToSoftware: async () => {
      const { currentMood, softwareConnections } = get()
      
      console.log(`🎭 Applying mood "${currentMood.name}" to connected software...`)
      
      const moodMapping = MOOD_MAPPINGS[currentMood.name]
      if (!moodMapping) {
        console.warn(`No mapping found for mood: ${currentMood.name}`)
        return
      }

      const promises: Promise<void>[] = []

      for (const connection of softwareConnections) {
        if (!connection.connected) continue

        try {
          switch (connection.id) {
            case 'qlab':
              if (moodMapping.qlab) {
                promises.push(get().applyMoodToQLab(moodMapping.qlab))
              }
              break
            case 'resolume':
              if (moodMapping.resolume) {
                promises.push(get().applyMoodToResolume(moodMapping.resolume))
              }
              break
            case 'chamsys':
              if (moodMapping.lighting) {
                promises.push(get().applyMoodToChamsys(moodMapping.lighting))
              }
              break
            case 'grandma3':
              if (moodMapping.grandma3) {
                promises.push(get().applyMoodToGrandMA3(moodMapping.grandma3))
              }
              break
          }
        } catch (error) {
          console.error(`Failed to apply mood to ${connection.name}:`, error)
        }
      }

      await Promise.all(promises)
      console.log(`✅ Mood "${currentMood.name}" applied to all connected software`)
    },

    applyMoodToQLab: async (config: any) => {
      const commands: Promise<void>[] = []
      
      if (config.cue) {
        commands.push(get().sendOSCCommand('qlab', `/cue/${config.cue}/load`, []))
      }
      if (config.volume !== undefined) {
        commands.push(get().sendOSCCommand('qlab', '/cue/current/sliderLevel', [config.volume]))
      }
      if (config.fadeTime !== undefined) {
        commands.push(get().sendOSCCommand('qlab', '/cue/current/fadeTime', [config.fadeTime]))
      }
      if (config.rate !== undefined) {
        commands.push(get().sendOSCCommand('qlab', '/cue/current/rate', [config.rate]))
      }
      if (config.playback === 'go') {
        commands.push(get().sendOSCCommand('qlab', '/go', []))
      }

      await Promise.all(commands)
    },

    applyMoodToResolume: async (config: any) => {
      const commands: Promise<void>[] = []
      
      if (config.clip !== undefined) {
        commands.push(get().sendOSCCommand('resolume', `/layer1/clip${config.clip}/connect`, [1]))
      }
      if (config.opacity !== undefined) {
        commands.push(get().sendOSCCommand('resolume', '/layer1/video/opacity/values', [config.opacity]))
      }
      if (config.speed !== undefined) {
        commands.push(get().sendOSCCommand('resolume', '/composition/tempocontroller/tempo', [120 * config.speed]))
      }
      if (config.crossfader !== undefined) {
        commands.push(get().sendOSCCommand('resolume', '/composition/crossfader', [config.crossfader]))
      }
      if (config.effects) {
        for (const effect of config.effects) {
          commands.push(get().sendOSCCommand('resolume', 
            `/layer${effect.layer}/video/effect${effect.effect}/param${effect.param}/values`, 
            [effect.value]
          ))
        }
      }

      await Promise.all(commands)
    },

    applyMoodToChamsys: async (config: any) => {
      const commands: Promise<void>[] = []
      
      if (config.playback !== undefined && config.intensity !== undefined) {
        commands.push(get().sendOSCCommand('chamsys', `/pb/${config.playback}/level`, [config.intensity]))
      }
      
      if (config.fixtures) {
        for (const fixture of config.fixtures) {
          commands.push(get().sendOSCCommand('chamsys', `/head/${fixture.id}/intensity`, [fixture.intensity]))
          
          if (fixture.color) {
            const rgb = hexToRGB(fixture.color)
            commands.push(get().sendOSCCommand('chamsys', `/head/${fixture.id}/r`, [rgb.r / 255]))
            commands.push(get().sendOSCCommand('chamsys', `/head/${fixture.id}/g`, [rgb.g / 255]))
            commands.push(get().sendOSCCommand('chamsys', `/head/${fixture.id}/b`, [rgb.b / 255]))
          }
        }
      }

      await Promise.all(commands)
    },

    applyMoodToGrandMA3: async (config: any) => {
      const commands: Promise<void>[] = []
      
      if (config.sequence !== undefined) {
        commands.push(get().sendOSCCommand('grandma3', `/gma3/exec/${config.sequence}/go`, []))
      }
      
      if (config.executors) {
        for (const exec of config.executors) {
          commands.push(get().sendOSCCommand('grandma3', `/gma3/exec/${exec.id}/fader`, [exec.level]))
        }
      }
      
      if (config.command) {
        commands.push(get().sendOSCCommand('grandma3', '/gma3/cmd', [config.command]))
      }

      await Promise.all(commands)
    },

    sendOSCCommand: async (software: string, command: string, args: any[]) => {
      console.log(`📤 OSC Command to ${software}: ${command}`, args)
      set({ lastOSCMessage: { software, message: `${command} ${args.join(' ')}`, timestamp: Date.now() } })
      
      if (!get().oscController) {
        console.log(`[SIMULATION] ${software}: ${command}`, args)
        return
      }
    },
    
    setSimulationMode: (enabled) => set({ simulationMode: enabled }),
    
    emergencyStop: async () => {
      set({
        emergencyActive: true,
        systemActive: false,
        currentMood: {
          name: 'Safe Mode',
          energy: 0.1,
          valence: 0.5,
          arousal: 0.0,
          color: '#6B7280',
          description: 'Emergency stop activated - system in safe state'
        }
      })
      
      setTimeout(() => {
        set({ emergencyActive: false })
      }, 30000)
    },

    // ===== NEW AI ACTIONS =====
    
    initializeAdvancedAI: async () => {
      try {
        const ai = new AdvancedMoodAI()
        set({ 
          advancedAI: ai, 
          aiEnabled: true,
          aiPrediction: {
            ...get().aiPrediction,
            learningActive: true,
            totalExperience: ai.getSystemStatus().totalExperience
          }
        })
        
        // Load initial learning metrics
        await get().updateLearningMetrics()
        
        console.log('🧠 Advanced AI Engine initialized')
      } catch (error) {
        console.error('❌ Failed to initialize Advanced AI:', error)
        set({ aiEnabled: false })
      }
    },

    setAIEnabled: (enabled) => {
      set({ aiEnabled: enabled })
      if (enabled && !get().advancedAI) {
        get().initializeAdvancedAI()
      }
    },

    requestAIPrediction: async () => {
      const { advancedAI, environmentData } = get()
      if (!advancedAI || !get().aiEnabled) return null

      try {
        // Convert environment data to context data
        const context: ContextData = {
          vision: {
            peopleCount: environmentData.peopleCount,
            avgMovement: environmentData.avgMovement,
            crowdDensity: environmentData.peopleCount / 50,
            boundingBoxes: [],
            lastUpdate: Date.now()
          },
          audio: {
            energy: environmentData.audioLevel,
            volumeLevel: environmentData.audioLevel,
            spectralCentroid: 1000 + environmentData.audioLevel * 2000,
            conversational: environmentData.conversationalLevel,
            musical: environmentData.musicalContent,
            complexity: environmentData.audioLevel,
            lastUpdate: Date.now()
          },
          environmental: {
            timeOfDay: environmentData.timeOfDay,
            dayOfWeek: environmentData.dayOfWeek,
            season: 'spring', // Could be calculated from date
            weather: environmentData.weather,
            specialEvents: environmentData.specialEvents
          },
          timestamp: Date.now()
        }

        const prediction = advancedAI.predictOptimalMood(context)
        
        // Update AI prediction state
        set(state => ({
          aiPrediction: {
            ...state.aiPrediction,
            currentPrediction: prediction,
            confidence: prediction.confidence,
            predictionHistory: [
              {
                timestamp: Date.now(),
                prediction
              },
              ...state.aiPrediction.predictionHistory.slice(0, 19) // Keep last 20
            ]
          }
        }))

        console.log(`🧠 AI Prediction: ${prediction.recommendedMood} (${Math.round(prediction.confidence * 100)}% confidence)`)
        return prediction

      } catch (error) {
        console.error('❌ AI prediction failed:', error)
        return null
      }
    },

    applyAIPrediction: async (prediction: MoodPrediction) => {
      // Convert AI prediction to mood state
      const newMood: MoodState = {
        name: prediction.recommendedMood,
        energy: prediction.parameters.energy,
        valence: prediction.parameters.valence,
        arousal: prediction.parameters.arousal,
        color: getMoodColor(prediction.recommendedMood),
        description: `AI-recommended: ${prediction.reasoning[0] || 'Optimal for current context'}`
      }

      // Apply the mood
      get().updateCurrentMood(newMood)

      // Record A/B test result if active
      if (get().abTesting.currentTest?.isActive) {
        // This would be called later when we have engagement data
        // get().recordABTestResult(prediction.recommendedMood, engagementScore)
      }

      console.log(`🎭 Applied AI-recommended mood: ${prediction.recommendedMood}`)
    },

    recordMoodOutcome: (engagement: number, duration: number, feedback: number) => {
      const { advancedAI, aiPrediction } = get()
      if (!advancedAI || !aiPrediction.currentPrediction) return

      try {
        // Create context from current environment
        const context: ContextData = get().environmentDataToContext()
        
        // Record outcome for learning
        advancedAI.recordOutcome(context, aiPrediction.currentPrediction.recommendedMood, {
          engagement,
          duration,
          audienceGrowth: engagement > 0.7 ? 0.1 : -0.05,
          feedback
        })

        // Update prediction history with actual outcome
        set(state => ({
          aiPrediction: {
            ...state.aiPrediction,
            predictionHistory: state.aiPrediction.predictionHistory.map((entry, index) => 
              index === 0 && entry.prediction === aiPrediction.currentPrediction
                ? { ...entry, actualOutcome: { engagement, duration, feedback } }
                : entry
            )
          }
        }))

        // Update learning metrics
        get().updateLearningMetrics()

        console.log(`📚 Recorded mood outcome: ${Math.round(engagement * 100)}% engagement`)

      } catch (error) {
        console.error('❌ Failed to record mood outcome:', error)
      }
    },

    updateLearningMetrics: async () => {
      const { advancedAI } = get()
      if (!advancedAI) return

      try {
        const metrics = advancedAI.getLearningMetrics()
        const systemStatus = advancedAI.getSystemStatus()
        
        set(state => ({
          learningMetrics: metrics,
          aiPrediction: {
            ...state.aiPrediction,
            totalExperience: systemStatus.totalExperience,
            learningActive: systemStatus.isLearning
          }
        }))
      } catch (error) {
        console.error('❌ Failed to update learning metrics:', error)
      }
    },

    exportLearningData: () => {
      const { advancedAI } = get()
      if (!advancedAI) return null

      return {
        aiData: advancedAI.exportLearningData(),
        moodHistory: get().moodHistory,
        audienceMetrics: get().audienceMetrics,
        exportTimestamp: Date.now()
      }
    },

    importLearningData: async (data: any) => {
      const { advancedAI } = get()
      if (!advancedAI || !data.aiData) return

      try {
        advancedAI.importLearningData(data.aiData)
        
        if (data.moodHistory) {
          set({ moodHistory: data.moodHistory })
        }
        
        if (data.audienceMetrics) {
          set({ audienceMetrics: data.audienceMetrics })
        }

        await get().updateLearningMetrics()
        console.log('✅ Learning data imported successfully')
      } catch (error) {
        console.error('❌ Failed to import learning data:', error)
      }
    },

    resetLearning: async () => {
      const { advancedAI } = get()
      if (!advancedAI) return

      try {
        advancedAI.resetLearning()
        
        set({
          aiPrediction: {
            currentPrediction: null,
            predictionHistory: [],
            confidence: 0,
            learningActive: false,
            totalExperience: 0
          },
          learningMetrics: null,
          abTesting: {
            currentTest: null,
            testHistory: [],
            isTestingEnabled: get().abTesting.isTestingEnabled
          }
        })

        console.log('🔄 Learning system reset')
      } catch (error) {
        console.error('❌ Failed to reset learning:', error)
      }
    },

    // A/B Testing Actions
    startABTest: async (moodA: string, moodB: string, context: string) => {
      const { advancedAI } = get()
      if (!advancedAI) return ''

      try {
        const testId = advancedAI.startABTest(moodA, moodB, context)
        
        set({
          abTesting: {
            ...get().abTesting,
            currentTest: {
              id: testId,
              moodA,
              moodB,
              context,
              sessionCount: 0,
              isActive: true
            }
          }
        })

        console.log(`🧪 Started A/B test: ${moodA} vs ${moodB} (${testId})`)
        return testId
      } catch (error) {
        console.error('❌ Failed to start A/B test:', error)
        return ''
      }
    },

    recordABTestResult: (mood: string, engagement: number) => {
      const { advancedAI, abTesting } = get()
      if (!advancedAI || !abTesting.currentTest?.isActive) return

      try {
        advancedAI.recordABTestResult(abTesting.currentTest.id, mood, engagement)
        
        set(state => ({
          abTesting: {
            ...state.abTesting,
            currentTest: state.abTesting.currentTest ? {
              ...state.abTesting.currentTest,
              sessionCount: state.abTesting.currentTest.sessionCount + 1
            } : null
          }
        }))

        console.log(`🧪 Recorded A/B test result: ${mood} = ${Math.round(engagement * 100)}%`)
      } catch (error) {
        console.error('❌ Failed to record A/B test result:', error)
      }
    },

    completeCurrentABTest: async () => {
      const { advancedAI, abTesting } = get()
      if (!advancedAI || !abTesting.currentTest) return

      try {
        // Get updated test results
        const results = advancedAI.getABTestResults()
        const latestResult = results[results.length - 1]
        
        set(state => ({
          abTesting: {
            ...state.abTesting,
            currentTest: null,
            testHistory: [...state.abTesting.testHistory, latestResult]
          }
        }))

        console.log(`✅ A/B test completed. Winner: ${latestResult.winnerMood}`)
      } catch (error) {
        console.error('❌ Failed to complete A/B test:', error)
      }
    },

    setABTestingEnabled: (enabled: boolean) => {
      set(state => ({
        abTesting: {
          ...state.abTesting,
          isTestingEnabled: enabled
        }
      }))
    },

    getAIInsights: () => {
      const { learningMetrics, aiPrediction } = get()
      
      if (!learningMetrics) {
        return {
          predictionAccuracy: 0,
          learningProgress: 0,
          moodEffectiveness: {},
          recommendations: ['Initialize AI system to start learning']
        }
      }

      // Calculate insights
      const moodEffectiveness = Object.entries(learningMetrics.moodEffectiveness)
        .reduce((acc, [mood, stats]) => {
          acc[mood] = stats.avgEngagement
          return acc
        }, {} as Record<string, number>)

      const recommendations = generateAIRecommendations(learningMetrics, aiPrediction)

      return {
        predictionAccuracy: learningMetrics.averageAccuracy,
        learningProgress: Math.min(1, learningMetrics.totalSessions / 100), // Progress to 100 sessions
        moodEffectiveness,
        recommendations
      }
    },

    // Helper method to convert environment data to context
    environmentDataToContext: (): ContextData => {
      const env = get().environmentData
      return {
        vision: {
          peopleCount: env.peopleCount,
          avgMovement: env.avgMovement,
          crowdDensity: env.peopleCount / 50,
          boundingBoxes: [],
          lastUpdate: Date.now()
        },
        audio: {
          energy: env.audioLevel,
          volumeLevel: env.audioLevel,
          spectralCentroid: 1000 + env.audioLevel * 2000,
          conversational: env.conversationalLevel,
          musical: env.musicalContent,
          complexity: env.audioLevel,
          lastUpdate: Date.now()
        },
        environmental: {
          timeOfDay: env.timeOfDay,
          dayOfWeek: env.dayOfWeek,
          season: 'spring',
          weather: env.weather,
          specialEvents: env.specialEvents
        },
        timestamp: Date.now()
      }
    }
  }))
)

// ===== UTILITY FUNCTIONS =====

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 }
}

function getMoodColor(moodName: string): string {
  const colors: Record<string, string> = {
    'Energetic': '#EF4444',
    'Social': '#10B981',
    'Contemplative': '#8B5CF6',
    'Mysterious': '#6366F1',
    'Peaceful': '#06B6D4'
  }
  return colors[moodName] || '#8B5CF6'
}

function generateAIRecommendations(metrics: LearningMetrics, aiPrediction: AIPredictionState): string[] {
  const recommendations: string[] = []

  // Accuracy-based recommendations
  if (metrics.averageAccuracy < 0.6) {
    recommendations.push('System needs more training data for better predictions')
  } else if (metrics.averageAccuracy > 0.8) {
    recommendations.push('AI predictions are highly accurate - consider enabling auto-mode')
  }

  // Experience-based recommendations
  if (metrics.totalSessions < 50) {
    recommendations.push('Collect more session data to improve learning accuracy')
  }

  // Mood effectiveness recommendations
  const moodStats = Object.entries(metrics.moodEffectiveness)
  const bestMood = moodStats.reduce((best, [mood, stats]) => 
    stats.avgEngagement > (best.stats?.avgEngagement || 0) ? { mood, stats } : best
  , { mood: '', stats: null as any })

  if (bestMood.mood) {
    recommendations.push(`${bestMood.mood} mood shows highest engagement (${Math.round(bestMood.stats.avgEngagement * 100)}%)`)
  }

  // Time pattern recommendations
  const timePatterns = metrics.patternRecognition.timePatterns
  if (timePatterns.length > 0) {
    const bestTime = timePatterns.reduce((best, pattern) => 
      pattern.success > best.success ? pattern : best
    )
    recommendations.push(`${bestTime.preferredMood} works best during ${bestTime.timeRange}`)
  }

  // A/B testing recommendations
  if (aiPrediction.totalExperience > 20 && !aiPrediction.predictionHistory.some(p => p.actualOutcome)) {
    recommendations.push('Consider running A/B tests to validate mood effectiveness')
  }

  return recommendations.length > 0 ? recommendations : ['System learning optimally - no specific recommendations']
}

// ===== ENHANCED SELECTORS =====
export const useSystemActive = () => useMoodStore((state) => state.systemActive)
export const useCurrentMood = () => useMoodStore((state) => state.currentMood)
export const useEnvironmentData = () => useMoodStore((state) => state.environmentData)
export const useSoftwareConnections = () => useMoodStore((state) => state.softwareConnections)
export const useMoodHistory = () => useMoodStore((state) => state.moodHistory)
export const useAudienceMetrics = () => useMoodStore((state) => state.audienceMetrics)
export const useOSCStatus = () => useMoodStore((state) => ({ 
  enabled: state.oscEnabled, 
  lastMessage: state.lastOSCMessage 
}))

// ⭐ NEW AI SELECTORS
export const useAIStatus = () => useMoodStore((state) => ({
  enabled: state.aiEnabled,
  active: state.aiPrediction.learningActive,
  experience: state.aiPrediction.totalExperience,
  confidence: state.aiPrediction.confidence
}))

export const useAIPrediction = () => useMoodStore((state) => state.aiPrediction.currentPrediction)

export const useLearningMetrics = () => useMoodStore((state) => state.learningMetrics)

export const useABTestStatus = () => useMoodStore((state) => ({
  enabled: state.abTesting.isTestingEnabled,
  currentTest: state.abTesting.currentTest,
  history: state.abTesting.testHistory
}))

// Auto-simulation enhanced with AI predictions
useMoodStore.subscribe(
  (state) => state.systemActive,
  (systemActive) => {
    if (systemActive && useMoodStore.getState().simulationMode) {
      const interval = setInterval(() => {
        const state = useMoodStore.getState()
        if (!state.systemActive || !state.simulationMode) {
          clearInterval(interval)
          return
        }
        
        // Enhanced environment simulation
        const environmentData = state.environmentData
        const timeOfDay = getCurrentTimeOfDay()
        
        const newData = {
          peopleCount: Math.max(1, environmentData.peopleCount + Math.floor((Math.random() - 0.5) * 4)),
          avgMovement: Math.max(0, Math.min(1, environmentData.avgMovement + (Math.random() - 0.5) * 0.2)),
          audioLevel: Math.max(0, Math.min(1, environmentData.audioLevel + (Math.random() - 0.5) * 0.3)),
          conversationalLevel: Math.max(0, Math.min(1, environmentData.conversationalLevel + (Math.random() - 0.5) * 0.2)),
          musicalContent: Math.max(0, Math.min(1, environmentData.musicalContent + (Math.random() - 0.5) * 0.1)),
          timeOfDay,
          dayOfWeek: isWeekend() ? 'weekend' as const : 'weekday' as const
        }
        
        state.updateEnvironmentData(newData)
        
        // AI-driven mood changes (if AI enabled)
        if (state.aiEnabled && Math.random() < 0.3) {
          state.requestAIPrediction().then(prediction => {
            if (prediction && prediction.confidence > 0.7) {
              state.applyAIPrediction(prediction)
            }
          })
        }
        // Traditional mood changes (if AI disabled)
        else if (!state.aiEnabled && Math.random() < 0.2) {
          const moods = [
            {
              name: 'Energetic',
              energy: 0.9,
              valence: 0.8,
              arousal: 0.9,
              color: '#EF4444',
              description: 'High energy and excitement'
            },
            {
              name: 'Social',
              energy: 0.7,
              valence: 0.9,
              arousal: 0.6,
              color: '#10B981',
              description: 'Interactive and collaborative atmosphere'
            },
            {
              name: 'Contemplative',
              energy: 0.3,
              valence: 0.6,
              arousal: 0.2,
              color: '#8B5CF6',
              description: 'Quiet reflection and thoughtful observation'
            }
          ]
          
          let targetMood = moods[2] // Default contemplative
          
          if (newData.peopleCount > 15 && newData.avgMovement > 0.6) {
            targetMood = moods[0] // Energetic
          } else if (newData.peopleCount > 8 && newData.audioLevel > 0.4) {
            targetMood = moods[1] // Social
          }
          
          state.updateCurrentMood(targetMood)
        }
        
      }, 3000) // Update every 3 seconds
    }
  }
)

// Helper functions for enhanced simulation
function getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'  
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

function isWeekend(): boolean {
  const day = new Date().getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}