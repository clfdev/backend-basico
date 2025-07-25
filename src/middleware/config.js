console.log('Início do arquivo middleware/config.js');
// middleware/config.js - Configuração dos middlewares básicos da aplicação

const express = require('express');
// Ambas importam bibliotecas externas, helmet e morgan (não são nativas do Node.js).
const helmet = require('helmet'); // Biblioteca externa de segurança para aplicações Express
const morgan = require('morgan'); // Biblioteca externa de logging de requisições
const db = require('../config/database');

// O método app.use() é usado para registrar middlewares na sua aplicação Express

/*Essa arrow function espera receber o objeto app da aplicação Express, 
  e aplica vários middlewares a ele com app.use().*/
const setupMiddlewares = (app) => {
  // Middlewares para parsing de dados
  app.use(express.json()); // Para parsing de JSON
  // Se você enviar uma requisição com corpo { "nome": "Caio" }, o Express vai transformar isso em: req.body = { nome: 'Caio' }
  app.use(express.urlencoded({ extended: true })); // Para parsing de dados de formulário
  // Se você enviar um formulário tipo nome=Caio&idade=30, isso vira: req.body = { nome: 'Caio', idade: '30' }

  // Middlewares de segurança
  app.use(helmet()); // Proteção básica com headers HTTP
  // proteger sua aplicação contra vulnerabilidades conhecidas (como clickjacking, sniffing etc).
  app.use(morgan('dev')); // Logging de requisições
  // Exibe logs como: GET /alunos 200 15ms

  // Middleware para disponibilizar o pool de conexão em todas as requisições
  app.use((req, res, next) => {
       req.db = db;
       next();
     });
  };

// Isso evita que você tenha que importar o banco de dados em cada rota. Em vez disso, basta acessar: req.db.query(...)

module.exports = setupMiddlewares;

console.log('Fim do arquivo middleware/config.js');