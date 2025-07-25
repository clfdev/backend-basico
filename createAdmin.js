/**
 * =====================================================
 * SCRIPT DE CRIAÇÃO DO ADMINISTRADOR INICIAL
 * Sistema de Questionários e Provas - UFRN
 * =====================================================
 * 
 * Este script cria o administrador inicial do sistema:
 * Nome: Caio Firme
 * Email: firme.caio@gmail.com
 * 
 * Uso: node scripts/createAdmin.js
 * =====================================================
 */

const path = require('path');

// Configurar timezone antes de qualquer operação
process.env.TZ = 'America/Sao_Paulo';

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// =====================================================
// CONFIGURAÇÕES DO ADMINISTRADOR
// =====================================================
const ADMIN_CONFIG = {
    nome_admin: 'Caio Firme',
    email_admin: 'firme.caio@gmail.com',
    cargo: 'Administrador Principal',
    nivel_acesso: 5, // Nível máximo
    senha_padrao: 'Admin@2025!', // Senha segura padrão
    ativo: true
};

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

/**
 * Verificar se administrador já existe
 */
async function verificarAdminExistente(email) {
    try {
        const query = `
            SELECT id_admin, nome_admin, email_admin, ativo 
            FROM administrador 
            WHERE email_admin = $1
        `;
        
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('❌ Erro ao verificar administrador existente:', error.message);
        throw error;
    }
}

/**
 * Criar hash da senha
 */
async function criarHashSenha(senha) {
    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);
        console.log('🔐 Hash da senha criado com sucesso');
        return hash;
    } catch (error) {
        console.error('❌ Erro ao criar hash da senha:', error.message);
        throw error;
    }
}

/**
 * Criar administrador no banco
 */
async function criarAdministrador(dadosAdmin) {
    try {
        const query = `
            INSERT INTO administrador (
                nome_admin, 
                email_admin, 
                senha_admin, 
                cargo, 
                nivel_acesso, 
                ativo,
                data_cadastro,
                data_ultima_alteracao
            ) VALUES (
                $1, $2, $3, $4, $5, $6, 
                CURRENT_TIMESTAMP, 
                CURRENT_TIMESTAMP
            )
            RETURNING id_admin, nome_admin, email_admin, cargo, nivel_acesso, data_cadastro
        `;
        
        const values = [
            dadosAdmin.nome_admin,
            dadosAdmin.email_admin,
            dadosAdmin.senha_hash,
            dadosAdmin.cargo,
            dadosAdmin.nivel_acesso,
            dadosAdmin.ativo
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('❌ Erro ao criar administrador:', error.message);
        throw error;
    }
}

/**
 * Atualizar administrador existente
 */
async function atualizarAdministrador(email, dadosAdmin) {
    try {
        const query = `
            UPDATE administrador 
            SET 
                nome_admin = $1,
                senha_admin = $2,
                cargo = $3,
                nivel_acesso = $4,
                ativo = $5,
                data_ultima_alteracao = CURRENT_TIMESTAMP
            WHERE email_admin = $6
            RETURNING id_admin, nome_admin, email_admin, cargo, nivel_acesso, data_ultima_alteracao
        `;
        
        const values = [
            dadosAdmin.nome_admin,
            dadosAdmin.senha_hash,
            dadosAdmin.cargo,
            dadosAdmin.nivel_acesso,
            dadosAdmin.ativo,
            email
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('❌ Erro ao atualizar administrador:', error.message);
        throw error;
    }
}

/**
 * Validar conexão com banco
 */
async function validarConexaoBanco() {
    try {
        const result = await pool.query('SELECT NOW() as timestamp, current_database() as database');
        console.log('✅ Conexão com banco validada');
        console.log(`📊 Database: ${result.rows[0].database}`);
        console.log(`⏰ Timestamp: ${result.rows[0].timestamp}`);
        return true;
    } catch (error) {
        console.error('❌ Erro de conexão com banco:', error.message);
        throw error;
    }
}

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================
async function criarAdminPrincipal() {
    console.log('🚀 Iniciando criação do administrador principal...\n');
    
    try {
        // Validar conexão
        await validarConexaoBanco();
        console.log('');
        
        // Verificar se admin já existe
        console.log('🔍 Verificando se administrador já existe...');
        const adminExistente = await verificarAdminExistente(ADMIN_CONFIG.email_admin);
        
        // Criar hash da senha
        const senhaHash = await criarHashSenha(ADMIN_CONFIG.senha_padrao);
        const dadosAdmin = {
            ...ADMIN_CONFIG,
            senha_hash: senhaHash
        };
        
        let adminResult;
        
        if (adminExistente) {
            console.log('👤 Administrador já existe. Atualizando dados...');
            console.log(`📧 Email: ${adminExistente.email_admin}`);
            console.log(`👨‍💼 Nome atual: ${adminExistente.nome_admin}`);
            console.log(`🔄 Status: ${adminExistente.ativo ? 'Ativo' : 'Inativo'}\n`);
            
            // Atualizar admin existente
            adminResult = await atualizarAdministrador(ADMIN_CONFIG.email_admin, dadosAdmin);
            console.log('✅ Administrador atualizado com sucesso!');
        } else {
            console.log('➕ Criando novo administrador...\n');
            
            // Criar novo admin
            adminResult = await criarAdministrador(dadosAdmin);
            console.log('✅ Administrador criado com sucesso!');
        }
        
        // Exibir resultado
        console.log('\n📋 DADOS DO ADMINISTRADOR:');
        console.log('─'.repeat(50));
        console.log(`🆔 ID: ${adminResult.id_admin}`);
        console.log(`👨‍💼 Nome: ${adminResult.nome_admin}`);
        console.log(`📧 Email: ${adminResult.email_admin}`);
        console.log(`💼 Cargo: ${adminResult.cargo}`);
        console.log(`🔐 Nível de Acesso: ${adminResult.nivel_acesso}/5`);
        console.log(`📅 Data: ${adminResult.data_cadastro || adminResult.data_ultima_alteracao}`);
        console.log('─'.repeat(50));
        
        console.log('\n🔑 CREDENCIAIS DE ACESSO:');
        console.log('─'.repeat(50));
        console.log(`📧 Email: ${ADMIN_CONFIG.email_admin}`);
        console.log(`🔒 Senha: ${ADMIN_CONFIG.senha_padrao}`);
        console.log('─'.repeat(50));
        
        console.log('\n⚠️  IMPORTANTE:');
        console.log('• Altere a senha após o primeiro login');
        console.log('• Mantenha as credenciais seguras');
        console.log('• O administrador tem acesso total ao sistema');
        
        console.log('\n🎉 Processo concluído com sucesso!');
        
    } catch (error) {
        console.error('\n💥 ERRO NO PROCESSO:');
        console.error('─'.repeat(50));
        console.error('❌ Falha ao criar/atualizar administrador');
        console.error(`🐛 Erro: ${error.message}`);
        
        if (error.code) {
            console.error(`📋 Código do erro: ${error.code}`);
        }
        
        console.error('─'.repeat(50));
        console.error('\n🔧 SOLUÇÕES POSSÍVEIS:');
        console.error('• Verifique se o banco de dados está rodando');
        console.error('• Confirme as credenciais no arquivo .env');
        console.error('• Execute as migrations do banco primeiro');
        console.error('• Verifique a conectividade de rede');
        
        process.exit(1);
    } finally {
        // Fechar pool de conexões
        await pool.end();
        console.log('\n🔌 Conexões com banco fechadas');
    }
}

// =====================================================
// TRATAMENTO DE ARGUMENTOS DA LINHA DE COMANDO
// =====================================================
function processarArgumentos() {
    const args = process.argv.slice(2);
    
    // Help
    if (args.includes('--help') || args.includes('-h')) {
        console.log('📖 USO DO SCRIPT:');
        console.log('─'.repeat(50));
        console.log('node scripts/createAdmin.js [opções]');
        console.log('');
        console.log('🔧 OPÇÕES:');
        console.log('  --help, -h     Mostrar esta ajuda');
        console.log('  --force, -f    Forçar atualização se admin existe');
        console.log('  --info, -i     Mostrar informações do admin atual');
        console.log('');
        console.log('📝 EXEMPLOS:');
        console.log('  node scripts/createAdmin.js');
        console.log('  node scripts/createAdmin.js --force');
        console.log('  node scripts/createAdmin.js --info');
        process.exit(0);
    }
    
    // Info
    if (args.includes('--info') || args.includes('-i')) {
        verificarAdminInfo();
        return;
    }
    
    // Force (comportamento padrão já atualiza)
    if (args.includes('--force') || args.includes('-f')) {
        console.log('🔄 Modo força ativado - atualizará admin existente');
    }
}

/**
 * Mostrar informações do admin atual
 */
async function verificarAdminInfo() {
    try {
        await validarConexaoBanco();
        const admin = await verificarAdminExistente(ADMIN_CONFIG.email_admin);
        
        if (admin) {
            console.log('👤 ADMINISTRADOR ENCONTRADO:');
            console.log('─'.repeat(50));
            console.log(`🆔 ID: ${admin.id_admin}`);
            console.log(`👨‍💼 Nome: ${admin.nome_admin}`);
            console.log(`📧 Email: ${admin.email_admin}`);
            console.log(`🔄 Status: ${admin.ativo ? 'Ativo' : 'Inativo'}`);
            console.log('─'.repeat(50));
        } else {
            console.log('❌ Administrador não encontrado');
            console.log('💡 Execute o script sem argumentos para criar');
        }
    } catch (error) {
        console.error('❌ Erro ao verificar informações:', error.message);
    } finally {
        await pool.end();
    }
}

// =====================================================
// EXECUÇÃO PRINCIPAL
// =====================================================
if (require.main === module) {
    // Processar argumentos primeiro
    processarArgumentos();
    
    // Executar função principal
    criarAdminPrincipal();
}

// =====================================================
// EXPORTAÇÕES (para testes)
// =====================================================
module.exports = {
    criarAdminPrincipal,
    verificarAdminExistente,
    criarHashSenha,
    ADMIN_CONFIG
};