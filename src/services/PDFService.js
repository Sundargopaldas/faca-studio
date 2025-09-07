/**
 * Serviço de Exportação PDF
 * Implementa geração de PDFs reais usando PDFKit
 */

const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

class PDFService {
  /**
   * Gerar PDF da faca
   * @param {Object} knifeData - Dados da faca
   * @param {Object} options - Opções de exportação
   * @returns {Buffer} Buffer do PDF
   */
  static async generatePDF(knifeData, options = {}) {
    const {
      includeInstructions = true,
      includeLayout = true,
      include3DPreview = false,
      paperSize = 'A4',
      orientation = 'portrait'
    } = options;

    // Criar documento PDF
    const doc = new PDFDocument({
      size: paperSize,
      layout: orientation,
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Adicionar metadados
    doc.info.Title = `Faca - ${knifeData.metadata?.template || 'Produto'}`;
    doc.info.Author = 'PactMaker Studio';
    doc.info.Subject = 'Faca de Embalagem';
    doc.info.Keywords = 'faca, embalagem, corte, vinco';
    doc.info.CreationDate = new Date();

    // Adicionar cabeçalho
    this.addHeader(doc, knifeData);

    // Adicionar informações do produto
    this.addProductInfo(doc, knifeData);

    // Adicionar desenho da faca
    await this.addKnifeDrawing(doc, knifeData);

    // Adicionar instruções se solicitado
    if (includeInstructions) {
      this.addInstructions(doc, knifeData);
    }

    // Adicionar layout se solicitado
    if (includeLayout && knifeData.layout) {
      this.addLayout(doc, knifeData.layout);
    }

    // Adicionar rodapé
    this.addFooter(doc);

    // Gerar buffer
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      
      doc.on('error', reject);
      doc.end();
    });
  }

  /**
   * Adicionar cabeçalho
   */
  static addHeader(doc, knifeData) {
    // Logo/título
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#3b82f6')
       .text('PactMaker Studio', 50, 50);

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#64748b')
       .text('Faca de Embalagem', 50, 80);

    // Linha separadora
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, 100)
       .lineTo(doc.page.width - 50, 100)
       .stroke();

    // Data de geração
    doc.fontSize(10)
       .fillColor('#9ca3af')
       .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 
             doc.page.width - 150, 50, { align: 'right' });
  }

  /**
   * Adicionar informações do produto
   */
  static addProductInfo(doc, knifeData) {
    const { dimensions, metadata } = knifeData;
    let y = 120;

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Informações do Produto', 50, y);

    y += 30;

    // Dimensões
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#374151')
       .text('Dimensões:', 50, y);

    y += 20;
    doc.font('Helvetica')
       .fillColor('#64748b');

    if (dimensions.width) {
      doc.text(`• Largura: ${dimensions.width}cm`, 70, y);
      y += 15;
    }
    if (dimensions.height) {
      doc.text(`• Altura: ${dimensions.height}cm`, 70, y);
      y += 15;
    }
    if (dimensions.depth) {
      doc.text(`• Profundidade: ${dimensions.depth}cm`, 70, y);
      y += 15;
    }
    if (dimensions.handle) {
      doc.text(`• Alça: ${dimensions.handle}cm`, 70, y);
      y += 15;
    }

    // Template
    if (metadata?.template) {
      y += 10;
      doc.font('Helvetica-Bold')
         .fillColor('#374151')
         .text('Template:', 50, y);
      
      y += 20;
      doc.font('Helvetica')
         .fillColor('#64748b')
         .text(metadata.template, 70, y);
    }

    // Material
    if (knifeData.material) {
      y += 30;
      doc.font('Helvetica-Bold')
         .fillColor('#374151')
         .text('Material:', 50, y);
      
      y += 20;
      doc.font('Helvetica')
         .fillColor('#64748b')
         .text(this.getMaterialName(knifeData.material), 70, y);
    }
  }

  /**
   * Adicionar desenho da faca
   */
  static async addKnifeDrawing(doc, knifeData) {
    const { svg, dimensions } = knifeData;
    
    // Título da seção
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Desenho da Faca', 50, 300);

    // Converter SVG para desenho PDF
    await this.drawSVGToPDF(doc, svg, dimensions, 50, 330);
  }

  /**
   * Desenhar SVG no PDF
   */
  static async drawSVGToPDF(doc, svg, dimensions, x, y) {
    // Por simplicidade, desenhar um retângulo representando a faca
    const { width, height, depth } = dimensions;
    
    // Escala para o PDF (1cm = 20 pontos)
    const scale = 20;
    const pdfWidth = width * scale;
    const pdfHeight = height * scale;
    
    // Desenhar contorno da faca
    doc.strokeColor('#ff0000')
       .lineWidth(2)
       .rect(x, y, pdfWidth, pdfHeight)
       .stroke();

    // Desenhar linhas de vinco
    doc.strokeColor('#0000ff')
       .lineWidth(1)
       .dash(5, { space: 5 })
       .moveTo(x, y + pdfHeight / 2)
       .lineTo(x + pdfWidth, y + pdfHeight / 2)
       .stroke()
       .undash();

    // Adicionar texto de dimensões
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333')
       .text(`${width}x${height}${depth ? 'x' + depth : ''}cm`, 
             x + pdfWidth / 2 - 30, y + pdfHeight / 2 - 5);

    // Adicionar legenda
    doc.fontSize(8)
       .fillColor('#666666')
       .text('Linha vermelha: Corte', x, y + pdfHeight + 20)
       .text('Linha azul: Vinco', x, y + pdfHeight + 35);
  }

  /**
   * Adicionar instruções
   */
  static addInstructions(doc, knifeData) {
    // Verificar se precisa de nova página
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Instruções de Corte', 50, doc.y + 20);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151')
       .text('1. Material:', 50, doc.y + 20)
       .text(`   Use ${this.getMaterialName(knifeData.material)}`, 70, doc.y + 5)
       .text('2. Corte:', 50, doc.y + 20)
       .text('   Corte nas linhas vermelhas contínuas', 70, doc.y + 5)
       .text('3. Vinco:', 50, doc.y + 20)
       .text('   Faça vinco nas linhas azuis tracejadas', 70, doc.y + 5)
       .text('4. Montagem:', 50, doc.y + 20)
       .text('   Dobre nas linhas de vinco e monte a embalagem', 70, doc.y + 5)
       .text('5. Finalização:', 50, doc.y + 20)
       .text('   Verifique se todas as abas estão bem encaixadas', 70, doc.y + 5);
  }

  /**
   * Adicionar layout
   */
  static addLayout(doc, layout) {
    // Verificar se precisa de nova página
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e293b')
       .text('Layout de Produção', 50, doc.y + 20);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151')
       .text(`Eficiência: ${layout.efficiency}%`, 50, doc.y + 20)
       .text(`Desperdício: ${layout.waste_percentage}%`, 50, doc.y + 5)
       .text(`Total de peças: ${layout.total_pieces}`, 50, doc.y + 5)
       .text(`Custo estimado: R$ ${layout.estimated_cost}`, 50, doc.y + 5);

    // Desenhar layout simplificado
    if (layout.pieces && layout.pieces.length > 0) {
      doc.text('Layout na folha:', 50, doc.y + 20);
      
      const layoutX = 50;
      const layoutY = doc.y + 20;
      const layoutWidth = 200;
      const layoutHeight = 150;
      
      // Desenhar folha
      doc.strokeColor('#000000')
         .lineWidth(1)
         .rect(layoutX, layoutY, layoutWidth, layoutHeight)
         .stroke();

      // Desenhar peças
      doc.fillColor('#3b82f6')
         .opacity(0.3);
      
      layout.pieces.forEach(piece => {
        const pieceX = layoutX + (piece.x / layout.sheet.width) * layoutWidth;
        const pieceY = layoutY + (piece.y / layout.sheet.height) * layoutHeight;
        const pieceWidth = (piece.width / layout.sheet.width) * layoutWidth;
        const pieceHeight = (piece.height / layout.sheet.height) * layoutHeight;
        
        doc.rect(pieceX, pieceY, pieceWidth, pieceHeight)
           .fill();
      });
      
      doc.opacity(1);
    }
  }

  /**
   * Adicionar rodapé
   */
  static addFooter(doc) {
    const pageHeight = doc.page.height;
    
    // Linha separadora
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, pageHeight - 60)
       .lineTo(doc.page.width - 50, pageHeight - 60)
       .stroke();

    // Texto do rodapé
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#9ca3af')
       .text('PactMaker Studio - Plataforma para Criação de Facas de Embalagens', 
             50, pageHeight - 40)
       .text(`Página ${doc.page.number}`, 
             doc.page.width - 100, pageHeight - 40, { align: 'right' });
  }

  /**
   * Obter nome do material
   */
  static getMaterialName(material) {
    const names = {
      'papel_300g': 'Papel 300g',
      'papel_250g': 'Papel 250g',
      'kraft_180g': 'Kraft 180g',
      'cartao_400g': 'Cartão 400g'
    };
    return names[material] || material;
  }

  /**
   * Salvar PDF em arquivo
   */
  static async savePDFToFile(pdfBuffer, filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, pdfBuffer);
    return filePath;
  }

  /**
   * Gerar PDF com preview 3D
   */
  static async generatePDFWith3D(knifeData, options = {}) {
    const pdfBuffer = await this.generatePDF(knifeData, {
      ...options,
      include3DPreview: true
    });

    // Aqui você poderia adicionar uma imagem 3D renderizada
    // Por enquanto, apenas retorna o PDF normal
    return pdfBuffer;
  }
}

module.exports = PDFService;

