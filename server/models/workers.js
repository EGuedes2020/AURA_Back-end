const { Model, DataTypes } = require('sequelize');
const sequelize = require('./database');
const Institution = require('./institution');

class Worker extends Model {}

Worker.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING
  },
  phone_number: {
    type: DataTypes.STRING
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Institution,
      key: 'id'
    }
  },
  role: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'worker',
  tableName: 'workers'
});

Worker.belongsTo(Institution, { foreignKey: 'institution_id' });

module.exports = Worker;
