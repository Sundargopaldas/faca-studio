const express = require('express');
const ProductController = require('../controllers/ProductController');
const { handleValidationErrors } = require('../utils/validation');
const router = express.Router();

// @route   GET /api/products
// @desc    Listar todos os produtos
// @access  Public
router.get('/', ProductController.getAll);

// @route   GET /api/products/categories
// @desc    Listar categorias disponíveis
// @access  Public
router.get('/categories', ProductController.getCategories);

// @route   GET /api/products/:id
// @desc    Obter produto específico
// @access  Public
router.get('/:id', ProductController.getById);

// @route   POST /api/products/:id/calculate-price
// @desc    Calcular preço baseado nas dimensões
// @access  Public
router.post('/:id/calculate-price', ProductController.calculatePrice);

module.exports = router;
