import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { externalApiConfig } from '@/config';

export interface Joke {
  id?: number;
  joke: string;
  translatedJoke?: string;
}

export class JokeService {
  private static readonly WHATSAPP_PHONE = '5548998589586'; // Formato internacional

  constructor(private prisma: PrismaClient) {}

  /**
   * Fetches a random joke from external API and translates it to Portuguese
   */
  async getRandomJoke(): Promise<string> {
    console.log('😄 JokeService.getRandomJoke - Fetching random joke from external API');
    
    try {
      // Always fetch from external API
      const response = await axios.get(externalApiConfig.geekJokes.baseUrl, {
        timeout: externalApiConfig.geekJokes.timeout,
        headers: {
          'User-Agent': 'Incuca-Geek-Jokes/1.0',
          'Accept': 'application/json'
        }
      });

      console.log('🌐 External API response:', response.data);

      // Extract joke from response
      let originalJoke = '';
      if (typeof response.data === 'string') {
        originalJoke = response.data;
      } else if (response.data && response.data.joke) {
        originalJoke = response.data.joke;
      } else if (response.data && typeof response.data === 'object') {
        // Handle different response formats
        originalJoke = response.data.text || response.data.value || JSON.stringify(response.data);
      } else {
        throw new Error('Invalid API response format');
      }

      if (!originalJoke || originalJoke.trim() === '') {
        throw new Error('Empty joke received from API');
      }

      console.log('📝 Original joke:', originalJoke);

      // Translate joke to Portuguese
      const translatedJoke = await this.translateJoke(originalJoke);
      
      console.log('🇧🇷 Translated joke:', translatedJoke);

      // Cache the translated joke
      await this.cacheJoke(originalJoke, translatedJoke);
      
      return translatedJoke;
    } catch (error) {
      console.error('🚨 JokeService.getRandomJoke - Error:', error);
      
      // Fallback to cached joke if external API fails
      const fallbackJoke = await this.getFallbackJoke();
      if (fallbackJoke) {
        console.log('🔄 Using fallback joke');
        return fallbackJoke;
      }
      
      // Ultimate fallback with a Portuguese joke
      return 'Por que os programadores preferem o modo escuro? Porque a luz atrai bugs! 🐛';
    }
  }

  /**
   * Translates a joke to Portuguese using MyMemory Translation API (free)
   */
  private async translateJoke(joke: string): Promise<string> {
    console.log('🌐 Translating joke to Portuguese using MyMemory API');
    
    try {
      // First, try MyMemory API (free Google Translate alternative)
      const translationResponse = await axios.get('https://api.mymemory.translated.net/get', {
        params: {
          q: joke,
          langpair: 'en|pt',
          de: 'incuca@jokes.com' // Optional email for better rate limits
        },
        timeout: 10000
      });

      if (translationResponse.data && 
          translationResponse.data.responseStatus === 200 && 
          translationResponse.data.responseData && 
          translationResponse.data.responseData.translatedText) {
        
        let translatedText = translationResponse.data.responseData.translatedText;
        
        console.log('✅ Translation successful via MyMemory API');
        console.log('Original:', joke);
        console.log('Translated:', translatedText);
        
        return translatedText;
      }
    } catch (error) {
      console.error('❌ MyMemory API failed:', error instanceof Error ? error.message : String(error));
    }

    // Fallback: Try LibreTranslate (if available)
    try {
      console.log('🔄 Trying LibreTranslate API as fallback');
      
      const libreResponse = await axios.post('https://libretranslate.de/translate', {
        q: joke,
        source: 'en',
        target: 'pt',
        format: 'text'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (libreResponse.data && libreResponse.data.translatedText) {
        let translatedText = libreResponse.data.translatedText;
        
        console.log('✅ Translation successful via LibreTranslate');
        console.log('Original:', joke);
        console.log('Translated:', translatedText);
        
        return translatedText;
      }
    } catch (error) {
      console.error('❌ LibreTranslate API failed:', error instanceof Error ? error.message : String(error));
    }

    // Final fallback: Return original joke with Portuguese prefix
    console.log('🔄 Using original joke as final fallback');
    return `Piada (original): ${joke} 🤖`;
  }

  /**
   * Caches a joke in the database
   */
  private async cacheJoke(originalJoke: string, translatedJoke: string): Promise<void> {
    try {
      console.log('💾 Caching translated joke');
      
      // Por enquanto, não fazemos cache até migração completa
      console.log('📝 Cache temporariamente desabilitado durante migração');
      
      console.log('✅ Joke cached successfully (skipped)');
    } catch (error) {
      console.error('🚨 Error caching joke:', error);
      // Don't throw error for caching failures
    }
  }

  /**
   * Gets a fallback joke from cache
   */
  private async getFallbackJoke(): Promise<string | null> {
    try {
      console.log('🔍 Looking for fallback joke in cache');
      
      // Retornar piada padrão enquanto cache está em migração
      console.log('📝 Cache temporariamente indisponível durante migração');
      return 'Por que os programadores preferem o modo escuro? Porque a luz atrai bugs! 🐛';
    } catch (error) {
      console.error('🚨 Error getting fallback joke:', error);
      return 'Por que os programadores preferem o modo escuro? Porque a luz atrai bugs! 🐛';
    }
  }

  /**
   * Favoritar uma piada para um usuário
   */
  async favoriteJoke(userId: number, joke: string, jokeId?: string): Promise<void> {
    try {
      console.log(`⭐ Favoritando piada para usuário ${userId}`);
      
      // TODO: Implementar após migração completa do schema
      console.log('📝 Funcionalidade em desenvolvimento - schema em migração');
      throw new Error('Funcionalidade temporariamente indisponível');
      
      console.log('✅ Piada favoritada com sucesso');
    } catch (error: any) {
      console.error('🚨 Erro ao favoritar piada:', error);
      throw error;
    }
  }

  /**
   * Desfavoritar uma piada
   */
  async unfavoriteJoke(userId: number, joke: string): Promise<void> {
    try {
      console.log(`❌ Desfavoritando piada para usuário ${userId}`);
      
      // TODO: Implementar após migração completa do schema
      console.log('📝 Funcionalidade em desenvolvimento - schema em migração');
      throw new Error('Funcionalidade temporariamente indisponível');
      
      console.log('✅ Piada removida dos favoritos');
    } catch (error) {
      console.error('🚨 Erro ao desfavoritar piada:', error);
      throw error;
    }
  }

  /**
   * Listar piadas favoritas do usuário
   */
  async getUserFavorites(userId: number): Promise<Joke[]> {
    try {
      console.log(`📋 Buscando favoritos do usuário ${userId}`);
      
      // TODO: Implementar após migração completa do schema
      console.log('📝 Funcionalidade em desenvolvimento - schema em migração');
      
      // Retornar lista vazia temporariamente
      const jokes: Joke[] = [];
      
      console.log(`✅ Encontrados ${jokes.length} favoritos`);
      return jokes;
    } catch (error) {
      console.error('🚨 Erro ao buscar favoritos:', error);
      throw error;
    }
  }

  /**
   * Verificar se uma piada está nos favoritos
   */
  async isJokeFavorited(userId: number, joke: string): Promise<boolean> {
    try {
      // TODO: Implementar após migração completa do schema
      console.log('📝 Funcionalidade em desenvolvimento - schema em migração');
      return false;
    } catch (error) {
      console.error('🚨 Erro ao verificar favorito:', error);
      return false;
    }
  }

  /**
   * Compartilhar piada via WhatsApp
   */
  async shareJokeViaWhatsApp(joke: string): Promise<string> {
    try {
      console.log('📱 Gerando link do WhatsApp para compartilhar piada');
      
      const messageText = `🤣 Confira essa piada:\n\n${joke}\n\n📱 Enviado pelo App Incuca`;
      const encodedMessage = encodeURIComponent(messageText);
      
      // URL para abrir WhatsApp com mensagem pré-definida
      const whatsappUrl = `https://wa.me/${JokeService.WHATSAPP_PHONE}?text=${encodedMessage}`;
      
      console.log('✅ Link do WhatsApp gerado com sucesso');
      return whatsappUrl;
    } catch (error) {
      console.error('🚨 Erro ao gerar link do WhatsApp:', error);
      throw new Error('Erro ao compartilhar via WhatsApp');
    }
  }

  /**
   * Cleans up expired cached jokes
   */
  async cleanExpiredJokes(): Promise<number> {
    console.log('🧹 JokeService.cleanExpiredJokes - Cleaning expired jokes');
    
    try {
      // Cleanup temporariamente desabilitado durante migração
      console.log('📝 Cleanup temporariamente desabilitado durante migração');
      
      console.log(`✅ JokeService.cleanExpiredJokes - Cleaned 0 expired jokes (skipped)`);
      return 0;
    } catch (error) {
      console.error('🚨 JokeService.cleanExpiredJokes - Error:', error);
      return 0;
    }
  }

  /**
   * Gets joke statistics
   */
  async getJokeStats(): Promise<{
    total: number;
    translated: number;
    cached: number;
    favorites: number;
  }> {
    try {
      console.log('📊 Getting joke statistics');
      
      // Estatísticas simplificadas durante migração
      const total = 0; // await this.prisma.jokeCache.count();
      const cached = 0;
      const favorites = 0;
      const translated = 0;

      console.log(`📈 Stats - Total: ${total}, Translated: ${translated}, Cached: ${cached}, Favorites: ${favorites}`);
      
      return { total, translated, cached, favorites };
    } catch (error) {
      console.error('🚨 Error getting joke stats:', error);
      return { total: 0, translated: 0, cached: 0, favorites: 0 };
    }
  }

  /**
   * Health check for the joke service
   */
  async healthCheck(): Promise<{
    status: string;
    externalApi: boolean;
    database: boolean;
    lastJoke?: string;
  }> {
    console.log('🏥 Performing joke service health check');
    
    let externalApi = false;
    let database = false;
    let lastJoke: string | undefined;

    // Test external API
    try {
      const response = await axios.get(externalApiConfig.geekJokes.baseUrl, {
        timeout: 5000
      });
      externalApi = !!response.data;
    } catch (error) {
      console.error('External API health check failed:', error);
    }

    // Test database
    try {
      const count = await this.prisma.jokeCache.count();
      database = true;
      
      // Get last cached joke
      const last = await this.prisma.jokeCache.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      if (last) {
        lastJoke = last.joke.substring(0, 100) + '...';
      }
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    const status = externalApi && database ? 'healthy' : 'unhealthy';
    
    console.log(`🏥 Health check result: ${status}`);
    
    return {
      status,
      externalApi,
      database,
      lastJoke
    };
  }
}
