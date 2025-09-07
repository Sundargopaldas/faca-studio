const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Dimensões padrão e limites (width, height, depth, handle)'
  },
  materials: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Lista de materiais disponíveis'
  },
  price: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Preço base e por cm (base, per_cm)'
  },
  template: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nome do template SVG/3D'
  },
  preview: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL da imagem de preview'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['sort_order']
    }
  ]
});

// Método para calcular preço baseado nas dimensões
Product.prototype.calculatePrice = function(dimensions) {
  const { base, per_cm } = this.price;
  const { width, height, depth, handle } = dimensions;
  
  // Calcular área/perímetro baseado no tipo de produto
  let size = 0;
  if (this.category === 'alimentos') {
    // Para caixas: área total
    size = (width * height * 2) + (width * depth * 2) + (height * depth * 2);
  } else if (this.category === 'sacolas') {
    // Para sacolas: área + alça
    size = (width * height) + (handle * 2);
  }
  
  return base + (size * per_cm);
};

// Método para validar dimensões
Product.prototype.validateDimensions = function(dimensions) {
  const { width, height, depth, handle } = dimensions;
  const dims = this.dimensions;
  
  const errors = [];
  
  if (width < dims.width.min || width > dims.width.max) {
    errors.push(`Largura deve estar entre ${dims.width.min} e ${dims.width.max}cm`);
  }
  
  if (height < dims.height.min || height > dims.height.max) {
    errors.push(`Altura deve estar entre ${dims.height.min} e ${dims.height.max}cm`);
  }
  
  if (dims.depth && (depth < dims.depth.min || depth > dims.depth.max)) {
    errors.push(`Profundidade deve estar entre ${dims.depth.min} e ${dims.depth.max}cm`);
  }
  
  if (dims.handle && (handle < dims.handle.min || handle > dims.handle.max)) {
    errors.push(`Alça deve estar entre ${dims.handle.min} e ${dims.handle.max}cm`);
  }
  
  return errors;
};

module.exports = Product;

