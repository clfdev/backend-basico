console.log('Início do arquivo validators/authValidator.js');
// validators/authValidator.js - Validação dos dados de autenticação

/**
 * Validadores para as requisições de autenticação
 * Usa o padrão de middleware do Express para validar os dados
 * antes de processar as requisições de autenticação
 */

/**
 * Valida a requisição de login de acordo com o tipo de usuário
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função para passar para o próximo middleware
 */
const validateLogin = (req, res, next) => {
  const { email, senha, tipo } = req.body;
  const errors = [];

  // Validações comuns para todos os tipos
  if (!email) {
    errors.push('Email é obrigatório');
  } else if (!isValidEmail(email)) {
    errors.push('Formato de email inválido');
  }

  if (!tipo) {
    errors.push('Tipo de usuário é obrigatório');
  } else if (!['admin', 'professor', 'aluno'].includes(tipo)) {
    errors.push('Tipo de usuário inválido. Use: admin, professor ou aluno');
  }

  // Validações específicas por tipo
  if (tipo === 'admin' || tipo === 'professor') {
    if (!senha) {
      errors.push('Senha é obrigatória para administradores e professores');
    } else if (senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
  }

  // Alunos não precisam de senha no nosso sistema
  // (conforme implementado no authController)

  // Se houver erros, retorna resposta de erro
  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      errors 
    });
  }

  // Se não houver erros, passa para o próximo middleware
  next();
};


/**
 * Valida a solicitação de verificação de token
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função para passar para o próximo middleware
 */
const validateTokenVerification = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token não fornecido ou formato inválido. Use o formato: Bearer [token]'
    });
  }

  // Se o token existe e está no formato correto, passa para o próximo middleware
  next();
};

/**
 * Função auxiliar para validar formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - Verdadeiro se o email for válido
 */
function isValidEmail(email) {
  // Expressão regular simples para validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validateLogin,
  validateTokenVerification
};

console.log('Fim do arquivo validators/authValidator.js');