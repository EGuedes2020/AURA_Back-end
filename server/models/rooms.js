const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
    host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
    dialect: 'postgres'
  });

const Rooms= sequelize.define('Room', {
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
    room_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    devices_per_division: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_warnings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    institution_name: {
      type: DataTypes.STRING(255),
    },
  }, {
    tableName: 'rooms',
    timestamps: false,
  });
  
  module.exports = Rooms;