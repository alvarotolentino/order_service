const express = require('express'),
  ordersController = require('../../controllers/orderController'),
  productController = require('../../controllers/productController');

let router = express.Router();

router.use('/v1', [ordersController, productController]);

module.exports = router;
