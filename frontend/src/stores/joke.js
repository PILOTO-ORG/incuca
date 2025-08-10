import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

/**
 * Store para gerenciar piadas
 */
export const useJokeStore = defineStore('joke', () => {
  // Estados
  const currentJoke = ref('')
  const jokes = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const stats = ref({
    totalJokesFetched: 0,
    todayJokes: 0,
    apiStatus: true,
    cacheHits: 0,
    lastUpdate: null
  })
  const favorites = ref([])

  // Getters
  const hasJoke = computed(() => !!currentJoke.value)
  const jokesCount = computed(() => jokes.value.length)
  const favoriteJokes = computed(() => {
    return jokes.value.filter(joke => favorites.value.includes(joke.id))
  })

  // Actions
  const fetchRandomJoke = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await api.get('/jokes/random')
      
      if (response.data.success) {
        const jokeData = response.data.data
        
        currentJoke.value = jokeData.joke
        
        // Adicionar à lista de piadas com ID único
        const newJoke = {
          id: Date.now() + Math.random(),
          text: jokeData.joke,
          timestamp: jokeData.timestamp,
          cached: jokeData.cached || false
        }
        
        jokes.value.unshift(newJoke)
        
        // Limitar histórico a 20 piadas
        if (jokes.value.length > 20) {
          jokes.value = jokes.value.slice(0, 20)
        }
        
        return jokeData.joke
      }
      
      throw new Error(response.data.message || 'Erro ao buscar piada')
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erro ao buscar piada'
      console.error('Erro ao buscar piada:', err)
      
      // Fallback para piada offline
      const fallbackJoke = getFallbackJoke()
      currentJoke.value = fallbackJoke
      
      return fallbackJoke
    } finally {
      isLoading.value = false
    }
  }

  const fetchMultipleJokes = async (count = 3) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await api.get(`/jokes/multiple?count=${count}`)
      
      if (response.data.success) {
        const jokesData = response.data.data.jokes
        
        // Adicionar todas as piadas
        jokesData.forEach(jokeText => {
          const newJoke = {
            id: Date.now() + Math.random(),
            text: jokeText,
            timestamp: new Date().toISOString(),
            cached: false
          }
          jokes.value.unshift(newJoke)
        })
        
        // Limitar histórico
        if (jokes.value.length > 50) {
          jokes.value = jokes.value.slice(0, 50)
        }
        
        // Definir a primeira como atual
        if (jokesData.length > 0) {
          currentJoke.value = jokesData[0]
        }
        
        return jokesData
      }
      
      throw new Error(response.data.message || 'Erro ao buscar piadas')
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Erro ao buscar piadas'
      console.error('Erro ao buscar múltiplas piadas:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/jokes/stats')
      
      if (response.data.success) {
        stats.value = response.data.data
        return stats.value
      }
      
      throw new Error(response.data.message || 'Erro ao buscar estatísticas')
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
      return null
    }
  }

  const getFallbackJoke = () => {
    const fallbackJokes = [
      "Por que os programadores preferem dark mode? Porque light atrai bugs! 🐛",
      "Como você chama um algoritmo que não funciona? Um bug-ritmo! 🎵",
      "O que o CSS disse para o HTML? Sem mim você não tem estilo! 💄",
      "Por que o JavaScript foi rejeitado? Porque era muito == e pouco ===! ⚖️",
      "Como um programador conserta um bug? Ele debug-a! 🔍",
      "Por que arrays começam em 0? Porque é o número de bugs que gostaríamos de ter! 🎯",
      "O que acontece quando você cruza um peixe com um elefante? Elephant.swim() is not a function! 🐘🐠"
    ]
    
    return fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)]
  }

  const clearCurrentJoke = () => {
    currentJoke.value = ''
  }

  const clearAllJokes = () => {
    jokes.value = []
    currentJoke.value = ''
  }

  const addToFavorites = (jokeId) => {
    if (!favorites.value.includes(jokeId)) {
      favorites.value.push(jokeId)
      saveFavoritesToStorage()
    }
  }

  const removeFromFavorites = (jokeId) => {
    const index = favorites.value.indexOf(jokeId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavoritesToStorage()
    }
  }

  const isFavorite = (jokeId) => {
    return favorites.value.includes(jokeId)
  }

  const toggleFavorite = (jokeId) => {
    if (isFavorite(jokeId)) {
      removeFromFavorites(jokeId)
    } else {
      addToFavorites(jokeId)
    }
  }

  const shareJoke = async (joke) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Piada Geek - Incuca',
          text: joke,
          url: window.location.href
        })
        return true
      } catch (err) {
        console.log('Erro ao compartilhar:', err)
      }
    }
    
    // Fallback: copiar para clipboard
    try {
      await navigator.clipboard.writeText(joke)
      return true
    } catch (err) {
      console.error('Erro ao copiar:', err)
      return false
    }
  }

  const getJokeById = (id) => {
    return jokes.value.find(joke => joke.id === id)
  }

  const searchJokes = (query) => {
    const lowerQuery = query.toLowerCase()
    return jokes.value.filter(joke => 
      joke.text.toLowerCase().includes(lowerQuery)
    )
  }

  // Persistência
  const saveFavoritesToStorage = () => {
    try {
      localStorage.setItem('incuca_favorite_jokes', JSON.stringify(favorites.value))
    } catch (error) {
      console.warn('Erro ao salvar favoritos:', error)
    }
  }

  const loadFavoritesFromStorage = () => {
    try {
      const savedFavorites = localStorage.getItem('incuca_favorite_jokes')
      if (savedFavorites) {
        favorites.value = JSON.parse(savedFavorites)
      }
    } catch (error) {
      console.warn('Erro ao carregar favoritos:', error)
    }
  }

  const saveJokesToStorage = () => {
    try {
      const jokesToSave = jokes.value.slice(0, 10) // Salvar apenas as 10 mais recentes
      localStorage.setItem('incuca_jokes_cache', JSON.stringify(jokesToSave))
    } catch (error) {
      console.warn('Erro ao salvar piadas:', error)
    }
  }

  const loadJokesFromStorage = () => {
    try {
      const savedJokes = localStorage.getItem('incuca_jokes_cache')
      if (savedJokes) {
        jokes.value = JSON.parse(savedJokes)
      }
    } catch (error) {
      console.warn('Erro ao carregar piadas:', error)
    }
  }

  // Inicializar dados do localStorage
  loadFavoritesFromStorage()
  loadJokesFromStorage()

  return {
    // Estado
    currentJoke,
    jokes,
    isLoading,
    error,
    stats,
    favorites,
    
    // Getters
    hasJoke,
    jokesCount,
    favoriteJokes,
    
    // Actions
    fetchRandomJoke,
    fetchMultipleJokes,
    fetchStats,
    getFallbackJoke,
    clearCurrentJoke,
    clearAllJokes,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    shareJoke,
    getJokeById,
    searchJokes,
    saveFavoritesToStorage,
    loadFavoritesFromStorage,
    saveJokesToStorage,
    loadJokesFromStorage
  }
})
