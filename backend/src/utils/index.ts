/**
 * Application Utilities
 *
 * Funções utilitárias reutilizáveis para toda a aplicação
 * Implementa princípios DRY e single responsibility
 *
 * @author Incuca Team
 * @version 1.0.0
 */

import crypto from 'crypto';
import { ApiResponse } from '@/types';

/**
 * Response Utilities
 * Funções para padronizar respostas da API
 */
export const responseUtils = {
  /**
   * Cria resposta de sucesso padronizada
   * @param message - Mensagem de sucesso
   * @param data - Dados da resposta
   * @param meta - Metadados adicionais
   * @returns Resposta formatada
   */
  success: <T = any>(message: string, data?: T, meta: any = null): ApiResponse<T> => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  }),

  /**
   * Cria resposta de erro padronizada
   * @param message - Mensagem de erro
   * @param details - Detalhes do erro
   * @param code - Código de erro personalizado
   * @returns Resposta formatada
   */
  error: (message: string, details: any = null, code: string | null = null): ApiResponse => ({
    success: false,
    message,
    error: details || code || message,
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  }),

  /**
   * Cria resposta paginada padronizada
   * @param items - Itens da página atual
   * @param page - Página atual
   * @param limit - Itens por página
   * @param total - Total de itens
   * @param message - Mensagem de sucesso
   * @returns Resposta paginada
   */
  paginated: <T = any>(
    items: T[], 
    page: number, 
    limit: number, 
    total: number, 
    message: string = 'Dados obtidos com sucesso'
  ): ApiResponse<T[]> & { pagination: any } => ({
    success: true,
    message,
    data: items,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1
    },
    timestamp: new Date().toISOString(),
    path: '',
    method: ''
  })
};

/**
 * Date Utilities
 * Funções para manipulação de datas
 */
export const dateUtils = {
  /**
   * Adiciona minutos a uma data
   */
  addMinutes: (date: Date, minutes: number): Date => {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  },

  /**
   * Adiciona horas a uma data
   */
  addHours: (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },

  /**
   * Adiciona dias a uma data
   */
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Verifica se uma data é válida
   */
  isValidDate: (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  },

  /**
   * Formata data para string ISO
   */
  toISOString: (date: Date): string | null => {
    if (!dateUtils.isValidDate(date)) return null;
    return date.toISOString();
  },

  /**
   * Calcula diferença em minutos entre duas datas
   */
  diffInMinutes: (date1: Date, date2: Date): number => {
    return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60);
  }
};

/**
 * String Utilities
 * Funções para manipulação de strings
 */
export const stringUtils = {
  /**
   * Gera string aleatória
   */
  randomString: (
    length: number = 32, 
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  },

  /**
   * Capitaliza primeira letra
   */
  capitalize: (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Converte para camelCase
   */
  toCamelCase: (str: string): string => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  },

  /**
   * Trunca string
   */
  truncate: (str: string, maxLength: number = 100, suffix: string = '...'): string => {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Remove caracteres especiais
   */
  sanitize: (str: string): string => {
    if (!str) return str;
    return str.replace(/[<>"/\\&]/g, '');
  },

  /**
   * Verifica se string é email válido
   */
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

/**
 * Crypto Utilities
 * Funções para criptografia e hash
 */
export const cryptoUtils = {
  /**
   * Gera hash SHA256
   */
  sha256: (data: string): string => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  /**
   * Gera UUID v4
   */
  uuid: (): string => {
    return crypto.randomUUID();
  },

  /**
   * Gera token aleatório
   */
  randomToken: (bytes: number = 32): string => {
    return crypto.randomBytes(bytes).toString('hex');
  },

  /**
   * Compara strings de forma segura (timing-safe)
   */
  safeCompare: (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
};

/**
 * Validation Utilities
 * Funções para validação de dados
 */
export const validationUtils = {
  /**
   * Verifica se valor está vazio
   */
  isEmpty: (value: any): boolean => {
    return value === null ||
           value === undefined ||
           value === '' ||
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  },

  /**
   * Verifica se é número válido
   */
  isNumber: (value: any): value is number => {
    return typeof value === 'number' && !isNaN(value);
  },

  /**
   * Verifica se é inteiro válido
   */
  isInteger: (value: any): value is number => {
    return Number.isInteger(value);
  },

  /**
   * Verifica se está dentro de um range
   */
  isInRange: (value: number, min: number, max: number): boolean => {
    return validationUtils.isNumber(value) && value >= min && value <= max;
  }
};

/**
 * Array Utilities
 * Funções para manipulação de arrays
 */
export const arrayUtils = {
  /**
   * Remove duplicatas de array
   */
  unique: <T>(arr: T[]): T[] => {
    return [...new Set(arr)];
  },

  /**
   * Embaralha array
   */
  shuffle: <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i];
      result[i] = result[j] as T;
      result[j] = temp as T;
    }
    return result;
  },

  /**
   * Divide array em chunks
   */
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
};

/**
 * Async Utilities
 * Funções para operações assíncronas
 */
export const asyncUtils = {
  /**
   * Delay assíncrono
   */
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Retry com backoff exponencial
   */
  retryWithBackoff: async <T>(
    fn: () => Promise<T>, 
    maxRetries: number = 3, 
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await asyncUtils.delay(delay);
      }
    }
    
    throw lastError!;
  },

  /**
   * Timeout para promises
   */
  withTimeout: <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((resolve, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  }
};

/**
 * Função auxiliar para criar resposta da API
 */
export const createApiResponse = <T = any>(
  success: boolean,
  message: string,
  data?: T,
  error?: string
): ApiResponse<T> => ({
  success,
  message,
  data,
  error,
  timestamp: new Date().toISOString(),
  path: '',
  method: ''
});

// Export default com todas as utilidades
export default {
  responseUtils,
  dateUtils,
  stringUtils,
  cryptoUtils,
  validationUtils,
  arrayUtils,
  asyncUtils,
  createApiResponse
};
