import { Router } from 'express';
import { 
  getRandomJoke, 
  getJokeStats, 
  healthCheck,
  getFavoriteJokes,
  favoriteJoke,
  unfavoriteJoke,
  checkJokeFavorite,
  shareJoke
} from '@/controllers/jokeController';
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
 * @route   GET /api/jokes/favorites
 * @desc    Buscar piadas favoritas do usuário
 * @access  Private
 */
router.get('/favorites', getFavoriteJokes);

/**
 * @route   POST /api/jokes/favorite
 * @desc    Favoritar uma piada
 * @body    { joke: string, jokeId?: string }
 * @access  Private
 */
router.post('/favorite', favoriteJoke);

/**
 * @route   DELETE /api/jokes/favorite
 * @desc    Desfavoritar uma piada
 * @body    { joke: string }
 * @access  Private
 */
router.delete('/favorite', unfavoriteJoke);

/**
 * @route   POST /api/jokes/check-favorite
 * @desc    Verificar se uma piada está nos favoritos
 * @body    { joke: string }
 * @access  Private
 */
router.post('/check-favorite', checkJokeFavorite);

/**
 * @route   POST /api/jokes/share
 * @desc    Compartilhar piada via WhatsApp
 * @body    { joke: string }
 * @access  Private
 */
router.post('/share', shareJoke);

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
