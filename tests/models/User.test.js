/**
 * Testes para o modelo User
 */

const { User } = require('../../src/models');

describe('User Model', () => {
  describe('Criação de usuário', () => {
    test('deve criar um usuário válido', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        password: '123456'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Deve estar hasheada
      expect(user.subscription).toBe('free');
      expect(user.is_active).toBe(true);
    });

    test('deve hash da senha automaticamente', async () => {
      const userData = {
        name: 'Maria Santos',
        email: 'maria@teste.com',
        password: 'senha123'
      };

      const user = await User.create(userData);
      const isHashed = await user.comparePassword('senha123');

      expect(user.password).not.toBe('senha123');
      expect(isHashed).toBe(true);
    });

    test('deve falhar com email duplicado', async () => {
      const userData = {
        name: 'Usuário 1',
        email: 'duplicado@teste.com',
        password: '123456'
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('deve falhar com dados inválidos', async () => {
      const invalidData = {
        name: 'A', // Muito curto
        email: 'email-invalido',
        password: '123' // Muito curto
      };

      await expect(User.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Métodos do usuário', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'Teste User',
        email: 'teste@teste.com',
        password: '123456'
      });
    });

    test('comparePassword deve funcionar corretamente', async () => {
      const correctPassword = await user.comparePassword('123456');
      const wrongPassword = await user.comparePassword('senhaerrada');

      expect(correctPassword).toBe(true);
      expect(wrongPassword).toBe(false);
    });

    test('toPublicJSON deve excluir senha', () => {
      const publicData = user.toPublicJSON();

      expect(publicData.password).toBeUndefined();
      expect(publicData.name).toBe(user.name);
      expect(publicData.email).toBe(user.email);
    });
  });

  describe('Validações', () => {
    test('deve validar email único', async () => {
      const user1 = await User.create({
        name: 'User 1',
        email: 'unico@teste.com',
        password: '123456'
      });

      expect(user1.email).toBe('unico@teste.com');

      // Aguardar um pouco para garantir que o primeiro usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 100));

      await expect(User.create({
        name: 'User 2',
        email: 'unico@teste.com',
        password: '123456'
      })).rejects.toThrow();
    });

    test('deve validar comprimento da senha', async () => {
      await expect(User.create({
        name: 'Test User',
        email: 'test@teste.com',
        password: '123' // Muito curto
      })).rejects.toThrow();
    });

    test('deve validar formato do email', async () => {
      await expect(User.create({
        name: 'Test User',
        email: 'email-invalido',
        password: '123456'
      })).rejects.toThrow();
    });
  });
});
