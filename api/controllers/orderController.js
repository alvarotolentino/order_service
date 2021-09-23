const express = require('express'),
  orderService = require('../services/orderService');
const { body, param } = require('express-validator');

let router = express.Router();

function validQuantity() {
  return (value) => {
    if (value > 0) {
      return true;
    } else {
      throw new Error(
        'Quantity should be a positive and greater than zero number'
      );
    }
  };
}

/**
 * @openapi
 * definitions:
 *  PurchaseOrder:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *        example: 123
 *      issueDate:
 *        type: string
 *        example: '2021-09-21'
 *      quantity:
 *        type: integer
 *        example: 10
 *      productId:
 *        type: string
 *        example: 999
 *      productName:
 *        type: string
 *        example: Product 1
 *  SalesOrder:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *        example: 123
 *      issueDate:
 *        type: string
 *        example: '2021-09-21'
 *      quantity:
 *        type: integer
 *        example: 5
 *      productId:
 *        type: string
 *        example: 999
 *      productName:
 *        type: string
 *        example: Product 1
 *  SalesOrders:
 *    type: array
 *    items:
 *      type: object
 *      properties:
 *        issue_date:
 *          type: string
 *        quantity:
 *          type: integer
 *        product_id:
 *          type: string
 *        product_name:
 *          type: string
 *        status:
 *          type: string
 *  PurchaseOrders:
 *    type: array
 *    items:
 *      type: object
 *      properties:
 *        issue_date:
 *          type: string
 *        quantity:
 *          type: integer
 *        product_id:
 *          type: string
 *        product_name:
 *          type: string
 */

/**
 * @openapi
 * /api/v1/purchase_order:
 *  post:
 *    summary: Post a purchase order
 *    description: Use to send a purchase order
 *    produces:
 *      - application/json
 *    requestBody:
 *      description: Purchase order
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/definitions/PurchaseOrder'
 *    responses:
 *      201:
 *        description: Created
 *      400:
 *        description: Bad request
 *      500:
 *        description: Server error
 */
router.post(
  '/purchase_order',
  body('id').notEmpty(),
  body('issueDate').isDate(),
  body('quantity').isInt().custom(validQuantity()),
  body('productId').notEmpty(),
  body('productName').notEmpty(),
  orderService.newPurchaseOrder
);

/**
 * @openapi
 * /api/v1/sales_order:
 *  post:
 *    summary: Get sales orders
 *    description: Use to request a list of sales orders
 *    produces:
 *      - application/json
 *    requestBody:
 *      description: Sales order
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/definitions/SalesOrder'
 *    responses:
 *      200:
 *        description: Error by out-of-stock or monthly threshold reached
 *      201:
 *        description: Created
 *      400:
 *        description: Bad request
 *      500:
 *        description: Server error
 */
router.post(
  '/sales_order',
  body('id').notEmpty(),
  body('issueDate').isDate(),
  body('quantity').isInt().custom(validQuantity()),
  body('productId').notEmpty(),
  body('productName').notEmpty(),
  orderService.newSalesOrder
);

/**
 * @openapi
 * /api/v1/purchase_orders/product/{id}:
 *  get:
 *    summary: Get purchase orders
 *    description: Use to request a list of purchase orders
 *    produces:
 *      - application/json
  *    parameters:
 *      - name: id
 *        description: Product Id
 *        in: path
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: List purchase orders
 *        schema:
 *          type: json
 *          $ref: '#/definitions/PurchaseOrders'
 *      500:
 *        description: Server error
 */
router.get(
  '/purchase_orders/product/:id',
  param('id').notEmpty(),
  orderService.getPurchaseOrderByProduct
);

/**
 * @openapi
 * /api/v1/sales_orders/product/{id}:
 *  get:
 *    summary: Get sales orders
 *    description: Use to request a list of sales orders
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: id
 *        description: Product Id
 *        in: path
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: List of sales orders
 *        schema:
 *          type: json
 *          $ref: '#/definitions/SalesOrders'
 *      500:
 *        description: Server error
 */
router.get(
  '/sales_orders/product/:id',
  param('id').notEmpty(),
  orderService.getSalesOrderByProduct
);

module.exports = router;
