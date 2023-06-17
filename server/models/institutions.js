const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});


const Institution = sequelize.define('Institution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255),
  },
  location: {
    type: DataTypes.STRING(255),
  },
  avatar: {
    type: DataTypes.STRING(255),
  },
  total_warnings: {
    type: DataTypes.INTEGER,
  },
  avg_response_time: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'institutions',
  timestamps: false,
});
module.exports = Institution;
