const Institution = require('./institutions');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('AURA_DB_V2', 'postgres', 'postgres', {
    host: 'postgres-1.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
    dialect: 'postgres'
  });


const WorkerVote = sequelize.define('WorkerVote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  suggestionId: {
    type: DataTypes.INTEGER,
    field: 'suggestion_id',
    allowNull: false,
  },
  workerId: {
    type: DataTypes.INTEGER,
    field: 'worker_id',
    allowNull: false,
  },
  votes: {
    type: DataTypes.STRING(3),
    allowNull: false,
  },
  workerName: {
    type: DataTypes.STRING(255),
    field: 'worker_name',
    allowNull: false,
  },
}, {
  tableName: 'worker_votes',
  timestamps: false,
});

module.exports = WorkerVote;
