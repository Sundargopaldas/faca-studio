const { sequelize } = require('../config/database');

// Importar todos os modelos
const User = require('./User');
const Product = require('./Product');
const Project = require('./Project');
const Template = require('./Template');
const Export = require('./Export');

// Definir associações
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Product.hasMany(Project, { foreignKey: 'product_id', as: 'projects' });
Project.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Project.hasMany(Export, { foreignKey: 'project_id', as: 'exports' });
Export.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

User.hasMany(Export, { foreignKey: 'user_id', as: 'exports' });
Export.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Exportar modelos e sequelize
module.exports = {
  sequelize,
  User,
  Product,
  Project,
  Template,
  Export
};

