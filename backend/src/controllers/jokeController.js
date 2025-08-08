const axios = require('axios')
const NodeCache = require('node-cache')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Cache em memória com TTL de 1 hora
const cache = new NodeCache({ 
  stdTTL: parseInt(process.env.CACHE_TTL) || 3600,
  checkperiod: 120
})

/**
 * JokeController
 * 
 * Controlador responsável por buscar e gerenciar piadas geek.
 * Integra com a API externa e implementa cache.
 */

/**
 * URL da API externa de piadas
 */
const GEEK_JOKES_API_URL = process.env.GEEK_JOKES_API_URL || 'https://geek-jokes.sameerkumar.website/api'

/**
 * Buscar uma piada aleatória
 */
const getRandomJoke = async (req, res, next) => {
  try {
    const cacheKey = `random_joke_${new Date().getHours()}`
    
    // Tentar buscar do cache primeiro
    let joke = cache.get(cacheKey)
    
    if (!joke) {
      joke = await fetchJokeFromAPI()
      if (joke) {
        cache.set(cacheKey, joke)
        // Salvar no banco para estatísticas
        await saveJokeToDatabase(joke)
      }
    }

    if (!joke) {
      joke = await getFallbackJoke()
    }

    res.json({
      success: true,
      message: 'Piada encontrada com sucesso',
      data: {
        joke,
        timestamp: new Date().toISOString(),
        cached: cache.has(cacheKey)
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * Buscar múltiplas piadas
 */
const getMultipleJokes = async (req, res, next) => {
  try {
    const count = Math.min(Math.max(parseInt(req.query.count) || 3, 1), 10)
    const jokes = []

    for (let i = 0; i < count; i++) {
      const joke = await fetchJokeFromAPI()
      if (joke) {
        jokes.push(joke)
        await saveJokeToDatabase(joke)
      }
    }

    // Se não conseguiu buscar nenhuma piada externa, usar fallback
    if (jokes.length === 0) {
      for (let i = 0; i < count; i++) {
        jokes.push(await getFallbackJoke())
      }
    }

    res.json({
      success: true,
      message: 'Piadas encontradas com sucesso',
      data: {
        jokes,
        count: jokes.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * Buscar estatísticas de piadas
 */
const getJokeStats = async (req, res, next) => {
  try {
    const statsKey = 'joke_stats'
    let stats = cache.get(statsKey)

    if (!stats) {
      // Buscar estatísticas do banco
      const totalJokes = await prisma.jokeCache.count()
      const todayJokes = await prisma.jokeCache.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })

      stats = {
        totalJokesFetched: totalJokes,
        todayJokes,
        apiStatus: await checkAPIStatus(),
        cacheHits: cache.getStats().hits || 0,
        cacheKeys: cache.keys().length,
        lastUpdate: new Date().toISOString()
      }

      cache.set(statsKey, stats, 300) // Cache por 5 minutos
    }

    res.json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: stats
    })

  } catch (error) {
    next(error)
  }
}

/**
 * Buscar piada da API externa
 */
const fetchJokeFromAPI = async () => {
  try {
    const response = await axios.get(GEEK_JOKES_API_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Incuca-Geek-Jokes-App/1.0'
      }
    })

    if (response.status === 200 && response.data) {
      // A API retorna texto direto ou objeto com propriedade 'joke'
      return typeof response.data === 'string' 
        ? response.data 
        : response.data.joke || response.data
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar piada da API externa:', error.message)
    return null
  }
}

/**
 * Piadas de fallback quando a API externa não funciona
 */
const getFallbackJoke = async () => {
  const fallbackJokes = [
    "Por que os programadores preferem dark mode? Porque light atrai bugs! 🐛",
    "Como você chama um algoritmo que não funciona? Um bug-ritmo! 🎵",
    "Por que o HTML foi ao psicólogo? Porque tinha problemas com suas tags! 🏷️",
    "O que o CSS disse para o HTML? Sem mim você não tem estilo! 💄",
    "Por que o JavaScript foi rejeitado? Porque era muito == e pouco ===! ⚖️",
    "Como um programador conserta um bug? Ele debug-a! 🔍",
    "Por que arrays começam em 0? Porque é o número de bugs que gostaríamos de ter! 🎯",
    "O que acontece quando você cruza um peixe com um elefante? Elephant.swim() is not a function! 🐘🐠"
  ]

  return fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)]
}

/**
 * Salvar piada no banco para estatísticas
 */
const saveJokeToDatabase = async (joke) => {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias

    await prisma.jokeCache.create({
      data: {
        joke,
        source: 'external_api',
        expiresAt
      }
    })
  } catch (error) {
    // Falha silenciosa para não afetar a resposta da API
    console.error('Erro ao salvar piada no banco:', error.message)
  }
}

/**
 * Verificar status da API externa
 */
const checkAPIStatus = async () => {
  try {
    const response = await axios.get(GEEK_JOKES_API_URL, { timeout: 5000 })
    return response.status === 200
  } catch (error) {
    return false
  }
}

/**
 * Limpar cache expirado (para uso em cronjobs)
 */
const clearExpiredCache = async () => {
  try {
    const deleted = await prisma.jokeCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    console.log(`🗑️ Cache limpo: ${deleted.count} registros removidos`)
    return deleted.count
  } catch (error) {
    console.error('Erro ao limpar cache:', error.message)
    return 0
  }
}

module.exports = {
  getRandomJoke,
  getMultipleJokes,
  getJokeStats,
  clearExpiredCache
}
