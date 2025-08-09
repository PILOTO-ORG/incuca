import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { JokeService } from '@/services/jokeService';
import { responseUtils, validationUtils } from '@/utils';

const prisma = new PrismaClient();
const jokeService = new JokeService(prisma);

/**
 * JokeController
 * 
 * Controlador responsável por buscar e gerenciar piadas geek.
 * Integra com a API externa e implementa cache usando clean architecture.
 */

/**
 * Buscar uma piada aleatória
 */
export const getRandomJoke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('😂 JokeController.getRandomJoke - Random joke request started');
  
  try {
    console.log('🔍 JokeController.getRandomJoke - Fetching joke from service');

    const joke = await jokeService.getRandomJoke();

    console.log('📤 JokeController.getRandomJoke - Sending joke response');
    
    res.json(responseUtils.success('Piada encontrada com sucesso', {
      joke,
      timestamp: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.getRandomJoke - Error:', error.message);
    next(error);
  }
};

/**
 * Buscar múltiplas piadas
 */
export const getMultipleJokes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('😂 JokeController.getMultipleJokes - Multiple jokes request started');
  
  try {
    const count = Math.min(Math.max(parseInt(req.query.count as string) || 3, 1), 10);
    console.log(`🔢 JokeController.getMultipleJokes - Fetching ${count} jokes`);

    const jokes: string[] = [];

    for (let i = 0; i < count; i++) {
      console.log(`🔍 JokeController.getMultipleJokes - Fetching joke ${i + 1}/${count}`);
      const joke = await jokeService.getRandomJoke();
      jokes.push(joke);
    }

    console.log(`✅ JokeController.getMultipleJokes - Successfully fetched ${jokes.length} jokes`);

    res.json(responseUtils.success('Piadas encontradas com sucesso', {
      jokes,
      count: jokes.length,
      timestamp: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.getMultipleJokes - Error:', error.message);
    next(error);
  }
};

/**
 * Buscar estatísticas de piadas
 */
export const getJokeStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('📊 JokeController.getJokeStats - Stats request started');
  
  try {
    console.log('🔍 JokeController.getJokeStats - Fetching stats from service');

    const stats = await jokeService.getJokeStats();

    // Adicionar informações extras
    const enhancedStats = {
      ...stats,
      lastUpdate: new Date().toISOString(),
      apiStatus: await checkAPIStatus()
    };

    console.log('📤 JokeController.getJokeStats - Sending stats response');

    res.json(responseUtils.success('Estatísticas obtidas com sucesso', enhancedStats));
  } catch (error: any) {
    console.error('🚨 JokeController.getJokeStats - Error:', error.message);
    next(error);
  }
};

/**
 * Limpar cache expirado
 */
export const clearExpiredCache = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('🗑️ JokeController.clearExpiredCache - Cache cleanup request started');
  
  try {
    console.log('🔍 JokeController.clearExpiredCache - Cleaning expired jokes');

    const deletedCount = await jokeService.cleanExpiredJokes();

    console.log(`✅ JokeController.clearExpiredCache - Cleaned ${deletedCount} expired jokes`);

    res.json(responseUtils.success('Cache limpo com sucesso', {
      deletedCount,
      timestamp: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.clearExpiredCache - Error:', error.message);
    next(error);
  }
};

/**
 * Buscar piadas favoritas (funcionalidade futura)
 */
export const getFavoriteJokes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('⭐ JokeController.getFavoriteJokes - Favorite jokes request started');
  
  try {
    // Implementação futura - por enquanto retorna lista vazia
    console.log('💡 JokeController.getFavoriteJokes - Feature not implemented yet');

    res.json(responseUtils.success('Funcionalidade em desenvolvimento', {
      favorites: [],
      message: 'Em breve você poderá favoritar suas piadas preferidas!'
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.getFavoriteJokes - Error:', error.message);
    next(error);
  }
};

/**
 * Buscar piadas por categoria (funcionalidade futura)
 */
export const getJokesByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('📂 JokeController.getJokesByCategory - Category jokes request started');
  
  try {
    const category = req.params.category;
    console.log(`🏷️ JokeController.getJokesByCategory - Requested category: ${category}`);

    // Implementação futura - por enquanto retorna piada aleatória
    const joke = await jokeService.getRandomJoke();

    res.json(responseUtils.success(`Piada da categoria "${category}"`, {
      joke,
      category,
      note: 'Categorização em desenvolvimento - retornando piada aleatória'
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.getJokesByCategory - Error:', error.message);
    next(error);
  }
};

/**
 * Health check para verificar se o serviço de piadas está funcionando
 */
export const healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('🏥 JokeController.healthCheck - Health check request started');
  
  try {
    const apiStatus = await checkAPIStatus();
    const stats = await jokeService.getJokeStats();
    
    const health = {
      status: apiStatus ? 'healthy' : 'degraded',
      externalApiStatus: apiStatus,
      cacheStatus: stats.cached > 0 ? 'healthy' : 'empty',
      totalCachedJokes: stats.cached,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ JokeController.healthCheck - Service status: ${health.status}`);

    res.json(responseUtils.success('Health check completed', health));
  } catch (error: any) {
    console.error('🚨 JokeController.healthCheck - Error:', error.message);
    next(error);
  }
};

/**
 * Função auxiliar para verificar status da API externa
 */
async function checkAPIStatus(): Promise<boolean> {
  try {
    console.log('🌐 JokeController.checkAPIStatus - Checking external API status');
    
    // Simular check da API externa (implementação simplificada)
    // Em produção, faria uma requisição real para a API
    const { externalApiConfig } = await import('@/config');
    
    // Por enquanto retorna true - implementação completa seria fazer uma requisição real
    return true;
  } catch (error) {
    console.error('🚨 JokeController.checkAPIStatus - Error:', error);
    return false;
  }
}
