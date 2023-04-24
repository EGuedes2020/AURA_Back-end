const express = require('express');
const pg = require('pg');
const cors = require('cors');

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
    const result = await pool.query('SELECT * FROM institutions');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Trabalhadores de uma instituição
app.get('/institutions/:id/workers', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const institutionResult = await pool.query('SELECT name FROM institutions WHERE id = $1', [institutionId]);
    const institutionName = institutionResult.rows[0].name;
    const workersResult = await pool.query('SELECT * FROM workers WHERE institution_id = $1', [institutionId]);
    const workers = workersResult.rows.map(worker => {
      return {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        phone_number: worker.phone_number,
        institution_name: institutionName
      };
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
    const result = await pool.query(
      'SELECT suggestions.*, institutions.name AS institution_name, workers.name AS worker_name FROM suggestions JOIN institutions ON suggestions.institution_id = institutions.id JOIN workers ON suggestions.author_id = workers.id WHERE suggestions.institution_id = $1',
      [institutionId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});



//Consumos de energia de uma instituição
app.get('/institutions/:id/energy', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const result = await pool.query(
      'SELECT energy_consumption.*, institutions.name AS institution_name FROM energy_consumption JOIN institutions ON energy_consumption.institution_id = institutions.id WHERE energy_consumption.institution_id = $1',
      [institutionId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Badges atribuídos a instituições
app.get('/institutions_badges', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT institution_badges.*, institutions.name AS institution_name, badges.name AS badge_name 
      FROM institution_badges 
      JOIN institutions ON institution_badges.institution_id = institutions.id 
      JOIN badges ON institution_badges.badge_id = badges.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

//Badges de uma instituição
app.get('/institutions/:id/badges', async (req, res) => {
  try {
    const institutionId = req.params.id;
    const result = await pool.query(
      'SELECT institution_badges.*, institutions.name AS institution_name, badges.name AS badge_name FROM institution_badges JOIN institutions ON institution_badges.institution_id = institutions.id JOIN badges ON institution_badges.badge_id = badges.id WHERE institution_badges.institution_id = $1',
      [institutionId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});









app.get('/badges', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM badges');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get('/energy', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM energy_consumption');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get('/suggestions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suggestions');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get('/workers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workers');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});



//-------------------------------------------------------------------------SERVER------------------------------------------
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});