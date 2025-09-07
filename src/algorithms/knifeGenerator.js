/**
 * Gerador de Facas para Embalagens
 * Implementa algoritmos para gerar facas baseadas em produtos e dimensões
 */

class KnifeGenerator {
  constructor() {
    this.templates = {
      'caixa_bolo_simples': this.generateBoxTemplate.bind(this),
      'sacola_alca_vazada': this.generateBagTemplate.bind(this),
      'caixa_visor': this.generateWindowBoxTemplate.bind(this),
      'caixa_cosmeticos': this.generateCosmeticsBoxTemplate.bind(this)
    };
  }

  /**
   * Gerar faca para um produto
   * @param {Object} params - Parâmetros de geração
   * @param {string} params.template - Template a usar
   * @param {Object} params.dimensions - Dimensões do produto
   * @param {Object} params.customizations - Personalizações
   * @returns {Object} Dados da faca gerada
   */
  generateKnife(params) {
    const { template, dimensions, customizations = {} } = params;
    
    if (!template) {
      throw new Error('Template é obrigatório');
    }
    
    if (!dimensions) {
      throw new Error('Dimensões são obrigatórias');
    }
    
    const templateFunction = this.templates[template];
    if (!templateFunction) {
      throw new Error(`Template '${template}' não encontrado`);
    }
    
    // Validar dimensões
    this.validateDimensions(template, dimensions);
    
    // Gerar faca
    const knifeData = templateFunction(dimensions, customizations);
    
    // Adicionar metadados
    knifeData.metadata = {
      template,
      dimensions,
      customizations,
      generatedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return knifeData;
  }

  /**
   * Gerar template de caixa simples
   */
  generateBoxTemplate(dimensions, customizations) {
    const { width, height, depth } = dimensions;
    const { material = 'papel_300g', color = '#ffffff' } = customizations;
    
    // Calcular dimensões da faca
    const knifeWidth = width + (depth * 2);
    const knifeHeight = height + (depth * 2);
    
    // Gerar SVG
    const svg = this.generateBoxSVG(knifeWidth, knifeHeight, depth, width, height);
    
    // Gerar dados de layout
    const layout = this.generateBoxLayout(knifeWidth, knifeHeight, depth, width, height);
    
    return {
      svg,
      layout,
      dimensions: {
        knifeWidth,
        knifeHeight,
        productWidth: width,
        productHeight: height,
        productDepth: depth
      },
      material,
      color,
      type: 'box'
    };
  }

  /**
   * Gerar template de sacola
   */
  generateBagTemplate(dimensions, customizations) {
    const { width, height, handle } = dimensions;
    const { material = 'papel_300g', color = '#ffffff' } = customizations;
    
    // Calcular dimensões da faca
    const knifeWidth = width + 4; // Margem lateral
    const knifeHeight = height + 8; // Margem superior e inferior
    
    // Gerar SVG
    const svg = this.generateBagSVG(knifeWidth, knifeHeight, width, height, handle);
    
    // Gerar dados de layout
    const layout = this.generateBagLayout(knifeWidth, knifeHeight, width, height, handle);
    
    return {
      svg,
      layout,
      dimensions: {
        knifeWidth,
        knifeHeight,
        productWidth: width,
        productHeight: height,
        handleSize: handle
      },
      material,
      color,
      type: 'bag'
    };
  }

  /**
   * Gerar template de caixa com visor
   */
  generateWindowBoxTemplate(dimensions, customizations) {
    const { width, height, depth } = dimensions;
    const { material = 'papel_300g', color = '#ffffff', windowSize = 0.6 } = customizations;
    
    // Calcular dimensões da faca
    const knifeWidth = width + (depth * 2);
    const knifeHeight = height + (depth * 2);
    
    // Gerar SVG
    const svg = this.generateWindowBoxSVG(knifeWidth, knifeHeight, depth, width, height, windowSize);
    
    // Gerar dados de layout
    const layout = this.generateBoxLayout(knifeWidth, knifeHeight, depth, width, height);
    
    return {
      svg,
      layout,
      dimensions: {
        knifeWidth,
        knifeHeight,
        productWidth: width,
        productHeight: height,
        productDepth: depth,
        windowSize
      },
      material,
      color,
      type: 'window_box'
    };
  }

  /**
   * Gerar template de caixa de cosméticos
   */
  generateCosmeticsBoxTemplate(dimensions, customizations) {
    const { width, height, depth } = dimensions;
    const { material = 'cartao_400g', color = '#ffffff' } = customizations;
    
    // Calcular dimensões da faca
    const knifeWidth = width + (depth * 2);
    const knifeHeight = height + (depth * 2);
    
    // Gerar SVG
    const svg = this.generateCosmeticsBoxSVG(knifeWidth, knifeHeight, depth, width, height);
    
    // Gerar dados de layout
    const layout = this.generateBoxLayout(knifeWidth, knifeHeight, depth, width, height);
    
    return {
      svg,
      layout,
      dimensions: {
        knifeWidth,
        knifeHeight,
        productWidth: width,
        productHeight: height,
        productDepth: depth
      },
      material,
      color,
      type: 'cosmetics_box'
    };
  }

  /**
   * Gerar SVG para caixa
   */
  generateBoxSVG(knifeWidth, knifeHeight, depth, width, height) {
    const scale = 10; // 1cm = 10px
    const w = knifeWidth * scale;
    const h = knifeHeight * scale;
    const d = depth * scale;
    const pw = width * scale;
    const ph = height * scale;
    
    return `
      <svg width="${w + 40}" height="${h + 40}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cutPattern" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#ff0000" stroke-width="1"/>
          </pattern>
          <pattern id="foldPattern" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#0000ff" stroke-width="1" stroke-dasharray="2,2"/>
          </pattern>
        </defs>
        
        <!-- Base da caixa -->
        <rect x="20" y="${20 + d}" width="${pw}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Lados -->
        <rect x="20" y="20" width="${pw}" height="${d}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="20" y="${20 + ph + d}" width="${pw}" height="${d}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="20" y="${20 + d}" width="${d}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="${20 + pw + d}" y="${20 + d}" width="${d}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Linhas de vinco -->
        <line x1="20" y1="${20 + d}" x2="${20 + pw}" y2="${20 + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="20" y1="${20 + ph + d}" x2="${20 + pw}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${20 + d}" y1="${20 + d}" x2="${20 + d}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${20 + pw + d}" y1="${20 + d}" x2="${20 + pw + d}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        
        <!-- Texto de identificação -->
        <text x="${20 + w/2}" y="${20 + h/2}" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#333">
          ${width}x${height}x${depth}cm
        </text>
      </svg>
    `;
  }

  /**
   * Gerar SVG para sacola
   */
  generateBagSVG(knifeWidth, knifeHeight, width, height, handle) {
    const scale = 10;
    const w = knifeWidth * scale;
    const h = knifeHeight * scale;
    const pw = width * scale;
    const ph = height * scale;
    const handleSize = handle * scale;
    
    return `
      <svg width="${w + 40}" height="${h + 40}" xmlns="http://www.w3.org/2000/svg">
        <!-- Corpo da sacola -->
        <rect x="20" y="20" width="${pw}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Alça -->
        <rect x="${20 + pw/2 - handleSize/2}" y="10" width="${handleSize}" height="20" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Linhas de vinco -->
        <line x1="20" y1="${20 + ph/2}" x2="${20 + pw}" y2="${20 + ph/2}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        
        <!-- Texto de identificação -->
        <text x="${20 + pw/2}" y="${20 + ph/2}" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#333">
          ${width}x${height}cm
        </text>
      </svg>
    `;
  }

  /**
   * Gerar SVG para caixa com visor
   */
  generateWindowBoxSVG(knifeWidth, knifeHeight, depth, width, height, windowSize) {
    const scale = 10;
    const w = knifeWidth * scale;
    const h = knifeHeight * scale;
    const d = depth * scale;
    const pw = width * scale;
    const ph = height * scale;
    const windowW = pw * windowSize;
    const windowH = ph * windowSize;
    
    return `
      <svg width="${w + 40}" height="${h + 40}" xmlns="http://www.w3.org/2000/svg">
        <!-- Base da caixa -->
        <rect x="20" y="${20 + d}" width="${pw}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Janela de acetato -->
        <rect x="${20 + pw/2 - windowW/2}" y="${20 + d + ph/2 - windowH/2}" 
              width="${windowW}" height="${windowH}" 
              fill="none" stroke="#00ff00" stroke-width="2" stroke-dasharray="2,2"/>
        
        <!-- Lados -->
        <rect x="20" y="20" width="${pw}" height="${d}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="20" y="${20 + ph + d}" width="${pw}" height="${d}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="20" y="${20 + d}" width="${d}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="${20 + pw + d}" y="${20 + d}" width="${d}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Linhas de vinco -->
        <line x1="20" y1="${20 + d}" x2="${20 + pw}" y2="${20 + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="20" y1="${20 + ph + d}" x2="${20 + pw}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${20 + d}" y1="${20 + d}" x2="${20 + d}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${20 + pw + d}" y1="${20 + d}" x2="${20 + pw + d}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        
        <!-- Texto de identificação -->
        <text x="${20 + w/2}" y="${20 + h/2}" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#333">
          ${width}x${height}x${depth}cm
        </text>
      </svg>
    `;
  }

  /**
   * Gerar SVG para caixa de cosméticos
   */
  generateCosmeticsBoxSVG(knifeWidth, knifeHeight, depth, width, height) {
    const scale = 10;
    const w = knifeWidth * scale;
    const h = knifeHeight * scale;
    const d = depth * scale;
    const pw = width * scale;
    const ph = height * scale;
    
    return `
      <svg width="${w + 40}" height="${h + 40}" xmlns="http://www.w3.org/2000/svg">
        <!-- Base da caixa -->
        <rect x="20" y="${20 + d}" width="${pw}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Lados -->
        <rect x="20" y="20" width="${pw}" height="${d}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="20" y="${20 + ph + d}" width="${pw}" height="${d}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="20" y="${20 + d}" width="${d}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="${20 + pw + d}" y="${20 + d}" width="${d}" height="${ph}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Linhas de vinco -->
        <line x1="20" y1="${20 + d}" x2="${20 + pw}" y2="${20 + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="20" y1="${20 + ph + d}" x2="${20 + pw}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${20 + d}" y1="${20 + d}" x2="${20 + d}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${20 + pw + d}" y1="${20 + d}" x2="${20 + pw + d}" y2="${20 + ph + d}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        
        <!-- Texto de identificação -->
        <text x="${20 + w/2}" y="${20 + h/2}" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#333">
          ${width}x${height}x${depth}cm
        </text>
      </svg>
    `;
  }

  /**
   * Gerar layout para caixa
   */
  generateBoxLayout(knifeWidth, knifeHeight, depth, width, height) {
    return {
      sheet: { width: 21, height: 29.7 }, // A4
      pieces: [
        { x: 1, y: 1, width: knifeWidth, height: knifeHeight, rotation: 0 }
      ],
      efficiency: 85,
      waste_percentage: 15,
      total_pieces: 8,
      estimated_cost: this.calculateCost(knifeWidth, knifeHeight)
    };
  }

  /**
   * Gerar layout para sacola
   */
  generateBagLayout(knifeWidth, knifeHeight, width, height, handle) {
    return {
      sheet: { width: 21, height: 29.7 }, // A4
      pieces: [
        { x: 1, y: 1, width: knifeWidth, height: knifeHeight, rotation: 0 }
      ],
      efficiency: 80,
      waste_percentage: 20,
      total_pieces: 6,
      estimated_cost: this.calculateCost(knifeWidth, knifeHeight)
    };
  }

  /**
   * Calcular custo
   */
  calculateCost(width, height) {
    const costPerCm2 = 0.02; // R$ 0,02 por cm²
    const area = width * height;
    return Math.round(area * costPerCm2 * 100) / 100;
  }

  /**
   * Validar dimensões
   */
  validateDimensions(template, dimensions) {
    const limits = {
      'caixa_bolo_simples': {
        width: { min: 15, max: 50 },
        height: { min: 5, max: 20 },
        depth: { min: 15, max: 50 }
      },
      'sacola_alca_vazada': {
        width: { min: 20, max: 40 },
        height: { min: 25, max: 50 },
        handle: { min: 5, max: 15 }
      },
      'caixa_visor': {
        width: { min: 15, max: 40 },
        height: { min: 8, max: 25 },
        depth: { min: 15, max: 40 }
      },
      'caixa_cosmeticos': {
        width: { min: 10, max: 30 },
        height: { min: 5, max: 15 },
        depth: { min: 10, max: 30 }
      }
    };
    
    const templateLimits = limits[template];
    if (!templateLimits) {
      throw new Error(`Limites não definidos para template '${template}'`);
    }
    
    const errors = [];
    
    Object.keys(templateLimits).forEach(key => {
      const value = dimensions[key];
      const limit = templateLimits[key];
      
      if (value === undefined || value === null) {
        errors.push(`${key} é obrigatório`);
        return;
      }
      
      if (value < limit.min || value > limit.max) {
        errors.push(`${key} deve estar entre ${limit.min} e ${limit.max}cm`);
      }
    });
    
    if (errors.length > 0) {
      throw new Error(`Dimensões inválidas: ${errors.join(', ')}`);
    }
  }
}

module.exports = KnifeGenerator;

