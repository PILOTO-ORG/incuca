import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

// Tipos
interface Joke {
  id: string | number
  text: string
  timestamp: string
  cached?: boolean
}

interface FavoriteJoke {
  id: number
  joke: string
  createdAt?: string
}

interface JokeStats {
  total: number
  translated: number
  cached: number
  favorites: number
  lastUpdate?: string
  apiStatus?: boolean
}

/**
 * Store para gerenciar piadas e favoritos
 */
export const useJokeStore = defineStore('joke', () => {
  // Estados
  const currentJoke = ref<string>('')
  const jokes = ref<Joke[]>([])
  const favorites = ref<FavoriteJoke[]>([])
  const isLoading = ref<boolean>(false)
  const isFavoriteLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const stats = ref<JokeStats>({
    total: 0,
    translated: 0,
    cached: 0,
    favorites: 0,
    lastUpdate: null,
    apiStatus: true
  })

  // Getters
  const hasJoke = computed(() => !!currentJoke.value)
  const jokesCount = computed(() => jokes.value.length)
  const favoritesCount = computed(() => favorites.value.length)
  const isCurrentJokeFavorited = computed(() => {
    if (!currentJoke.value) return false
    return favorites.value.some(fav => fav.joke === currentJoke.value)
  })

  // Actions para piadas
  const fetchRandomJoke = async (): Promise<string> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await api.get('/jokes/random')
      
      if (response.data.success) {
        const jokeData = response.data.data
        
        currentJoke.value = jokeData.joke
        
        // Adicionar à lista de piadas com ID único
        const newJoke: Joke = {
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
    } catch (err: any) {
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

  const fetchStats = async (): Promise<JokeStats | null> => {
    try {
      const response = await api.get('/jokes/stats')
      
      if (response.data.success) {
        stats.value = response.data.data
        return stats.value
      }
      
      throw new Error(response.data.message || 'Erro ao buscar estatísticas')
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err)
      return null
    }
  }

  // Actions para favoritos
  const fetchFavorites = async (): Promise<void> => {
    try {
      isFavoriteLoading.value = true
      
      const response = await api.get('/jokes/favorites')
      
      if (response.data.success) {
        favorites.value = response.data.data.favorites
        console.log('✅ Favoritos carregados:', favorites.value.length)
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar favoritos:', err)
      error.value = err.response?.data?.message || 'Erro ao buscar favoritos'
    } finally {
      isFavoriteLoading.value = false
    }
  }

  const addToFavorites = async (joke: string, jokeId?: string): Promise<boolean> => {
    try {
      isFavoriteLoading.value = true
      
      const response = await api.post('/jokes/favorite', {
        joke,
        jokeId
      })
      
      if (response.data.success) {
        // Adicionar aos favoritos locais
        const newFavorite: FavoriteJoke = {
          id: Date.now(), // Temporário até recarregar da API
          joke,
          createdAt: new Date().toISOString()
        }
        favorites.value.unshift(newFavorite)
        
        console.log('✅ Piada adicionada aos favoritos')
        return true
      }
      
      throw new Error(response.data.message || 'Erro ao favoritar piada')
    } catch (err: any) {
      console.error('❌ Erro ao favoritar piada:', err)
      error.value = err.response?.data?.message || 'Erro ao favoritar piada'
      return false
    } finally {
      isFavoriteLoading.value = false
    }
  }

  const removeFromFavorites = async (joke: string): Promise<boolean> => {
    try {
      isFavoriteLoading.value = true
      
      const response = await api.delete('/jokes/favorite', {
        data: { joke }
      })
      
      if (response.data.success) {
        // Remover dos favoritos locais
        favorites.value = favorites.value.filter(fav => fav.joke !== joke)
        
        console.log('✅ Piada removida dos favoritos')
        return true
      }
      
      throw new Error(response.data.message || 'Erro ao desfavoritar piada')
    } catch (err: any) {
      console.error('❌ Erro ao desfavoritar piada:', err)
      error.value = err.response?.data?.message || 'Erro ao desfavoritar piada'
      return false
    } finally {
      isFavoriteLoading.value = false
    }
  }

  const toggleFavorite = async (joke: string, jokeId?: string): Promise<boolean> => {
    const isFavorited = favorites.value.some(fav => fav.joke === joke)
    
    if (isFavorited) {
      return await removeFromFavorites(joke)
    } else {
      return await addToFavorites(joke, jokeId)
    }
  }

  const isJokeFavorited = (joke: string): boolean => {
    return favorites.value.some(fav => fav.joke === joke)
  }

  // Action para compartilhar
  const shareJoke = async (joke: string): Promise<boolean> => {
    try {
      // Gerar link do WhatsApp para número específico
      const phoneNumber = '554898589586' // Número com código do país (55) e DDD (48)
      const jokeText = encodeURIComponent(`🤣 Que tal essa piada?\n\n"${joke}"\n\n✨ Compartilhado pelo Incuca - Sua dose diária de humor!`)
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${jokeText}`
      
      // Abrir WhatsApp em nova aba
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      
      console.log('✅ Link do WhatsApp aberto para', phoneNumber)
      return true
    } catch (err: any) {
      console.error('❌ Erro ao compartilhar piada:', err)
      
      // Fallback: copiar para clipboard
      try {
        await navigator.clipboard.writeText(joke)
        console.log('📋 Piada copiada para clipboard como fallback')
        return true
      } catch (clipboardErr) {
        console.error('❌ Erro ao copiar para clipboard:', clipboardErr)
        return false
      }
    }
  }

  // Utilities
  const getFallbackJoke = (): string => {
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

  const clearError = () => {
    error.value = null
  }

  const getJokeById = (id: string | number): Joke | undefined => {
    return jokes.value.find(joke => joke.id === id)
  }

  const searchJokes = (query: string): Joke[] => {
    const lowerQuery = query.toLowerCase()
    return jokes.value.filter(joke => 
      joke.text.toLowerCase().includes(lowerQuery)
    )
  }

  const searchFavorites = (query: string): FavoriteJoke[] => {
    const lowerQuery = query.toLowerCase()
    return favorites.value.filter(fav => 
      fav.joke.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    // Estado
    currentJoke,
    jokes,
    favorites,
    isLoading,
    isFavoriteLoading,
    error,
    stats,
    
    // Getters
    hasJoke,
    jokesCount,
    favoritesCount,
    isCurrentJokeFavorited,
    
    // Actions - Piadas
    fetchRandomJoke,
    fetchStats,
    getFallbackJoke,
    clearCurrentJoke,
    clearAllJokes,
    clearError,
    
    // Actions - Favoritos
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isJokeFavorited,
    
    // Actions - Compartilhar
    shareJoke,
    
    // Utilities
    getJokeById,
    searchJokes,
    searchFavorites
  }
})
