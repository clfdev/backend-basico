// tests/auth-test.js - Testes simples para verificar a autenticação
// Execução: node src/tests/auth-test.js

// Importações
const db = require('../config/database');
const bcrypt = require('../utils/bcrypt');
const jwt = require('../config/jwt');
require('dotenv').config();

// Cores para console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

// Contador de testes
let passedTests = 0;
let failedTests = 0;
let totalTests = 0;

// Função para registrar resultados de testes
function logTest(name, success, error = null) {
  totalTests++;
  if (success) {
    console.log(`${colors.green}✓ PASSOU: ${name}${colors.reset}`);
    passedTests++;
  } else {
    console.log(`${colors.red}✗ FALHOU: ${name}${colors.reset}`);
    if (error) {
      console.log(`  ${colors.red}Erro: ${error.message}${colors.reset}`);
    }
    failedTests++;
  }
}

// Função para resumo final
function printSummary() {
  console.log("\n" + "=".repeat(50));
  console.log(`${colors.bright}RESUMO DOS TESTES:${colors.reset}`);
  console.log(`${colors.green}Passaram: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Falharam: ${failedTests}${colors.reset}`);
  console.log(`${colors.blue}Total: ${totalTests}${colors.reset}`);
  console.log("=".repeat(50) + "\n");
}

// ========== TESTES ==========

async function runTests() {
  console.log(`${colors.bright}${colors.blue}TESTES DE AUTENTICAÇÃO${colors.reset}`);
  console.log("=".repeat(50));
  console.log("Executando testes...\n");

  try {
    // TESTE 1: Verificar geração de hash com bcrypt
    try {
      const password = "senha123";
      const hash = await bcrypt.hashPassword(password);
      
      // Hash deve ser uma string longa
      const isValidHash = typeof hash === 'string' && hash.length > 50;
      logTest("Geração de hash bcrypt", isValidHash);
      
      if (isValidHash) {
        console.log(`  Hash gerado: ${hash.substring(0, 20)}...`);
      }
    } catch (error) {
      logTest("Geração de hash bcrypt", false, error);
    }

    // TESTE 2: Verificar comparação de senhas com bcrypt
    try {
      const password = "senha123";
      const hash = await bcrypt.hashPassword(password);
      
      // Comparação com senha correta
      const validComparison = await bcrypt.comparePassword(password, hash);
      logTest("Comparação de senha correta", validComparison);
      
      // Comparação com senha incorreta
      const invalidComparison = await bcrypt.comparePassword("senha_errada", hash);
      logTest("Rejeição de senha incorreta", !invalidComparison);
      
    } catch (error) {
      logTest("Comparação de senhas", false, error);
    }

    // TESTE 3: Verificar geração de JWT
    try {
      // Usuário de teste
      const testUser = {
        id: 1,
        nome: "Usuário Teste",
        email: "teste@escola.com"
      };
      
      // Gerar tokens para diferentes tipos de usuário
      const adminToken = jwt.generateToken(testUser, 'admin');
      const professorToken = jwt.generateToken(testUser, 'professor');
      const alunoToken = jwt.generateToken(testUser, 'aluno');
      
      logTest("Geração de token para admin", typeof adminToken === 'string' && adminToken.length > 0);
      logTest("Geração de token para professor", typeof professorToken === 'string' && professorToken.length > 0);
      logTest("Geração de token para aluno", typeof alunoToken === 'string' && alunoToken.length > 0);
      
      console.log(`  Token de admin: ${adminToken.substring(0, 20)}...`);
      console.log(`  Token de professor: ${professorToken.substring(0, 20)}...`);
      console.log(`  Token de aluno: ${alunoToken.substring(0, 20)}...`);
      
    } catch (error) {
      logTest("Geração de tokens JWT", false, error);
    }

    // TESTE 4: Verificar se JWT_SECRET está configurado
    try {
      const jwtSecret = process.env.JWT_SECRET;
      const isConfigured = jwtSecret && jwtSecret.length > 0;
      
      logTest("JWT_SECRET configurado", isConfigured);
      
      if (!isConfigured) {
        console.log(`  ${colors.yellow}Aviso: JWT_SECRET não está configurado no arquivo .env${colors.reset}`);
      }
    } catch (error) {
      logTest("Verificação de JWT_SECRET", false, error);
    }
    
    // TESTE 5: Verificar usuários no banco (se existirem)
    try {
      // Verificar se a tabela professor existe
      const tableResult = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'professor'
        ) as exists
      `);
      
      if (tableResult.rows[0].exists) {
        // Contar professores ativos
        const countResult = await db.query(`
          SELECT COUNT(*) as count FROM professor WHERE ativo = TRUE
        `);
        
        const professorCount = parseInt(countResult.rows[0].count);
        logTest("Existem professores ativos no sistema", professorCount > 0);
        console.log(`  Total de professores ativos: ${professorCount}`);
        
        if (professorCount === 0) {
          console.log(`  ${colors.yellow}Aviso: Não existem professores ativos cadastrados${colors.reset}`);
        }
      } else {
        logTest("Tabela de professores existe", false);
        console.log(`  ${colors.yellow}Aviso: A tabela 'professor' não existe no banco${colors.reset}`);
      }
    } catch (error) {
      logTest("Verificação de usuários", false, error);
    }

    // TESTE 6: Testar a verificação de JWT
    try {
      // Teste com um token válido
      const user = { id: 1, nome: "Teste" };
      const token = jwt.generateToken(user, 'admin');
      
      try {
        const decoded = jwt.verify(token);
        const isValid = decoded && decoded.id === 1;
        
        logTest("Verificação de token válido", isValid);
        console.log(`  Conteúdo decodificado: ${JSON.stringify(decoded)}`);
      } catch (err) {
        logTest("Verificação de token válido", false, err);
      }
      
      // Teste com um token inválido
      try {
        const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzNCwiaWF0IjoxNTE2MjM5MDIyfQ.invalid_signature";
        jwt.verify(invalidToken);
        
        // Se chegar aqui, o teste falhou
        logTest("Rejeição de token inválido", false);
      } catch (err) {
        // Erro é esperado para token inválido
        logTest("Rejeição de token inválido", true);
        console.log(`  Erro corretamente gerado: ${err.message}`);
      }
    } catch (error) {
      logTest("Verificação de JWT", false, error);
    }

  } catch (error) {
    console.error(`${colors.red}Erro geral nos testes: ${error.message}${colors.reset}`);
  } finally {
    // Imprimir resumo
    printSummary();
    
    // Fechar conexão com o banco
    console.log("Fechando conexão com o banco de dados...");
    await db.end();
    console.log("Testes concluídos.");
  }
}

// Executar os testes
runTests();