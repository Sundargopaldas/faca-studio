const { Project, Product, User } = require('../models');
const { Op } = require('sequelize');

class ProjectController {
  // Listar projetos do usuário
  static async getUserProjects(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const userId = req.userId;
      
      let whereClause = { user_id: userId };
      
      if (status) {
        whereClause.status = status;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows: projects } = await Project.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'category', 'preview']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['updated_at', 'DESC']]
      });
      
      res.json({
        projects,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  // Criar novo projeto
  static async create(req, res) {
    try {
      const { productId, name, description, dimensions, customizations } = req.body;
      const userId = req.userId;
      
      // Validar se o produto existe
      const product = await Product.findByPk(productId);
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
      
      // Criar projeto
      const project = await Project.create({
        user_id: userId,
        product_id: productId,
        name,
        description,
        dimensions,
        customizations,
        status: 'draft'
      });
      
      // Calcular custo estimado
      await project.calculateCost();
      
      res.status(201).json({
        message: 'Projeto criado com sucesso',
        project
      });
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  // Obter projeto por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const project = await Project.findOne({
        where: { 
          id,
          user_id: userId 
        },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'category', 'preview', 'dimensions', 'materials', 'price']
          }
        ]
      });
      
      if (!project) {
        return res.status(404).json({ message: 'Projeto não encontrado' });
      }
      
      res.json({ project });
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  // Atualizar projeto
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const updateData = req.body;
      
      const project = await Project.findOne({
        where: { 
          id,
          user_id: userId 
        }
      });
      
      if (!project) {
        return res.status(404).json({ message: 'Projeto não encontrado' });
      }
      
      // Se dimensões foram alteradas, recalcular custo
      if (updateData.dimensions) {
        const product = await Product.findByPk(project.product_id);
        const errors = product.validateDimensions(updateData.dimensions);
        if (errors.length > 0) {
          return res.status(400).json({ 
            message: 'Dimensões inválidas',
            errors 
          });
        }
      }
      
      await project.update(updateData);
      
      // Recalcular custo se necessário
      if (updateData.dimensions) {
        await project.calculateCost();
      }
      
      res.json({
        message: 'Projeto atualizado com sucesso',
        project
      });
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  // Deletar projeto
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const project = await Project.findOne({
        where: { 
          id,
          user_id: userId 
        }
      });
      
      if (!project) {
        return res.status(404).json({ message: 'Projeto não encontrado' });
      }
      
      await project.destroy();
      
      res.json({ message: 'Projeto deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  // Gerar faca
  static async generateKnife(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const project = await Project.findOne({
        where: { 
          id,
          user_id: userId 
        }
      });
      
      if (!project) {
        return res.status(404).json({ message: 'Projeto não encontrado' });
      }
      
      // Gerar dados da faca
      const knifeData = project.generateKnifeData();
      
      // Atualizar status do projeto
      await project.update({ 
        status: 'generated',
        knife_data: knifeData
      });
      
      res.json({
        message: 'Faca gerada com sucesso',
        knife: knifeData,
        project: {
          id: project.id,
          name: project.name,
          status: project.status
        }
      });
    } catch (error) {
      console.error('Erro ao gerar faca:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = ProjectController;

