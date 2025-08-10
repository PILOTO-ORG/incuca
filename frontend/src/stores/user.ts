import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { logger } from '../plugins/logger'

// Tipos
interface User {
  id: number
  name: string
  email: string
  active: boolean
  createdAt: string
  updatedAt: string
}

interface Tokens {
  accessToken: string | null
  refreshToken: string | null
}

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message: string
  user: User
  access_token: string
  refresh_token: string
}

/**
 * Store para gerenciar estado do usuário e autenticação
 */
export const useUserStore = defineStore('user', () => {
  // Estados
  const user = ref<User | null>(null)
  const tokens = ref<Tokens>({
    accessToken: null,
    refreshToken: null
  })
  const isLoading = ref<boolean>(false)
  const isInitialized = ref<boolean>(false)

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
  const login = async (credentials: LoginCredentials) => {
    logger.info('🔐 Iniciando processo de login', { email: credentials.email })
    
    try {
      isLoading.value = true
      logger.debug('Login loading state set to true')
      
      const response = await api.post<LoginResponse>('/auth/login', credentials)
      logger.debug('Login API response received', { status: response.status })
      
      if (response.data.success) {
        const { user: userData, access_token, refresh_token } = response.data
        logger.success('✅ Login bem-sucedido', { userId: userData.id, email: userData.email })
        
        // Armazenar dados do usuário
        user.value = userData
        tokens.value = {
          accessToken: access_token,
          refreshToken: refresh_token
        }
        
        // Persistir tokens no localStorage
        localStorage.setItem('accessToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)
        logger.debug('Tokens salvos no localStorage')
        
        // Configurar token no axios
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        logger.debug('Authorization header configurado')
        
        return response.data
      }
      
      throw new Error(response.data.message || 'Erro no login')
    } catch (error: any) {
      logger.error('❌ Erro no login', { 
        message: error.message,
        status: error.response?.status,
        email: credentials.email
      })
      throw error
    } finally {
      isLoading.value = false
      logger.debug('Login loading state set to false')
    }
  }

  const logout = async () => {
    logger.info('🚪 Iniciando processo de logout', { userId: user.value?.id })
    
    try {
      isLoading.value = true
      
      // Tentar fazer logout no servidor
      if (tokens.value.accessToken) {
        try {
          await api.post('/auth/logout')
          logger.success('Logout realizado no servidor')
        } catch (error: any) {
          logger.warn('⚠️ Erro ao fazer logout no servidor (continuando)', { error: error.message })
        }
      }
      
      // Limpar estado local
      clearUserData()
      logger.success('✅ Logout concluído com sucesso')
      
    } catch (error: any) {
      logger.error('❌ Erro no logout', { error: error.message })
      // Mesmo com erro, limpar dados locais
      clearUserData()
    } finally {
      isLoading.value = false
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    logger.info('🔄 Tentando renovar token')
    
    try {
      if (!tokens.value.refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: tokens.value.refreshToken
      })

      if (response.data.success) {
        const { accessToken } = response.data.data
        logger.success('✅ Token renovado com sucesso')
        
        tokens.value.accessToken = accessToken
        localStorage.setItem('accessToken', accessToken)
        
        // Atualizar header do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        
        return true
      }
      
      throw new Error('Falha ao renovar token')
    } catch (error: any) {
      logger.error('❌ Erro ao renovar token', { error: error.message })
      clearUserData()
      return false
    }
  }

  const fetchUserData = async (): Promise<boolean> => {
    logger.debug('📤 Buscando dados do usuário')
    
    try {
      if (!tokens.value.accessToken) {
        logger.warn('⚠️ Token de acesso não encontrado')
        return false
      }

      const response = await api.get('/auth/me')
      
      if (response.data.success) {
        user.value = response.data.data.user
        logger.success('✅ Dados do usuário carregados', { userId: user.value.id })
        return true
      }
      
      return false
    } catch (error: any) {
      logger.error('❌ Erro ao buscar dados do usuário', { 
        error: error.message,
        status: error.response?.status 
      })
      
      if (error.response?.status === 401) {
        logger.info('Token expirado, tentando renovar...')
        const refreshed = await refreshToken()
        if (refreshed) {
          return await fetchUserData()
        }
      }
      return false
    }
  }

  const checkAuth = async (): Promise<boolean> => {
    logger.info('🔍 Verificando estado de autenticação')
    
    try {
      isLoading.value = true
      
      // Buscar tokens do localStorage
      const accessToken = localStorage.getItem('accessToken')
      const refreshTokenValue = localStorage.getItem('refreshToken')
      
      if (!accessToken || !refreshTokenValue) {
        logger.info('Tokens não encontrados no localStorage')
        isInitialized.value = true
        return false
      }
      
      logger.debug('Tokens encontrados no localStorage')
      
      // Configurar tokens
      tokens.value = { accessToken, refreshToken: refreshTokenValue }
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      // Tentar buscar dados do usuário
      const success = await fetchUserData()
      
      if (!success) {
        logger.warn('Falha ao restaurar sessão do usuário')
        clearUserData()
        return false
      }
      
      logger.success('✅ Sessão restaurada com sucesso')
      return true
    } catch (error: any) {
      logger.error('❌ Erro ao verificar autenticação', { error: error.message })
      clearUserData()
      return false
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const clearUserData = () => {
    logger.info('🧹 Limpando dados do usuário')
    
    const previousUserId = user.value?.id
    
    user.value = null
    tokens.value = { accessToken: null, refreshToken: null }
    
    // Limpar localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Remover header de autorização
    delete api.defaults.headers.common['Authorization']
    
    logger.debug('Dados do usuário limpos', { previousUserId })
  }

  const updateUser = (userData: Partial<User>) => {
    if (!user.value) return
    
    const previousData = { ...user.value }
    user.value = { ...user.value, ...userData }
    
    logger.info('👤 Dados do usuário atualizados', { 
      userId: user.value.id,
      updatedFields: Object.keys(userData),
      previousData,
      newData: user.value
    })
  }

  // Log inicial do store
  logger.debug('User store initialized')

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
