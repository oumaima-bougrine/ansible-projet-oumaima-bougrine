const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Connexion PostgreSQL via variables d'environnement
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

app.use(express.json());

// Endpoint racine
app.get('/', (req, res) => {
  res.json({ message: 'API Backend Node.js/Express', status: 'ok' });
});

// Endpoint /users - liste des utilisateurs depuis PostgreSQL
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users ORDER BY id');
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API running at http://0.0.0.0:${port}/`);
});
