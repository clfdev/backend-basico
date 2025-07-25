console.log('Início do arquivo config/database.js');
// config/database.js - Configuração da conexão com o banco de dados

const { Pool } = require('pg');
require('dotenv').config();
console.log('Tipo do DATABASE_URL:', typeof process.env.DATABASE_URL);

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Configurações de conexão
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo limite para conexões ociosas
  connectionTimeoutMillis: 10000, // Tempo limite para estabelecer conexão 
  
  // Configurações específicas para o timezone
  timezone: 'America/Sao_Paulo'
});

// Verificação de conexão com o banco
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Banco de dados conectado com sucesso, timestamp:', res.rows[0].now);
    // Configurar timezone no banco
    pool.query("SET timezone = 'America/Sao_Paulo'");
  }
});

// Exporta o pool para ser usado em outros módulos
module.exports = pool;

console.log('Fim do arquivo config/database.js');