const { Sequelize, DataTypes } = require('sequelize');
const Institution = require('./institutions');

const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
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
