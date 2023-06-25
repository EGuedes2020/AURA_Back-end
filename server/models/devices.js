const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('AURA_DB_V2', 'postgres', 'postgres', {
    host: 'postgres-1.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
    dialect: 'postgres'
  });

const Device = sequelize.define('Device', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    institution_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    room: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name_of_device: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    assigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    institution_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    room_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'devices',
    timestamps: false,
  });
  
  module.exports = Device;