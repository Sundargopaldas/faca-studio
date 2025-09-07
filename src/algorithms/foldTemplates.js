/**
 * Templates de Dobras para Facas de Embalagem
 * Sistema avançado para criação de modelos com dobras e cantos variados
 */

class FoldTemplate {
  constructor(name, type, description) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.folds = [];
    this.corners = [];
    this.tabs = [];
  }

  addFold(start, end, type = 'valley', angle = 90) {
    this.folds.push({
      start: { x: start.x, y: start.y },
      end: { x: end.x, y: end.y },
      type: type, // 'valley' (vale) ou 'mountain' (montanha)
      angle: angle
    });
    return this;
  }

  addCorner(center, radius, type = 'rounded') {
    this.corners.push({
      center: { x: center.x, y: center.y },
      radius: radius,
      type: type // 'rounded', 'square', 'chamfered'
    });
    return this;
  }

  addTab(position, width, height, type = 'standard') {
    this.tabs.push({
      position: { x: position.x, y: position.y },
      width: width,
      height: height,
      type: type // 'standard', 'rounded', 'notched'
    });
    return this;
  }
}

class FoldTemplateLibrary {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    // 1. Caixa com Abas Padrão
    this.createStandardBox();
    
    // 2. Caixa com Cantos Arredondados
    this.createRoundedBox();
    
    // 3. Sacola com Alça
    this.createHandleBag();
    
    // 4. Caixa de Janela
    this.createWindowBox();
    
    // 5. Caixa de Cosméticos
    this.createCosmeticBox();
    
    // 6. Caixa com Dobras Complexas
    this.createComplexBox();
    
    // 7. Embalagem de Presente
    this.createGiftBox();
    
    // 8. Caixa de Pizza
    this.createPizzaBox();
  }

  createStandardBox() {
    const template = new FoldTemplate(
      'Caixa com Abas Padrão',
      'box',
      'Caixa retangular com abas de fechamento padrão'
    );

    // Dobras principais (vales)
    template
      .addFold({ x: 0, y: 10 }, { x: 25, y: 10 }, 'valley', 90)  // Dobra inferior
      .addFold({ x: 0, y: 20 }, { x: 25, y: 20 }, 'valley', 90)  // Dobra superior
      .addFold({ x: 10, y: 0 }, { x: 10, y: 30 }, 'valley', 90)  // Dobra esquerda
      .addFold({ x: 15, y: 0 }, { x: 15, y: 30 }, 'valley', 90); // Dobra direita

    // Abas de fechamento
    template
      .addTab({ x: 0, y: 0 }, 2, 2, 'standard')    // Aba esquerda superior
      .addTab({ x: 23, y: 0 }, 2, 2, 'standard')   // Aba direita superior
      .addTab({ x: 0, y: 28 }, 2, 2, 'standard')   // Aba esquerda inferior
      .addTab({ x: 23, y: 28 }, 2, 2, 'standard'); // Aba direita inferior

    this.templates.set('standard_box', template);
  }

  createRoundedBox() {
    const template = new FoldTemplate(
      'Caixa com Cantos Arredondados',
      'box',
      'Caixa com cantos arredondados e dobras suaves'
    );

    // Dobras principais
    template
      .addFold({ x: 0, y: 10 }, { x: 25, y: 10 }, 'valley', 90)
      .addFold({ x: 0, y: 20 }, { x: 25, y: 20 }, 'valley', 90)
      .addFold({ x: 10, y: 0 }, { x: 10, y: 30 }, 'valley', 90)
      .addFold({ x: 15, y: 0 }, { x: 15, y: 30 }, 'valley', 90);

    // Cantos arredondados
    template
      .addCorner({ x: 2, y: 2 }, 2, 'rounded')      // Canto superior esquerdo
      .addCorner({ x: 23, y: 2 }, 2, 'rounded')     // Canto superior direito
      .addCorner({ x: 2, y: 28 }, 2, 'rounded')     // Canto inferior esquerdo
      .addCorner({ x: 23, y: 28 }, 2, 'rounded');   // Canto inferior direito

    // Abas arredondadas
    template
      .addTab({ x: 0, y: 0 }, 2, 2, 'rounded')
      .addTab({ x: 23, y: 0 }, 2, 2, 'rounded')
      .addTab({ x: 0, y: 28 }, 2, 2, 'rounded')
      .addTab({ x: 23, y: 28 }, 2, 2, 'rounded');

    this.templates.set('rounded_box', template);
  }

  createHandleBag() {
    const template = new FoldTemplate(
      'Sacola com Alça',
      'bag',
      'Sacola com alça integrada e dobras laterais'
    );

    // Dobras principais
    template
      .addFold({ x: 0, y: 8 }, { x: 20, y: 8 }, 'valley', 90)   // Dobra inferior
      .addFold({ x: 0, y: 22 }, { x: 20, y: 22 }, 'valley', 90) // Dobra superior
      .addFold({ x: 5, y: 0 }, { x: 5, y: 30 }, 'valley', 90)   // Dobra lateral esquerda
      .addFold({ x: 15, y: 0 }, { x: 15, y: 30 }, 'valley', 90); // Dobra lateral direita

    // Alça
    template
      .addFold({ x: 8, y: 0 }, { x: 12, y: 0 }, 'mountain', 180) // Dobra da alça
      .addTab({ x: 8, y: -3 }, 4, 3, 'rounded'); // Alça

    // Cantos arredondados
    template
      .addCorner({ x: 2, y: 2 }, 1.5, 'rounded')
      .addCorner({ x: 18, y: 2 }, 1.5, 'rounded')
      .addCorner({ x: 2, y: 28 }, 1.5, 'rounded')
      .addCorner({ x: 18, y: 28 }, 1.5, 'rounded');

    this.templates.set('handle_bag', template);
  }

  createWindowBox() {
    const template = new FoldTemplate(
      'Caixa de Janela',
      'box',
      'Caixa com janela transparente e dobras especiais'
    );

    // Dobras principais
    template
      .addFold({ x: 0, y: 12 }, { x: 30, y: 12 }, 'valley', 90)
      .addFold({ x: 0, y: 18 }, { x: 30, y: 18 }, 'valley', 90)
      .addFold({ x: 12, y: 0 }, { x: 12, y: 30 }, 'valley', 90)
      .addFold({ x: 18, y: 0 }, { x: 18, y: 30 }, 'valley', 90);

    // Janela (área sem dobra)
    template.window = {
      x: 12,
      y: 12,
      width: 6,
      height: 6
    };

    // Abas especiais para janela
    template
      .addTab({ x: 0, y: 0 }, 3, 2, 'notched')
      .addTab({ x: 27, y: 0 }, 3, 2, 'notched')
      .addTab({ x: 0, y: 28 }, 3, 2, 'notched')
      .addTab({ x: 27, y: 28 }, 3, 2, 'notched');

    this.templates.set('window_box', template);
  }

  createCosmeticBox() {
    const template = new FoldTemplate(
      'Caixa de Cosméticos',
      'box',
      'Caixa elegante com dobras em ângulo e cantos chanfrados'
    );

    // Dobras em ângulo
    template
      .addFold({ x: 0, y: 10 }, { x: 20, y: 10 }, 'valley', 90)
      .addFold({ x: 0, y: 20 }, { x: 20, y: 20 }, 'valley', 90)
      .addFold({ x: 8, y: 0 }, { x: 8, y: 30 }, 'valley', 90)
      .addFold({ x: 12, y: 0 }, { x: 12, y: 30 }, 'valley', 90);

    // Cantos chanfrados
    template
      .addCorner({ x: 2, y: 2 }, 1, 'chamfered')
      .addCorner({ x: 18, y: 2 }, 1, 'chamfered')
      .addCorner({ x: 2, y: 28 }, 1, 'chamfered')
      .addCorner({ x: 18, y: 28 }, 1, 'chamfered');

    // Abas elegantes
    template
      .addTab({ x: 0, y: 0 }, 2.5, 1.5, 'rounded')
      .addTab({ x: 17.5, y: 0 }, 2.5, 1.5, 'rounded')
      .addTab({ x: 0, y: 28.5 }, 2.5, 1.5, 'rounded')
      .addTab({ x: 17.5, y: 28.5 }, 2.5, 1.5, 'rounded');

    this.templates.set('cosmetic_box', template);
  }

  createComplexBox() {
    const template = new FoldTemplate(
      'Caixa com Dobras Complexas',
      'box',
      'Caixa com múltiplas dobras e cantos variados'
    );

    // Dobras principais
    template
      .addFold({ x: 0, y: 8 }, { x: 25, y: 8 }, 'valley', 90)
      .addFold({ x: 0, y: 17 }, { x: 25, y: 17 }, 'valley', 90)
      .addFold({ x: 0, y: 22 }, { x: 25, y: 22 }, 'valley', 90)
      .addFold({ x: 8, y: 0 }, { x: 8, y: 30 }, 'valley', 90)
      .addFold({ x: 17, y: 0 }, { x: 17, y: 30 }, 'valley', 90);

    // Dobras secundárias (montanhas)
    template
      .addFold({ x: 4, y: 0 }, { x: 4, y: 30 }, 'mountain', 90)
      .addFold({ x: 21, y: 0 }, { x: 21, y: 30 }, 'mountain', 90);

    // Cantos variados
    template
      .addCorner({ x: 2, y: 2 }, 1, 'rounded')
      .addCorner({ x: 23, y: 2 }, 1.5, 'chamfered')
      .addCorner({ x: 2, y: 28 }, 1.5, 'chamfered')
      .addCorner({ x: 23, y: 28 }, 1, 'rounded');

    // Abas múltiplas
    template
      .addTab({ x: 0, y: 0 }, 2, 1.5, 'standard')
      .addTab({ x: 6, y: 0 }, 2, 1.5, 'rounded')
      .addTab({ x: 17, y: 0 }, 2, 1.5, 'notched')
      .addTab({ x: 23, y: 0 }, 2, 1.5, 'standard');

    this.templates.set('complex_box', template);
  }

  createGiftBox() {
    const template = new FoldTemplate(
      'Embalagem de Presente',
      'box',
      'Caixa decorativa com dobras especiais para presentes'
    );

    // Dobras principais
    template
      .addFold({ x: 0, y: 10 }, { x: 20, y: 10 }, 'valley', 90)
      .addFold({ x: 0, y: 20 }, { x: 20, y: 20 }, 'valley', 90)
      .addFold({ x: 10, y: 0 }, { x: 10, y: 30 }, 'valley', 90);

    // Dobras decorativas
    template
      .addFold({ x: 5, y: 0 }, { x: 5, y: 30 }, 'mountain', 45)
      .addFold({ x: 15, y: 0 }, { x: 15, y: 30 }, 'mountain', 45);

    // Cantos decorativos
    template
      .addCorner({ x: 2, y: 2 }, 2, 'rounded')
      .addCorner({ x: 18, y: 2 }, 2, 'rounded')
      .addCorner({ x: 2, y: 28 }, 2, 'rounded')
      .addCorner({ x: 18, y: 28 }, 2, 'rounded');

    // Abas decorativas
    template
      .addTab({ x: 0, y: 0 }, 3, 2, 'rounded')
      .addTab({ x: 17, y: 0 }, 3, 2, 'rounded')
      .addTab({ x: 0, y: 28 }, 3, 2, 'rounded')
      .addTab({ x: 17, y: 28 }, 3, 2, 'rounded');

    this.templates.set('gift_box', template);
  }

  createPizzaBox() {
    const template = new FoldTemplate(
      'Caixa de Pizza',
      'box',
      'Caixa quadrada com dobras especiais para pizza'
    );

    // Dobras principais
    template
      .addFold({ x: 0, y: 15 }, { x: 30, y: 15 }, 'valley', 90)
      .addFold({ x: 15, y: 0 }, { x: 15, y: 30 }, 'valley', 90);

    // Dobras de ventilação
    template
      .addFold({ x: 5, y: 5 }, { x: 10, y: 5 }, 'valley', 45)
      .addFold({ x: 20, y: 5 }, { x: 25, y: 5 }, 'valley', 45)
      .addFold({ x: 5, y: 25 }, { x: 10, y: 25 }, 'valley', 45)
      .addFold({ x: 20, y: 25 }, { x: 25, y: 25 }, 'valley', 45);

    // Cantos arredondados
    template
      .addCorner({ x: 2, y: 2 }, 2, 'rounded')
      .addCorner({ x: 28, y: 2 }, 2, 'rounded')
      .addCorner({ x: 2, y: 28 }, 2, 'rounded')
      .addCorner({ x: 28, y: 28 }, 2, 'rounded');

    // Abas de fechamento
    template
      .addTab({ x: 0, y: 0 }, 4, 3, 'standard')
      .addTab({ x: 26, y: 0 }, 4, 3, 'standard')
      .addTab({ x: 0, y: 27 }, 4, 3, 'standard')
      .addTab({ x: 26, y: 27 }, 4, 3, 'standard');

    this.templates.set('pizza_box', template);
  }

  getTemplate(name) {
    return this.templates.get(name);
  }

  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  getTemplatesByType(type) {
    return this.getAllTemplates().filter(template => template.type === type);
  }
}

module.exports = { FoldTemplate, FoldTemplateLibrary };

