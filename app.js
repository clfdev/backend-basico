console.log('Início do arquivo app.js');
// app.js - Configuração da aplicação e inicialização do servidor

// Importação de dependências
const express = require('express');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // carrega as variáveis do .env para process.env.
console.log(process.env.PORT); // 5000
console.log(process.env.NODE_ENV); // development

// Importação de configurações e middlewares
const db = require('./src/config/database');
const middlewareConfig = require('./src/middleware/config');
const corsMiddleware = require('./src/middleware/cors');
const errorHandler = require('./src/utils/errorHandler');

// Importação das rotas
const authRoutes = require('./src/routes/authRoutes');
// const professorRoutes = require('./src/routes/professorRoutes');
// const alunoRoutes = require('./src/routes/alunoRoutes');
// const adminRoutes = require('./src/routes/adminRoutes');

// Criação da aplicação Express
const app = express();

// Limita a 100 requisições por IP a cada 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 requisições por IP
  message: 'Você excedeu o número de requisições permitidas. Tente novamente mais tarde.'
});

// Aplica o limitador globalmente
app.use(limiter);

// Aplicação do middleware CORS
app.use(corsMiddleware);

// Aplicação de middlewares
middlewareConfig(app);

// Rota básica para teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Sistema de Atividades Avaliativas Escolares',
    version: '1.0.0',
    status: 'online'
  });
});

// Montagem das rotas
app.use('/api/auth', authRoutes);
// app.use('/api/professor', professorRoutes);
// app.use('/api/aluno', alunoRoutes);
// app.use('/api/admin', adminRoutes);

// Aplicação do middleware de tratamento de erros
app.use(errorHandler.errorMiddleware);

// O servidor será iniciado pelo server.js
// Exportamos o app configurado

console.log('Fim do arquivo app.js');

module.exports = app; // Exportar para testes