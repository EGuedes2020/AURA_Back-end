const Institution = require('./institutions');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('AURA_DB_V2', 'postgres', 'postgres', {
    host: 'postgres-1.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
    dialect: 'postgres'
  });

const Energy = sequelize.define('EnergyConsumption', {
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
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  month_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  energy_consumed: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  cost_energy: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0,
    get() {
      const energyConsumed = this.getDataValue('energy_consumed');
      return energyConsumed * 0.15;
    },
  },
  institution_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  }, 
}, {
  tableName: 'energy_consumption',
  timestamps: false
});

module.exports = Energy;
