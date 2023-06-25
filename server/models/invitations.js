const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('AURA_DB_V2', 'postgres', 'postgres', {
    host: 'postgres-1.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
    dialect: 'postgres'
  });

const Invitation = sequelize.define('Invitation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      expiration: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      name: {
        type: DataTypes.STRING(255),
      },
      institution: {
        type: DataTypes.STRING(255),
      },
    }, {
      tableName: 'invitations',
      timestamps: false,
    });
module.exports = Invitation;
