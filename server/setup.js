//---------------------------------------MIDDLEWARE
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer')
app.use(cookieParser());
app.use(express.json())
app.use(cors());

//---------------------------------------AUTH
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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

//--------------------------------NODEMAILER
app.post('/api/send-email', (req, res) => {
  
  const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    service: 'gmail',
    secure: true,
    auth: {
      user: 'luisffsantoos@gmail.com',
      pass: 'lomdhajbvvozpqqg'
    }
  });

  const mailOptions = {
    from: 'luisffsantoos@gmail.com',
    to: 'luisssferreira24@gmail.com',
    subject: 'AURA INVITE',
    text: 'Usa este link para aceder à nossa aplicação: https://www.youtube.com/watch?v=dQw4w9WgXcQ ',
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
});


//------------------------------ROTAS---------------------------------------------------------
// (1.1) Todas as instituições
app.get('/api/institutions', async (req, res, next) => {
  try {
    const institutions = await Institution.findAll();
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
app.post('/api/suggestions', async (req, res, next) => {
  try {
    const suggestion = await Suggestion.create(req.body);
    res.status(201).json(suggestion);
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
  try {
    const energy = await Energy.findByPk(req.params.id);
    if (!energy) {
      return res.status(404).json({ message: 'Energy data not found' });
    }

    await energy.update(req.body);
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

    const institutionBadges = await InstitutionBadge.findAll();
    res.json(institutionBadges);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
InstitutionBadge.removeAttribute('id')

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
        institution_name: institutionName
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

    // Encontra worker na BD
    const worker = await Worker.findOne({ where: { email } });

    if (!worker) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Checka password
    const passwordMatch = await bcrypt.compare(password, worker.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Cria token
    const token = jwt.sign({ worker_id: worker.id },'SECRET_KEY');
    res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'none' });
    
    //Verifica login
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

function verifyToken(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.split(' ')[1];

  // If no token in the Authorization header, check for the token in the jwt cookie
  if (!token) {
    token = req.cookies.jwt;
  }
  // No token
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  // Verify token
  jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    req.worker_id = decoded.worker_id;
    next();
  });
}



//Verifica o JWT 
app.get('/api/protected', verifyToken, (req, res) => {
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



