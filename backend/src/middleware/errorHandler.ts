import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { responseUtils } from '../utils';
import { ErrorResponse, HttpStatusCode } from '../types';

/**
 * Interface para erros personalizados
 */
interface CustomError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  meta?: any;
  isJoi?: boolean;
  details?: Array<{
    path: string[];
    message: string;
  }>;
}

/**
 * Middleware para tratamento centralizado de erros
 * Implementa logging estruturado e respostas padronizadas
 */
export const errorHandler = (
  error: CustomError, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  
  console.error('🚨 ErrorHandler - Error occurred:', {
    requestId,
    timestamp,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: config.NODE_ENV === 'development' ? error.stack : undefined
    }
  });

  // Erro de validação do Prisma - Duplicate key
  if (error.code === 'P2002') {
    console.log('🔑 ErrorHandler - Prisma duplicate key error');
    const response: ErrorResponse = {
      success: false,
      message: 'Dados duplicados',
      error: 'Este email já está em uso',
      timestamp,
      path: req.path,
      method: req.method,
      statusCode: 409
    };
    res.status(409).json(response);
    return;
  }

  // Erro de registro não encontrado do Prisma
  if (error.code === 'P2025') {
    console.log('🔍 ErrorHandler - Prisma record not found error');
    const response: ErrorResponse = {
      success: false,
      message: 'Registro não encontrado',
      error: error.meta?.cause || 'Recurso solicitado não existe',
      timestamp,
      path: req.path,
      method: req.method,
      statusCode: 404
    };
    res.status(404).json(response);
    return;
  }

  // Erro de conexão com banco de dados
  if (error.code === 'P1001' || error.code === 'P1008' || error.code === 'P1017') {
    console.log('🗄️ ErrorHandler - Database connection error');
    const response: ErrorResponse = {
      success: false,
      message: 'Serviço temporariamente indisponível',
      error: 'Problema de conexão com o banco de dados',
      timestamp,
      path: req.path,
      method: req.method,
      statusCode: 503
    };
    res.status(503).json(response);
    return;
  }

  // Erro de validação do Joi
  if (error.isJoi && error.details) {
    console.log('📝 ErrorHandler - Joi validation error');
    const response = {
      success: false,
      message: 'Dados de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      })),
      timestamp,
      path: req.path,
      method: req.method
    };
    res.status(422).json(response);
    return;
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    console.log('🔐 ErrorHandler - JWT invalid error');
    const response: ErrorResponse = {
      success: false,
      message: 'Token inválido',
      error: 'JWT_INVALID',
      timestamp,
      path: req.path,
      method: req.method,
      statusCode: 401
    };
    res.status(401).json(response);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    console.log('⏰ ErrorHandler - JWT expired error');
    const response: ErrorResponse = {
      success: false,
      message: 'Token expirado',
      error: 'TOKEN_EXPIRED',
      timestamp,
      path: req.path,
      method: req.method,
      statusCode: 401
    };
    res.status(401).json(response);
    return;
  }

  // Erro de timeout/network
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    console.log('⏱️ ErrorHandler - Timeout error');
    const response: ErrorResponse = {
      success: false,
      message: 'Timeout na requisição',
      error: 'Serviço externo demorou para responder',
      timestamp,
      path: req.path,
      method: req.method,
      statusCode: 504
    };
    res.status(504).json(response);
    return;
  }

  // Erro de rate limit
  if (error.message === 'Too Many Requests') {
    console.log('🚦 ErrorHandler - Rate limit error');
    const response: ErrorResponse = {
      success: false,
      message: 'Muitas requisições',
      error: 'Rate limit exceeded',
      timestamp,
      path: req.path,
      method: req.method,
      statusCode: 429
    };
    res.status(429).json(response);
    return;
  }

  // Erro de validação customizado
  if (error.name === 'ValidationError') {
    console.log('✅ ErrorHandler - Custom validation error');
    const response: ErrorResponse = {
      success: false,
      message: 'Erro de validação',
      error: error.message,
      timestamp,
      path: req.path,
      method: req.method,
      statusCode: 400
    };
    res.status(400).json(response);
    return;
  }

  // Erro padrão
  const status: HttpStatusCode = (error.status || error.statusCode || 500) as HttpStatusCode;
  const message = status === 500 ? 'Erro interno do servidor' : error.message;

  console.log(`🔥 ErrorHandler - Generic error (${status}):`, error.message);

  const response: ErrorResponse = {
    success: false,
    message,
    error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    timestamp,
    path: req.path,
    method: req.method,
    statusCode: status,
    ...(config.NODE_ENV === 'development' && {
      stack: error.stack
    })
  };

  res.status(status).json(response);
};

/**
 * Middleware para capturar erros assíncronos
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para tratar 404 - rotas não encontradas
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const timestamp = new Date().toISOString();
  
  console.log(`🔍 NotFoundHandler - Route not found: ${req.method} ${req.path}`);

  const response: ErrorResponse = {
    success: false,
    message: 'Rota não encontrada',
    error: `Cannot ${req.method} ${req.path}`,
    timestamp,
    path: req.path,
    method: req.method,
    statusCode: 404
  };

  res.status(404).json(response);
};

/**
 * Handler para erros não capturados
 */
export const uncaughtExceptionHandler = (error: Error): void => {
  console.error('💥 UncaughtException:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Em produção, devemos fazer graceful shutdown
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
};

/**
 * Handler para promises rejeitadas não capturadas
 */
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  console.error('🔥 UnhandledRejection:', {
    reason,
    promise,
    timestamp: new Date().toISOString()
  });
  
  // Em produção, devemos fazer graceful shutdown
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
};
