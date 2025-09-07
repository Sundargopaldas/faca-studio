const { Project, Product } = require('../models');
const { LayoutOptimizer, KnifeGenerator } = require('../algorithms');

class KnifeService {
  // Gerar faca baseada no projeto
  static async generateKnife(projectId, userId) {
    try {
      const project = await Project.findOne({
        where: { 
          id: projectId,
          user_id: userId 
        },
        include: [
          {
            model: Product,
            as: 'product'
          }
        ]
      });
      
      if (!project) {
        throw new Error('Projeto não encontrado');
      }
      
      const knifeData = {
        id: `knife_${Date.now()}`,
        projectId: project.id,
        productId: project.product_id,
        dimensions: project.dimensions,
        customizations: project.customizations,
        svg: this.generateSVG(project),
        layout: this.generateLayout(project),
        metadata: {
          generated_at: new Date(),
          version: '1.0',
          product_name: project.product.name,
          estimated_cost: project.estimated_cost
        }
      };
      
      // Atualizar projeto com dados da faca
      await project.update({
        knife_data: knifeData,
        status: 'generated'
      });
      
      return knifeData;
    } catch (error) {
      console.error('Erro ao gerar faca:', error);
      throw error;
    }
  }
  
  // Gerar SVG da faca
  static generateSVG(project) {
    const { dimensions, product, customizations } = project;
    
    // Usar o gerador de facas
    const knifeGenerator = new KnifeGenerator();
    
    try {
      const knifeData = knifeGenerator.generateKnife({
        template: product.template || 'caixa_bolo_simples',
        dimensions,
        customizations
      });
      
      return knifeData.svg;
    } catch (error) {
      console.error('Erro ao gerar faca:', error);
      // Fallback para geração simples
      return this.generateSimpleSVG(dimensions, product);
    }
  }
  
  // Gerar SVG para caixa
  static generateBoxSVG(width, height, depth) {
    const totalWidth = width + (depth * 2);
    const totalHeight = height + (depth * 2);
    
    return `
      <svg width="${totalWidth + 40}" height="${totalHeight + 40}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cutPattern" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#ff0000" stroke-width="1"/>
          </pattern>
          <pattern id="foldPattern" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#0000ff" stroke-width="1" stroke-dasharray="2,2"/>
          </pattern>
        </defs>
        
        <!-- Base da caixa -->
        <rect x="20" y="${20 + depth}" width="${width}" height="${height}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Lados -->
        <rect x="20" y="20" width="${width}" height="${depth}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="20" y="${20 + height + depth}" width="${width}" height="${depth}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="20" y="${20 + depth}" width="${depth}" height="${height}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <rect x="${20 + width + depth}" y="${20 + depth}" width="${depth}" height="${height}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Linhas de vinco -->
        <line x1="20" y1="${20 + depth}" x2="${20 + width}" y2="${20 + depth}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="20" y1="${20 + height + depth}" x2="${20 + width}" y2="${20 + height + depth}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${20 + depth}" y1="${20 + depth}" x2="${20 + depth}" y2="${20 + height + depth}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        <line x1="${20 + width + depth}" y1="${20 + depth}" x2="${20 + width + depth}" y2="${20 + height + depth}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        
        <!-- Texto de identificação -->
        <text x="${20 + totalWidth/2}" y="${20 + totalHeight/2}" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#333">
          ${width/10}x${height/10}x${depth/10}cm
        </text>
      </svg>
    `;
  }
  
  // Gerar SVG para sacola
  static generateBagSVG(width, height, handleSize) {
    const totalWidth = width + 40;
    const totalHeight = height + 40;
    
    return `
      <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- Corpo da sacola -->
        <rect x="20" y="20" width="${width}" height="${height}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Alça -->
        <rect x="${20 + width/2 - handleSize/2}" y="10" width="${handleSize}" height="20" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Linhas de vinco -->
        <line x1="20" y1="${20 + height/2}" x2="${20 + width}" y2="${20 + height/2}" 
              stroke="#0000ff" stroke-width="1" stroke-dasharray="3,3"/>
        
        <!-- Texto de identificação -->
        <text x="${20 + width/2}" y="${20 + height/2}" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#333">
          ${width/10}x${height/10}cm
        </text>
      </svg>
    `;
  }
  
  // Gerar SVG genérico
  static generateGenericSVG(width, height) {
    return `
      <svg width="${width + 40}" height="${height + 40}" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="${width}" height="${height}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        
        <text x="${20 + width/2}" y="${20 + height/2}" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#333">
          ${width/10}x${height/10}cm
        </text>
      </svg>
    `;
  }
  
  // Gerar layout otimizado
  static generateLayout(project) {
    const { dimensions, product } = project;
    
    // Usar o otimizador de layout
    const layoutOptimizer = new LayoutOptimizer();
    
    try {
      // Preparar peças para otimização
      const pieces = [{
        id: 'main_piece',
        width: dimensions.width,
        height: dimensions.height,
        depth: dimensions.depth
      }];
      
      // Tamanho padrão da folha (A4 = 21x29.7cm)
      const sheet = { width: 21, height: 29.7 };
      
      // Otimizar layout
      const result = layoutOptimizer.optimize({
        pieces,
        sheet,
        algorithm: 'best_fit',
        options: {
          allowRotation: true,
          margin: 1
        }
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao otimizar layout:', error);
      // Fallback para layout simples
      return this.generateSimpleLayout(dimensions);
    }
  }
  
  // Gerar posições das peças
  static generatePiecePositions(piecesPerRow, piecesPerCol, width, height) {
    const pieces = [];
    const margin = 1; // 1cm de margem
    
    for (let row = 0; row < piecesPerCol; row++) {
      for (let col = 0; col < piecesPerRow; col++) {
        pieces.push({
          x: margin + (col * width),
          y: margin + (row * height),
          width: width,
          height: height,
          rotation: 0,
          id: `piece_${row}_${col}`
        });
      }
    }
    
    return pieces;
  }
  
  // Otimizar layout
  static async optimizeLayout(projectId, materialWidth, materialHeight) {
    try {
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new Error('Projeto não encontrado');
      }
      
      const { dimensions } = project;
      const { width, height } = dimensions;
      
      // Algoritmo de otimização simples
      const optimizedLayout = this.calculateOptimalLayout(
        width, height, materialWidth, materialHeight
      );
      
      return {
        original: project.knife_data?.layout,
        optimized: optimizedLayout,
        improvement: this.calculateImprovement(
          project.knife_data?.layout, 
          optimizedLayout
        )
      };
    } catch (error) {
      console.error('Erro ao otimizar layout:', error);
      throw error;
    }
  }
  
  // Calcular layout otimizado
  static calculateOptimalLayout(width, height, materialWidth, materialHeight) {
    // Tentar diferentes rotações
    const layouts = [
      this.calculateLayout(width, height, materialWidth, materialHeight),
      this.calculateLayout(height, width, materialWidth, materialHeight) // rotacionado
    ];
    
    // Retornar o layout com melhor eficiência
    return layouts.reduce((best, current) => 
      current.efficiency > best.efficiency ? current : best
    );
  }
  
  // Calcular layout específico
  static calculateLayout(width, height, materialWidth, materialHeight) {
    const piecesPerRow = Math.floor(materialWidth / width);
    const piecesPerCol = Math.floor(materialHeight / height);
    const totalPieces = piecesPerRow * piecesPerCol;
    
    const usedArea = totalPieces * (width * height);
    const totalArea = materialWidth * materialHeight;
    const efficiency = (usedArea / totalArea) * 100;
    
    return {
      piecesPerRow,
      piecesPerCol,
      totalPieces,
      efficiency: Math.round(efficiency),
      waste_percentage: Math.round(100 - efficiency),
      pieces: this.generatePiecePositions(piecesPerRow, piecesPerCol, width, height)
    };
  }
  
  // Calcular melhoria
  static calculateImprovement(original, optimized) {
    if (!original) return { efficiency_gain: 0, cost_savings: 0 };
    
    const efficiencyGain = optimized.efficiency - original.efficiency;
    const costSavings = (efficiencyGain / 100) * (original.estimated_cost || 0);
    
    return {
      efficiency_gain: Math.round(efficiencyGain),
      cost_savings: Math.round(costSavings * 100) / 100
    };
  }

  // Gerar SVG simples (fallback)
  static generateSimpleSVG(dimensions, product) {
    const { width, height, depth, handle } = dimensions;
    const scale = 10;
    
    return `
      <svg width="${width * scale + 40}" height="${height * scale + 40}" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="${width * scale}" height="${height * scale}" 
              fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="${20 + width * scale / 2}" y="${20 + height * scale / 2}" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#333">
          ${width}x${height}${depth ? 'x' + depth : ''}cm
        </text>
      </svg>
    `;
  }

  // Gerar layout simples (fallback)
  static generateSimpleLayout(dimensions) {
    const { width, height } = dimensions;
    
    return {
      sheet: { width: 21, height: 29.7 },
      pieces: [
        { x: 1, y: 1, width, height, rotation: 0 }
      ],
      efficiency: 75,
      waste_percentage: 25,
      total_pieces: 8,
      estimated_cost: 2.50
    };
  }
}

module.exports = KnifeService;
