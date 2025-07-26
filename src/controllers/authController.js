console.log('Início do arquivo controllers/authController.js');
// controllers/authController.js - Controlador para funções de autenticação

const jwt = require('../config/jwt');
const bcrypt = require('../utils/bcrypt');

/**
 * Função para autenticar usuário (login)
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const login = async (req, res) => {
  try {
    const { email, senha, tipo } = req.body;
    
    // Validação mais flexível
    if (!email || !tipo) {
      return res.status(400).json({ error: 'Email e tipo são obrigatórios' });
    }
    
    // Para admin e professor, senha é obrigatória
    if ((tipo === 'admin' || tipo === 'professor') && !senha) {
      return res.status(400).json({ error: 'Senha é obrigatória para administradores e professores' });
    }
    
    let user = null;
    let query = '';
    
    // Verifica o tipo de usuário para buscar na tabela correta
    switch (tipo) {
      case 'admin':
        query = 'SELECT id_admin as id, nome_admin as nome, email_admin as email, senha_admin as senha_hash FROM administrador WHERE email_admin = $1 AND ativo = TRUE';
        break;
      case 'professor':
        query = 'SELECT id_professor as id, nome_professor as nome, email_professor as email, senha_hash, id_disciplina FROM professor WHERE email_professor = $1 AND ativo = TRUE';
        break;
      case 'aluno':
        query = 'SELECT a.id_aluno as id, a.nome_aluno as nome, a.email_aluno as email, m.numero_matricula as matricula FROM aluno a JOIN matricula m ON a.id_aluno = m.id_aluno WHERE a.email_aluno = $1 AND a.ativo = TRUE AND m.ativa = TRUE';
        break;
      default:
        return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }
    
    const result = await req.db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }
    
    user = result.rows[0];
    
    // Para alunos, não verificamos senha (seria implementado diferentemente)
    // Para admin e professor, verificamos a senha com bcrypt
    if (tipo !== 'aluno') {
      // Verificar a senha usando bcrypt
      const passwordMatches = await bcrypt.comparePassword(senha, user.senha_hash);
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }
    }
    
    // Gera o token JWT usando o módulo jwt
    const token = jwt.generateToken(user, tipo);
    
    return res.json({ 
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo
      }
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

/**
 * Verifica se o token é válido
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const verify = (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false });
  }
};

module.exports = {
  login,
  verify
};

console.log('Fim do arquivo controllers/authController.js');