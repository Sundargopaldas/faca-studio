/**
 * Testes para o modelo Product
 */

const { Product } = require('../../src/models');

describe('Product Model', () => {
  describe('Criação de produto', () => {
    test('deve criar um produto válido', async () => {
      const productData = {
        name: 'Caixa de Bolo',
        category: 'alimentos',
        description: 'Caixa para bolos',
        dimensions: {
          width: { min: 15, max: 50, default: 25 },
          height: { min: 5, max: 20, default: 10 },
          depth: { min: 15, max: 50, default: 25 }
        },
        materials: ['papel_300g', 'papel_250g'],
        price: { base: 0.85, per_cm: 0.02 },
        template: 'caixa_bolo_simples'
      };

      const product = await Product.create(productData);

      expect(product).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.category).toBe(productData.category);
      expect(product.dimensions).toEqual(productData.dimensions);
      expect(product.materials).toEqual(productData.materials);
      expect(product.price).toEqual(productData.price);
      expect(product.is_active).toBe(true);
    });

    test('deve falhar com dados obrigatórios faltando', async () => {
      const invalidData = {
        name: 'Produto Incompleto'
        // Faltam campos obrigatórios
      };

      await expect(Product.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Métodos do produto', () => {
    let product;

    beforeEach(async () => {
      product = await Product.create({
        name: 'Teste Produto',
        category: 'alimentos',
        description: 'Produto de teste',
        dimensions: {
          width: { min: 10, max: 30, default: 20 },
          height: { min: 5, max: 15, default: 10 },
          depth: { min: 10, max: 30, default: 20 }
        },
        materials: ['papel_300g'],
        price: { base: 1.0, per_cm: 0.02 },
        template: 'teste'
      });
    });

    test('calculatePrice deve calcular preço corretamente', () => {
      const dimensions = { width: 20, height: 10, depth: 20 };
      const price = product.calculatePrice(dimensions);

      // Cálculo esperado: base + (área * per_cm)
      // Área = (20*10*2) + (20*20*2) + (10*20*2) = 400 + 800 + 400 = 1600
      // Preço = 1.0 + (1600 * 0.02) = 1.0 + 32 = 33
      expect(price).toBe(33);
    });

    test('validateDimensions deve validar dimensões corretamente', () => {
      const validDimensions = { width: 20, height: 10, depth: 20 };
      const invalidDimensions = { width: 5, height: 10, depth: 20 }; // width muito pequeno

      const validErrors = product.validateDimensions(validDimensions);
      const invalidErrors = product.validateDimensions(invalidDimensions);

      expect(validErrors).toHaveLength(0);
      expect(invalidErrors).toHaveLength(1);
      expect(invalidErrors[0]).toContain('Largura deve estar entre');
    });

    test('validateDimensions deve validar dimensões opcionais', async () => {
      const productWithHandle = await Product.create({
        name: 'Sacola',
        category: 'sacolas',
        description: 'Sacola com alça',
        dimensions: {
          width: { min: 20, max: 40, default: 30 },
          height: { min: 25, max: 50, default: 35 },
          handle: { min: 5, max: 15, default: 8 }
        },
        materials: ['papel_300g'],
        price: { base: 0.65, per_cm: 0.015 },
        template: 'sacola'
      });

      const validDimensions = { width: 30, height: 35, handle: 8 };
      const invalidDimensions = { width: 30, height: 35, handle: 3 }; // handle muito pequeno

      const validErrors = productWithHandle.validateDimensions(validDimensions);
      const invalidErrors = productWithHandle.validateDimensions(invalidDimensions);

      expect(validErrors).toHaveLength(0);
      expect(invalidErrors).toHaveLength(1);
      expect(invalidErrors[0]).toContain('Alça deve estar entre');
    });
  });

  describe('Validações', () => {
    test('deve validar comprimento do nome', async () => {
      await expect(Product.create({
        name: 'A', // Muito curto
        category: 'alimentos',
        dimensions: { width: { min: 10, max: 30, default: 20 } },
        materials: ['papel_300g'],
        price: { base: 1.0, per_cm: 0.02 },
        template: 'teste'
      })).rejects.toThrow();
    });

    test('deve validar categoria obrigatória', async () => {
      await expect(Product.create({
        name: 'Produto Sem Categoria',
        // category faltando
        dimensions: { width: { min: 10, max: 30, default: 20 } },
        materials: ['papel_300g'],
        price: { base: 1.0, per_cm: 0.02 },
        template: 'teste'
      })).rejects.toThrow();
    });
  });
});

