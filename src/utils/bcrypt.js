console.log('Início do arquivo utils/bcrypt.js');
// utils/bcrypt.js - Funções para hash e verificação de senhas

const bcrypt = require('bcrypt');

// Número de rounds para o salt (quanto maior, mais seguro, mas mais lento)
const SALT_ROUNDS = 10;

/**
 * Gera um hash para uma senha
 * @param {string} password - Senha em texto puro
 * @returns {Promise<string>} Hash da senha
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    throw new Error('Falha ao processar senha');
  }
};

/**
 * Verifica se uma senha corresponde a um hash
 * @param {string} password - Senha em texto puro
 * @param {string} hash - Hash da senha armazenado
 * @returns {Promise<boolean>} Verdadeiro se a senha corresponder ao hash
 */
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Erro ao comparar senha:', error);
    throw new Error('Falha ao verificar senha');
  }
};

module.exports = {
  hashPassword,
  comparePassword
};

console.log('Fim do arquivo utils/bcrypt.js');