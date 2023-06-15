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
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  institution_id: {
    type: DataTypes.INTEGER,
  },
  author_id: {
    type: DataTypes.INTEGER,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date_created: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  institution_name: {
    type: DataTypes.STRING(255),
  },
  author_name: {
    type: DataTypes.STRING(255),
  },
  status: {
    type: DataTypes.STRING(20),
    validate: {
      isIn: [['approved', 'disapproved', 'pending']],
    },
  },
  number_of_votes: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'suggestions',
  timestamps: false,
})

module.exports = Suggestion;
