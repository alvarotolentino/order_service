const { Pool } = require('pg');
const { validationResult } = require('express-validator');

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

async function newPurchaseOrder(req, res) {
  const client = await pool.connect();
  try {
    const { id, issueDate, quantity, productId, productName } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    await client.query('BEGIN');
    await client.query(
      'INSERT INTO purchase_order (id,issue_date,quantity,product_id,product_name) VALUES ($1,$2,$3,$4,$5)',
      [id, issueDate, quantity, productId, productName]
    );
    const result = await client.query(
      'SELECT id, open_balance FROM stock WHERE product_id = $1 AND stock_at = $2',
      [productId, issueDate]
    );

    let stockInsertUpdateStm = '';
    let params = [];
    if (result.rows && result.rows.length > 0 && result.rows[0].id) {
      stockInsertUpdateStm = 'UPDATE stock SET open_balance = $1 WHERE id = $2';
      const currentQuantity = parseInt(result.rows[0].open_balance);
      params = [currentQuantity + quantity, result.rows[0].id];
    } else {
      stockInsertUpdateStm =
        'INSERT INTO stock (product_id, product_name,stock_at,open_balance) VALUES ($1,$2,$3, $4)';
      params = [productId, productName, issueDate, quantity];
    }
    await client.query(stockInsertUpdateStm, params);

    await client.query('COMMIT');
    return res.status(201).json({ status: 'ok' });
  } catch (err) {
    console.error('Server error. Details: ', JSON.stringify(err));
    client.query('ROLLBACK');
    return res.status(500).json({ error: 'Something was wrong.' });
  } finally {
    client.release();
  }
}

async function newSalesOrder(req, res) {
  const client = await pool.connect();

  try {
    const { id, issueDate, quantity, productId, productName } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { totalStock, stockAvailable } = await getStock(productId, issueDate);

    if (totalStock < quantity) {
      const availableStatus = 'outOfStock';
      await client.query(
        'INSERT INTO sales_order (id,issue_date,quantity,product_id,product_name, status) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, issueDate, quantity, productId, productName, availableStatus]
      );
      return res.status(200).json({
        error: `${productName}(${productId}) Quantity out of stock.`,
      });
    }

    const monthlyThreshold = await getMonthlyThreshold(productId, issueDate);
    if (
      monthlyThreshold.rows &&
      monthlyThreshold.rows.length > 0 &&
      !isNaN(monthlyThreshold.rows[0].threshold) &&
      parseInt(monthlyThreshold.rows[0].threshold) + parseInt(quantity) > 30
    ) {
      const thresholdStatus = 'thresholdReached';
      await client.query(
        'INSERT INTO sales_order (id,issue_date,quantity,product_id,product_name, status) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, issueDate, quantity, productId, productName, thresholdStatus]
      );
      return res.status(200).json({
        error: `${productName}(${productId}) Monthly threshold reached.`,
      });
    }

    const { noZeroStockId, zeroStockIds } = getStockIds(
      quantity,
      stockAvailable
    );

    await client.query('BEGIN');

    const acceptedStatus = 'accepted';
    await client.query(
      'INSERT INTO sales_order (id,issue_date,quantity,product_id,product_name, status) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, issueDate, quantity, productId, productName, acceptedStatus]
    );

    let updateStockStm = [];
    let params = [];
    if (noZeroStockId && noZeroStockId.length > 0) {
      const zeroStockId = Object.keys(noZeroStockId[0])[0];
      updateStockStm.push('UPDATE stock SET open_balance = $1 WHERE id = $2');
      params.push(noZeroStockId[0][zeroStockId]);
      params.push(zeroStockId);
    }

    if (zeroStockIds && zeroStockIds.length > 0) {
      if (updateStockStm.length > 0) {
        updateStockStm.push(
          'UPDATE stock SET open_balance = 0 WHERE id IN ($3)'
        );
      } else {
        updateStockStm.push(
          'UPDATE stock SET open_balance = 0 WHERE id IN ($1)'
        );
      }
      params.push(zeroStockIds.join());
    }

    await client.query(updateStockStm.join(';'), params);
    await client.query('COMMIT');
    return res.status(201).json({ status: 'ok' });
  } catch (error) {
    console.error('Server error. Details: ', JSON.stringify(error));
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Something was wrong.' });
  } finally {
    client.release();
  }
}

async function getPurchaseOrderByProduct(req, res) {
  try {
    const id = req.params.id;
    const result = await pool.query(
      'SELECT issue_date,quantity,product_id,product_name FROM purchase_order WHERE product_id = $1',
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Server error. Details: ', JSON.stringify(error));
    res.status(500).json({ error: 'Something was wrong.' });
  }
}

async function getSalesOrderByProduct(req, res) {
  try {
    const id = req.params.id;
    const result = await pool.query(
      'SELECT issue_date,quantity,product_id,product_name, status FROM sales_order WHERE product_id = $1',
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Server error. Details: ', JSON.stringify(error));
    res.status(500).json({ error: 'Something was wrong.' });
  }
}

function getStockIds(quantity, stockAvailable) {
  stockAvailable.rows.forEach((item) => {
    if (quantity > 0) {
      if (item.open_balance > quantity) {
        item.open_balance -= quantity;
        quantity = 0;
      } else {
        quantity -= item.open_balance;
        item.open_balance = 0;
      }
      item.updated = true;
    }
  });

  const noZeroStockId = stockAvailable.rows
    .filter((row) => row.updated && row.open_balance > 0)
    .map((row) => {
      return { [row.id]: row.open_balance };
    });

  const zeroStockIds = stockAvailable.rows
    .filter((row) => row.updated && row.open_balance === 0)
    .map((row) => row.id);
  return { noZeroStockId, zeroStockIds };
}

async function getMonthlyThreshold(productId, issueDate) {
  return await pool.query(
    `SELECT SUM(quantity) as threshold 
      FROM sales_order 
      WHERE product_id = $1 AND status = 'accepted' AND to_char(issue_date, 'YYYY-MM') = to_char(date($2),'YYYY-MM') 
      GROUP BY DATE_TRUNC('month', issue_date)`,
    [productId, issueDate]
  );
}

async function getStock(productId, issueDate) {
  const stockAvailable = await pool.query(
    `SELECT id, open_balance 
      FROM stock 
      WHERE product_id = $1 AND stock_at <= $2 AND open_balance > 0 ORDER BY id`,
    [productId, issueDate]
  );
  const totalStock = stockAvailable.rows.reduce((prev, curr) => {
    return prev + curr.open_balance;
  }, 0);
  return { totalStock, stockAvailable };
}

module.exports = {
  newPurchaseOrder,
  newSalesOrder,
  getPurchaseOrderByProduct,
  getSalesOrderByProduct,
};
