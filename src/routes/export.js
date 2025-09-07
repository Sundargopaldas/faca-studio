const express = require('express');
const ExportService = require('../services/ExportService');
const { exportValidation, handleValidationErrors, customValidations } = require('../utils/validation');
const auth = require('../middleware/auth');
const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// @route   GET /api/export
// @desc    Listar exports do usuário
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.userId;
    
    const result = await ExportService.getUserExports(userId, page, limit);
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao listar exports:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// @route   POST /api/export/svg
// @desc    Exportar faca como SVG
// @access  Private
router.post('/svg', async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.userId;
    
    if (!projectId) {
      return res.status(400).json({ message: 'ProjectId é obrigatório' });
    }
    
    const result = await ExportService.exportSVG(projectId, userId);
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    
    // Enviar arquivo
    const fs = require('fs');
    const fileStream = fs.createReadStream(result.filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Erro ao exportar SVG:', error);
    res.status(500).json({ 
      message: error.message || 'Erro interno do servidor' 
    });
  }
});

// @route   POST /api/export/pdf
// @desc    Exportar faca como PDF
// @access  Private
router.post('/pdf', async (req, res) => {
  try {
    const { projectId, options = {} } = req.body;
    const userId = req.userId;
    
    if (!projectId) {
      return res.status(400).json({ message: 'ProjectId é obrigatório' });
    }
    
    const result = await ExportService.exportPDF(projectId, userId, options);
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    
    // Enviar arquivo
    const fs = require('fs');
    const fileStream = fs.createReadStream(result.filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    res.status(500).json({ 
      message: error.message || 'Erro interno do servidor' 
    });
  }
});

// @route   POST /api/export/dxf
// @desc    Exportar faca como DXF
// @access  Private
router.post('/dxf', async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.userId;
    
    if (!projectId) {
      return res.status(400).json({ message: 'ProjectId é obrigatório' });
    }
    
    const result = await ExportService.exportDXF(projectId, userId);
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/dxf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    
    // Enviar arquivo
    const fs = require('fs');
    const fileStream = fs.createReadStream(result.filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Erro ao exportar DXF:', error);
    res.status(500).json({ 
      message: error.message || 'Erro interno do servidor' 
    });
  }
});

// @route   GET /api/export/:id/download
// @desc    Download de arquivo exportado
// @access  Private
router.get('/:id/download', 
  customValidations.validateExportOwnership,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const result = await ExportService.getExportFile(id, userId);
      
      // Configurar headers baseado no formato
      const contentType = {
        'svg': 'image/svg+xml',
        'pdf': 'application/pdf',
        'dxf': 'application/dxf',
        'png': 'image/png',
        'jpg': 'image/jpeg'
      };
      
      res.setHeader('Content-Type', contentType[result.export.format] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${result.export.file_path.split('/').pop()}"`);
      
      // Enviar arquivo
      const fs = require('fs');
      const fileStream = fs.createReadStream(result.filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      res.status(500).json({ 
        message: error.message || 'Erro interno do servidor' 
      });
    }
  }
);

module.exports = router;
