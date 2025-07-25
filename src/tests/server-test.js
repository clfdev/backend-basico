// tests/server-test.js - Testes simples para verificar se o servidor está funcionando
// Execução: node .\src\tests\server-test.js

// Importações
const http = require('http');
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
      console.log(`  ${colors.red}Erro: ${error.message || error}${colors.reset}`);
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

// Função para fazer requisição HTTP
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const PORT = 5000; // Porta padrão do servidor
    const defaultOptions = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 segundos de timeout
    };

    // Mesclar opções
    const requestOptions = { ...defaultOptions, ...options };
    
    const req = http.request(requestOptions, (res) => {
      let data = '';
      
      // Receber dados
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // Finalizar resposta
      res.on('end', () => {
        try {
          // Tentar fazer parse do JSON
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          // Se não for JSON, retornar como texto
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    // Lidar com erros
    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error(`Não foi possível conectar ao servidor na porta ${PORT}. Verifique se o servidor está rodando.`));
      } else {
        reject(error);
      }
    });

    // Timeout
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Tempo limite excedido ao tentar conectar ao servidor na porta ${PORT}.`));
    });

    // Se houver corpo, enviar
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// ========== TESTES ==========

async function runTests() {
  console.log(`${colors.bright}${colors.blue}TESTES DO SERVIDOR${colors.reset}`);
  console.log("=".repeat(50));
  console.log("Executando testes...\n");
  console.log(`${colors.yellow}IMPORTANTE: O servidor deve estar rodando na porta 5000.${colors.reset}`);
  console.log(`${colors.yellow}Certifique-se de iniciar o servidor com 'node server.js' antes de executar este teste.${colors.reset}\n`);

  try {
    // TESTE 1: Verificar se o servidor está rodando
    try {
      const response = await makeRequest('/');
      logTest("Servidor está rodando", response.statusCode >= 200 && response.statusCode < 500);
      console.log(`  Código de status: ${response.statusCode}`);
      console.log(`  Resposta: ${JSON.stringify(response.data)}`);
    } catch (error) {
      logTest("Servidor está rodando", false, error);
      // Se o servidor não estiver rodando, interromper os testes
      console.log(`${colors.red}Não foi possível conectar ao servidor. Encerrando testes.${colors.reset}`);
      printSummary();
      return;
    }

    // TESTE 2: Verificar rota de health check
    try {
      const response = await makeRequest('/health');
      logTest("Rota de health check", response.statusCode === 200);
      console.log(`  Código de status: ${response.statusCode}`);
      console.log(`  Status do sistema: ${response.data.status || 'Não disponível'}`);
      console.log(`  Status do banco: ${(response.data.database && response.data.database.connected) ? 'Conectado' : 'Não conectado'}`);
    } catch (error) {
      logTest("Rota de health check", false, error);
    }

    // TESTE 3: Verificar rota de autenticação (existência)
    try {
      // Apenas verificar se a rota existe, não se a autenticação funciona
      // Tentativa com credenciais inválidas deve retornar 401, não 404
      const response = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'teste@email.com', senha: 'senha_invalida', tipo: 'professor' }
      });
      
      // Se retornar 404, a rota não existe
      // Se retornar 401 ou qualquer outro código, a rota existe
      const routeExists = response.statusCode !== 404;
      
      logTest("Rota de autenticação existe", routeExists);
      console.log(`  Código de status: ${response.statusCode}`);
      
      if (response.statusCode === 401) {
        console.log(`  Resposta esperada para credenciais inválidas (401 Unauthorized)`);
      } else if (response.statusCode === 400) {
        console.log(`  Validação de entrada funcionando (400 Bad Request)`);
      }
    } catch (error) {
      // Se a rota não estiver registrada, ainda é um erro de conexão
      logTest("Rota de autenticação existe", false, error);
    }

    // TESTE 4: Verificar CORS
    try {
      // Fazer uma requisição com Origin inválido
      const response = await makeRequest('/', {
        headers: {
          'Origin': 'http://site-malicioso.com'
        }
      });
      
      // Verificar se os headers CORS estão presentes
      const corsHeaderExists = 'access-control-allow-origin' in response.headers;
      
      logTest("Headers CORS configurados", corsHeaderExists);
      
      if (corsHeaderExists) {
        console.log(`  Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
      } else {
        console.log(`  ${colors.yellow}Aviso: Headers CORS não encontrados na resposta${colors.reset}`);
      }
    } catch (error) {
      logTest("Verificação de CORS", false, error);
    }

    // TESTE 5: Verificar Rate Limiting
    try {
      console.log(`  ${colors.yellow}Fazendo múltiplas requisições para testar rate limiting...${colors.reset}`);
      
      // Fazer 5 requisições rápidas
      const results = await Promise.all([
        makeRequest('/'),
        makeRequest('/'),
        makeRequest('/'),
        makeRequest('/'),
        makeRequest('/')
      ]);
      
      // Verificar se alguma resposta tem o header de rate limit
      const hasRateLimitHeaders = results.some(result => 
        'x-ratelimit-limit' in result.headers || 
        'x-ratelimit-remaining' in result.headers
      );
      
      logTest("Rate limiting configurado", hasRateLimitHeaders);
      
      if (hasRateLimitHeaders) {
        // Mostrar headers da última resposta
        const lastResponse = results[results.length - 1];
        console.log(`  X-RateLimit-Limit: ${lastResponse.headers['x-ratelimit-limit'] || 'Não disponível'}`);
        console.log(`  X-RateLimit-Remaining: ${lastResponse.headers['x-ratelimit-remaining'] || 'Não disponível'}`);
      } else {
        console.log(`  ${colors.yellow}Aviso: Headers de rate limit não encontrados${colors.reset}`);
        console.log(`  ${colors.yellow}Isso pode ser normal se o limite for muito alto ou se não estiver configurado globalmente${colors.reset}`);
      }
    } catch (error) {
      logTest("Verificação de rate limiting", false, error);
    }

  } catch (error) {
    console.error(`${colors.red}Erro geral nos testes: ${error.message}${colors.reset}`);
  } finally {
    // Imprimir resumo
    printSummary();
    console.log("Testes concluídos.");
  }
}

// Executar os testes
runTests();