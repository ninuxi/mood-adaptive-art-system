// src/stores/moodStore.ts - UPDATED per Real OSC Integration
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Import the real OSC Controller
// import { OSCController } from '../lib/protocols/OSCController'

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

// ⭐ NUOVO: Mood-to-Software mapping configurations
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

// ⭐ CONFIGURAZIONE MOOD MAPPINGS - QUI vanno i codici della documentazione!
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
        { layer: 1, effect: 1, param: 1, value: 0.7 }, // Brightness
        { layer: 1, effect: 2, param: 1, value: 0.5 }  // Saturation
      ]
    },
    lighting: {
      playback: 1,
      intensity: 0.9,
      color: '#FF4444', // Red energy
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
        { layer: 1, effect: 3, param: 1, value: 0.3 }, // Blur
        { layer: 1, effect: 1, param: 1, value: 0.4 }  // Low brightness
      ]
    },
    lighting: {
      playback: 2,
      intensity: 0.4,
      color: '#8B5CF6', // Purple contemplative
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
      color: '#10B981', // Green social
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
        { layer: 1, effect: 3, param: 1, value: 0.8 }, // Heavy blur
        { layer: 1, effect: 1, param: 1, value: 0.2 }  // Very low brightness
      ]
    },
    lighting: {
      playback: 4,
      intensity: 0.5,
      color: '#6366F1', // Deep purple mysterious
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
      color: '#06B6D4', // Soft cyan peaceful
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
  // Current state
  systemActive: boolean
  currentMood: MoodState
  environmentData: EnvironmentData
  softwareConnections: SoftwareConnection[]
  
  // ⭐ NUOVO: OSC Controller integration
  oscController: any | null // Will be OSCController when imported
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
  
  // Actions
  setSystemActive: (active: boolean) => void
  updateCurrentMood: (mood: MoodState) => void
  updateEnvironmentData: (data: Partial<EnvironmentData>) => void
  updateSoftwareConnection: (id: string, updates: Partial<SoftwareConnection>) => void
  addMoodToHistory: (mood: string) => void
  
  // ⭐ NUOVO: OSC Actions
  initializeOSC: () => Promise<void>
  connectToSoftware: (softwareId: string) => Promise<boolean>
  disconnectFromSoftware: (softwareId: string) => Promise<void>
  applyCurrentMoodToSoftware: () => Promise<void>
  sendOSCCommand: (software: string, command: string, args: any[]) => Promise<void>
  
  // Simulation controls
  simulationMode: boolean
  setSimulationMode: (enabled: boolean) => void
  
  // Emergency controls
  emergencyStop: () => void
  emergencyActive: boolean
}

export const useMoodStore = create<MoodStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
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
      temperature: 22
    },
    softwareConnections: [
      {
        id: 'qlab',
        name: 'QLab',
        connected: false, // Start disconnected for real connections
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
    
    // ⭐ NUOVO: OSC state
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
    
    // Existing Actions
    setSystemActive: (active) => set({ systemActive: active }),
    
    updateCurrentMood: (mood) => {
      const prevMood = get().currentMood
      set({ currentMood: mood })
      
      // Add to history if mood actually changed
      if (prevMood.name !== mood.name) {
        get().addMoodToHistory(prevMood.name)
        
        // ⭐ NUOVO: Apply mood to software when changed
        if (get().oscEnabled && !get().simulationMode) {
          get().applyCurrentMoodToSoftware()
        }
      }
    },
    
    updateEnvironmentData: (data) =>
      set((state) => ({
        environmentData: { ...state.environmentData, ...data }
      })),
    
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

    // ⭐ NUOVO: OSC Implementation
    initializeOSC: async () => {
      try {
        // Uncomment when OSCController is ready
        // const { OSCController } = await import('../lib/protocols/OSCController')
        // const controller = new OSCController()
        
        // Setup event listeners
        // controller.onConnectionStatusChange((id, connected) => {
        //   get().updateSoftwareConnection(id, { 
        //     connected, 
        //     status: connected ? 'online' : 'offline',
        //     lastPing: connected ? Date.now() : 0
        //   })
        // })

        // controller.onMessageSent((software, message) => {
        //   set({ lastOSCMessage: { software, message, timestamp: Date.now() } })
        // })

        // set({ oscController: controller, oscEnabled: true })
        
        // For now, just enable OSC mode
        set({ oscEnabled: true })
        console.log('✅ OSC Controller initialized')
      } catch (error) {
        console.error('❌ Failed to initialize OSC:', error)
        set({ oscEnabled: false })
      }
    },

    connectToSoftware: async (softwareId: string) => {
      const { oscController } = get()
      if (!oscController) {
        console.log('OSC Controller not initialized, using simulation')
        get().updateSoftwareConnection(softwareId, { 
          connected: true, 
          status: 'online', 
          lastPing: Date.now() 
        })
        return true
      }

      try {
        // const connected = await oscController.connect(softwareId)
        // return connected
        
        // Temporary simulation
        get().updateSoftwareConnection(softwareId, { 
          connected: true, 
          status: 'online', 
          lastPing: Date.now() 
        })
        return true
      } catch (error) {
        console.error(`Failed to connect to ${softwareId}:`, error)
        get().updateSoftwareConnection(softwareId, { 
          connected: false, 
          status: 'error' 
        })
        return false
      }
    },

    disconnectFromSoftware: async (softwareId: string) => {
      const { oscController } = get()
      if (!oscController) {
        get().updateSoftwareConnection(softwareId, { 
          connected: false, 
          status: 'offline', 
          lastPing: 0 
        })
        return
      }

      try {
        // await oscController.disconnect(softwareId)
        get().updateSoftwareConnection(softwareId, { 
          connected: false, 
          status: 'offline', 
          lastPing: 0 
        })
      } catch (error) {
        console.error(`Failed to disconnect from ${softwareId}:`, error)
      }
    },

    // ⭐ CORE FUNCTION: Apply current mood to all connected software
    applyCurrentMoodToSoftware: async () => {
      const { currentMood, oscController, softwareConnections } = get()
      
      console.log(`🎭 Applying mood "${currentMood.name}" to connected software...`)
      
      // Get mood mapping
      const moodMapping = MOOD_MAPPINGS[currentMood.name]
      if (!moodMapping) {
        console.warn(`No mapping found for mood: ${currentMood.name}`)
        return
      }

      // Apply to each connected software
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

    // Individual software application functions
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
      const { oscController } = get()
      
      // Log the command
      console.log(`📤 OSC Command to ${software}: ${command}`, args)
      set({ lastOSCMessage: { software, message: `${command} ${args.join(' ')}`, timestamp: Date.now() } })
      
      if (!oscController) {
        console.log(`[SIMULATION] ${software}: ${command}`, args)
        return
      }

      // Real OSC implementation will go here
      // await oscController.sendToSoftware(software, command, args)
    },
    
    setSimulationMode: (enabled) => set({ simulationMode: enabled }),
    
    emergencyStop: async () => {
      const { oscController } = get()
      
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
      
      // Send emergency stop to all software
      if (oscController) {
        try {
          // await oscController.emergencyStopAll()
          console.log('🛑 Emergency stop sent to all software')
        } catch (error) {
          console.error('Emergency stop failed:', error)
        }
      }
      
      // Auto-reset emergency after 30 seconds
      setTimeout(() => {
        set({ emergencyActive: false })
      }, 30000)
    }
  }))
)

// Utility function for color conversion
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 }
}

// Selectors for optimized re-renders
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

// Auto-simulation when system is active (existing code remains the same)
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
        
        const environmentData = state.environmentData
        const newData = {
          peopleCount: Math.max(1, environmentData.peopleCount + Math.floor((Math.random() - 0.5) * 4)),
          avgMovement: Math.max(0, Math.min(1, environmentData.avgMovement + (Math.random() - 0.5) * 0.2)),
          audioLevel: Math.max(0, Math.min(1, environmentData.audioLevel + (Math.random() - 0.5) * 0.3))
        }
        
        state.updateEnvironmentData(newData)
        
        if (Math.random() < 0.2) {
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
          
          let targetMood = moods[2]
          
          if (newData.peopleCount > 15 && newData.avgMovement > 0.6) {
            targetMood = moods[0]
          } else if (newData.peopleCount > 8 && newData.audioLevel > 0.4) {
            targetMood = moods[1]
          }
          
          state.updateCurrentMood(targetMood)
        }
        
      }, 3000)
    }
  }
)