//---------------------------------------MIDDLEWARE
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const app = express();
app.use(cors());

//----------------------------------------LIGAÇÃO A BASE DE DADOS
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('AURA_db', 'postgres', 'postgres', {
  host: 'aura-database-instance.cts91ecvtypq.eu-north-1.rds.amazonaws.com',
  dialect: 'postgres'
});

//----------------------------------------IMPORT DOS MODELOS
const Institution = require('./models/institutions')
const Suggestion  = require('./models/suggestions');
const Worker = require('./models/workers')
const Badge = require('./models/badges')
const Energy = require('./models/energy_consumption')
const InstitutionBadge = require('./models/institution_badges');

//--------------------------------EXPRESS VALIDATOR
const { check,query, validationResult } = require('express-validator');

//1-Listagem de todas as instituições
app.get('/api/institutions',
  [
    query('sortBy').optional().isIn(['name', 'createdAt']),
    query('sortDirection').optional().isIn(['asc', 'desc']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sortBy = 'name', sortDirection = 'asc', limit = 20, offset = 0 } = req.query;

    try {
      const institutions = await Institution.findAll({
        order: [[sortBy, sortDirection.toUpperCase()]],
        limit,
        offset,
      });
      res.json(institutions);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });


//2-Listagem de todas as sugestões
app.get('/api/suggestions', [
  check('institution_id').optional().isInt(),
  check('author_id').optional().isInt(),
  check('description').optional().isString(), //não faz muito sentido porque a descrição é obrigatória, se fizer isso dá erro
  /*check('description').notEmpty().withMessage('Description is required').isString(),*/ 
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const suggestions = await Suggestion.findAll();
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


//3-Listagem de todos os trabalhadores
app.get('/api/workers', [
check('name').optional().isLength({ min: 1 }).withMessage('Name is required and must be at least 1 character'),
  check('email').isEmail().optional({ nullable: true }),
  check('phone_number').isMobilePhone().optional({ nullable: false }),
  check('role').isLength({ max: 50 }).optional({ nullable: false }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    const workers = await Worker.findAll();
    res.json(workers);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//4-Listagem de todos os Badges
app.get('/api/badges', [
 check('name').optional().notEmpty(),
 check('season').optional(),
 check('year').optional().isInt(),
 check('description').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const badges = await Badge.findAll();
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//5-Listagem de todos os Consumos de Energia
app.get('/api/energy', [
 check('year').optional().isInt({ min: 1900, max: 2100 }),
 check('month').optional().isInt({ min: 1, max: 12 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const energy = await Energy.findAll();
    res.json(energy);
    console.log(ener)
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


//6-Listagem de badges das instiuições
app.get('/api/institutions-badges', [
  check('institution_id').optional().isInt(),
  check('badge_id').optional().isInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institutionBadges = await InstitutionBadge.findAll();
    res.json(institutionBadges);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
;
InstitutionBadge.removeAttribute('id')

//7- Listagem de trabalhadores de uma instituição
app.get('/api/institutions/:id/workers', [
  check('id').isInt().toInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institutionId = req.params.id;
    const institution = await Institution.findOne({ where: { id: institutionId } });
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

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


//8-Listagem de Sugestões de uma instituição
app.get('/api/institutions/:id/suggestions', [
  check('id').isInt().withMessage('Invalid institution ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const institutionId = req.params.id;
    const suggestions = await Suggestion.findAll({
      where: { institution_id: institutionId },
    });
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


//9-Consumos de energia de uma instituição
app.get('/api/institutions/:id/energy', [
  check('id').isInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institutionId = req.params.id;
    const result = await Energy.findAll({
      where: { institution_id: institutionId },
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//10-Badges de uma instituição
app.get('/api/institutions/:id/badges', [
  check('id').isInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const institutionId = req.params.id;
    const result = await InstitutionBadge.findAll({
      where: { institution_id: institutionId },
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


//-----------------------------TESTE DE LIGAÇÃO--------------------------------
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


