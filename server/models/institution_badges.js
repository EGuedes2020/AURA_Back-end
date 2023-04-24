module.exports = (sequelize, DataTypes) => {
    const InstitutionBadge = sequelize.define('InstitutionBadges', {
      institutionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Institutions',
          key: 'id',
        },
      },
      badgeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Badges',
          key: 'id',
        },
      },
    });
  
    InstitutionBadges.associate = (models) => {
      InstitutionBadges.belongsTo(models.Institutions, {
        foreignKey: 'institutionId',
      });
      InstitutionBadges.belongsTo(models.Badges, { foreignKey: 'badgeId' });
    };
  
    return InstitutionBadge;
  };
  