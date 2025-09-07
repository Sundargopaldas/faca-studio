const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Export = sequelize.define('Export', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  format: {
    type: DataTypes.ENUM('svg', 'pdf', 'dxf', 'png', 'jpg'),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Caminho do arquivo gerado'
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tamanho do arquivo em bytes'
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração do arquivo'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Metadados adicionais do export'
  }
}, {
  tableName: 'exports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['format']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expires_at']
    }
  ]
});

// Método para gerar nome do arquivo
Export.prototype.generateFileName = function() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `faca_${this.project_id}_${timestamp}.${this.format}`;
};

// Método para verificar se expirou
Export.prototype.isExpired = function() {
  if (!this.expires_at) return false;
  return new Date() > this.expires_at;
};

// Método para incrementar download
Export.prototype.incrementDownload = async function() {
  this.download_count += 1;
  await this.save();
};

// Método para marcar como processado
Export.prototype.markAsCompleted = async function(filePath, fileSize) {
  this.status = 'completed';
  this.file_path = filePath;
  this.file_size = fileSize;
  this.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
  await this.save();
};

// Método para marcar como falhou
Export.prototype.markAsFailed = async function(errorMessage) {
  this.status = 'failed';
  this.error_message = errorMessage;
  await this.save();
};

module.exports = Export;

