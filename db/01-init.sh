#!/bin/bash
set -e
export PGPASSWORD=$POSTGRES_PASSWORD;
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER $APP_DB_USER WITH PASSWORD '$APP_DB_PASS';
  CREATE DATABASE $APP_DB_NAME;
  GRANT ALL PRIVILEGES ON DATABASE $APP_DB_NAME TO $APP_DB_USER;
  \connect $APP_DB_NAME $APP_DB_USER
  BEGIN;
    CREATE TABLE IF NOT EXISTS purchase_order (
      id VARCHAR(26) NOT NULL,
      issue_date DATE NOT NULL,
      product_id VARCHAR(10) NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      quantity INTEGER NOT NULL
  	);
    CREATE TABLE IF NOT EXISTS sales_order (
      id VARCHAR(26) NOT NULL,
      issue_date DATE NOT NULL,
      product_id VARCHAR(10) NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      quantity INTEGER NOT NULL,
      status VARCHAR(20) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stock (
      id serial PRIMARY KEY,
      product_id VARCHAR(10) NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      stock_at DATE NOT NULL,
      open_balance INTEGER NOT NULL
    );
  COMMIT;
EOSQL