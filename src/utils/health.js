console.log('Início do arquivo utils/health.js');
// utils/health.js - Módulo para monitoramento de saúde da aplicação

// Importação do pool de conexão com o banco de dados
const db = require('../config/database');

/**
 * Configuração da rota de health check da aplicação
 * @param {Object} app - Instância do Express
 */
const setup = (app) => {
  // Rota de health check
  app.get('/health', async (req, res) => {
    try {
      // Verificação de conexão com o banco de dados
      const dbCheck = await checkDatabase();
      
      // Status geral da aplicação
      const status = {
        status: dbCheck.connected ? 'UP' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: dbCheck,
        environment: process.env.NODE_ENV || 'development'
      };
      
      // Código de status HTTP baseado no estado do banco
      const statusCode = dbCheck.connected ? 200 : 503;
      
      res.status(statusCode).json(status);
    } catch (error) {
      console.error('Erro ao verificar saúde da aplicação:', error);
      
      res.status(500).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });
  
  console.log('Health check configurado em: /health');
};

/**
 * Verifica o estado da conexão com o banco de dados
 * @returns {Object} Objeto com informações sobre a conexão
 */
const checkDatabase = async () => {
  try {
    // Tenta executar uma query simples para verificar conexão
    const startTime = Date.now();
    const result = await db.query('SELECT NOW()');
    const responseTime = Date.now() - startTime;
    
    return {
      connected: true,
      responseTime: `${responseTime}ms`,
      timestamp: result.rows[0].now
    };
  } catch (error) {
    console.error('Erro na verificação do banco de dados:', error);
    
    return {
      connected: false,
      error: error.message
    };
  }
};

module.exports = {
  setup,
  checkDatabase
};

console.log('Fim do arquivo utils/health.js');