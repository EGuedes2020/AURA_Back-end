const express = require('express');
const pg = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());


const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});

const Institutions = require('./models/institutions')

app.get('/institutions', async (req, res) => {
  try {
    const institutions = await Institutions.findAll();
    res.json(institutions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});


