const { DataTypes,Sequelize } = require('sequelize');

// Replace with your database credentials
const sequelize = new Sequelize('Aura_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres',
});

// Import models
const Badges = require('./badges')(sequelize, DataTypes);
const EnergyConsumption = require('./energy_consumption')(sequelize, DataTypes);
const Institutions = require('./institutions')(sequelize, DataTypes);
const Workers = require('./workers')(sequelize, DataTypes);
const Suggestions = require('./suggestions')(sequelize, DataTypes);
const InstitutionBadges = require('./institution_badges')(sequelize, DataTypes);

// Associations
Institutions.hasMany(EnergyConsumption, { foreignKey: 'institution_id' });
EnergyConsumption.belongsTo(Institutions, { foreignKey: 'institution_id' });

Institutions.hasMany(Workers, { foreignKey: 'institution_id' });
Workers.belongsTo(Institutions, { foreignKey: 'institution_id' });

Workers.hasMany(Suggestions, { foreignKey: 'author_id' });
Suggestions.belongsTo(Workers, { foreignKey: 'author_id' });

Institutions.hasMany(Suggestions, { foreignKey: 'institution_id' });
Suggestions.belongsTo(Institutions, { foreignKey: 'institution_id' });

Institutions.belongsToMany(Badges, { through: InstitutionBadges });
Badges.belongsToMany(Institutions, { through: InstitutionBadges });

// Export models
module.exports = {
  sequelize,
  Badges,
  EnergyConsumption,
  Institutions,
  Workers,
  Suggestions,
  InstitutionBadges,
};
