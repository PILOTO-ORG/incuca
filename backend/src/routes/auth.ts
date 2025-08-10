import { Router } from 'express';
import { login, logout, me, refresh, validate } from '../controllers/authController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login do usuário
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Informações do usuário autenticado
 * @access  Private
 */
router.get('/me', authenticateToken, me);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token de acesso
 * @access  Public
 */
router.post('/refresh', refresh);

/**
 * @route   POST /api/auth/validate
 * @desc    Validar token de acesso
 * @access  Public
 */
router.post('/validate', validate);

export default router;
