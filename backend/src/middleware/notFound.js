/**
 * Middleware para rotas não encontradas
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      auth: [
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'GET /api/auth/me',
        'POST /api/auth/refresh'
      ],
      jokes: [
        'GET /api/jokes/random',
        'GET /api/jokes/multiple',
        'GET /api/jokes/stats'
      ],
      system: [
        'GET /',
        'GET /health'
      ]
    }
  })
}

module.exports = {
  notFound
}
