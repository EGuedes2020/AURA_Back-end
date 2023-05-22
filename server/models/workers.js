const { Sequelize, DataTypes } = require('sequelize');
const Institution = require('./institutions');

const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
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
    references: {
      model: Institution,
      key: 'id',
    },
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  institution_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING, // assuming avatar is a string column
    allowNull: true, // or false, depending on your requirements
  },

password: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      validate: {
        len: [6, 255],
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
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
