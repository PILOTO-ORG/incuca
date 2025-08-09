import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  AuthService as IAuthService, 
  LoginResponse, 
  JwtPayload, 
  User 
} from '@/types';
import { jwtConfig } from '@/config';

export class AuthService implements IAuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Authenticates a user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log(`🔐 AuthService.login - Attempting login for email: ${email}`);
    
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log(`❌ AuthService.login - User not found: ${email}`);
        throw new Error('Invalid credentials');
      }

      if (!user.active) {
        console.log(`❌ AuthService.login - User inactive: ${email}`);
        throw new Error('Account is inactive');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`❌ AuthService.login - Invalid password for: ${email}`);
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const { token, refreshToken } = await this.generateTokens(user.id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      // Map Prisma fields to interface fields
      const userResponse: Omit<User, 'password'> = {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        active: userWithoutPassword.active,
        createdAt: userWithoutPassword.createdAt,
        updatedAt: userWithoutPassword.updatedAt
      };

      console.log(`✅ AuthService.login - Login successful for: ${email}`);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
          refreshToken
        }
      };
    } catch (error) {
      console.error(`🚨 AuthService.login - Error:`, error);
      throw error;
    }
  }

  /**
   * Generates access and refresh tokens for a user
   */
  async generateTokens(userId: number): Promise<{ token: string; refreshToken: string }> {
    console.log(`🎫 AuthService.generateTokens - Generating tokens for user: ${userId}`);
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
        id: user.id,
        email: user.email
      };

      const token = (jwt as any).sign(
        payload, 
        jwtConfig.secret, 
        {
          expiresIn: jwtConfig.expiresIn,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        }
      );

      const refreshToken = (jwt as any).sign(
        payload, 
        jwtConfig.refreshSecret, 
        {
          expiresIn: jwtConfig.refreshExpiresIn,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        }
      );

      console.log(`✅ AuthService.generateTokens - Tokens generated for user: ${userId}`);
      
      return { token, refreshToken };
    } catch (error) {
      console.error(`🚨 AuthService.generateTokens - Error:`, error);
      throw error;
    }
  }

  /**
   * Verifies and decodes a JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    console.log(`🔍 AuthService.verifyToken - Verifying token`);
    
    try {
      const decoded = (jwt as any).verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as JwtPayload;

      console.log(`✅ AuthService.verifyToken - Token verified for user: ${decoded.id}`);
      return decoded;
    } catch (error) {
      console.error(`🚨 AuthService.verifyToken - Error:`, error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Refreshes an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    console.log(`🔄 AuthService.refreshToken - Refreshing token`);
    
    try {
      const decoded = (jwt as any).verify(refreshToken, jwtConfig.refreshSecret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as JwtPayload;

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, active: true }
      });

      if (!user || !user.active) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(decoded.id);
      
      console.log(`✅ AuthService.refreshToken - Token refreshed for user: ${decoded.id}`);
      return tokens;
    } catch (error) {
      console.error(`🚨 AuthService.refreshToken - Error:`, error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Validates if a user exists and is active
   */
  async validateUser(userId: number): Promise<Omit<User, 'password'> | null> {
    console.log(`👤 AuthService.validateUser - Validating user: ${userId}`);
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user || !user.active) {
        console.log(`❌ AuthService.validateUser - User not found or inactive: ${userId}`);
        return null;
      }

      console.log(`✅ AuthService.validateUser - User validated: ${userId}`);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error(`🚨 AuthService.validateUser - Error:`, error);
      return null;
    }
  }
}
