const Institution = require('./institutions');
const Badges = require('./badges');



const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('AURA_DB_V2', 'postgres', 'postgres', {
    host: 'postgres-1.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
    dialect: 'postgres'
  });


const InstitutionBadge = sequelize.define('InstitutionBadge', {
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Institution',
      key: 'id'
    },
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE'
  },
  badge_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Badge',
      key: 'id'
    },
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'institution_badges',
  timestamps: false
},{
  sequelize,
  modelName: 'InstitutionBadge',
  tableName: 'institution_badges',
});

InstitutionBadge.belongsTo(Institution, { foreignKey: 'institution_id' });

module.exports = InstitutionBadge;
