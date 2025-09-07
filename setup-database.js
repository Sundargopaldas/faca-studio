#!/usr/bin/env node

/**
 * Script de Configuração do Banco de Dados
 * Cria as tabelas e dados iniciais
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configurações do banco
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'pactmaker'
};

console.log('🗄️ CONFIGURANDO BANCO DE DADOS PACTMAKER\n');

async function setupDatabase() {
  let connection;
  
  try {
    // Conectar sem especificar database para criar se não existir
    console.log('📡 Conectando ao MySQL...');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✅ Conectado ao MySQL');
    
    // Criar database se não existir
    console.log('📁 Criando database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbConfig.database}' criada/verificada`);
    
    // Usar o database
    await connection.execute(`USE \`${dbConfig.database}\``);
    
    // Ler e executar script SQL
    console.log('📄 Executando script SQL...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await connection.execute(command);
          console.log(`  ✅ Comando executado`);
        } catch (error) {
          if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
            console.log(`  ⚠️  Aviso: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Script SQL executado');
    
    // Verificar tabelas criadas
    console.log('🔍 Verificando tabelas...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ ${tables.length} tabelas encontradas:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Verificar dados iniciais
    console.log('📊 Verificando dados iniciais...');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
    
    console.log(`✅ Usuários: ${users[0].count}`);
    console.log(`✅ Produtos: ${products[0].count}`);
    
    console.log('\n🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure as variáveis de ambiente no arquivo .env');
    console.log('2. Execute: npm run dev');
    console.log('3. Acesse: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error.message);
    console.log('\n🔧 Soluções possíveis:');
    console.log('1. Verifique se o MySQL está rodando');
    console.log('2. Verifique as credenciais no arquivo .env');
    console.log('3. Execute: mysql -u root -p < database.sql');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;

