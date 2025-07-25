# Sistema de Atividades Avaliativas - Backend

Este repositório contém o backend do Sistema de Atividades Avaliativas, uma aplicação para gerenciamento de questionários e provas online para instituições de ensino. O sistema permite a criação, aplicação e correção de avaliações com diferentes níveis de acesso para administradores, professores e alunos.

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Requisitos](#requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Execução](#execução)
- [Testes](#testes)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
- [Próximos Passos](#próximos-passos)
- [Licença](#licença)

## 📁 Estrutura do Projeto

```
backend/
├── config/             # Configurações da aplicação
│   ├── database.js     # Conexão com o banco de dados
│   └── jwt.js          # Configuração de tokens JWT
├── controllers/        # Controladores (lógica de negócio)
│   └── authController.js # Controlador de autenticação
├── middleware/         # Middlewares (interceptadores)
│   ├── auth.js         # Middleware de autenticação
│   ├── config.js       # Configuração de middlewares
│   └── cors.js         # Configuração de CORS
├── routes/             # Rotas da API
│   └── authRoutes.js   # Rotas de autenticação
├── tests/              # Testes da aplicação
│   ├── auth-test.js    # Testes de autenticação
│   ├── db-test.js      # Testes de banco de dados
│   ├── server-test.js  # Testes do servidor
│   └── run-all-tests.js # Executa todos os testes
├── utils/              # Utilitários
│   ├── bcrypt.js       # Funções para hash de senhas
│   ├── errorHandler.js # Tratamento de erros
│   └── health.js       # Monitoramento de saúde
├── .env.example        # Exemplo de variáveis de ambiente
├── app.js              # Configuração da aplicação
├── package.json        # Dependências e scripts
├── server.js           # Ponto de entrada principal
└── README.md           # Este arquivo
```

## 🛠 Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para criação da API
- **PostgreSQL**: Banco de dados relacional
- **JWT**: Autenticação e autorização
- **Bcrypt**: Hash de senhas
- **Helmet**: Segurança HTTP
- **Cors**: Proteção CORS
- **Morgan**: Logging de requisições
- **Dotenv**: Gerenciamento de variáveis de ambiente

## 📋 Requisitos

- Node.js (v18.0.0 ou superior)
- PostgreSQL (v13.0 ou superior)
- NPM (v8.0.0 ou superior)

## ⚙️ Configuração do Ambiente

1. **Clone o repositório:**
```bash
git clone https://github.com/ufrn/sistema-atividades-avaliativas.git
cd sistema-atividades-avaliativas/backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```
# Conexão com banco de dados
DATABASE_URL=postgres://user:password@localhost:5432/db_name

# Configuração JWT
JWT_SECRET=sua_chave_secreta_muito_segura

# Configuração do servidor
PORT=5000
NODE_ENV=development

# URL do frontend (para CORS)
FRONTEND_URL=http://localhost:3000
```

4. **Configure o banco de dados:**
   
   Execute os scripts SQL disponíveis na pasta `database` (se disponível) ou utilize o código fornecido no arquivo `BANCO DE DADOS.pdf` para criar o esquema necessário.

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará disponível em `http://localhost:5000`.

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes específicos
```bash
npm run test:db     # Testes de banco de dados
npm run test:auth   # Testes de autenticação
npm run test:server # Testes do servidor HTTP
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em JWT (JSON Web Tokens) com diferentes tempos de expiração:

- **Administradores**: 24 horas
- **Professores**: 24 horas
- **Alunos**: 4 horas

Para autenticar, envie uma requisição POST para `/api/auth/login` com:

```json
{
  "email": "usuario@email.com",
  "senha": "senha123",
  "tipo": "professor"  // "admin", "professor" ou "aluno"
}
```

Nota: Para alunos, a autenticação é feita apenas com o email (sem senha).

O token recebido deve ser incluído no header `Authorization` em todas as requisições subsequentes:

```
Authorization: Bearer seu_token_jwt
```

## 📡 Endpoints

### Autenticação
- `POST /api/auth/login` - Autenticação de usuários
- `POST /api/auth/register` - Registro de novos usuários (admin e professores)
- `GET /api/auth/verify` - Verificação da validade de tokens

### Monitoramento
- `GET /health` - Verificação de saúde do sistema

### Rotas Futuras (A serem implementadas)
- `/api/professor/*` - Rotas específicas para professores
- `/api/aluno/*` - Rotas específicas para alunos
- `/api/admin/*` - Rotas específicas para administradores

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

---
