const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const { projectValidation, handleValidationErrors, customValidations } = require('../utils/validation');
const auth = require('../middleware/auth');
const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// @route   GET /api/projects
// @desc    Listar projetos do usuário
// @access  Private
router.get('/', ProjectController.getUserProjects);

// @route   POST /api/projects
// @desc    Criar novo projeto
// @access  Private
router.post('/', 
  projectValidation.create,
  customValidations.validateProductDimensions,
  handleValidationErrors,
  ProjectController.create
);

// @route   GET /api/projects/:id
// @desc    Obter projeto específico
// @access  Private
router.get('/:id', 
  customValidations.validateProjectOwnership,
  ProjectController.getById
);

// @route   PUT /api/projects/:id
// @desc    Atualizar projeto
// @access  Private
router.put('/:id', 
  customValidations.validateProjectOwnership,
  projectValidation.update,
  handleValidationErrors,
  ProjectController.update
);

// @route   DELETE /api/projects/:id
// @desc    Deletar projeto
// @access  Private
router.delete('/:id', 
  customValidations.validateProjectOwnership,
  ProjectController.delete
);

// @route   POST /api/projects/:id/generate-knife
// @desc    Gerar faca para o projeto
// @access  Private
router.post('/:id/generate-knife', 
  customValidations.validateProjectOwnership,
  ProjectController.generateKnife
);

module.exports = router;

