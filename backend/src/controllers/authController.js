const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { loginSchema } = require('../validators/authValidator')

const prisma = new PrismaClient()

/**
 * AuthController
 * 
 * Controlador responsável pela autenticação de usuários.
 * Implementa login/logout com JWT.
 */

/**
 * Login do usuário
 */
const login = async (req, res, next) => {
  try {
    // Validação dos dados de entrada
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      })
    }

    const { email, password } = value

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      })
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      })
    }

    // Gerar tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    const refreshToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    )

    // Resposta de sucesso
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        tokens: {
          accessToken,
          refreshToken,
          tokenType: 'Bearer',
          expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * Logout do usuário
 */
const logout = async (req, res, next) => {
  try {
    // Em um cenário real, adicionaríamos o token a uma blacklist
    // Por simplicidade, retornamos sucesso
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Informações do usuário autenticado
 */
const me = async (req, res, next) => {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true
      }
    })

    if (!user || !user.active) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      })
    }

    res.json({
      success: true,
      data: { user }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * Refresh do token
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token é obrigatório'
      })
    }

    // Verificar refresh token
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      })
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }

    // Verificar se usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      })
    }

    // Gerar novo access token
    const newAccessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        accessToken: newAccessToken,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    })

  } catch (error) {
    next(error)
  }
}

module.exports = {
  login,
  logout,
  me,
  refresh
}
