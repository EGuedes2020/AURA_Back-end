//---------------------------------------MIDDLEWARE
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer')
const Uploadcare = require('uploadcare');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const axios = require('axios');
app.use(cookieParser());
app.use(express.json())
app.use(cors());
//app.use(verifyToken);

//---------------------------------------AUTH
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//--------------------------------------UPLOADCARE-ASSETS
const uploadcare = new Uploadcare({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
});


//Dar upload de um ficheiro


//Obter uma imagem
app.get('/image/:fileIdentifier', async (req, res) => {
  const fileIdentifier = req.params.fileIdentifier; 
  try {
    const fileUrl = `https://ucarecdn.com/${fileIdentifier}/`; 

    
    const response = await axios.get(fileUrl, { responseType: 'stream' });

    
    res.set('Content-Type', response.headers['content-type']);

    
    response.data.pipe(res);
  } catch (error) {
  
    console.error(error);
    res.status(500).send('Image retrieval failed');
  }
});

//----------------------------------------LIGAÇÃO A BASE DE DADOS
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres'
});
//----------------------------------------IMPORT DOS MODELOS
const Institution = require('./models/institutions')
const Suggestion  = require('./models/suggestions');
const Worker = require('./models/workers')
const Badge = require('./models/badges')
const Energy = require('./models/energy_consumption')
const InstitutionBadge = require('./models/institution_badges');
const ActiveWarning = require('./models/active_warnings')
const Rooms = require('./models/rooms')
const Invitation = require('./models/invitations')
const Device = require('./models/devices')
const WorkerVote = require('./models/workers_votes')

//--------------------------------EXPRESS VALIDATOR
const { check,query, validationResult } = require('express-validator');

//--------------------------------NODEMAILER
app.post('/api/send-email', async (req, res) => {
  const { destinationEmail, name, institution } = req.body;

  try {
    // Generate a unique token for the invitation
    const token = uuidv4();

    // Calculate the expiration date (e.g., 24 hours from the current time)
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);

    // Store the invitation details in the database
    const invitation = await Invitation.create({
      token,
      email: destinationEmail,
      status: 'pending',
      expiration,
      name,
      institution,
    });

    // Create the registration link with the token
    const registrationLink = `https://your-website.com/register?token=${invitation.token}`;

    // Send the email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      service: process.env.SMTP_SERVICE,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: 'appaura.ua@gmail.com',
      to: destinationEmail,
      subject: 'AURA INVITE',
      text: `Use this link to access our application: ${registrationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error occurred while sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully' });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

//------------------------------ROTAS---------------------------------------------------------


// GET route to fetch all worker votes
app.get('/api/worker_votes', async (req, res, next) => {
  try {
    const workerVotes = await WorkerVote.findAll();
    res.json(workerVotes);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET route to fetch a specific worker vote by ID
app.get('/api/worker_votes/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const workerVote = await WorkerVote.findByPk(id);
    if (!workerVote) {
      return res.status(404).json({ error: 'Worker vote not found' });
    }
    res.json(workerVote);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST route to create a new worker vote
app.post('/api/worker_votes', [
  check('suggestionId').isInt(),
  check('workerId').isInt(),
  check('votes').isIn(['yes', 'no']),
  check('workerName').isString(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { suggestionId, workerId, votes, workerName } = req.body;
  try {
    const newWorkerVote = await WorkerVote.create({
      suggestionId,
      workerId,
      votes,
      workerName,
    });
    res.status(201).json(newWorkerVote);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PUT route to update a specific worker vote
app.put('/api/worker_votes/:id', [
  check('suggestionId').optional().isInt(),
  check('workerId').optional().isInt(),
  check('votes').optional().isIn(['yes', 'no']),
  check('workerName').optional().isString(),
], async (req, res, next) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const workerVote = await WorkerVote.findByPk(id);
    if (!workerVote) {
      return res.status(404).json({ error: 'Worker vote not found' });
    }

    const { suggestionId, workerId, votes, workerName } = req.body;
    await workerVote.update({
      suggestionId: suggestionId || workerVote.suggestionId,
      workerId: workerId || workerVote.workerId,
      votes: votes || workerVote.votes,
      workerName: workerName || workerVote.workerName,
    });

    res.json(workerVote);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// DELETE route to delete a specific worker vote
app.delete('/api/worker_votes/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const workerVote = await WorkerVote.findByPk(id);
    if (!workerVote) {
      return res.status(404).json({ error: 'Worker vote not found' });
    }
    await workerVote.destroy();
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
// (1.1) Todas as instituições
app.get('/api/institutions', async (req, res, next) => {
  try {
    const institutions = await Institution.findAll();
    
    // Calculate Score for each institution
    institutions.forEach(institution => {
      const avgResponseTime = institution.avg_response_time || 0;
      const totalWarnings = institution.total_warnings || 0;
      const score = Math.floor((1 / ((0.6 * avgResponseTime / 60) + (0.4 * totalWarnings / 40))) * 10000);
      institution.setDataValue('Score', score);
    });

    res.status(200).json(institutions);
  } catch (err) {
    next(err);
  }
});

//(1.2)Atualiza uma instituição
app.put('/api/institutions/:id', async (req, res, next) => {
  try {
    const institution = await Institution.findByPk(req.params.id);
    if (!institution) {
      res.status(404).send("Institution not found");
    } else {
      await institution.update(req.body);
      res.status(200).json(institution);
    }
  } catch (err) {
    next(err);
  }
});

//(1.3)Cria uma nova instituição
app.post('/api/institutions', async (req, res, next) => {
  try {
    const institution = await Institution.create(req.body);
    res.status(201).json(institution);
  } catch (err) {
    next(err);
  }
});

//(1.4)Apaga uma nova instituição
app.delete('/api/institutions/:id', async (req, res, next) => {
  try {
    const institution = await Institution.findByPk(req.params.id);
    if (!institution) {
      res.status(404).send("Institution not found");
    } else {
      await institution.destroy();
      res.status(204).send();
    }
  } catch (err) {
    next(err);
  }
});

//(1.5)Uma instituição
app.get('/api/inst/:id', async (req, res, next) => {
  try {
    const institutionId = req.params.id;
    
    // Retrieve the institution with the given ID
    const institution = await Institution.findByPk(institutionId);

    if (!institution) {
      res.status(404).json({ error: 'Institution not found.' });
    } else {
      // Calculate the score for the institution
      const avgResponseTime = institution.avg_response_time || 0;
      const totalWarnings = institution.total_warnings || 0;
      const score = Math.floor((1 / ((0.6 * avgResponseTime / 60) + (0.4 * totalWarnings / 40))) * 10000);
      institution.setDataValue('Score', score);

      res.status(200).json(institution);
    }
  } catch (err) {
    next(err);
  }
});

app.get('/api/institutions/firstplace', async (req, res, next) => {
  try {
    const institutions = await Institution.findAll();
    
    // Calculate Score for each institution
    institutions.forEach(institution => {
      const avgResponseTime = institution.avg_response_time || 0;
      const totalWarnings = institution.total_warnings || 0;
      const score = Math.floor((1 / ((0.6 * avgResponseTime / 60) + (0.4 * totalWarnings / 40))) * 10000);
      institution.setDataValue('Score', score);
    });

    // Sort institutions based on the calculated score in descending order
    institutions.sort((a, b) => b.getDataValue('Score') - a.getDataValue('Score'));

    const firstPlace = institutions[0];

    res.status(200).json(firstPlace);
  } catch (err) {
    next(err);
  }
});

//2nd place
app.get('/api/institutions/secondplace', async (req, res, next) => {
  try {
    const institutions = await Institution.findAll();
    
    // Calculate Score for each institution
    institutions.forEach(institution => {
      const avgResponseTime = institution.avg_response_time || 0;
      const totalWarnings = institution.total_warnings || 0;
      const score = Math.floor((1 / ((0.6 * avgResponseTime / 60) + (0.4 * totalWarnings / 40))) * 10000);
      institution.setDataValue('Score', score);
    });

    // Sort institutions based on the calculated score in descending order
    institutions.sort((a, b) => b.getDataValue('Score') - a.getDataValue('Score'));

    const secondPlace = institutions[1];

    res.status(200).json(secondPlace);
  } catch (err) {
    next(err);
  }
});

//3rd place
app.get('/api/institutions/thirdplace', async (req, res, next) => {
  try {
    const institutions = await Institution.findAll();
    
    // Calculate Score for each institution
    institutions.forEach(institution => {
      const avgResponseTime = institution.avg_response_time || 0;
      const totalWarnings = institution.total_warnings || 0;
      const score = Math.floor((1 / ((0.6 * avgResponseTime / 60) + (0.4 * totalWarnings / 40))) * 10000);
      institution.setDataValue('Score', score);
    });

    // Sort institutions based on the calculated score in descending order
    institutions.sort((a, b) => b.getDataValue('Score') - a.getDataValue('Score'));

    const thirdPlace = institutions[2];

    res.status(200).json(thirdPlace);
  } catch (err) {
    next(err);
  }
});


//(2.1) Todas as sugestões
app.get('/api/suggestions', [
  check('institution_id').optional().isInt(),
  check('author_id').optional().isInt(),
  check('description').optional().isString(),
], async (req, res, next) => { // add "next" parameter
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const suggestions = await Suggestion.findAll();
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    next(err); 
  }
});

//(2.2) Atualiza uma sugestão
app.put('/api/suggestions/:id', async (req, res, next) => {
  try {
    const suggestion = await Suggestion.findByPk(req.params.id);
    if (!suggestion) {
      res.status(404).send("Suggestion not found");
    } else {
      await suggestion.update(req.body);
      res.status(200).json(suggestion);
    }
  } catch (err) {
    next(err);
  }
});

//(2.3) Cria uma nova sugestão
app.post('/api/institutions/:institutionId/suggestions', async (req, res, next) => {
  const institutionId = req.params.institutionId;

  try {
    const suggestionData = {
      institution_id: institutionId,
      description: req.body.description,
      author_id: req.body.author_id,
      title: req.body.title,
      // Include any other fields you want to set for the suggestion
    };

    const suggestion = await Suggestion.create(suggestionData);
    const sortedSuggestions = await Suggestion.findAll({
      where: { institution_id: institutionId },
      order: [['date_created', 'DESC']],
    });

    res.status(201).json(sortedSuggestions);
  } catch (err) {
    next(err);
  }
});


//(2.4) Apaga uma sugestão
app.delete('/api/suggestions/:id', async (req, res, next) => {
  try {
    const suggestion = await Suggestion.findByPk(req.params.id);
    if (!suggestion) {
      res.status(404).send("Suggestion not found");
    } else {
      await suggestion.destroy();
      res.status(204).send();
    }
  } catch (err) {
    next(err);
  }
});

//(2.5) Uma sugestão especifica
app.get('/api/suggestions/:id', async (req, res, next) => {
  try {
    const suggestionId = req.params.id;
    const suggestion = await Suggestion.findByPk(suggestionId);

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    res.json(suggestion);
  } catch (err) {
    console.error(err);
    next(err);
  }
});




//(3.1) Todos os trabalhadores
app.get('/api/workers', [
  check('name').optional().isLength({ min: 1 }).withMessage('Name is required and must be at least 1 character'),
  check('email').isEmail().optional({ nullable: true }),
  check('phone_number').isMobilePhone().optional({ nullable: false }),
  check('role').isLength({ max: 50 }).optional({ nullable: false }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    const workers = await Worker.findAll();
    res.json(workers);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//(3.2) Atualiza um trabalhador 
app.put('/api/workers/:id', [
  check('name').isLength({ min: 1 }).withMessage('Name is required and must be at least 1 character'),
  check('email').isEmail().optional({ nullable: true }),
  check('phone_number').isMobilePhone().optional({ nullable: false }),
  check('role').isLength({ max: 50 }).optional({ nullable: false }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    const worker = await Worker.findByPk(req.params.id);
    if (!worker) {
      return res.status(404).send("Worker not found");
    }
    await worker.update(req.body);
    res.status(200).json(worker);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//(3.3) Adiciona um trabalhador (semelhante ao 11)
app.post('/api/workers', [
  check('name').isLength({ min: 1 }).withMessage('Name is required and must be at least 1 character'),
  check('email').isEmail().optional({ nullable: true }),
  check('phone_number').isMobilePhone().optional({ nullable: false }),
  check('role').isLength({ max: 50 }).optional({ nullable: false }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    const worker = await Worker.create(req.body);
    res.status(201).json(worker);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//(3.4) Apaga um trabalhador trabalhadores
app.delete('/api/workers/:id', async (req, res, next) => {
  try {
    const worker = await Worker.findByPk(req.params.id);
    if (!worker) {
      res.status(404).send("Worker not found");
    } else {
      await worker.destroy();
      res.status(204).send();
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});



// (4.1) Todos os badges
app.get('/api/badges', [
  check('name').optional().notEmpty(),
  check('season').optional(),
  check('year').optional().isInt(),
  check('description').optional(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const badges = await Badge.findAll();
    res.json(badges);
  } catch (err) {
    console.error(err);
    next(err);
  }
}, function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// (4.2) Atualiza um badge
app.put('/api/badges/:id', async (req, res, next) => {
  try {
    const badge = await Badge.findByPk(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    await badge.update(req.body);
    res.json(badge);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// (4.3) Adiciona um badge
app.post('/api/badges', async (req, res, next) => {
  try {
    const badge = await Badge.create(req.body);
    res.json(badge);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// (4.4) Apaga um badge
app.delete('/api/badges/:id', async (req, res, next) => {
  try {
    const badge = await Badge.findByPk(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    await badge.destroy();
    res.json({ message: 'Badge deleted successfully' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});



//(5.1) Todos os consumos de energia
app.get('/api/energy', [
  check('year').optional().isInt({ min: 1900, max: 2100 }),
  check('month').optional().isInt({ min: 1, max: 12 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const energy = await Energy.findAll();
    res.json(energy);
    console.log(energy)
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//(5.2) Atualiza um consumos de energia
app.put('/api/energy/:id', async (req, res, next) => {
  const energyId = req.params.id;

  try {
    // Check if the energy consumption exists
    const energy = await Energy.findByPk(energyId);
    if (!energy) {
      return res.status(404).json({ message: 'Energy consumption not found' });
    }

    // Update the energy consumption
    await energy.update(req.body);

    // Return the updated energy consumption
    res.json(energy);
  } catch (err) {
    console.error(err);
    next(err);
  }
});



//(5.3) Adiciona um consumo de energia
app.post('/api/energy', async (req, res, next) => {
  try {
    const energy = await Energy.create(req.body);
    res.json(energy);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//(5.4) Apaga um consumo de energia
app.delete('/api/energy/:id', async (req, res, next) => {
  try {
    const energy = await Energy.findByPk(req.params.id);
    if (!energy) {
      return res.status(404).json({ message: 'Energy data not found' });
    }

    await energy.destroy();
    res.json({ message: 'Energy data deleted successfully' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// (6) Histórico de Badges atribuídos a instituições
app.get('/api/institutions-badges', [
  check('institution_id').optional().isInt(),
  check('badge_id').optional().isInt(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { institution_id, badge_id } = req.query;

    const options = {
      include: Institution,
      where: {},
      order: [['institution_id', 'ASC']],
    };

    if (institution_id) {
      options.where.institution_id = institution_id;
    }

    if (badge_id) {
      options.where.badge_id = badge_id;
    }

    const institutionBadges = await InstitutionBadge.findAll(options);

    res.json(institutionBadges);
  } catch (err) {
    console.error(err);
    next(err);
  }
});



// (7) Trabalhadores de uma instituição
app.get('/api/institutions/:id/workers', [
  check('id').isInt().toInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
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
        institution_name: institutionName,
        avatar: worker.avatar, // Include the avatar URL in the response
      };
    });
    
    res.json(formattedWorkers);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
// (8) Sugestões de uma instituição
app.get('/api/institutions/:id/suggestions', [
  check('id').isInt().withMessage('Invalid institution ID'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institutionId = req.params.id;
    const suggestions = await Suggestion.findAll({
      where: { institution_id: institutionId },
      order: [['date_created', 'DESC']],
    });

    const formattedSuggestions = suggestions.map(suggestion => {
      const { votes, status, number_of_votes } = suggestion;

      // Check if votes is null and set it to 0
      const formattedVotes = votes === null ? 0 : votes;

      // Check if status is null and set it to 'pending'
      const formattedStatus = status === null ? 'pending' : status;

      // Check if number_of_votes is null and set it to 0
      const formattedNumberOfVotes = number_of_votes === null ? 0 : number_of_votes;

      // Return the suggestion with formatted votes, status, and number_of_votes
      return {
        ...suggestion.toJSON(),
        votes: formattedVotes,
        status: formattedStatus,
        number_of_votes: formattedNumberOfVotes,
      };
    });

    res.json(formattedSuggestions);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// (9) Consumos de energia de uma instituição
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
    next(err);
  }
});
// (10) Badges de uma instituição
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

//Primeiros 4 badges
app.get('/api/institutions/:institutionId/4badges', async (req, res, next) => {
  try {
    const institutionId = req.params.institutionId;
    const badgeIds = [1, 12, 9, 4];

    const badges = await InstitutionBadge.findAll({
      where: {
        institution_id: institutionId,
        badge_id: badgeIds
      },
      attributes: ['badge_id', 'avatar']
    });

    res.status(200).json(badges);
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 11.1(Todos os avisos)
app.get('/api/institutions/active_warnings', async (req, res) => {
  try {
    const activeWarnings = await ActiveWarning.findAll();
    res.json(activeWarnings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve active warnings' });
  }
});

// 11.2(Aviso especifico)
app.get('/api/institutions/active_warnings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const activeWarning = await ActiveWarning.findByPk(id);
    if (!activeWarning) {
      return res.status(404).json({ error: 'Active warning not found' });
    }
    res.json(activeWarning);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve active warning' });
  }
});

// 11.3(Adicionar um novo alerta)
app.post('/api/institutions/active_warnings', async (req, res) => {
  const { institution_id, room, warning_time, devices_on } = req.body;
  try {
    const newActiveWarning = await ActiveWarning.create({
      institution_id,
      room,
      warning_time,
      devices_on,
    });
    res.status(201).json(newActiveWarning);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create active warning' });
  }
});

//11.4 (Atualizar um alerta)
app.put('/api/institutions/active_warnings/:id', async (req, res) => {
  const { id } = req.params;
  const { institution_id, room, warning_time, devices_on } = req.body;
  try {
    const activeWarning = await ActiveWarning.findByPk(id);
    if (!activeWarning) {
      return res.status(404).json({ error: 'Active warning not found' });
    }
    activeWarning.institution_id = institution_id;
    activeWarning.room = room;
    activeWarning.warning_time = warning_time;
    activeWarning.devices_on = devices_on;
    await activeWarning.save();
    res.json(activeWarning);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update active warning' });
  }
});

// 11.5(Apagar um alerta)
app.delete('/api/institutions/active_warnings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const activeWarning = await ActiveWarning.findByPk(id);
    if (!activeWarning) {
      return res.status(404).json({ error: 'Active warning not found' });
    }
    await activeWarning.destroy();
    res.json({ message: 'Active warning deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete active warning' });
  }
});

// 11.6(Avisos de uma instituição em específico)
app.get('/api/active_warnings/institution/:institutionId', async (req, res) => {
  const { institutionId } = req.params;
  try {
    const activeWarnings = await ActiveWarning.findAll({
      where: { institution_id: institutionId },
    });
    res.json(activeWarnings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve active warnings' });
  }
});

// 12.1 (Todos as divisões)
app.get('/api/institutions/rooms', async (req, res) => {
  try {
    const rooms = await Rooms.findAll();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve rooms' });
  }
});

// 12.2 (Uma divisão específica)
app.get('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Rooms.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve room' });
  }
});

// 12.3 (Adicionar uma divisão)
app.post('/api/institutions/rooms', async (req, res) => {
  const { institution_id, room_number, devices_per_division, total_warnings, institution_name } = req.body;
  try {
    const newRoom = await Rooms.create({
      institution_id,
      room_number,
      devices_per_division,
      total_warnings,
      institution_name,
    });
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// 12.4 (atualizar uma divisão)
app.put('/api/institutions/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { institution_id, room_number, devices_per_division, total_warnings, institution_name } = req.body;
  try {
    const room = await Rooms.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    room.institution_id = institution_id;
    room.room_number = room_number;
    room.devices_per_division = devices_per_division;
    room.total_warnings = total_warnings;
    room.institution_name = institution_name;
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// 12.5 (apagar uma divisão)
app.delete('/api/institutions/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Rooms.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    await room.destroy();
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

//12.6 (Todas as divisões de uma instituição)
app.get('/api/institutions/rooms/:institutionId', async (req, res) => {
  const { institutionId } = req.params;
  try {
    const sumOfDevices = await Rooms.sum('devices_per_division', {
      where: { institution_id: institutionId },
    });
    
    const rooms = await Rooms.findAll({
      where: { institution_id: institutionId },
    });
    
    res.json({ sumOfDevices, rooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve rooms and sum of devices' });
  }
});




//13.1 (Todos os dispositivos)
app.get('/api/institutions/devices',  async (req, res) => {
  try {
    const devices = await Device.findAll();
    res.status(200).json({ devices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


//13.2 (Adicionar um novo dispositivo)
app.post('/api/institutions/devices',  async (req, res) => {
  try {
    const { institution_id, room, name_of_device, assigned, institution_name, room_name } = req.body;

    const device = await Device.create({
      institution_id,
      room,
      name_of_device,
      assigned,
      institution_name,
      room_name
    });

    res.status(201).json({ device });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

//13.3 (Atualizar um dispositivo)
app.put('/api/institutions/devices/:id',  async (req, res) => {
  try {
    const { id } = req.params;
    const { institution_id, room, name_of_device, assigned, institution_name, room_name } = req.body;

    const device = await Device.findByPk(id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    device.institution_id = institution_id;
    device.room = room;
    device.name_of_device = name_of_device;
    device.assigned = assigned;
    device.institution_name = institution_name;
    device.room_name = room_name;

    await device.save();

    res.status(200).json({ device });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

//13.4 (Apagar um dispositivo)
app.delete('/api/institutions/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findByPk(id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await device.destroy();

    res.status(200).json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

//13.5 (Dispositivos de uma instituição)
app.get('/api/institutions/:institutionId/devices', async (req, res) => {
  try {
    const { institutionId } = req.params;

    // Find all devices belonging to the specified institution, sorted by ID
    const devices = await Device.findAll({
      where: { institution_id: institutionId },
      order: [['id', 'ASC']], // Sort by ID in ascending order
    });

    res.status(200).json({ devices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});




app.get('/api/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find worker in the database by ID
    const worker = await Worker.findOne({ where: { id } });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Return the worker details
    res.status(200).json({ worker });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


//----------------------AUTH
//(11) Registo de um novo utilizador
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone_number, institution_id, role, institution_name, password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const worker = await Worker.create({
      name,
      email,
      phone_number,
      institution_id,
      role,
      institution_name,
      password_hash: hashedPassword,
    });

    // Create a token for the new user
    const token = jwt.sign({ worker_id: worker.id }, 'SECRET_KEY');

    res.status(201).json({ worker, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

//(12) Autenticação de um utilizador
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find worker in the database
    const worker = await Worker.findOne({ where: { email } });

    if (!worker) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, worker.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign({ worker_id: worker.id }, 'SECRET_KEY');
    res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'none' });

    // Include user data in the response
    const responseData = {
      message: 'Login successful',
      token,
      worker_id: worker.id,
      institution_id: worker.institution_id,
      role: worker.role,
      // Include other relevant data as needed
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// function verifyToken(req, res, next) {
//   // Get the token from the Authorization header
//   const authHeader = req.headers.authorization;
//   let token = authHeader && authHeader.split(' ')[1];

//   // If no token in the Authorization header, check for the token in the jwt cookie
//   if (!token) {
//     token = req.cookies.jwt;
//   }
//   // No token
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized: No token provided' });
//   }

//   // Verify token
//   jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ error: 'Forbidden: Invalid token' });
//     }
//     req.worker_id = decoded.worker_id;
//     next();
//   });
// }


//Verifica o JWT 
app.get('/api/protected', (req, res) => {
  // Check if the 'jwt' cookie exists
  if (req.cookies.jwt) {
    res.status(200).json({ message: 'Valid Token' });
  } else {
    res.status(401).json({ error: 'Unauthorized: No token sad' });
  }
});







//-----------------------------TESTE DE LIGAÇÃO-------------------------------
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

//--------------------------------ERROR-HANDLING
//401
app.use((err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send('Unauthorized');
  } else {
    next(err);
  }
});

//403
app.use((err, req, res, next) => {
  if (err.status === 403) {
    res.status(403).send('Forbidden');
  } else {
    next(err);
  }
});

//404
app.use((req, res, next) => {
  res.status(404).send('Page Not Found');
});

//422
app.use((err, req, res, next) => {
  if (err.status === 422) {
    res.status(422).send('Unprocessable Entity');
  } else {
    next(err);
  }
});

//429
app.use((err, req, res, next) => {
  if (err.status === 429) {
    res.status(429).send('Too Many Requests');
  } else {
    next(err);
  }
});

//500
app.use((err, req, res, next) => {
  res.status(500).send('Something Broke!');
});

//503
app.use((err, req, res, next) => {
  if (err.status === 503) {
    res.status(503).send('Service Unavailable');
  } else {
    next(err);
  }
});

