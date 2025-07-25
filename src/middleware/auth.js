console.log('Início do arquivo middleware/auth.js');
// middleware/auth.js - Middlewares de autenticação e autorização

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificação de JWT (autenticação)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar se é administrador
const authAdmin = (req, res, next) => {
  if (req.user && req.user.tipo === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Somente administradores.' });
  }
};

// Middleware para verificar se é professor
const authProfessor = (req, res, next) => {
  if (req.user && req.user.tipo === 'professor') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Somente professores.' });
  }
};

// Middleware para verificar se é aluno
const authAluno = (req, res, next) => {
  if (req.user && req.user.tipo === 'aluno') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Somente alunos.' });
  }
};

// Middleware para verificar se é professor ou admin
const authProfessorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.tipo === 'professor' || req.user.tipo === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Somente professores ou administradores.' });
  }
};

// Exporta todos os middlewares de autenticação
module.exports = {
  authMiddleware,
  authAdmin,
  authProfessor,
  authAluno,
  authProfessorOrAdmin
};

console.log('Fim do arquivo middleware/auth.js');