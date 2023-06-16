const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});


const Institution = sequelize.define('Institution', {
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
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING, 
    allowNull: true,
  },

  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'institutions',
  timestamps: false, 
},{
  sequelize,
  modelName: 'Institution',
  tableName: 'institutions',
});

module.exports = Institution;
