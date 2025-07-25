console.log('Início do arquivo routes/authRoutes.js');
// routes/authRoutes.js - Rotas relacionadas à autenticação

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Rota de login para todos os tipos de usuário
 * POST /api/auth/login
 */
router.post('/login', authController.login);

/**
 * Rota para verificar se o token é válido
 * GET /api/auth/verify
 */
router.get('/verify', authController.verify);

module.exports = router;

console.log('Fim do arquivo routes/authRoutes.js');