const Institution = require('./institutions');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('AURA_DB_V2', 'postgres', 'postgres', {
    host: 'postgres-1.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
    dialect: 'postgres'
  });


const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  institution_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'workers',
  timestamps: false,
    hooks: {
      beforeSave: async (worker) => {
        if (worker.changed('password')) {
          const salt = await bcrypt.genSalt();
          worker.password_hash = await bcrypt.hash(worker.password, salt);
        }
      },
    },
  });

  Worker.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

module.exports = Worker;
