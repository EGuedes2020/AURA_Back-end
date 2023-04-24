const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Institution = require('./institution');
const Worker = require('./worker');

const Suggestion = sequelize.define('Suggestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Institution,
      key: 'id',
    },
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Worker,
      key: 'id',
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date_created: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'suggestions',
});

module.exports = Suggestion;
