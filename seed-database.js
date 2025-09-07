#!/usr/bin/env node

/**
 * Script de Dados de Teste
 * Insere produtos e templates de exemplo
 */

const { sequelize, User, Product, Project, Template, Export } = require('./src/models');

console.log('🌱 INSERINDO DADOS DE TESTE\n');

async function seedDatabase() {
  try {
    // Conectar ao banco
    console.log('📡 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');
    
    // Sincronizar modelos
    console.log('🔄 Sincronizando modelos...');
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');
    
    // Limpar dados existentes (opcional)
    console.log('🧹 Limpando dados existentes...');
    await Export.destroy({ where: {} });
    await Project.destroy({ where: {} });
    await Template.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log('✅ Dados limpos');
    
    // Criar usuários de teste
    console.log('👥 Criando usuários de teste...');
    const users = await User.bulkCreate([
      {
        name: 'Admin',
        email: 'admin@pactmaker.com',
        password: '123456',
        subscription: 'enterprise'
      },
      {
        name: 'João Silva',
        email: 'joao@teste.com',
        password: '123456',
        subscription: 'pro'
      },
      {
        name: 'Maria Santos',
        email: 'maria@teste.com',
        password: '123456',
        subscription: 'free'
      }
    ]);
    console.log(`✅ ${users.length} usuários criados`);
    
    // Criar produtos
    console.log('📦 Criando produtos...');
    const products = await Product.bulkCreate([
      {
        name: 'Caixa de Bolo Simples',
        category: 'alimentos',
        description: 'Caixa quadrada para bolos e tortas com design clássico',
        dimensions: {
          width: { min: 15, max: 50, default: 25 },
          height: { min: 5, max: 20, default: 10 },
          depth: { min: 15, max: 50, default: 25 }
        },
        materials: ['papel_300g', 'papel_250g', 'kraft_180g'],
        price: { base: 0.85, per_cm: 0.02 },
        template: 'caixa_bolo_simples',
        preview: '/assets/images/caixa_bolo_simples.jpg',
        sort_order: 1
      },
      {
        name: 'Sacola com Alça Vazada',
        category: 'sacolas',
        description: 'Sacola tradicional com alça vazada para fácil transporte',
        dimensions: {
          width: { min: 20, max: 40, default: 30 },
          height: { min: 25, max: 50, default: 35 },
          handle: { min: 5, max: 15, default: 8 }
        },
        materials: ['papel_300g', 'kraft_180g', 'cartao_400g'],
        price: { base: 0.65, per_cm: 0.015 },
        template: 'sacola_alca_vazada',
        preview: '/assets/images/sacola_alca_vazada.jpg',
        sort_order: 2
      },
      {
        name: 'Caixa com Visor',
        category: 'alimentos',
        description: 'Caixa com janela de acetato para visualização do produto',
        dimensions: {
          width: { min: 15, max: 40, default: 25 },
          height: { min: 8, max: 25, default: 12 },
          depth: { min: 15, max: 40, default: 25 }
        },
        materials: ['papel_300g', 'cartao_400g'],
        price: { base: 1.20, per_cm: 0.025 },
        template: 'caixa_visor',
        preview: '/assets/images/caixa_visor.jpg',
        sort_order: 3
      },
      {
        name: 'Caixa de Cosméticos',
        category: 'cosmeticos',
        description: 'Caixa elegante para produtos de beleza e cosméticos',
        dimensions: {
          width: { min: 10, max: 30, default: 20 },
          height: { min: 5, max: 15, default: 8 },
          depth: { min: 10, max: 30, default: 20 }
        },
        materials: ['cartao_400g', 'papel_300g'],
        price: { base: 1.50, per_cm: 0.03 },
        template: 'caixa_cosmeticos',
        preview: '/assets/images/caixa_cosmeticos.jpg',
        sort_order: 4
      },
      {
        name: 'Embalagem Eletrônicos',
        category: 'eletronicos',
        description: 'Caixa protetora para dispositivos eletrônicos',
        dimensions: {
          width: { min: 12, max: 35, default: 22 },
          height: { min: 6, max: 18, default: 10 },
          depth: { min: 12, max: 35, default: 22 }
        },
        materials: ['cartao_400g', 'papel_300g'],
        price: { base: 2.00, per_cm: 0.035 },
        template: 'caixa_eletronicos',
        preview: '/assets/images/caixa_eletronicos.jpg',
        sort_order: 5
      }
    ]);
    console.log(`✅ ${products.length} produtos criados`);
    
    // Criar templates
    console.log('📋 Criando templates...');
    const templates = await Template.bulkCreate([
      {
        name: 'Caixa de Bolo Clássica',
        category: 'alimentos',
        description: 'Template clássico para caixas de bolo com design elegante',
        preview_image: '/assets/templates/caixa_bolo_classica.jpg',
        svg_template: `
          <svg width="{{width}}" height="{{height}}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="{{width}}" height="{{height}}" 
                  fill="none" stroke="#ff0000" stroke-width="2"/>
            <text x="{{width/2}}" y="{{height/2}}" text-anchor="middle">
              Caixa de Bolo
            </text>
          </svg>
        `,
        default_dimensions: { width: 25, height: 10, depth: 25 },
        parameters: {
          width: { min: 15, max: 50, label: 'Largura' },
          height: { min: 5, max: 20, label: 'Altura' },
          depth: { min: 15, max: 50, label: 'Profundidade' }
        },
        is_premium: false,
        usage_count: 1250,
        tags: ['bolo', 'alimentos', 'clássico']
      },
      {
        name: 'Sacola Premium',
        category: 'sacolas',
        description: 'Sacola de luxo com alça reforçada e design moderno',
        preview_image: '/assets/templates/sacola_premium.jpg',
        svg_template: `
          <svg width="{{width}}" height="{{height}}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="{{width}}" height="{{height}}" 
                  fill="none" stroke="#ff0000" stroke-width="2"/>
            <rect x="{{width/2-{{handle}}/2}}" y="0" width="{{handle}}" height="20" 
                  fill="none" stroke="#ff0000" stroke-width="2"/>
          </svg>
        `,
        default_dimensions: { width: 30, height: 35, handle: 8 },
        parameters: {
          width: { min: 20, max: 40, label: 'Largura' },
          height: { min: 25, max: 50, label: 'Altura' },
          handle: { min: 5, max: 15, label: 'Alça' }
        },
        is_premium: true,
        usage_count: 890,
        tags: ['sacola', 'luxo', 'premium']
      },
      {
        name: 'Caixa de Cosméticos Elegante',
        category: 'cosmeticos',
        description: 'Caixa elegante para produtos de beleza com acabamento premium',
        preview_image: '/assets/templates/caixa_cosmeticos_elegante.jpg',
        svg_template: `
          <svg width="{{width}}" height="{{height}}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="{{width}}" height="{{height}}" 
                  fill="none" stroke="#ff0000" stroke-width="2"/>
            <text x="{{width/2}}" y="{{height/2}}" text-anchor="middle">
              Cosméticos
            </text>
          </svg>
        `,
        default_dimensions: { width: 20, height: 8, depth: 20 },
        parameters: {
          width: { min: 10, max: 30, label: 'Largura' },
          height: { min: 5, max: 15, label: 'Altura' },
          depth: { min: 10, max: 30, label: 'Profundidade' }
        },
        is_premium: true,
        usage_count: 650,
        tags: ['cosméticos', 'beleza', 'elegante']
      }
    ]);
    console.log(`✅ ${templates.length} templates criados`);
    
    // Criar projetos de exemplo
    console.log('📁 Criando projetos de exemplo...');
    const projects = await Project.bulkCreate([
      {
        user_id: users[1].id,
        product_id: products[0].id,
        name: 'Bolo de Aniversário',
        description: 'Caixa para bolo de aniversário personalizado',
        dimensions: { width: 30, height: 12, depth: 30 },
        customizations: { color: '#ff6b6b', material: 'papel_300g' },
        status: 'generated',
        estimated_cost: 2.50
      },
      {
        user_id: users[1].id,
        product_id: products[1].id,
        name: 'Sacola da Loja',
        description: 'Sacola para a loja de roupas',
        dimensions: { width: 35, height: 40, handle: 10 },
        customizations: { color: '#4ecdc4', material: 'kraft_180g' },
        status: 'draft',
        estimated_cost: 1.80
      },
      {
        user_id: users[2].id,
        product_id: products[2].id,
        name: 'Caixa de Chocolate',
        description: 'Caixa com visor para chocolates artesanais',
        dimensions: { width: 20, height: 10, depth: 20 },
        customizations: { color: '#8b4513', material: 'cartao_400g' },
        status: 'exported',
        estimated_cost: 3.20
      }
    ]);
    console.log(`✅ ${projects.length} projetos criados`);
    
    // Criar exports de exemplo
    console.log('📤 Criando exports de exemplo...');
    const exports = await Export.bulkCreate([
      {
        project_id: projects[0].id,
        user_id: users[1].id,
        format: 'svg',
        file_path: '/data/exports/faca_bolo_aniversario.svg',
        file_size: 15420,
        download_count: 3,
        status: 'completed',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        project_id: projects[2].id,
        user_id: users[2].id,
        format: 'pdf',
        file_path: '/data/exports/faca_chocolate.pdf',
        file_size: 25680,
        download_count: 1,
        status: 'completed',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log(`✅ ${exports.length} exports criados`);
    
    console.log('\n🎉 DADOS DE TESTE INSERIDOS COM SUCESSO!');
    console.log('\n📊 Resumo:');
    console.log(`- ${users.length} usuários`);
    console.log(`- ${products.length} produtos`);
    console.log(`- ${templates.length} templates`);
    console.log(`- ${projects.length} projetos`);
    console.log(`- ${exports.length} exports`);
    
    console.log('\n🔑 Credenciais de teste:');
    console.log('Admin: admin@pactmaker.com / 123456');
    console.log('Usuário Pro: joao@teste.com / 123456');
    console.log('Usuário Free: maria@teste.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados de teste:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

