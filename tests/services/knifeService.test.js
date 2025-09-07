/**
 * Testes para o KnifeService
 */

const KnifeService = require('../../src/services/KnifeService');
const { User, Product, Project } = require('../../src/models');

describe('KnifeService', () => {
  let user, product, project;

  beforeEach(async () => {
    // Criar usuário de teste
    user = await User.create({
      name: 'Teste User',
      email: 'teste@teste.com',
      password: '123456'
    });

    // Criar produto de teste
    product = await Product.create({
      name: 'Caixa de Teste',
      category: 'alimentos',
      description: 'Produto para teste',
      dimensions: {
        width: { min: 10, max: 30, default: 20 },
        height: { min: 5, max: 15, default: 10 },
        depth: { min: 10, max: 30, default: 20 }
      },
      materials: ['papel_300g'],
      price: { base: 1.0, per_cm: 0.02 },
      template: 'caixa_bolo_simples'
    });

    // Criar projeto de teste
    project = await Project.create({
      user_id: user.id,
      product_id: product.id,
      name: 'Projeto de Teste',
      description: 'Projeto para teste',
      dimensions: { width: 20, height: 10, depth: 20 },
      customizations: { material: 'papel_300g' },
      status: 'draft'
    });
  });

  describe('generateKnife', () => {
    test('deve gerar faca para projeto válido', async () => {
      const knifeData = await KnifeService.generateKnife(project.id, user.id);

      expect(knifeData).toBeDefined();
      expect(knifeData.id).toBeDefined();
      expect(knifeData.projectId).toBe(project.id);
      expect(knifeData.productId).toBe(product.id);
      expect(knifeData.dimensions).toEqual(project.dimensions);
      expect(knifeData.svg).toBeDefined();
      expect(knifeData.layout).toBeDefined();
      expect(knifeData.metadata).toBeDefined();
    });

    test('deve falhar com projeto inexistente', async () => {
      await expect(KnifeService.generateKnife(99999, user.id))
        .rejects.toThrow('Projeto não encontrado');
    });

    test('deve falhar com usuário sem permissão', async () => {
      const otherUser = await User.create({
        name: 'Outro User',
        email: 'outro@teste.com',
        password: '123456'
      });

      await expect(KnifeService.generateKnife(project.id, otherUser.id))
        .rejects.toThrow('Projeto não encontrado');
    });
  });

  describe('generateSVG', () => {
    test('deve gerar SVG para caixa', async () => {
      // Atualizar projeto com produto
      project.product = product;
      const svg = KnifeService.generateSVG(project);

      expect(svg).toBeDefined();
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
      expect(svg).toContain('width');
      expect(svg).toContain('height');
    });

    test('deve gerar SVG para sacola', async () => {
      const bagProduct = await Product.create({
        name: 'Sacola de Teste',
        category: 'sacolas',
        description: 'Sacola para teste',
        dimensions: {
          width: { min: 20, max: 40, default: 30 },
          height: { min: 25, max: 50, default: 35 },
          handle: { min: 5, max: 15, default: 8 }
        },
        materials: ['papel_300g'],
        price: { base: 0.65, per_cm: 0.015 },
        template: 'sacola_alca_vazada'
      });

      const bagProject = await Project.create({
        user_id: user.id,
        product_id: bagProduct.id,
        name: 'Sacola de Teste',
        dimensions: { width: 30, height: 35, handle: 8 },
        customizations: { material: 'papel_300g' },
        status: 'draft'
      });

      // Atualizar projeto com produto
      bagProject.product = bagProduct;
      const svg = KnifeService.generateSVG(bagProject);

      expect(svg).toBeDefined();
      expect(svg).toContain('<svg');
    });
  });

  describe('generateLayout', () => {
    test('deve gerar layout otimizado', () => {
      const layout = KnifeService.generateLayout(project);

      expect(layout).toBeDefined();
      expect(layout.sheet).toBeDefined();
      expect(layout.pieces).toBeDefined();
      expect(layout.efficiency).toBeGreaterThan(0);
      expect(layout.waste_percentage).toBeGreaterThanOrEqual(0);
      expect(layout.total_pieces).toBeGreaterThan(0);
    });
  });

  describe('optimizeLayout', () => {
    test('deve otimizar layout existente', async () => {
      const optimizedLayout = await KnifeService.optimizeLayout(
        project.id,
        21, // materialWidth
        29.7 // materialHeight
      );

      expect(optimizedLayout).toBeDefined();
      expect(optimizedLayout.original).toBeDefined();
      expect(optimizedLayout.optimized).toBeDefined();
      expect(optimizedLayout.improvement).toBeDefined();
    });

    test('deve falhar com projeto inexistente', async () => {
      await expect(KnifeService.optimizeLayout(99999, 21, 29.7))
        .rejects.toThrow('Projeto não encontrado');
    });
  });

  describe('Métodos auxiliares', () => {
    test('generateSimpleSVG deve funcionar como fallback', () => {
      const dimensions = { width: 20, height: 10, depth: 20 };
      const product = { category: 'alimentos' };

      const svg = KnifeService.generateSimpleSVG(dimensions, product);

      expect(svg).toBeDefined();
      expect(svg).toContain('<svg');
      expect(svg).toContain('20x10x20cm');
    });

    test('generateSimpleLayout deve funcionar como fallback', () => {
      const dimensions = { width: 20, height: 10 };

      const layout = KnifeService.generateSimpleLayout(dimensions);

      expect(layout).toBeDefined();
      expect(layout.sheet).toBeDefined();
      expect(layout.pieces).toHaveLength(1);
      expect(layout.efficiency).toBe(75);
    });
  });
});
