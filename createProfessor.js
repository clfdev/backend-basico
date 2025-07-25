/**
 * =====================================================
 * SCRIPT DE CRIAÇÃO DE PROFESSOR
 * Sistema de Questionários e Provas - UFRN
 * =====================================================
 * 
 * Este script cria ou atualiza um professor no sistema.
 * Uso: node scripts/createProfessor.js
 * =====================================================
 */

const path = require('path');
process.env.TZ = 'America/Sao_Paulo';
require('dotenv').config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// =====================================================
// CONFIGURAÇÕES DO PROFESSOR
// =====================================================
const PROFESSORES = [
    {
        id_disciplina: 1,
        nome_professor: 'Ana Maria Silva',
        email_professor: 'ana.matematica@escolainovacao.br',
        codigo_professor: 'PROF001',
        formacao: 'Licenciatura em Matemática',
        especialidade: 'Álgebra e Geometria',
        senha_padrao: 'Professor@2025!',
        ativo: true,
        data_contratacao: '2020-02-15'
    },
    {
        id_disciplina: 2,
        nome_professor: 'Roberto Carlos Lima',
        email_professor: 'roberto.portugues@escolainovacao.br',
        codigo_professor: 'PROF002',
        formacao: 'Licenciatura em Letras',
        especialidade: 'Literatura Brasileira',
        senha_padrao: 'Professor@2025!',
        ativo: true,
        data_contratacao: '2020-02-15'
    },
    {
        id_disciplina: 3,
        nome_professor: 'Fernanda Santos Rocha',
        email_professor: 'fernanda.historia@escolainovacao.br',
        codigo_professor: 'PROF003',
        formacao: 'Licenciatura em História',
        especialidade: 'História do Brasil',
        senha_padrao: 'Professor@2025!',
        ativo: true,
        data_contratacao: '2020-02-15'
    },
    {
        id_disciplina: 4,
        nome_professor: 'Paulo Henrique Costa',
        email_professor: 'paulo.geografia@escolainovacao.br',
        codigo_professor: 'PROF004',
        formacao: 'Licenciatura em Geografia',
        especialidade: 'Geografia Física',
        senha_padrao: 'Professor@2025!',
        ativo: true,
        data_contratacao: '2020-02-15'
    },
    {
        id_disciplina: 5,
        nome_professor: 'Marcia Regina Oliveira',
        email_professor: 'marcia.ciencias@escolainovacao.br',
        codigo_professor: 'PROF005',
        formacao: 'Licenciatura em Ciências',
        especialidade: 'Ecologia',
        senha_padrao: 'Professor@2025!',
        ativo: true,
        data_contratacao: '2020-02-15'
    },
    {
        id_disciplina: 6,
        nome_professor: 'Patricia Anne Johnson',
        email_professor: 'patricia.ingles@escolainovacao.br',
        codigo_professor: 'PROF006',
        formacao: 'Licenciatura em Letras',
        especialidade: 'Língua Inglesa',
        senha_padrao: 'Professor@2025!',
        ativo: true,
        data_contratacao: '2020-02-15'
    }
];

// =====================================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// =====================================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

async function verificarProfessorExistente(email) {
    try {
        const query = `SELECT id_professor, nome_professor, email_professor FROM professor WHERE email_professor = $1`;
        const { rows } = await pool.query(query, [email]);
        return rows[0] || null;
    } catch (error) {
        console.error('❌ Erro ao verificar professor existente:', error.message);
        throw error;
    }
}

async function criarHashSenha(senha) {
    try {
        const hash = await bcrypt.hash(senha, 10);
        console.log('🔐 Hash da senha criado com sucesso');
        return hash;
    } catch (error) {
        console.error('❌ Erro ao criar hash da senha:', error.message);
        throw error;
    }
}

async function criarProfessor(dadosProf) {
    try {
        const query = `
            INSERT INTO professor (
                id_disciplina, nome_professor, email_professor, codigo_professor, formacao, especialidade, senha_hash, data_contratacao
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id_professor
        `;
        const values = [
            dadosProf.id_disciplina,
            dadosProf.nome_professor,
            dadosProf.email_professor,
            dadosProf.codigo_professor,
            dadosProf.formacao,
            dadosProf.especialidade,
            dadosProf.senha_hash,
            dadosProf.data_contratacao
        ];
        const { rows } = await pool.query(query, values);
        console.log('✅ Professor criado com sucesso!');
        return rows[0];
    } catch (error) {
        console.error('❌ Erro ao criar professor:', error.message);
        throw error;
    }
}

async function atualizarProfessor(email, dadosProf) {
    try {
        const query = `
            UPDATE professor SET
                id_disciplina = $1,
                nome_professor = $2,
                codigo_professor = $3,
                formacao = $4,
                especialidade = $5,
                senha_hash = $6,
                data_contratacao = $7
            WHERE email_professor = $8
        `;
        const values = [
            dadosProf.id_disciplina,
            dadosProf.nome_professor,
            dadosProf.codigo_professor,
            dadosProf.formacao,
            dadosProf.especialidade,
            dadosProf.senha_hash,
            dadosProf.data_contratacao,
            email
        ];
        await pool.query(query, values);
        console.log('✅ Professor atualizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao atualizar professor:', error.message);
        throw error;
    }
}

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================
async function criarOuAtualizarProfessores() {
    try {
        for (const PROFESSOR_CONFIG of PROFESSORES) {
            const profExistente = await verificarProfessorExistente(PROFESSOR_CONFIG.email_professor);
            const senha_hash = await criarHashSenha(PROFESSOR_CONFIG.senha_padrao);
            const dadosProf = { ...PROFESSOR_CONFIG, senha_hash };

            if (profExistente) {
                await atualizarProfessor(PROFESSOR_CONFIG.email_professor, dadosProf);
            } else {
                await criarProfessor(dadosProf);
            }

            console.log('\n📋 DADOS DO PROFESSOR:');
            console.log('─'.repeat(50));
            console.log(`👨‍🏫 Nome: ${dadosProf.nome_professor}`);
            console.log(`📧 Email: ${dadosProf.email_professor}`);
            console.log(`🔑 Senha padrão: ${PROFESSOR_CONFIG.senha_padrao}`);
            console.log('─'.repeat(50));
        }
        process.exit(0);
    } catch (error) {
        console.error('\n💥 ERRO NO PROCESSO:');
        console.error('─'.repeat(50));
        console.error('❌ Falha ao criar/atualizar professores');
        console.error(`🐛 Erro: ${error.message}`);
        process.exit(1);
    }
}

// =====================================================
// EXECUÇÃO PRINCIPAL
// =====================================================
if (require.main === module) {
    criarOuAtualizarProfessores();
}
