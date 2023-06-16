const { DataTypes,Sequelize } = require('sequelize');
const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});



const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  avatar_achieved: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  avatar_not_achieved: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'badges',
  timestamps: false // Set to true if you have timestamp columns (e.g., createdAt, updatedAt)
});


module.exports = Badge;
