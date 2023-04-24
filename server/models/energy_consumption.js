const sequelize = new Sequelize('sqlite::memory')
const { DataTypes,Sequelize } = require('sequelize');
const Institution = require('./institution');

const EnergyConsumption = sequelize.define('EnergyConsumption', {
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
}, {
  tableName: 'energy_consumption',
});

module.exports = EnergyConsumption;
