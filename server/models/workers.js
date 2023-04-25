const { Sequelize, DataTypes } = require('sequelize');
const Institution = require('./institutions');

const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});

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
  institution_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'workers',
  timestamps: false,
});

module.exports = Worker;
