const { Export, Project } = require('../models');
const PDFService = require('./PDFService');
const fs = require('fs').promises;
const path = require('path');

class ExportService {
  // Exportar como SVG
  static async exportSVG(projectId, userId) {
    try {
      const project = await Project.findOne({
        where: { 
          id: projectId,
          user_id: userId 
        }
      });
      
      if (!project) {
        throw new Error('Projeto não encontrado');
      }
      
      if (!project.knife_data || !project.knife_data.svg) {
        throw new Error('Faca não foi gerada ainda');
      }
      
      // Criar registro de export
      const exportRecord = await Export.create({
        project_id: projectId,
        user_id: userId,
        format: 'svg',
        status: 'processing'
      });
      
      try {
        // Gerar nome do arquivo
        const fileName = exportRecord.generateFileName();
        const filePath = path.join(__dirname, '../../data/exports', fileName);
        
        // Garantir que o diretório existe
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // Salvar arquivo SVG
        await fs.writeFile(filePath, project.knife_data.svg, 'utf8');
        
        // Obter tamanho do arquivo
        const stats = await fs.stat(filePath);
        
        // Atualizar registro
        await exportRecord.markAsCompleted(filePath, stats.size);
        
        return {
          export: exportRecord,
          filePath,
          fileName
        };
      } catch (error) {
        await exportRecord.markAsFailed(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao exportar SVG:', error);
      throw error;
    }
  }
  
  // Exportar como PDF
  static async exportPDF(projectId, userId, options = {}) {
    try {
      const project = await Project.findOne({
        where: { 
          id: projectId,
          user_id: userId 
        }
      });
      
      if (!project) {
        throw new Error('Projeto não encontrado');
      }
      
      if (!project.knife_data) {
        throw new Error('Faca não foi gerada ainda');
      }
      
      // Criar registro de export
      const exportRecord = await Export.create({
        project_id: projectId,
        user_id: userId,
        format: 'pdf',
        status: 'processing',
        metadata: options
      });
      
      try {
        // Gerar PDF real usando PDFService
        const pdfBuffer = await PDFService.generatePDF(project.knife_data, options);
        
        // Gerar nome do arquivo
        const fileName = exportRecord.generateFileName();
        const filePath = path.join(__dirname, '../../data/exports', fileName);
        
        // Salvar arquivo PDF
        await PDFService.savePDFToFile(pdfBuffer, filePath);
        
        // Obter tamanho do arquivo
        const stats = await fs.stat(filePath);
        
        // Atualizar registro
        await exportRecord.markAsCompleted(filePath, stats.size);
        
        return {
          export: exportRecord,
          filePath,
          fileName
        };
      } catch (error) {
        await exportRecord.markAsFailed(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  }
  
  // Exportar como DXF
  static async exportDXF(projectId, userId) {
    try {
      const project = await Project.findOne({
        where: { 
          id: projectId,
          user_id: userId 
        }
      });
      
      if (!project) {
        throw new Error('Projeto não encontrado');
      }
      
      if (!project.knife_data) {
        throw new Error('Faca não foi gerada ainda');
      }
      
      // Criar registro de export
      const exportRecord = await Export.create({
        project_id: projectId,
        user_id: userId,
        format: 'dxf',
        status: 'processing'
      });
      
      try {
        // Gerar DXF
        const dxfContent = this.generateDXF(project);
        
        // Gerar nome do arquivo
        const fileName = exportRecord.generateFileName();
        const filePath = path.join(__dirname, '../../data/exports', fileName);
        
        // Garantir que o diretório existe
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // Salvar arquivo DXF
        await fs.writeFile(filePath, dxfContent, 'utf8');
        
        // Obter tamanho do arquivo
        const stats = await fs.stat(filePath);
        
        // Atualizar registro
        await exportRecord.markAsCompleted(filePath, stats.size);
        
        return {
          export: exportRecord,
          filePath,
          fileName
        };
      } catch (error) {
        await exportRecord.markAsFailed(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao exportar DXF:', error);
      throw error;
    }
  }
  
  
  // Gerar DXF
  static generateDXF(project) {
    const { dimensions } = project;
    const { width, height, depth } = dimensions;
    
    // Formato DXF básico
    return `
0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
CUT
10
0.0
20
0.0
30
0.0
11
${width}
21
0.0
31
0.0
0
LINE
8
CUT
10
${width}
20
0.0
30
0.0
11
${width}
21
${height}
31
0.0
0
LINE
8
CUT
10
${width}
20
${height}
30
0.0
11
0.0
21
${height}
31
0.0
0
LINE
8
CUT
10
0.0
20
${height}
30
0.0
11
0.0
21
0.0
31
0.0
0
ENDSEC
0
EOF
    `;
  }
  
  // Gerar instruções
  static generateInstructions(project) {
    return `
      <div style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;">
        <h3>Instruções de Corte</h3>
        <p><strong>Produto:</strong> ${project.name}</p>
        <p><strong>Dimensões:</strong> ${JSON.stringify(project.dimensions)}</p>
        <p><strong>Material:</strong> Papel 300g</p>
        <p><strong>Instruções:</strong></p>
        <ul>
          <li>Linhas vermelhas: Corte</li>
          <li>Linhas azuis: Vinco</li>
          <li>Dobrar nas linhas de vinco</li>
          <li>Cortar nas linhas vermelhas</li>
        </ul>
      </div>
    `;
  }
  
  // Gerar layout SVG
  static generateLayoutSVG(layout) {
    const { sheet, pieces } = layout;
    
    return `
      <svg width="${sheet.width * 10}" height="${sheet.height * 10}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${sheet.width * 10}" height="${sheet.height * 10}" 
              fill="none" stroke="#000" stroke-width="1"/>
        
        ${pieces.map(piece => `
          <rect x="${piece.x * 10}" y="${piece.y * 10}" 
                width="${piece.width * 10}" height="${piece.height * 10}" 
                fill="none" stroke="#ff0000" stroke-width="1"/>
        `).join('')}
        
        <text x="${sheet.width * 5}" y="${sheet.height * 10 - 10}" 
              text-anchor="middle" font-family="Arial" font-size="12">
          Layout Otimizado - ${layout.efficiency}% de eficiência
        </text>
      </svg>
    `;
  }
  
  // Obter arquivo de export
  static async getExportFile(exportId, userId) {
    try {
      const exportRecord = await Export.findOne({
        where: { 
          id: exportId,
          user_id: userId 
        }
      });
      
      if (!exportRecord) {
        throw new Error('Export não encontrado');
      }
      
      if (exportRecord.status !== 'completed') {
        throw new Error('Export ainda não foi processado');
      }
      
      if (exportRecord.isExpired()) {
        throw new Error('Arquivo expirado');
      }
      
      // Incrementar contador de downloads
      await exportRecord.incrementDownload();
      
      return {
        export: exportRecord,
        filePath: exportRecord.file_path
      };
    } catch (error) {
      console.error('Erro ao obter arquivo de export:', error);
      throw error;
    }
  }
  
  // Listar exports do usuário
  static async getUserExports(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows: exports } = await Export.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'name', 'status']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      return {
        exports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar exports:', error);
      throw error;
    }
  }
}

module.exports = ExportService;
