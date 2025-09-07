/**
 * Gerador SVG Avançado para Facas com Dobras e Cantos Variados
 */

const { FoldTemplateLibrary } = require('./foldTemplates');

class AdvancedSVGGenerator {
  constructor() {
    this.templateLibrary = new FoldTemplateLibrary();
    this.scale = 10; // Pixels por cm
  }

  generateSVG(templateName, dimensions, material = 'papel_300g') {
    const template = this.templateLibrary.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' não encontrado`);
    }

    const { width, height, depth } = dimensions;
    const svgWidth = width * this.scale;
    const svgHeight = height * this.scale;

    let svg = this.createSVGHeader(svgWidth, svgHeight);
    
    // Desenhar contorno principal
    svg += this.drawMainOutline(width, height, template);
    
    // Desenhar dobras
    svg += this.drawFolds(template, width, height);
    
    // Desenhar cantos
    svg += this.drawCorners(template, width, height);
    
    // Desenhar abas
    svg += this.drawTabs(template, width, height);
    
    // Desenhar janela (se houver)
    if (template.window) {
      svg += this.drawWindow(template.window, width, height);
    }
    
    // Adicionar informações
    svg += this.addInfo(dimensions, template, material);
    
    svg += '</svg>';
    
    return svg;
  }

  createSVGHeader(width, height) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <pattern id="valleyPattern" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M0,4 L4,0" stroke="#0066cc" stroke-width="0.5" opacity="0.7"/>
        </pattern>
        <pattern id="mountainPattern" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M0,0 L4,4" stroke="#cc0000" stroke-width="0.5" opacity="0.7"/>
        </pattern>
        <pattern id="cutPattern" patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill="none" stroke="#000000" stroke-width="0.3"/>
        </pattern>
      </defs>`;
  }

  drawMainOutline(width, height, template) {
    const x = 0;
    const y = 0;
    const w = width * this.scale;
    const h = height * this.scale;

    let path = `<rect x="${x}" y="${y}" width="${w}" height="${h}" 
      fill="none" stroke="#000000" stroke-width="2" stroke-dasharray="none"/>`;

    // Adicionar cantos especiais se necessário
    if (template.corners.length > 0) {
      path += this.drawRoundedCorners(template, width, height);
    }

    return path;
  }

  drawFolds(template, width, height) {
    let foldsSVG = '';
    
    template.folds.forEach((fold, index) => {
      const startX = fold.start.x * this.scale;
      const startY = fold.start.y * this.scale;
      const endX = fold.end.x * this.scale;
      const endY = fold.end.y * this.scale;
      
      const pattern = fold.type === 'valley' ? 'valleyPattern' : 'mountainPattern';
      const color = fold.type === 'valley' ? '#0066cc' : '#cc0000';
      const dashArray = fold.type === 'valley' ? '5,2' : '2,5';
      
      foldsSVG += `
        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" 
          stroke="${color}" stroke-width="1" stroke-dasharray="${dashArray}" opacity="0.8"/>
        <text x="${(startX + endX) / 2}" y="${(startY + endY) / 2 - 5}" 
          text-anchor="middle" font-size="8" fill="${color}" font-weight="bold">
          ${fold.type === 'valley' ? 'V' : 'M'}
        </text>`;
    });
    
    return foldsSVG;
  }

  drawCorners(template, width, height) {
    let cornersSVG = '';
    
    template.corners.forEach((corner, index) => {
      const centerX = corner.center.x * this.scale;
      const centerY = corner.center.y * this.scale;
      const radius = corner.radius * this.scale;
      
      if (corner.type === 'rounded') {
        cornersSVG += `
          <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
            fill="none" stroke="#00aa00" stroke-width="1" opacity="0.6"/>
          <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" 
            font-size="6" fill="#00aa00">R</text>`;
      } else if (corner.type === 'chamfered') {
        cornersSVG += `
          <polygon points="${centerX - radius},${centerY - radius} 
            ${centerX + radius},${centerY - radius} 
            ${centerX + radius},${centerY + radius} 
            ${centerX - radius},${centerY + radius}" 
            fill="none" stroke="#ff6600" stroke-width="1" opacity="0.6"/>
          <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" 
            font-size="6" fill="#ff6600">C</text>`;
      }
    });
    
    return cornersSVG;
  }

  drawTabs(template, width, height) {
    let tabsSVG = '';
    
    template.tabs.forEach((tab, index) => {
      const x = tab.position.x * this.scale;
      const y = tab.position.y * this.scale;
      const w = tab.width * this.scale;
      const h = tab.height * this.scale;
      
      if (tab.type === 'rounded') {
        tabsSVG += `
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" ry="2"
            fill="none" stroke="#9900cc" stroke-width="1" stroke-dasharray="3,1"/>
          <text x="${x + w/2}" y="${y + h/2 + 2}" text-anchor="middle" 
            font-size="6" fill="#9900cc">A</text>`;
      } else if (tab.type === 'notched') {
        tabsSVG += `
          <path d="M${x},${y} L${x + w/2},${y + h/2} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z"
            fill="none" stroke="#9900cc" stroke-width="1" stroke-dasharray="3,1"/>
          <text x="${x + w/2}" y="${y + h/2 + 2}" text-anchor="middle" 
            font-size="6" fill="#9900cc">N</text>`;
      } else {
        tabsSVG += `
          <rect x="${x}" y="${y}" width="${w}" height="${h}"
            fill="none" stroke="#9900cc" stroke-width="1" stroke-dasharray="3,1"/>
          <text x="${x + w/2}" y="${y + h/2 + 2}" text-anchor="middle" 
            font-size="6" fill="#9900cc">T</text>`;
      }
    });
    
    return tabsSVG;
  }

  drawWindow(window, width, height) {
    const x = window.x * this.scale;
    const y = window.y * this.scale;
    const w = window.width * this.scale;
    const h = window.height * this.scale;
    
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" 
        fill="none" stroke="#00aaff" stroke-width="2" stroke-dasharray="8,4"/>
      <text x="${x + w/2}" y="${y + h/2 + 3}" text-anchor="middle" 
        font-size="8" fill="#00aaff" font-weight="bold">JANELA</text>`;
  }

  drawRoundedCorners(template, width, height) {
    let cornersSVG = '';
    
    template.corners.forEach((corner) => {
      const centerX = corner.center.x * this.scale;
      const centerY = corner.center.y * this.scale;
      const radius = corner.radius * this.scale;
      
      // Desenhar arco no contorno principal
      cornersSVG += `
        <path d="M${centerX - radius},${centerY} 
          A${radius},${radius} 0 0,1 ${centerX},${centerY - radius}
          L${centerX},${centerY - radius - 2}
          A${radius + 2},${radius + 2} 0 0,0 ${centerX - radius - 2},${centerY}
          Z" 
          fill="none" stroke="#000000" stroke-width="2"/>`;
    });
    
    return cornersSVG;
  }

  addInfo(dimensions, template, material) {
    const { width, height, depth } = dimensions;
    const infoY = (height * this.scale) + 20;
    
    return `
      <g id="info">
        <rect x="5" y="${infoY}" width="${width * this.scale - 10}" height="60" 
          fill="#f8f9fa" stroke="#dee2e6" stroke-width="1" rx="5"/>
        
        <text x="10" y="${infoY + 15}" font-size="12" font-weight="bold" fill="#333">
          ${template.name}
        </text>
        
        <text x="10" y="${infoY + 30}" font-size="10" fill="#666">
          Dimensões: ${width} x ${height}${depth ? ' x ' + depth : ''} cm
        </text>
        
        <text x="10" y="${infoY + 45}" font-size="10" fill="#666">
          Material: ${this.getMaterialName(material)} | Dobras: ${template.folds.length} | Abas: ${template.tabs.length}
        </text>
        
        <g id="legend" transform="translate(${width * this.scale - 120}, ${infoY + 10})">
          <text x="0" y="0" font-size="8" fill="#0066cc">V = Vale</text>
          <text x="0" y="12" font-size="8" fill="#cc0000">M = Montanha</text>
          <text x="0" y="24" font-size="8" fill="#9900cc">A = Aba</text>
          <text x="0" y="36" font-size="8" fill="#00aa00">R = Arredondado</text>
        </g>
      </g>`;
  }

  getMaterialName(material) {
    const materials = {
      'papel_300g': 'Papel 300g',
      'papel_250g': 'Papel 250g',
      'papel_180g': 'Papel 180g',
      'cartao': 'Cartão',
      'kraft': 'Papel Kraft'
    };
    return materials[material] || material;
  }

  // Método para gerar preview 3D simples
  generate3DPreview(templateName, dimensions) {
    const template = this.templateLibrary.getTemplate(templateName);
    if (!template) return null;

    return {
      template: templateName,
      dimensions: dimensions,
      folds: template.folds.length,
      tabs: template.tabs.length,
      corners: template.corners.length,
      complexity: this.calculateComplexity(template),
      estimatedTime: this.estimateAssemblyTime(template)
    };
  }

  calculateComplexity(template) {
    let complexity = 0;
    complexity += template.folds.length * 2;
    complexity += template.tabs.length * 3;
    complexity += template.corners.length * 2;
    
    if (template.window) complexity += 5;
    
    return Math.min(complexity, 100); // Máximo 100
  }

  estimateAssemblyTime(template) {
    const baseTime = 2; // 2 minutos base
    const foldTime = template.folds.length * 0.5;
    const tabTime = template.tabs.length * 1;
    const cornerTime = template.corners.length * 0.8;
    
    return Math.round((baseTime + foldTime + tabTime + cornerTime) * 10) / 10;
  }

  // Listar todos os templates disponíveis
  getAvailableTemplates() {
    return this.templateLibrary.getAllTemplates().map(template => ({
      id: template.name.toLowerCase().replace(/\s+/g, '_'),
      name: template.name,
      type: template.type,
      description: template.description,
      complexity: this.calculateComplexity(template),
      estimatedTime: this.estimateAssemblyTime(template)
    }));
  }
}

module.exports = AdvancedSVGGenerator;

