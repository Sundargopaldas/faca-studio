const express = require('express');
const KnifeService = require('../services/KnifeService');
const auth = require('../middleware/auth');
const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// @route   POST /api/knife/generate
// @desc    Gerar faca para um projeto
// @access  Private
router.post('/generate', async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.userId;
    
    if (!projectId) {
      return res.status(400).json({ 
        message: 'ProjectId é obrigatório' 
      });
    }
    
    const knifeData = await KnifeService.generateKnife(projectId, userId);
    
    res.json({
      message: 'Faca gerada com sucesso',
      knife: knifeData
    });
  } catch (error) {
    console.error('Erro ao gerar faca:', error);
    res.status(500).json({ 
      message: error.message || 'Erro interno do servidor' 
    });
  }
});

// @route   POST /api/knife/optimize
// @desc    Otimizar layout da faca
// @access  Private
router.post('/optimize', async (req, res) => {
  try {
    const { projectId, materialWidth, materialHeight } = req.body;
    
    if (!projectId || !materialWidth || !materialHeight) {
      return res.status(400).json({ 
        message: 'ProjectId, materialWidth e materialHeight são obrigatórios' 
      });
    }
    
    const optimizedLayout = await KnifeService.optimizeLayout(
      projectId, 
      materialWidth, 
      materialHeight
    );
    
    res.json({
      message: 'Layout otimizado com sucesso',
      layout: optimizedLayout
    });
  } catch (error) {
    console.error('Erro ao otimizar layout:', error);
    res.status(500).json({ 
      message: error.message || 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
