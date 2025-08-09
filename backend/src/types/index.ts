import { Request } from 'express';

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  active?: boolean;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  active?: boolean;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: Omit<User, 'password'>;
    token: string;
    refreshToken: string;
  };
}

export interface JwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'password'>;
}

// Joke types
export interface Joke {
  id: number;
  joke: string;
  source: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface JokeApiResponse {
  joke: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
}

// Environment types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  INITIAL_USER_EMAIL: string;
  INITIAL_USER_PASSWORD: string;
  GEEK_JOKES_API_URL: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Service types
export interface JokeService {
  getRandomJoke(): Promise<string>;
  cacheJoke(joke: string): Promise<void>;
  getCachedJoke(): Promise<string | null>;
}

export interface AuthService {
  login(email: string, password: string): Promise<LoginResponse>;
  generateTokens(userId: number): Promise<{ token: string; refreshToken: string }>;
  verifyToken(token: string): Promise<JwtPayload>;
  refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }>;
}

export interface UserService {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: number, userData: UpdateUserData): Promise<User>;
  delete(id: number): Promise<void>;
}

// HTTP Response types
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503 | 504;

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  method: string;
  statusCode: HttpStatusCode;
}

// Middleware types
export interface LoggingContext {
  requestId: string;
  userId?: number;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  startTime: number;
}
