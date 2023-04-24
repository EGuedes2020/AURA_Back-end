const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Suggestions = sequelize.define('suggestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date_created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
});

// Define associations
const Institution = require('./Institution');
const Worker = require('./Worker');

Suggestion.belongsTo(Institution, { foreignKey: 'institution_id' });
Suggestion.belongsTo(Worker, { foreignKey: 'author_id' });

module.exports = Suggestions;
