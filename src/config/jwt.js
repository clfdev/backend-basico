console.log('Início do arquivo config/jwt.js');
// config/jwt.js - Configuração e funções relacionadas a JWT

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Gera um token JWT baseado no tipo de usuário e suas informações
 * @param {Object} user - Objeto com dados do usuário
 * @param {string} tipo - Tipo de usuário ('admin', 'professor', 'aluno')
 * @returns {string} Token JWT gerado
 */
const generateToken = (user, tipo) => {
  // Define o tempo de expiração do token com base no tipo de usuário
  let expiresIn = '4h'; // Padrão para alunos (4 horas)
  if (tipo === 'admin' || tipo === 'professor') {
    expiresIn = '24h'; // 24 horas para professores e administradores
  }
  
  // Dados a serem incluídos no token
  const payload = { 
    id: user.id, 
    tipo, 
    ...(tipo === 'professor' ? { disciplina: user.id_disciplina } : {}),
    ...(tipo === 'aluno' ? { matricula: user.matricula } : {})
  };
  
  // Gera o token JWT
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verifica se um token JWT é válido
 * @param {string} token - Token JWT a ser verificado
 * @param {string} secret - Chave secreta para verificação
 * @returns {Object} Payload decodificado do token
 */
const verify = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verify
};

console.log('Fim do arquivo config/jwt.js');