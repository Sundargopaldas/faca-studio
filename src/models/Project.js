const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Dimensões personalizadas do projeto'
  },
  customizations: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Personalizações adicionais (cores, materiais, etc)'
  },
  knife_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados da faca gerada (SVG, PDF, DXF)'
  },
  status: {
    type: DataTypes.ENUM('draft', 'generated', 'exported', 'archived'),
    defaultValue: 'draft'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se o projeto pode ser compartilhado publicamente'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Tags para organização'
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  material_usage: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Informações sobre uso de material'
  }
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Método para calcular custo estimado
Project.prototype.calculateCost = async function() {
  const Product = require('./Product');
  const product = await Product.findByPk(this.product_id);
  
  if (product) {
    this.estimated_cost = product.calculatePrice(this.dimensions);
    await this.save();
  }
  
  return this.estimated_cost;
};

// Método para gerar dados da faca
Project.prototype.generateKnifeData = function() {
  const { width, height, depth, handle } = this.dimensions;
  
  // Gerar SVG básico
  const svg = this.generateSVG();
  
  // Gerar dados de layout
  const layout = this.generateLayout();
  
  this.knife_data = {
    svg,
    layout,
    dimensions: this.dimensions,
    generated_at: new Date(),
    version: '1.0'
  };
  
  return this.knife_data;
};

// Método para gerar SVG
Project.prototype.generateSVG = function() {
  const { width, height, depth, handle } = this.dimensions;
  
  return `
    <svg width="${width * 2}" height="${height * 2}" xmlns="http://www.w3.org/2000/svg">
      <!-- Linha de corte -->
      <rect x="10" y="10" width="${width}" height="${height}" 
            fill="none" stroke="#ff0000" stroke-width="2"/>
      
      <!-- Linhas de vinco -->
      <line x1="10" y1="${height/2}" x2="${width + 10}" y2="${height/2}" 
            stroke="#0000ff" stroke-width="1" stroke-dasharray="5,5"/>
      
      <!-- Texto de identificação -->
      <text x="${width/2}" y="${height/2}" text-anchor="middle" 
            font-family="Arial" font-size="12" fill="#333">
        ${width}x${height}x${depth}cm
      </text>
    </svg>
  `;
};

// Método para gerar layout
Project.prototype.generateLayout = function() {
  return {
    sheet: { width: 100, height: 70 },
    pieces: [
      { x: 10, y: 10, width: this.dimensions.width, height: this.dimensions.height, rotation: 0 }
    ],
    efficiency: 85,
    waste_percentage: 15
  };
};

module.exports = Project;

