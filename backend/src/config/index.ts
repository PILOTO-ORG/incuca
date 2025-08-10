import dotenv from 'dotenv';
import { EnvironmentConfig } from '../types';

// Load environment variables
dotenv.config();

/**
 * Validates that a required environment variable is present
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Gets an environment variable with a default value
 */
function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Gets a number environment variable with a default value
 */
function getEnvNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
}

/**
 * Application configuration object
 */
export const config: EnvironmentConfig = {
  NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
  PORT: getEnvNumber('PORT', 8000),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET', 'your-refresh-secret-here'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '1h'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  INITIAL_USER_EMAIL: requireEnv('INITIAL_USER_EMAIL'),
  INITIAL_USER_PASSWORD: requireEnv('INITIAL_USER_PASSWORD'),
  GEEK_JOKES_API_URL: getEnv('GEEK_JOKES_API_URL', 'https://geek-jokes.sameerkumar.website/api'),
  LOG_LEVEL: (process.env.LOG_LEVEL as EnvironmentConfig['LOG_LEVEL']) || 'info'
};

/**
 * Database configuration
 */
export const databaseConfig = {
  url: config.DATABASE_URL,
  ssl: config.NODE_ENV === 'production',
  logging: config.NODE_ENV === 'development'
};

/**
 * JWT configuration
 */
export const jwtConfig = {
  secret: config.JWT_SECRET,
  refreshSecret: config.JWT_REFRESH_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
  refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
  issuer: 'incuca-api',
  audience: 'incuca-frontend'
};

/**
 * Server configuration
 */
export const serverConfig = {
  port: config.PORT,
  cors: {
    origin: config.NODE_ENV === 'production' 
      ? ['https://incuca.com.br'] 
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  helmet: {
    contentSecurityPolicy: config.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.NODE_ENV === 'production' ? 100 : 1000, // requests per window
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED'
    }
  }
};

/**
 * Logging configuration
 */
export const loggingConfig = {
  level: config.LOG_LEVEL,
  format: config.NODE_ENV === 'production' ? 'json' : 'combined',
  includeUserAgent: true,
  includeResponseTime: true
};

/**
 * External API configuration      // Cache the joke for future use
      await this.cacheJoke(joke);
      

 */
export const externalApiConfig = {
  geekJokes: {
    baseUrl: config.GEEK_JOKES_API_URL,
    timeout: 5000,
    retries: 3
  }
};

/**
 * Validates the configuration on startup
 */
export function validateConfig(): void {
  console.log('🔧 Validating configuration...');
  
  // Validate required fields
  const requiredFields: (keyof EnvironmentConfig)[] = [
    'DATABASE_URL',
    'JWT_SECRET',
    'INITIAL_USER_EMAIL',
    'INITIAL_USER_PASSWORD'
  ];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Configuration validation failed: ${field} is required`);
    }
  }
  
  // Validate JWT secret strength
  if (config.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long for better security');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.INITIAL_USER_EMAIL)) {
    throw new Error('Configuration validation failed: INITIAL_USER_EMAIL must be a valid email address');
  }
  
  // Validate password strength
  if (config.INITIAL_USER_PASSWORD.length < 8) {
    throw new Error('Configuration validation failed: INITIAL_USER_PASSWORD must be at least 8 characters long');
  }
  
  console.log('✅ Configuration validation passed');
}

export default config;
