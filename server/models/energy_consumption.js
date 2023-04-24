const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EnergyConsumption = sequelize.define('energy_consumption', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
    get() {
      const energyConsumed = this.getDataValue('energy_consumed');
      const cost = 0.15;
      return energyConsumed * cost;
    },
  },
}, {
  tableName: 'energy_consumption',
  underscored: true,
});

module.exports = EnergyConsumption;
