console.log('Início do arquivo middleware/cors.js');
// middleware/cors.js - Configuração de CORS (Cross-Origin Resource Sharing)

const cors = require('cors'); // importa a biblioteca externa chamada cors

/*
É um middleware para o Express que permite habilitar o CORS (Cross-Origin Resource Sharing)
— ou seja, controlar quais domínios podem fazer requisições à sua API.
O Node.js puro não tem cors embutido.
*/

// Lista de origens permitidas
const getAllowedOrigins = () => {
  const devOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  if (process.env.NODE_ENV === 'production') {
    return [process.env.FRONTEND_URL].filter(Boolean);
  }
  return devOrigins;
};

/*
1) Requisição do navegador: fetch('https://api.exemplo.com/dados')
O navegador (Chrome, Firefox, etc.) adiciona automaticamente:
- Origin: https://seusite.com
Exemplo do cabeçalho da requisição:
- GET /dados HTTP/1.1
- Host: api.exemplo.com
- Origin: https://seusite.com

2) Requisição SEM Origin (Postman, cURL, backend)
Exemplo usando Postman ou curl: curl https://api.exemplo.com/dados
Cabeçalho da requisição:
- GET /dados HTTP/1.1
- Host: api.exemplo.com
- # (sem Origin!)
*/

// origin e credentials são chaves reconhecidas pela função cors().
// Postman e cURL fazem requisições que não têm cabeçalho Origin
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    // Permitir chamadas sem origin (ex: Postman, curl)
    if (!origin) return callback(null, true); // null → sem erro, true → permitir o acesso
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`❌ CORS bloqueado para origem: ${origin}`);
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true // permite cookies, headers como Authorization
};

module.exports = cors(corsOptions);

console.log('Fim do arquivo middleware/cors.js');