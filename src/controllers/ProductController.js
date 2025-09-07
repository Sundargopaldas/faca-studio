const { Product } = require('../models');

class ProductController {
  // Listar todos os produtos
  static async getAll(req, res) {
    try {
      const { category, search, page = 1, limit = 10 } = req.query;
      
      let whereClause = { is_active: true };
      
      if (category) {
        whereClause.category = category;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows: products } = await Product.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      });
      
      res.json({
        products,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  // Obter produto por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      res.json({ product });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  // Listar categorias
  static async getCategories(req, res) {
    try {
      const categories = await Product.findAll({
        attributes: ['category'],
        where: { is_active: true },
        group: ['category'],
        order: [['category', 'ASC']]
      });
      
      res.json({ 
        categories: categories.map(c => c.category) 
      });
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  // Calcular preço
  static async calculatePrice(req, res) {
    try {
      const { id } = req.params;
      const { dimensions } = req.body;
      
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      // Validar dimensões
      const errors = product.validateDimensions(dimensions);
      if (errors.length > 0) {
        return res.status(400).json({ 
          message: 'Dimensões inválidas',
          errors 
        });
      }
      
      const price = product.calculatePrice(dimensions);
      
      res.json({
        price,
        dimensions,
        product: {
          id: product.id,
          name: product.name,
          category: product.category
        }
      });
    } catch (error) {
      console.error('Erro ao calcular preço:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = ProductController;

