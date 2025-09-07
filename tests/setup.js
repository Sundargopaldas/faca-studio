/**
 * Configuração dos Testes
 */

const { sequelize } = require('../src/models');

// Configurar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';

// Configurar timeout para testes
jest.setTimeout(30000);

// Setup antes de todos os testes
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Banco de dados de teste conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar banco de teste:', error);
  }
});

// Cleanup após todos os testes
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexão com banco de teste fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
});

// Limpar dados entre testes
beforeEach(async () => {
  // Limpar tabelas em ordem (respeitando foreign keys)
  await sequelize.models.Export.destroy({ where: {} });
  await sequelize.models.Project.destroy({ where: {} });
  await sequelize.models.Template.destroy({ where: {} });
  await sequelize.models.Product.destroy({ where: {} });
  await sequelize.models.User.destroy({ where: {} });
});

module.exports = {
  sequelize
};

