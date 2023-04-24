const express = require('express');
const pg = require('pg');
const cors = require('cors');
const Institution = require('./models/institutions');
const Worker = require('./models/workers');
const EnergyConsumption = require('./models/energy_consumption');
const Badge = require('./models/badges');
const InstitutionBadge = require('./models/institution_badges');
const Suggestion = require('./models/suggestions');

const app = express();
app.use(cors());

const pool = new pg.Pool({
  user: 'postgres',
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  database: 'AURA_db',
  password: 'postgres',
  port: 5432,
});

//-----------------------------------------------------------ROTAS-----------------------------------------------------------------------

//Listagem de instituições
app.get('/institutions', async (req, res) => {
  try {
    const institutions = await Institution.findAll({ raw: true });
    res.json(institutions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Trabalhadores de uma instituição
app.get('/institutions/:id/workers', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const workers = await Worker.findAll({
      where: { institution_id: institutionId },
      include: Institution
    });
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Sugestões de uma instituição
app.get('/institutions/:id/suggestions', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const suggestions = await Suggestion.findAll({
      where: { institution_id: institutionId },
      include: [{ model: Institution }, { model: Worker }]
    });
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Consumos de energia de uma instituição
app.get('/institutions/:id/energy', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const energyConsumptions = await EnergyConsumption.findAll({
      where: { institution_id: institutionId },
      include: Institution
    });
    res.json(energyConsumptions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Badges atribuídos a instituições
app.get('/institutions_badges', async (req, res) => {
  try {
    const institutionBadges = await InstitutionBadge.findAll({
      include: [{ model: Institution }, { model: Badge }]
    });
    res.json(institutionBadges);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Badges de uma instituição
app.get('/institutions/:id/badges', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const institutionBadges = await InstitutionBadge.findAll({
      where: { institution_id: institutionId },
      include: [{ model: Institution }, { model: Badge }]
    });
    res.json(institutionBadges);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Listagem de todos os badges
app.get('/badges', async (req, res) => {
    try {
    const badges = await Badge.findAll();
    res.json(badges);
    } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
    }
    });

//Registo de todos os consumos de energia    
app.get('/energy', async (req, res) => {
    try {
    const energyConsumptions = await EnergyConsumption.findAll();
    res.json(energyConsumptions);
    } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
    }
    });

//Listagem de todas as sugestões
app.get('/suggestions', async (req, res) => {
    try {
    const suggestions = await Suggestion.findAll();
    res.json(suggestions);
    } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
    }
    });
    
//Listagem de todos os trabalhadores    
app.get('/workers', async (req, res) => {
    try {
    const workers = await Worker.findAll();
    res.json(workers);
    } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
    }
    });
    
//-------------------------------------------------------------------------SERVER------------------------------------------
app.listen(3000, () => {
console.log('Server listening on port 3000');
});
