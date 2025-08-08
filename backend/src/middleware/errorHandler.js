/**
 * Middleware para tratamento de erros
 */
const errorHandler = (error, req, res, next) => {
  console.error('🚨 Error:', error)

  // Erro de validação do Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Dados duplicados',
      error: 'Este email já está em uso'
    })
  }

  // Erro de registro não encontrado do Prisma
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado',
      error: error.meta?.cause || 'Recurso solicitado não existe'
    })
  }

  // Erro de conexão com banco de dados
  if (error.code === 'P1001' || error.code === 'P1008') {
    return res.status(503).json({
      success: false,
      message: 'Serviço temporariamente indisponível',
      error: 'Problema de conexão com o banco de dados'
    })
  }

  // Erro de validação do Joi
  if (error.isJoi) {
    return res.status(422).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    })
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    })
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    })
  }

  // Erro de timeout/network
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return res.status(504).json({
      success: false,
      message: 'Timeout na requisição',
      error: 'Serviço externo demorou para responder'
    })
  }

  // Erro padrão
  const status = error.status || error.statusCode || 500
  const message = error.message || 'Erro interno do servidor'

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Erro interno do servidor' : message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      error: error.message
    })
  })
}

module.exports = {
  errorHandler
}
