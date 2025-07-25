// tests/db-test.js - Testes simples para verificar a integração com o banco de dados
// Execução: node src/tests/db-test.js

// Importações
const db = require('../config/database');
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
  console.log(`${colors.bright}${colors.blue}TESTES DE INTEGRAÇÃO COM BANCO DE DADOS${colors.reset}`);
  console.log("=".repeat(50));
  console.log("Executando testes...\n");

  try {
    // TESTE 1: Verificar conexão com o banco
    try {
      const result = await db.query('SELECT NOW()');
      logTest("Conexão com o banco de dados", true);
      console.log(`  Timestamp do banco: ${result.rows[0].now}`);
    } catch (error) {
      logTest("Conexão com o banco de dados", false, error);
    }

    // TESTE 2: Verificar se o timezone está configurado
    try {
      const result = await db.query("SHOW timezone");
      const timezone = result.rows[0].timezone;
      const isCorrectTimezone = timezone === 'America/Sao_Paulo';
      
      logTest("Timezone configurado corretamente", isCorrectTimezone);
      console.log(`  Timezone atual: ${timezone}`);
      
      if (!isCorrectTimezone) {
        console.log(`  ${colors.yellow}Aviso: O timezone deveria ser 'America/Sao_Paulo'${colors.reset}`);
      }
    } catch (error) {
      logTest("Verificação de timezone", false, error);
    }

    // TESTE 3: Contar tabelas do sistema
    try {
      const result = await db.query(`
        SELECT COUNT(*) as total 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableCount = parseInt(result.rows[0].total);
      logTest("Verificação de tabelas do sistema", tableCount > 0);
      console.log(`  Total de tabelas encontradas: ${tableCount}`);
      
      if (tableCount === 0) {
        console.log(`  ${colors.yellow}Aviso: Nenhuma tabela encontrada. O esquema está vazio.${colors.reset}`);
      }
    } catch (error) {
      logTest("Verificação de tabelas do sistema", false, error);
    }

    // TESTE 4: Testar inserção e remoção de dados temporários
    try {
      // Criar tabela temporária para teste
      await db.query(`
        CREATE TEMPORARY TABLE test_temp (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Inserir dados
      const insertResult = await db.query(`
        INSERT INTO test_temp (name) VALUES ($1) RETURNING *
      `, ['Teste de Integração']);
      
      const inserted = insertResult.rows[0];
      const insertSuccess = inserted && inserted.name === 'Teste de Integração';
      
      logTest("Inserção de dados", insertSuccess);
      
      if (insertSuccess) {
        console.log(`  Registro inserido com ID: ${inserted.id}`);
      }
      
      // Buscar dados
      const selectResult = await db.query(`
        SELECT * FROM test_temp WHERE id = $1
      `, [inserted.id]);
      
      const selected = selectResult.rows[0];
      const selectSuccess = selected && selected.id === inserted.id;
      
      logTest("Busca de dados", selectSuccess);
      
      // Excluir dados
      await db.query(`
        DELETE FROM test_temp WHERE id = $1
      `, [inserted.id]);
      
      const verifyResult = await db.query(`
        SELECT COUNT(*) as count FROM test_temp WHERE id = $1
      `, [inserted.id]);
      
      const deleteSuccess = verifyResult.rows[0].count === '0';
      logTest("Exclusão de dados", deleteSuccess);
      
    } catch (error) {
      logTest("Operações CRUD básicas", false, error);
    }

    // TESTE 5: Verificar se as tabelas principais existem
    const requiredTables = [
      'disciplina', 
      'professor', 
      'turma', 
      'aluno', 
      'administrador', 
      'questionario',
      'questao'
    ];
    
    for (const table of requiredTables) {
      try {
        const result = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          ) as exists
        `, [table]);
        
        const tableExists = result.rows[0].exists;
        logTest(`Tabela ${table} existe`, tableExists);
        
        if (!tableExists) {
          console.log(`  ${colors.yellow}Aviso: A tabela '${table}' não foi encontrada.${colors.reset}`);
        }
      } catch (error) {
        logTest(`Verificação da tabela ${table}`, false, error);
      }
    }
    
    // TESTE 6: Verificar se a função de timezone foi executada
    try {
      const result = await db.query(`
        SELECT current_setting('timezone') as current_tz
      `);
      
      const currentTz = result.rows[0].current_tz;
      const tzSuccess = currentTz === 'America/Sao_Paulo';
      
      logTest("Configuração de timezone na sessão atual", tzSuccess);
      console.log(`  Timezone da sessão atual: ${currentTz}`);
      
      if (!tzSuccess) {
        console.log(`  ${colors.yellow}Aviso: O timezone da sessão deve ser 'America/Sao_Paulo'${colors.reset}`);
      }
    } catch (error) {
      logTest("Verificação de timezone da sessão", false, error);
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