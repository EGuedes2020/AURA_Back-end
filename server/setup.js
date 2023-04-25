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

const Institution = require('./models/institutions')
const Suggestion  = require('./models/suggestions');
const Worker = require('./models/workers')
const Badge = require('./models/badges')
const Energy = require('./models/energy_consumption')
const InstitutionBadge = require('./models/institution_badges');

//Listagem de todas as instituições
app.get('/institutions', async (req, res) => {
  try {
    const institutions = await Institution.findAll();
    res.json(institutions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


//1-Listagem de todas as sugestões
app.get('/api/suggestions', async (req, res) => {
  try {
    const suggestions = await Suggestion.findAll();
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//2-Listagem de todos os trabalhadores
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await Worker.findAll();
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//3-Listagem de todos os Badges
app.get('/api/badges', async (req, res) => {
  try {
    const badges = await Badge.findAll();
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//4-Listagem de todos os Consumos de Energia
app.get('/api/energy', async (req, res) => {
  try {
    const energy = await Energy.findAll();
    res.json(energy);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//5-Listagem de badges das instiuições
app.get('/api/institutions-badges', async (req, res) => {
  try {
    const institutionBadges = await InstitutionBadge.findAll(
      /*include: [
        { model: Institution, attributes: ['name'] },
        { model: Badge, attributes: ['name'] }
      ]*/
    );
    res.json(institutionBadges);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
InstitutionBadge.removeAttribute('id')

//6- Listagem de trabalhadores de uma instituição
app.get('/api/institutions/:id/workers', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const institution = await Institution.findOne({ where: { id: institutionId } });
    const institutionName = institution.name;
    const workers = await Worker.findAll({ where: { institution_id: institutionId } });
    const formattedWorkers = workers.map(worker => {
      return {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        phone_number: worker.phone_number,
        institution_name: institutionName
      };
    });
    res.json(formattedWorkers);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//7-Listagem de Sugestões de uma instituição
app.get('/api/institutions/:id/suggestions', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const suggestions = await Suggestion.findAll({
      where: { institution_id: institutionId },
      /*include: [
        { 
          model: Institution, 
          attributes: ['name'],
        },
        { 
          model: Worker, 
          attributes: ['name'],
        }
      ],*/ 
    });
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//8-Consumos de energia de uma instituição
app.get('/api/institutions/:id/energy', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const result = await Energy.findAll({
      where: { institution_id: institutionId },
     /* include: [
        { model: Institution, attributes: ['name'] },
      ]*/
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//9-Badges de uma instituição
app.get('/api/institutions/:id/badges', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const result = await InstitutionBadge.findAll({
      where: { institution_id: institutionId },
    /* include: [
        { model: Institution, attributes: ['name'] },
        { model: Badge, attributes: ['name'] }
      ] */
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


//-----------------------------AUTHENTICATE--------------------------------
try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

//-----------------------------------SERVER
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});


