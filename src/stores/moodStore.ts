import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

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
}

interface MoodStore {
  // Current state
  systemActive: boolean
  currentMood: MoodState
  environmentData: EnvironmentData
  softwareConnections: SoftwareConnection[]
  
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
        connected: true,
        lastPing: Date.now(),
        status: 'online'
      },
      {
        id: 'resolume',
        name: 'Resolume Arena',
        connected: false,
        lastPing: Date.now() - 30000,
        status: 'offline'
      },
      {
        id: 'chamsys',
        name: 'Chamsys MagicQ',
        connected: true,
        lastPing: Date.now() - 2000,
        status: 'online'
      }
    ],
    
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
    
    // Actions
    setSystemActive: (active) => set({ systemActive: active }),
    
    updateCurrentMood: (mood) => {
      const prevMood = get().currentMood
      set({ currentMood: mood })
      
      // Add to history if mood actually changed
      if (prevMood.name !== mood.name) {
        get().addMoodToHistory(prevMood.name)
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
      
      // Calculate duration of previous mood
      const duration = lastEntry 
        ? Math.round((now - lastEntry.timestamp) / 60000) 
        : 0
      
      // Update last entry with actual duration and add new one
      const newHistory = [
        { timestamp: now, mood: get().currentMood.name, duration: 0 },
        ...history.slice(0, 9).map((entry, index) => 
          index === 0 ? { ...entry, duration } : entry
        )
      ]
      
      set({ moodHistory: newHistory })
    },
    
    setSimulationMode: (enabled) => set({ simulationMode: enabled }),
    
    emergencyStop: () => {
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
      
      // Auto-reset emergency after 30 seconds
      setTimeout(() => {
        set({ emergencyActive: false })
      }, 30000)
    }
  }))
)

// Selectors for optimized re-renders
export const useSystemActive = () => useMoodStore((state) => state.systemActive)
export const useCurrentMood = () => useMoodStore((state) => state.currentMood)
export const useEnvironmentData = () => useMoodStore((state) => state.environmentData)
export const useSoftwareConnections = () => useMoodStore((state) => state.softwareConnections)
export const useMoodHistory = () => useMoodStore((state) => state.moodHistory)
export const useAudienceMetrics = () => useMoodStore((state) => state.audienceMetrics)

// Auto-simulation when system is active
useMoodStore.subscribe(
  (state) => state.systemActive,
  (systemActive) => {
    if (systemActive && useMoodStore.getState().simulationMode) {
      // Start simulation interval
      const interval = setInterval(() => {
        const state = useMoodStore.getState()
        if (!state.systemActive || !state.simulationMode) {
          clearInterval(interval)
          return
        }
        
        // Simulate environment changes
        const environmentData = state.environmentData
        const newData = {
          peopleCount: Math.max(1, environmentData.peopleCount + Math.floor((Math.random() - 0.5) * 4)),
          avgMovement: Math.max(0, Math.min(1, environmentData.avgMovement + (Math.random() - 0.5) * 0.2)),
          audioLevel: Math.max(0, Math.min(1, environmentData.audioLevel + (Math.random() - 0.5) * 0.3))
        }
        
        state.updateEnvironmentData(newData)
        
        // Occasionally change mood based on environment
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
          
          // Choose mood based on environment
          let targetMood = moods[2] // Default to contemplative
          
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