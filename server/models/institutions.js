const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Institution = sequelize.define('Institution', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'institutions',
  timestamps: false 
});
module.exports = Institution;
