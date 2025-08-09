/**
 * Plugin de logging para capturar ações do usuário e eventos do sistema
 */

class Logger {
  constructor() {
    this.logs = []
    this.maxLogs = 1000
    this.isEnabled = true
  }

  log(level, message, data = null) {
    if (!this.isEnabled) return

    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100)
    }

    this.logs.unshift(logEntry)

    // Manter apenas os últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Console log com formatação
    this.consoleLog(logEntry)

    // Enviar para backend se for erro crítico
    if (level === 'error') {
      this.sendToBackend(logEntry)
    }
  }

  info(message, data = null) {
    this.log('info', message, data)
  }

  warn(message, data = null) {
    this.log('warn', message, data)
  }

  error(message, data = null) {
    this.log('error', message, data)
  }

  debug(message, data = null) {
    this.log('debug', message, data)
  }

  success(message, data = null) {
    this.log('success', message, data)
  }

  consoleLog(logEntry) {
    const time = new Date(logEntry.timestamp).toLocaleTimeString('pt-BR')
    const emoji = this.getEmoji(logEntry.level)
    
    const style = this.getConsoleStyle(logEntry.level)
    
    console.log(
      `%c${emoji} [${time}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`,
      style,
      logEntry.data || ''
    )
  }

  getEmoji(level) {
    const emojis = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
      success: '✅'
    }
    return emojis[level] || '📝'
  }

  getConsoleStyle(level) {
    const styles = {
      info: 'color: #2196F3; font-weight: bold;',
      warn: 'color: #FF9800; font-weight: bold;',
      error: 'color: #F44336; font-weight: bold;',
      debug: 'color: #9C27B0; font-weight: bold;',
      success: 'color: #4CAF50; font-weight: bold;'
    }
    return styles[level] || 'color: #666; font-weight: bold;'
  }

  async sendToBackend(logEntry) {
    try {
      // Só enviar erros críticos para não sobrecarregar o backend
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...logEntry,
          source: 'frontend'
        })
      })

      if (!response.ok) {
        console.warn('Failed to send log to backend:', response.statusText)
      }
    } catch (error) {
      console.warn('Error sending log to backend:', error.message)
    }
  }

  getLogs(level = null, limit = null) {
    let filteredLogs = level 
      ? this.logs.filter(log => log.level === level)
      : this.logs

    if (limit) {
      filteredLogs = filteredLogs.slice(0, limit)
    }

    return filteredLogs
  }

  clearLogs() {
    this.logs = []
    this.info('Logs cleared')
  }

  exportLogs() {
    const logsJson = JSON.stringify(this.logs, null, 2)
    const blob = new Blob([logsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `frontend-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    this.success('Logs exported successfully')
  }

  // Interceptar erros globais
  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      this.error('Global JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      })
    })
  }

  // Interceptar navegação
  setupNavigationLogging() {
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      logger.info('Navigation (pushState)', { 
        url: args[2],
        state: args[0] 
      })
      return originalPushState.apply(history, args)
    }

    history.replaceState = function(...args) {
      logger.info('Navigation (replaceState)', { 
        url: args[2],
        state: args[0] 
      })
      return originalReplaceState.apply(history, args)
    }

    window.addEventListener('popstate', (event) => {
      logger.info('Navigation (popstate)', { 
        url: window.location.href,
        state: event.state 
      })
    })
  }

  // Interceptar requisições HTTP
  setupHttpLogging() {
    const originalFetch = window.fetch

    window.fetch = async function(...args) {
      const startTime = Date.now()
      const [url, options = {}] = args

      logger.debug('HTTP Request Started', {
        url: url.toString(),
        method: options.method || 'GET',
        headers: options.headers
      })

      try {
        const response = await originalFetch.apply(window, args)
        const duration = Date.now() - startTime

        logger.info('HTTP Request Completed', {
          url: url.toString(),
          method: options.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`
        })

        if (!response.ok) {
          logger.warn('HTTP Request Failed', {
            url: url.toString(),
            status: response.status,
            statusText: response.statusText
          })
        }

        return response
      } catch (error) {
        const duration = Date.now() - startTime

        logger.error('HTTP Request Error', {
          url: url.toString(),
          method: options.method || 'GET',
          error: error.message,
          duration: `${duration}ms`
        })

        throw error
      }
    }
  }

  enable() {
    this.isEnabled = true
    this.info('Logger enabled')
  }

  disable() {
    this.isEnabled = false
    console.log('Logger disabled')
  }
}

// Criar instância global
const logger = new Logger()

// Plugin para Vue
const LoggerPlugin = {
  install(app) {
    // Configurar interceptadores
    logger.setupGlobalErrorHandling()
    logger.setupNavigationLogging()
    logger.setupHttpLogging()

    // Disponibilizar globalmente
    app.config.globalProperties.$logger = logger
    app.provide('logger', logger)

    // Log inicial
    logger.success('Frontend Logger initialized')
  }
}

export default LoggerPlugin
export { logger }
