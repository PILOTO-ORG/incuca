import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HttpStatusCode } from '@/types';

/**
 * Validation Middleware
 *
 * Middleware genérico para validação de dados usando Joi
 * Implementa validação consistente em toda a aplicação
 */

interface ValidationError {
  type?: 'body' | 'query' | 'params';
  field: string;
  message: string;
  value?: any;
}

interface ValidationErrorResponse {
  success: false;
  message: string;
  details: {
    errors: ValidationError[];
    receivedFields?: string[];
    receivedParams?: string[];
    receivedData?: {
      body: string[];
      query: string[];
      params: string[];
    };
  };
  timestamp: string;
}

const HTTP_STATUS = {
  BAD_REQUEST: 400 as HttpStatusCode
};

/**
 * Cria resposta de erro padronizada
 */
const createErrorResponse = (message: string, details: any = null): ValidationErrorResponse => ({
  success: false,
  message,
  details,
  timestamp: new Date().toISOString()
});

/**
 * Middleware de validação para request body
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros
      stripUnknown: true, // Remove campos não definidos no schema
      convert: true // Converte tipos automaticamente
    });

    if (error) {
      const errorDetails: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      console.log('❌ Body validation failed:', errorDetails);

      res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse('Dados de entrada inválidos', {
          errors: errorDetails,
          receivedFields: Object.keys(req.body || {})
        })
      );
      return;
    }

    // Substituir req.body pelos dados validados e sanitizados
    req.body = value;
    next();
  };
};

/**
 * Middleware de validação para query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorDetails: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      console.log('❌ Query validation failed:', errorDetails);

      res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse('Parâmetros de consulta inválidos', {
          errors: errorDetails,
          receivedParams: Object.keys(req.query || {})
        })
      );
      return;
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware de validação para route parameters
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorDetails: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      console.log('❌ Params validation failed:', errorDetails);

      res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse('Parâmetros de rota inválidos', {
          errors: errorDetails,
          receivedParams: Object.keys(req.params || {})
        })
      );
      return;
    }

    req.params = value;
    next();
  };
};

/**
 * Interface para schemas de validação combinada
 */
interface ValidationSchemas {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

/**
 * Middleware combinado de validação (body + query + params)
 */
export const validate = (schemas: ValidationSchemas = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    // Validar body se schema fornecido
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'body' as const,
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.body = value;
      }
    }

    // Validar query se schema fornecido
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'query' as const,
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.query = value;
      }
    }

    // Validar params se schema fornecido
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'params' as const,
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })));
      } else {
        req.params = value;
      }
    }

    if (errors.length > 0) {
      console.log('❌ Validation failed:', errors);

      res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse('Dados de entrada inválidos', {
          errors,
          receivedData: {
            body: Object.keys(req.body || {}),
            query: Object.keys(req.query || {}),
            params: Object.keys(req.params || {})
          }
        })
      );
      return;
    }

    next();
  };
};
