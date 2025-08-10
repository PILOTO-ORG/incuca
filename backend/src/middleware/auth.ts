import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { responseUtils } from '../utils';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona informações do usuário à requisição
 */
export const authenticateToken = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  console.log('🔐 AuthMiddleware.authenticateToken - Authenticating token');
  
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ AuthMiddleware.authenticateToken - No token provided');
      res.status(401).json(responseUtils.error('Token de acesso é obrigatório'));
      return;
    }

    console.log('🔍 AuthMiddleware.authenticateToken - Verifying token');

    // Verificar e decodificar o token usando o AuthService
    let decoded: JwtPayload;
    try {
      decoded = await authService.verifyToken(token);
    } catch (error: any) {
      console.log('❌ AuthMiddleware.authenticateToken - Token verification failed:', error.message);
      
      if (error.message.includes('expired')) {
        res.status(401).json(responseUtils.error('Token expirado', null, 'TOKEN_EXPIRED'));
        return;
      }
      
      res.status(401).json(responseUtils.error('Token inválido'));
      return;
    }

    console.log(`🔍 AuthMiddleware.authenticateToken - Validating user: ${decoded.id}`);

    // Verificar se o usuário ainda existe e está ativo
    const user = await authService.validateUser(decoded.id);

    if (!user) {
      console.log(`❌ AuthMiddleware.authenticateToken - User not found or inactive: ${decoded.id}`);
      res.status(401).json(responseUtils.error('Usuário não encontrado ou inativo'));
      return;
    }

    // Adicionar informações do usuário à requisição
    req.user = user;

    console.log(`✅ AuthMiddleware.authenticateToken - User authenticated: ${user.email}`);
    next();
  } catch (error: any) {
    console.error('🚨 AuthMiddleware.authenticateToken - Error:', error.message);
    res.status(500).json(responseUtils.error('Erro interno do servidor'));
  }
};

/**
 * Middleware opcional de autenticação
 * Não falha se não houver token, apenas adiciona informações do usuário se token for válido
 */
export const optionalAuth = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  console.log('🔓 AuthMiddleware.optionalAuth - Optional authentication');
  
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      console.log('🔍 AuthMiddleware.optionalAuth - Token found, attempting verification');
      
      try {
        const decoded = await authService.verifyToken(token);
        const user = await authService.validateUser(decoded.id);

        if (user) {
          req.user = user;
          console.log(`✅ AuthMiddleware.optionalAuth - User authenticated: ${user.email}`);
        } else {
          console.log('⚠️ AuthMiddleware.optionalAuth - User not found or inactive');
        }
      } catch (error) {
        console.log('⚠️ AuthMiddleware.optionalAuth - Token verification failed (ignored)');
        // Ignorar erros de token em auth opcional
      }
    } else {
      console.log('ℹ️ AuthMiddleware.optionalAuth - No token provided (proceeding without auth)');
    }

    next();
  } catch (error: any) {
    console.error('🚨 AuthMiddleware.optionalAuth - Error:', error.message);
    // Em auth opcional, continuamos mesmo com erro
    next();
  }
};

/**
 * Middleware para verificar se usuário tem permissões específicas
 * (preparação para futuro sistema de roles)
 */
export const requireRole = (role: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    console.log(`🛡️ AuthMiddleware.requireRole - Checking role: ${role}`);
    
    if (!req.user) {
      console.log('❌ AuthMiddleware.requireRole - No authenticated user');
      res.status(401).json(responseUtils.error('Autenticação necessária'));
      return;
    }

    // Por enquanto, todos os usuários autenticados têm acesso
    // Futuramente implementaremos sistema de roles
    console.log(`✅ AuthMiddleware.requireRole - Role check passed for user: ${req.user.email}`);
    next();
  };
};

/**
 * Middleware para verificar se usuário está ativo
 */
export const requireActiveUser = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  console.log('🟢 AuthMiddleware.requireActiveUser - Checking user active status');
  
  if (!req.user) {
    console.log('❌ AuthMiddleware.requireActiveUser - No authenticated user');
    res.status(401).json(responseUtils.error('Autenticação necessária'));
    return;
  }

  if (!req.user.active) {
    console.log(`❌ AuthMiddleware.requireActiveUser - User inactive: ${req.user.email}`);
    res.status(403).json(responseUtils.error('Usuário inativo'));
    return;
  }

  console.log(`✅ AuthMiddleware.requireActiveUser - User is active: ${req.user.email}`);
  next();
};
