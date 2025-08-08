import axios from 'axios'

// Configuração base do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Adicionar token se existir
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log da requisição em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ Erro na requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Log da resposta em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`🟢 ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      })
    }
    
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Log do erro
    console.error(`🔴 ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    })
    
    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Tentar renovar o token
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (refreshToken && !originalRequest.url.includes('/auth/refresh')) {
        try {
          const response = await api.post('/auth/refresh', {
            refreshToken
          })
          
          if (response.data.success) {
            const { accessToken } = response.data.data
            
            // Atualizar token no localStorage
            localStorage.setItem('accessToken', accessToken)
            
            // Atualizar header da requisição original
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            
            // Repetir a requisição original
            return api(originalRequest)
          }
        } catch (refreshError) {
          console.error('❌ Erro ao renovar token:', refreshError)
          
          // Se falhar ao renovar, limpar tokens e redirecionar para login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          
          // Redirecionar para login se não estivermos já lá
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
      } else {
        // Não há refresh token ou já estamos tentando fazer refresh
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    
    // Tratamento de erros específicos
    if (error.response?.status === 429) {
      error.userMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
    } else if (error.response?.status === 503) {
      error.userMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Erro interno do servidor. Nossa equipe foi notificada.'
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Requisição demorou muito para responder. Verifique sua conexão.'
    } else if (!error.response) {
      error.userMessage = 'Erro de conexão. Verifique sua internet.'
    } else {
      error.userMessage = error.response.data?.message || 'Erro inesperado. Tente novamente.'
    }
    
    return Promise.reject(error)
  }
)

// Métodos auxiliares
export const apiHelpers = {
  /**
   * Fazer upload de arquivo
   */
  uploadFile: async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(progress)
        }
      }
    })
  },
  
  /**
   * Download de arquivo
   */
  downloadFile: async (url, filename) => {
    const response = await api.get(url, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  },
  
  /**
   * Verificar se API está online
   */
  checkHealth: async () => {
    try {
      const response = await api.get('/health')
      return response.data.success
    } catch (error) {
      return false
    }
  },
  
  /**
   * Cancelar todas as requisições pendentes
   */
  cancelAllRequests: () => {
    // Em um cenário real, poderíamos manter uma lista de CancelTokens
    console.log('Cancelando todas as requisições...')
  }
}

export default api
