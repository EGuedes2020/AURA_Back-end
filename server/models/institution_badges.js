const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InstitutionBadge = sequelize.define('institution_badge', {
  institutionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'institution',
      key: 'id'
    }
  },
  badgeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'badge',
      key: 'id'
    }
  }
}, {
  tableName: 'institution_badges',
  timestamps: false
});

module.exports = InstitutionBadge;
