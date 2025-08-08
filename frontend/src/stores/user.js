import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

/**
 * Store para gerenciar estado do usuário e autenticação
 */
export const useUserStore = defineStore('user', () => {
  // Estados
  const user = ref(null)
  const tokens = ref({
    accessToken: null,
    refreshToken: null
  })
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => {
    return !!tokens.value.accessToken && !!user.value
  })

  const userInitials = computed(() => {
    if (!user.value?.name) return ''
    return user.value.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  // Actions
  const login = async (credentials) => {
    try {
      isLoading.value = true
      
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        const { user: userData, tokens: userTokens } = response.data.data
        
        // Armazenar dados do usuário
        user.value = userData
        tokens.value = userTokens
        
        // Persistir tokens no localStorage
        localStorage.setItem('accessToken', userTokens.accessToken)
        localStorage.setItem('refreshToken', userTokens.refreshToken)
        
        // Configurar token no axios
        api.defaults.headers.common['Authorization'] = `Bearer ${userTokens.accessToken}`
        
        return response.data
      }
      
      throw new Error(response.data.message || 'Erro no login')
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true
      
      // Tentar fazer logout no servidor
      if (tokens.value.accessToken) {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          // Ignorar erros de logout no servidor
          console.warn('Erro ao fazer logout no servidor:', error)
        }
      }
      
      // Limpar estado local
      clearUserData()
      
    } catch (error) {
      console.error('Erro no logout:', error)
      // Mesmo com erro, limpar dados locais
      clearUserData()
    } finally {
      isLoading.value = false
    }
  }

  const refreshToken = async () => {
    try {
      if (!tokens.value.refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: tokens.value.refreshToken
      })

      if (response.data.success) {
        const { accessToken } = response.data.data
        
        tokens.value.accessToken = accessToken
        localStorage.setItem('accessToken', accessToken)
        
        // Atualizar header do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        return true
      }
      
      throw new Error('Falha ao renovar token')
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      clearUserData()
      return false
    }
  }

  const fetchUserData = async () => {
    try {
      if (!tokens.value.accessToken) return false

      const response = await api.get('/auth/me')
      
      if (response.data.success) {
        user.value = response.data.data.user
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      if (error.response?.status === 401) {
        // Token expirado, tentar renovar
        const refreshed = await refreshToken()
        if (refreshed) {
          return await fetchUserData()
        }
      }
      return false
    }
  }

  const checkAuth = async () => {
    try {
      isLoading.value = true
      
      // Buscar tokens do localStorage
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!accessToken || !refreshToken) {
        isInitialized.value = true
        return false
      }
      
      // Configurar tokens
      tokens.value = { accessToken, refreshToken }
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      // Tentar buscar dados do usuário
      const success = await fetchUserData()
      
      if (!success) {
        clearUserData()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      clearUserData()
      return false
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const clearUserData = () => {
    user.value = null
    tokens.value = { accessToken: null, refreshToken: null }
    
    // Limpar localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Remover header de autorização
    delete api.defaults.headers.common['Authorization']
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
  }

  // Retorno do store
  return {
    // Estado
    user,
    tokens,
    isLoading,
    isInitialized,
    
    // Getters
    isAuthenticated,
    userInitials,
    
    // Actions
    login,
    logout,
    refreshToken,
    fetchUserData,
    checkAuth,
    clearUserData,
    updateUser
  }
})
