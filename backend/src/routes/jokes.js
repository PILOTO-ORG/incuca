const express = require('express')
const { getRandomJoke, getMultipleJokes, getJokeStats } = require('../controllers/jokeController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Todas as rotas de piadas requerem autenticação
router.use(authenticateToken)

/**
 * @route   GET /api/jokes/random
 * @desc    Buscar uma piada aleatória
 * @access  Private
 */
router.get('/random', getRandomJoke)

/**
 * @route   GET /api/jokes/multiple
 * @desc    Buscar múltiplas piadas
 * @query   count - Número de piadas (1-10, padrão: 3)
 * @access  Private
 */
router.get('/multiple', getMultipleJokes)

/**
 * @route   GET /api/jokes/stats
 * @desc    Estatísticas de piadas
 * @access  Private
 */
router.get('/stats', getJokeStats)

module.exports = router
