const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Institution = require('./institution');

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Institution,
      key: 'id',
    },
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'workers',
});

module.exports = Worker;
