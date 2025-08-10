import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// Tipos
interface MoodConfig {
  name: string
  description: string
  emoji: string
  color: string
  bgClass: string
  icon: string
}

interface MoodHistoryEntry {
  from: string
  to: string
  timestamp: string
}

interface MoodStats {
  currentMood: string
  totalTransitions: number
  moodCounts: Record<string, number>
  lastTransition: MoodHistoryEntry | null
  progression: {
    current: number
    total: number
    percentage: number
    isComplete: boolean
  }
}

type MoodType = 'inicial' | 'triste' | 'poker-face' | 'feliz'

/**
 * Store para gerenciar o humor/mood da aplicação
 */
export const useMoodStore = defineStore('mood', () => {
  // Estados
  const currentMood = ref<MoodType>('inicial')
  const moodHistory = ref<MoodHistoryEntry[]>([])
  const isTransitioning = ref<boolean>(false)

  // Configuração dos moods
  const moodConfig: Record<MoodType, MoodConfig> = {
    inicial: {
      name: 'Inicial',
      description: 'Estado neutro, sem emoção definida',
      emoji: '😐',
      color: '#9E9E9E',
      bgClass: 'mood-neutral',
      icon: 'mdi-emoticon-neutral'
    },
    triste: {
      name: 'Triste',
      description: 'Estado melancólico e tristonho',
      emoji: '😢',
      color: '#455A64',
      bgClass: 'mood-sad',
      icon: 'mdi-emoticon-sad'
    },
    'poker-face': {
      name: 'Poker Face',
      description: 'Estado de concentração e expectativa',
      emoji: '😑',
      color: '#FF6B6B',
      bgClass: 'mood-poker-face',
      icon: 'mdi-emoticon-cool'
    },
    feliz: {
      name: 'Feliz',
      description: 'Estado de alegria e satisfação',
      emoji: '😄',
      color: '#FFC107',
      bgClass: 'mood-happy',
      icon: 'mdi-emoticon-happy'
    }
  }

  // Getters
  const currentMoodConfig = computed(() => {
    return moodConfig[currentMood.value] || moodConfig.inicial
  })

  const moodProgression = computed(() => {
    const moods: MoodType[] = ['inicial', 'triste', 'poker-face', 'feliz']
    const currentIndex = moods.indexOf(currentMood.value)
    const total = moods.length
    
    return {
      current: currentIndex + 1,
      total,
      percentage: ((currentIndex + 1) / total) * 100,
      isComplete: currentIndex === total - 1
    }
  })

  const canProgress = computed(() => {
    const progressionOrder: MoodType[] = ['inicial', 'triste', 'poker-face', 'feliz']
    const currentIndex = progressionOrder.indexOf(currentMood.value)
    return currentIndex < progressionOrder.length - 1
  })

  const canRegress = computed(() => {
    const progressionOrder: MoodType[] = ['inicial', 'triste', 'poker-face', 'feliz']
    const currentIndex = progressionOrder.indexOf(currentMood.value)
    return currentIndex > 0
  })

  // Actions
  const setMood = (newMood: string): boolean => {
    if (!moodConfig[newMood as MoodType]) {
      console.warn(`Mood '${newMood}' não existe`)
      return false
    }

    if (currentMood.value === newMood) {
      return true // Já está no mood solicitado
    }

    // Adicionar ao histórico
    moodHistory.value.push({
      from: currentMood.value,
      to: newMood,
      timestamp: new Date().toISOString()
    })

    // Limitar histórico a 50 entradas
    if (moodHistory.value.length > 50) {
      moodHistory.value = moodHistory.value.slice(-50)
    }

    currentMood.value = newMood as MoodType
    return true
  }

  const progressMood = (): boolean => {
    const progressionOrder: MoodType[] = ['inicial', 'triste', 'poker-face', 'feliz']
    const currentIndex = progressionOrder.indexOf(currentMood.value)
    
    if (currentIndex < progressionOrder.length - 1) {
      const nextMood = progressionOrder[currentIndex + 1]
      return setMood(nextMood)
    }
    
    return false
  }

  const regressMood = (): boolean => {
    const progressionOrder: MoodType[] = ['inicial', 'triste', 'poker-face', 'feliz']
    const currentIndex = progressionOrder.indexOf(currentMood.value)
    
    if (currentIndex > 0) {
      const prevMood = progressionOrder[currentIndex - 1]
      return setMood(prevMood)
    }
    
    return false
  }

  const resetMood = () => {
    setMood('inicial')
  }

  const startTransition = () => {
    isTransitioning.value = true
  }

  const endTransition = () => {
    isTransitioning.value = false
  }

  const getMoodStats = (): MoodStats => {
    const stats: Record<string, number> = {}
    
    // Contar ocorrências de cada mood no histórico
    moodHistory.value.forEach(entry => {
      stats[entry.to] = (stats[entry.to] || 0) + 1
    })

    return {
      currentMood: currentMood.value,
      totalTransitions: moodHistory.value.length,
      moodCounts: stats,
      lastTransition: moodHistory.value[moodHistory.value.length - 1] || null,
      progression: moodProgression.value
    }
  }

  const clearHistory = () => {
    moodHistory.value = []
  }

  // Métodos utilitários
  const getMoodByName = (name: string): string | undefined => {
    return Object.keys(moodConfig).find(key => 
      moodConfig[key as MoodType].name.toLowerCase() === name.toLowerCase()
    )
  }

  const getAllMoods = () => {
    return Object.keys(moodConfig).map(key => ({
      key,
      ...moodConfig[key as MoodType]
    }))
  }

  // Persistir mood no localStorage
  const saveMoodToStorage = () => {
    try {
      localStorage.setItem('incuca_current_mood', currentMood.value)
      localStorage.setItem('incuca_mood_history', JSON.stringify(moodHistory.value))
    } catch (error) {
      console.warn('Erro ao salvar mood no localStorage:', error)
    }
  }

  const loadMoodFromStorage = () => {
    try {
      const savedMood = localStorage.getItem('incuca_current_mood')
      const savedHistory = localStorage.getItem('incuca_mood_history')
      
      if (savedMood && moodConfig[savedMood as MoodType]) {
        currentMood.value = savedMood as MoodType
      }
      
      if (savedHistory) {
        moodHistory.value = JSON.parse(savedHistory)
      }
    } catch (error) {
      console.warn('Erro ao carregar mood do localStorage:', error)
    }
  }

  // Auto-salvar quando mood muda
  const watchMood = () => {
    watch(currentMood, saveMoodToStorage)
    watch(moodHistory, saveMoodToStorage, { deep: true })
  }

  // Inicializar com dados do localStorage
  loadMoodFromStorage()

  return {
    // Estado
    currentMood,
    moodHistory,
    isTransitioning,
    moodConfig,
    
    // Getters
    currentMoodConfig,
    moodProgression,
    canProgress,
    canRegress,
    
    // Actions
    setMood,
    progressMood,
    regressMood,
    resetMood,
    startTransition,
    endTransition,
    getMoodStats,
    clearHistory,
    getMoodByName,
    getAllMoods,
    saveMoodToStorage,
    loadMoodFromStorage,
    watchMood
  }
})
