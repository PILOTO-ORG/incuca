import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, LoginRequest } from '../types';
import { responseUtils } from '../utils';
import { loginSchema } from '../validators/authValidator';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

/**
 * AuthController
 * 
 * Controlador responsável pela autenticação de usuários.
 * Implementa login/logout com JWT usando clean architecture.
 */

/**
 * Login do usuário
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('🔐 AuthController.login - Login attempt started');
  
  try {
    // Validação dos dados
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      const errorMessage = error.details?.[0]?.message || 'Dados inválidos';
      console.log('❌ AuthController.login - Validation failed:', errorMessage);
      res.status(400).json(responseUtils.error(errorMessage));
      return;
    }

    const { email, password }: LoginRequest = value;
    console.log(`👤 AuthController.login - Attempting login for: ${email}`);

    // Usar o AuthService para fazer login
    const loginResult = await authService.login(email, password);

    console.log(`📤 AuthController.login - Login successful for: ${email}`);

    res.status(200).json({
      success: loginResult.success,
      message: loginResult.message,
      user: loginResult.data.user,
      access_token: loginResult.data.token,
      refresh_token: loginResult.data.refreshToken
    });
  } catch (error: any) {
    console.error('🚨 AuthController.login - Error:', error.message);
    console.error('🔍 AuthController.login - Stack:', error.stack);
    
    if (error.message === 'Invalid credentials' || error.message === 'Account is inactive') {
      res.status(401).json(responseUtils.error(
        error.message === 'Invalid credentials' ? 'Credenciais inválidas' : 'Usuário inativo'
      ));
      return;
    }
    
    next(error);
  }
};

/**
 * Logout do usuário
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('🚪 AuthController.logout - Logout attempt');
  
  try {
    // Em um cenário real, adicionaríamos o token a uma blacklist
    // Por simplicidade, retornamos sucesso
    console.log('✅ AuthController.logout - Logout successful');
    
    res.json(responseUtils.success('Logout realizado com sucesso'));
  } catch (error) {
    console.error('🚨 AuthController.logout - Error:', error);
    next(error);
  }
};

/**
 * Informações do usuário autenticado
 */
export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('👤 AuthController.me - Getting user info');
  
  try {
    if (!req.user) {
      console.log('❌ AuthController.me - No user in request');
      res.status(401).json(responseUtils.error('Usuário não autenticado'));
      return;
    }

    const userId = req.user.id;
    console.log(`🔍 AuthController.me - Getting info for user: ${userId}`);

    const user = await authService.validateUser(userId);

    if (!user) {
      console.log(`❌ AuthController.me - User not found: ${userId}`);
      res.status(404).json(responseUtils.error('Usuário não encontrado'));
      return;
    }

    console.log(`✅ AuthController.me - User info retrieved for: ${userId}`);

    res.json(responseUtils.success('Informações do usuário', { user }));
  } catch (error) {
    console.error('🚨 AuthController.me - Error:', error);
    next(error);
  }
};

/**
 * Refresh do token
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('🔄 AuthController.refresh - Token refresh attempt');
  
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log('❌ AuthController.refresh - No refresh token provided');
      res.status(400).json(responseUtils.error('Refresh token é obrigatório'));
      return;
    }

    console.log('🔍 AuthController.refresh - Validating refresh token');

    // Usar o AuthService para renovar token
    const tokens = await authService.refreshToken(refreshToken);

    console.log('✅ AuthController.refresh - Token refreshed successfully');

    res.json(responseUtils.success('Token renovado com sucesso', {
      accessToken: tokens.token,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer'
    }));
  } catch (error: any) {
    console.error('🚨 AuthController.refresh - Error:', error.message);
    
    if (error.message === 'Invalid refresh token' || error.message === 'User not found or inactive') {
      res.status(401).json(responseUtils.error('Refresh token inválido'));
      return;
    }
    
    next(error);
  }
};

/**
 * Validação de token (endpoint para verificar se token é válido)
 */
export const validate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('🔐 AuthController.validate - Token validation');
  
  try {
    if (!req.user) {
      console.log('❌ AuthController.validate - No user in request');
      res.status(401).json(responseUtils.error('Token inválido'));
      return;
    }

    console.log(`✅ AuthController.validate - Token valid for user: ${req.user.id}`);

    res.json(responseUtils.success('Token válido', {
      user: req.user,
      valid: true
    }));
  } catch (error) {
    console.error('🚨 AuthController.validate - Error:', error);
    next(error);
  }
};
