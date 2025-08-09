import { Router, Request, Response } from 'express';

const router = Router();

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  message: string;
  data?: any;
  timestamp: string;
  url?: string;
  userAgent?: string;
  source: string;
}

/**
 * @route   POST /api/logs
 * @desc    Receber logs do frontend
 * @access  Public
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { level, message, data, timestamp, url, userAgent, source }: LogEntry = req.body;

    // Validação básica
    if (!level || !message || !timestamp || !source) {
      const response = {
        success: false,
        message: 'Campos obrigatórios: level, message, timestamp, source'
      };
      res.status(400).json(response);
      return;
    }

    // Log no console do backend com formatação
    const time = new Date(timestamp).toLocaleTimeString('pt-BR');
    const emoji = getEmoji(level);
    
    console.log(`${emoji} [${time}] [${source.toUpperCase()}] ${level.toUpperCase()}: ${message}`, {
      timestamp,
      source,
      level,
      url: url || 'unknown',
      userAgent: userAgent || 'unknown'
    });
    
    if (data) {
      console.log('📋 Frontend Data:', JSON.stringify(data, null, 2));
    }
    
    if (url) {
      console.log(`🔗 Frontend URL: ${url}`);
    }
    
    // TODO: Aqui você poderia salvar os logs em um banco de dados
    // await saveLogToDatabase({ level, message, data, timestamp, url, userAgent, source })
    
    const response = {
      success: true,
      message: 'Log recebido com sucesso'
    };

    res.json(response);
  } catch (error: any) {
    console.error('🚨 Erro ao processar log do frontend:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    const response = {
      success: false,
      message: 'Erro interno do servidor'
    };
    
    res.status(500).json(response);
  }
});

/**
 * Função utilitária para obter emoji baseado no nível do log
 */
function getEmoji(level: LogEntry['level']): string {
  const emojis: Record<LogEntry['level'], string> = {
    info: 'ℹ️',
    warn: '⚠️', 
    error: '❌',
    debug: '🐛',
    success: '✅'
  };
  return emojis[level] || '📝';
}

export default router;
