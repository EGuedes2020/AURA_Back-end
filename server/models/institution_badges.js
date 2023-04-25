const { DataTypes,Sequelize } = require('sequelize');
const Institution = require('./institutions');
const Badges = require('./badges');



const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});


const InstitutionBadge = sequelize.define('InstitutionBadge', {
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Institution,
      key: 'id',
    },
  },
  badge_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Badges,
      key: 'id',
    },
  },
  institution_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  badge_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'institution_badges',
  timestamps: false
});

module.exports = InstitutionBadge;
