import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { JokeService } from '../services/jokeService';
import { responseUtils, validationUtils } from '../utils';

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
 * Buscar piadas favoritas do usuário autenticado
 */
export const getFavoriteJokes = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log('⭐ JokeController.getFavoriteJokes - Favorite jokes request started');
  
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json(responseUtils.error('Usuário não autenticado'));
    }

    console.log(`🔍 JokeController.getFavoriteJokes - Fetching favorites for user ${userId}`);

    const favorites = await jokeService.getUserFavorites(userId);

    console.log(`✅ JokeController.getFavoriteJokes - Found ${favorites.length} favorites`);

    res.json(responseUtils.success('Piadas favoritas encontradas', {
      favorites,
      count: favorites.length,
      timestamp: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.getFavoriteJokes - Error:', error.message);
    next(error);
  }
};

/**
 * Favoritar uma piada
 */
export const favoriteJoke = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log('💖 JokeController.favoriteJoke - Favorite joke request started');
  
  try {
    const userId = (req as any).user?.id;
    const { joke, jokeId } = req.body;
    
    if (!userId) {
      return res.status(401).json(responseUtils.error('Usuário não autenticado'));
    }

    if (!joke) {
      return res.status(400).json(responseUtils.error('Piada é obrigatória'));
    }

    console.log(`⭐ JokeController.favoriteJoke - Adding favorite for user ${userId}`);

    await jokeService.favoriteJoke(userId, joke, jokeId);

    console.log('✅ JokeController.favoriteJoke - Joke favorited successfully');

    res.json(responseUtils.success('Piada adicionada aos favoritos', {
      joke,
      timestamp: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.favoriteJoke - Error:', error.message);
    
    if (error.message === 'Piada já está nos favoritos') {
      return res.status(409).json(responseUtils.error(error.message));
    }
    
    next(error);
  }
};

/**
 * Desfavoritar uma piada
 */
export const unfavoriteJoke = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log('💔 JokeController.unfavoriteJoke - Unfavorite joke request started');
  
  try {
    const userId = (req as any).user?.id;
    const { joke } = req.body;
    
    if (!userId) {
      return res.status(401).json(responseUtils.error('Usuário não autenticado'));
    }

    if (!joke) {
      return res.status(400).json(responseUtils.error('Piada é obrigatória'));
    }

    console.log(`❌ JokeController.unfavoriteJoke - Removing favorite for user ${userId}`);

    await jokeService.unfavoriteJoke(userId, joke);

    console.log('✅ JokeController.unfavoriteJoke - Joke unfavorited successfully');

    res.json(responseUtils.success('Piada removida dos favoritos', {
      joke,
      timestamp: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.unfavoriteJoke - Error:', error.message);
    
    if (error.message === 'Piada não encontrada nos favoritos') {
      return res.status(404).json(responseUtils.error(error.message));
    }
    
    next(error);
  }
};

/**
 * Verificar se uma piada está nos favoritos
 */
export const checkJokeFavorite = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log('🔍 JokeController.checkJokeFavorite - Check favorite status request started');
  
  try {
    const userId = (req as any).user?.id;
    const { joke } = req.body;
    
    if (!userId) {
      return res.status(401).json(responseUtils.error('Usuário não autenticado'));
    }

    if (!joke) {
      return res.status(400).json(responseUtils.error('Piada é obrigatória'));
    }

    console.log(`🔍 JokeController.checkJokeFavorite - Checking favorite status for user ${userId}`);

    const isFavorited = await jokeService.isJokeFavorited(userId, joke);

    console.log(`✅ JokeController.checkJokeFavorite - Favorite status: ${isFavorited}`);

    res.json(responseUtils.success('Status verificado', {
      joke,
      isFavorited,
      timestamp: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.checkJokeFavorite - Error:', error.message);
    next(error);
  }
};

/**
 * Compartilhar piada via WhatsApp
 */
export const shareJoke = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log('📱 JokeController.shareJoke - Share joke request started');
  
  try {
    const { joke } = req.body;
    
    if (!joke) {
      return res.status(400).json(responseUtils.error('Piada é obrigatória'));
    }

    console.log('📤 JokeController.shareJoke - Generating WhatsApp share link');

    const whatsappUrl = await jokeService.shareJokeViaWhatsApp(joke);

    console.log('✅ JokeController.shareJoke - Share link generated successfully');

    res.json(responseUtils.success('Link do WhatsApp gerado', {
      joke,
      whatsappUrl,
      message: 'Abra o link para compartilhar a piada no WhatsApp',
      timestamp: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('🚨 JokeController.shareJoke - Error:', error.message);
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
