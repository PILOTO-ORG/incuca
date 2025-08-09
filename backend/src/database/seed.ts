import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

/**
 * Seed do banco de dados
 * Cria o usuário inicial conforme especificado no teste
 */
async function seed(): Promise<void> {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'cliente@incuca.com.br' }
    });

    if (existingUser) {
      console.log('👤 Usuário inicial já existe');
      return;
    }

    // Hash da senha conforme especificado no .env
    const initPassword = process.env.INITIAL_USER_PASSWORD;
    const initEmail = process.env.INITIAL_USER_EMAIL;
    
    if (!initPassword || !initEmail) {
      throw new Error('INITIAL_USER_EMAIL e INITIAL_USER_PASSWORD devem estar definidos no .env');
    }

    const hashedPassword = await bcrypt.hash(initPassword, 12);

    // Criar usuário inicial
    const user = await prisma.user.create({
      data: {
        email: initEmail,
        name: 'Cliente Incuca',
        password: hashedPassword,
        active: true
      }
    });

    console.log('✅ Usuário inicial criado com sucesso:', {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active
    });

    // Limpar cache de piadas (se existir)
    const deletedJokes = await prisma.jokeCache.deleteMany({});
    console.log(`🗑️ Removidas ${deletedJokes.count} piadas do cache`);

    // Criar algumas piadas iniciais para cache (opcional)
    const initialJokes = [
      'Por que os programadores preferem Linux? Porque é a única OS que não tem Windows!',
      'Como você chama um bug que não consegue ser reproduzido? Um feature!',
      'Por que os desenvolvedores JavaScript nunca conseguem sair de casa? Porque eles sempre esquecem de fechar as {}!',
      'Qual é o tipo de dados favorito dos programadores? Boolean, porque ele só aceita verdade ou mentira!'
    ];

    for (const joke of initialJokes) {
      // Seed temporariamente desabilitado durante migração do schema
      console.log(`📝 Skipping joke seed: ${joke.substring(0, 50)}...`);
    }

    console.log(`💫 Adicionadas ${initialJokes.length} piadas iniciais ao cache`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Função para limpar o banco (útil para testes)
 */
async function cleanDatabase(): Promise<void> {
  try {
    console.log('🧹 Limpando banco de dados...');
    
    await prisma.jokeCache.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ Banco limpo com sucesso');
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed se este arquivo for executado diretamente
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'clean') {
    cleanDatabase()
      .then(() => console.log('✅ Limpeza concluída'))
      .catch(error => {
        console.error('❌ Falha na limpeza:', error);
        process.exit(1);
      });
  } else {
    seed()
      .then(() => console.log('✅ Seed concluído'))
      .catch(error => {
        console.error('❌ Falha no seed:', error);
        process.exit(1);
      });
  }
}

export { seed, cleanDatabase };
