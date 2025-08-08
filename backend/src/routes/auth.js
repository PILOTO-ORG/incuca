const express = require('express')
const { login, logout, me, refresh } = require('../controllers/authController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

/**
 * @route   POST /api/auth/login
 * @desc    Login do usuário
 * @access  Public
 */
router.post('/login', login)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout', authenticateToken, logout)

/**
 * @route   GET /api/auth/me
 * @desc    Informações do usuário autenticado
 * @access  Private
 */
router.get('/me', authenticateToken, me)

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token de acesso
 * @access  Public
 */
router.post('/refresh', refresh)

module.exports = router
