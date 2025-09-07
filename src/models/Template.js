const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Template = sequelize.define('Template', {
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
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preview_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  svg_template: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Template SVG com placeholders'
  },
  default_dimensions: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Dimensões padrão do template'
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Parâmetros configuráveis do template'
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'templates',
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
      fields: ['is_premium']
    },
    {
      fields: ['usage_count']
    }
  ]
});

// Método para renderizar template com dimensões
Template.prototype.render = function(dimensions, customizations = {}) {
  let svg = this.svg_template;
  
  // Substituir placeholders pelas dimensões
  Object.keys(dimensions).forEach(key => {
    const placeholder = `{{${key}}}`;
    svg = svg.replace(new RegExp(placeholder, 'g'), dimensions[key]);
  });
  
  // Aplicar customizações
  if (customizations.color) {
    svg = svg.replace(/stroke="#[^"]*"/g, `stroke="${customizations.color}"`);
  }
  
  return svg;
};

// Método para validar dimensões
Template.prototype.validateDimensions = function(dimensions) {
  const errors = [];
  const params = this.parameters;
  
  Object.keys(params).forEach(key => {
    const param = params[key];
    const value = dimensions[key];
    
    if (value === undefined || value === null) {
      errors.push(`${param.label || key} é obrigatório`);
      return;
    }
    
    if (param.min && value < param.min) {
      errors.push(`${param.label || key} deve ser pelo menos ${param.min}`);
    }
    
    if (param.max && value > param.max) {
      errors.push(`${param.label || key} deve ser no máximo ${param.max}`);
    }
  });
  
  return errors;
};

// Método para incrementar uso
Template.prototype.incrementUsage = async function() {
  this.usage_count += 1;
  await this.save();
};

module.exports = Template;

