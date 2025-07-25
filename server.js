console.log('Início do arquivo server.js');
// server.js - Arquivo principal para inicialização do servidor

// Importação da aplicação configurada
const app = require('./app');

// Importação do módulo de monitoramento de saúde
const healthCheck = require('./src/utils/health');

// Porta do servidor
const PORT = process.env.PORT || 5000;

// Configuração do health check
healthCheck.setup(app);

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log('Timezone configurado para: America/Sao_Paulo');
  console.log('Health check disponível em: /health');
});

// Tratamento de sinais para encerramento gracioso
process.on('SIGTERM', () => {
  console.info('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.info('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

console.log('Fim do arquivo server.js');