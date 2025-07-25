console.log('Início do arquivo utils/errorHandler.js');
// utils/errorHandler.js - Configuração de tratamento de erros globais

/**
 * Configura handlers para erros não tratados na aplicação
 * O process é um objeto global do Node.js que representa o processo em execução da aplicação Node.
 * process não precisa ser importado — ele está sempre disponível 
 */

const setup = () => {
  // Trata exceções não capturadas
  process.on('uncaughtException', (error) => {
    console.error('Erro não tratado:', error);
    // Em produção, aqui poderia enviar o erro para um serviço de monitoramento
  });

  /*
  * 'uncaughtException' é disparado quando um erro é lançado e não tratado com try/catch
  * 'unhandledRejection' é disparado quando uma promessa (Promise) é rejeitada e ninguém trata com .catch()
  */

  /*
  Esses eventos são úteis para:
- Capturar erros graves que escaparam do seu controle
- Evitar que o processo "morra silenciosamente"
- Logar o erro
- Notificar um sistema de monitoramento (ex: Sentry, LogRocket, Datadog)
  */

  // Trata promessas rejeitadas não capturadas
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Promessa rejeitada não tratada:', reason);
    // Em produção, aqui poderia enviar o erro para um serviço de monitoramento
  });
};

/*
* Apesar de úteis, não se deve depender exclusivamente desses handlers. Eles são como "última linha de defesa". 
* Sempre prefira: try/catch para blocos de código síncronos
*/

/**
 * Middleware para tratamento de erros em rotas Express
 * Express reconhece como middleware de erro não é pelo nome da função, mas sim a assinatura dela:
   (err, req, res, next) => { ... }
* Se um middleware tiver quatro parâmetros, nessa ordem:

function meuTratadorDeErros(err, req, res, next) {
  // ...
}

O Express sabe automaticamente que ele serve para capturar e tratar erros.
É um middleware especial do Express para erros, identificado por ter 4 parâmetros: err, req, res, next.
O Express reconhece automaticamente esse tipo de middleware como um tratador global de erros.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('Erro na requisição:', err);
  
  // Determina o código de status HTTP adequado
  // Verifica se o erro tem um statusCode definido. Caso não tenha, usa o código 500 (Erro interno do servidor).
  const statusCode = err.statusCode || 500;
  
  // Resposta formatada para o cliente
  res.status(statusCode).json({
    error: err.message || 'Erro interno no servidor', // error: é uma chave (de nome arbitrario) de objeto JS do JSON.
    // Incluir stack trace apenas em ambiente de desenvolvimento
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/*
... são o operador spread (ou "operador de espalhamento") do JavaScript.
No contexto de objetos, ele “espalha” as propriedades de outro objeto dentro de um novo objeto
*/

module.exports = {
  setup,
  errorMiddleware
};

console.log('Fim do arquivo utils/errorHandler.js');