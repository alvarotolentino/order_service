const express = require('express'),
  productService = require('../services/productService');

let router = express.Router();

/**
 * @openapi
 * definitions:
 *  Products:
 *    type: array
 *    items:
 *      type: object
 *      properties:
 *        product_id:
 *          type: string
 *          example: 1234
 *        product_name:
 *          type: string
 *          example: Product Name
 */

/**
 * @openapi
 * /api/v1/products:
 *  get:
 *    summary: Get products
 *    description: Use to request a list of unique products from stock
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: List of products
 *        schema:
 *          type: json
 *          $ref: '#/definitions/Products'
 */
router.get('/products', productService.getProducts);

module.exports = router;
