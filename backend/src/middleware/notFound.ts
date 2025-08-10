import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../types';

interface NotFoundResponse {
  success: false;
  message: string;
  path: string;
  method: string;
  timestamp: string;
  statusCode: HttpStatusCode;
  availableEndpoints: {
    auth: string[];
    jokes: string[];
    system: string[];
  };
}

/**
 * Middleware para rotas não encontradas
 * Retorna informações úteis sobre endpoints disponíveis
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  
  console.log(`🔍 NotFound - Route not found: ${req.method} ${req.originalUrl}`, {
    timestamp,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    headers: req.headers
  });

  const response: NotFoundResponse = {
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp,
    statusCode: 404,
    availableEndpoints: {
      auth: [
        'POST /api/auth/login',
        'POST /api/auth/logout', 
        'GET /api/auth/me',
        'POST /api/auth/refresh',
        'POST /api/auth/validate'
      ],
      jokes: [
        'GET /api/jokes/random',
        'GET /api/jokes/multiple',
        'GET /api/jokes/stats',
        'GET /api/jokes/health'
      ],
      system: [
        'GET /',
        'GET /health',
        'GET /api/logs'
      ]
    }
  };

  res.status(404).json(response);
};
