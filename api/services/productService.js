const { Pool } = require('pg');

const {
  DB_HOSTNAME,
  POSTGRES_PORT,
  APP_DB_USER,
  APP_DB_PASS,
  APP_DB_NAME,
} = require('../config');

const pool = new Pool({
  host: DB_HOSTNAME,
  user: APP_DB_USER,
  password: APP_DB_PASS,
  database: APP_DB_NAME,
  port: POSTGRES_PORT,
  max: 10,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});

async function getProducts(req, res) {
  try {
    const result = await pool.query(
      `SELECT product_id, product_name
      FROM stock
      GROUP BY product_id, product_name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Server error. Details: ', JSON.stringify(error));
    res.status(500).json({ error: 'Something was wrong.' });
  }
}

module.exports = {
  getProducts,
};
