const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/**
 * Seed do banco de dados
 * Cria o usuário inicial conforme especificado no teste
 */
async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...')

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'cliente@incuca.com.br' }
    })

    if (existingUser) {
      console.log('👤 Usuário inicial já existe')
      return
    }

  // Hash da senha conforme especificado no .env
  const initPassword = process.env.INITIAL_USER_PASSWORD
  const password = initPassword || ''
  const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário inicial
    const initEmail = process.env.INITIAL_USER_EMAIL
    const user = await prisma.user.create({
      data: {
        email: initEmail || '',
        name: 'Cliente Incuca',
        password: hashedPassword,
        active: true
      }
    })

    console.log('✅ Usuário inicial criado:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Nome: ${user.name}`)
    console.log(`   ID: ${user.id}`)

    // Criar algumas piadas de exemplo no cache
    const sampleJokes = [
      "Por que os programadores preferem dark mode? Porque light atrai bugs! 🐛",
      "Como você chama um algoritmo que não funciona? Um bug-ritmo! 🎵",
    ]

    for (const joke of sampleJokes) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      await prisma.jokeCache.create({
        data: {
          joke,
          source: 'seed',
          expiresAt
        }
      })
    }

    console.log('✅ Piadas de exemplo criadas no cache')
    console.log('🎉 Seed concluído com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seed()
}

module.exports = { seed }
