const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
    host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
    dialect: 'postgres'
  });

const ActiveWarning = sequelize.define('ActiveWarning', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  warning_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  devices_on: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  institution_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'active_warnings',
  timestamps: false,
});

module.exports = ActiveWarning;
