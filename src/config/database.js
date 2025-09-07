const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'pactmaker',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('📊 MySQL conectado com sucesso!');
    
    // Sincronizar modelos com o banco
    await sequelize.sync({ alter: true });
    console.log('🔄 Banco de dados sincronizado!');
  } catch (error) {
    console.error('❌ Erro de conexão com o banco:', error.message);
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Continuando sem banco em modo desenvolvimento');
    }
  }
};

module.exports = { sequelize, connectDB };
