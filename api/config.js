require('dotenv').config();

const {
  DB_HOSTNAME,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  APP_DB_USER,
  APP_DB_PASS,
  APP_DB_NAME,
  API_PORT,
} = process.env;

module.exports = {
  DB_HOSTNAME,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  APP_DB_USER,
  APP_DB_PASS,
  APP_DB_NAME,
  API_PORT,
};
