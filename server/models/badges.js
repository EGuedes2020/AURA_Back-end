const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Badge = db.define('badge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  season: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'badges' 
});
module.exports = Badge;
