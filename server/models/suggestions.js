const Institution = require('./institutions');
const Worker = require('./workers');

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});


const Suggestion = sequelize.define('Suggestion', {
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
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Worker,
      key: 'id',
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_created: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  institution_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  }, 
 author_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'suggestions',
  timestamps: false
});

module.exports = Suggestion;
