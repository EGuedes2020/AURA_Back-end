const Institution = require('./models/institutions');
const Badge = require('./models/badges');
const EnergyConsumption = require('./models/energy_consumption');
const InstitutionBadge = require('./models/institution_badges');
const Suggestion = require('./models/suggestions');
const Worker = require('./models/workers');



//Associations
Institution.hasMany(Worker);
Worker.belongsTo(Institution);

Institution.belongsToMany(Badge, { through: InstitutionBadge });
Badge.belongsToMany(Institution, { through: InstitutionBadge });

EnergyConsumption.belongsTo(Institution);
Institution.hasMany(EnergyConsumption);

Suggestion.belongsTo(Institution);
Institution.hasMany(Suggestion);

Suggestion.belongsTo(Worker);
Worker.hasMany(Suggestion);
