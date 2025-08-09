import { Router } from 'express';
import { getRandomJoke, getMultipleJokes, getJokeStats, healthCheck } from '@/controllers/jokeController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Todas as rotas de piadas requerem autenticação
router.use(authenticateToken);

/**
 * @route   GET /api/jokes/random
 * @desc    Buscar uma piada aleatória
 * @access  Private
 */
router.get('/random', getRandomJoke);

/**
 * @route   GET /api/jokes/multiple
 * @desc    Buscar múltiplas piadas
 * @query   count - Número de piadas (1-10, padrão: 3)
 * @access  Private
 */
router.get('/multiple', getMultipleJokes);

/**
 * @route   GET /api/jokes/stats
 * @desc    Estatísticas de piadas
 * @access  Private
 */
router.get('/stats', getJokeStats);

/**
 * @route   GET /api/jokes/health
 * @desc    Verificação de saúde do serviço de piadas
 * @access  Private
 */
router.get('/health', healthCheck);

export default router;
