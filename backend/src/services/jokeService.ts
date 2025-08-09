import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { externalApiConfig } from '@/config';

export class JokeService {
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
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours
      
      await this.prisma.jokeCache.create({
        data: {
          joke: translatedJoke,
          source: 'external_api_translated',
          expiresAt
        }
      });
      
      console.log('✅ Joke cached successfully');
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
      
      const cachedJoke = await this.prisma.jokeCache.findFirst({
        where: {
          source: 'external_api_translated'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (cachedJoke) {
        console.log('✅ Found fallback joke in cache');
        return cachedJoke.joke;
      }

      console.log('❌ No fallback joke found');
      return null;
    } catch (error) {
      console.error('🚨 Error getting fallback joke:', error);
      return null;
    }
  }

  /**
   * Gets multiple jokes (for future use)
   */
  async getMultipleJokes(count: number = 3): Promise<string[]> {
    console.log(`😄 Getting ${count} jokes`);
    
    const jokes: string[] = [];
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      try {
        const joke = await this.getRandomJoke();
        jokes.push(joke);
        
        // Small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error getting joke ${i + 1}:`, error);
        break;
      }
    }
    
    return jokes;
  }

  /**
   * Cleans up expired cached jokes
   */
  async cleanExpiredJokes(): Promise<number> {
    console.log('🧹 JokeService.cleanExpiredJokes - Cleaning expired jokes');
    
    try {
      const result = await this.prisma.jokeCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      console.log(`✅ JokeService.cleanExpiredJokes - Cleaned ${result.count} expired jokes`);
      return result.count;
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
  }> {
    try {
      console.log('📊 Getting joke statistics');
      
      const now = new Date();
      
      const [total, translated, cached] = await Promise.all([
        this.prisma.jokeCache.count(),
        this.prisma.jokeCache.count({
          where: {
            source: 'external_api_translated'
          }
        }),
        this.prisma.jokeCache.count({
          where: {
            expiresAt: {
              gt: now
            }
          }
        })
      ]);

      console.log(`📈 Stats - Total: ${total}, Translated: ${translated}, Cached: ${cached}`);
      
      return { total, translated, cached };
    } catch (error) {
      console.error('🚨 Error getting joke stats:', error);
      return { total: 0, translated: 0, cached: 0 };
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
