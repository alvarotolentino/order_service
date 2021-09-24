const express = require('express'),
  helmet = require('helmet'),
  cors = require('cors'),
  swaggerJsdoc = require('swagger-jsdoc'),
  swaggerUi = require('swagger-ui-express');

const routes = require('./routes');

const {
  API_PORT,
} = require('./config');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: '*',
  })
);

routes.init(app);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API with Swagger',
      version: '0.1.0',
      description:
        'This is an API for handle purchase and sales order.',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Order Manager',
        url: 'http://www.order.io/',
        email: 'info@order.io',
      },
    },
    servers: [
      {
        url: `http://localhost:${API_PORT || 3000}`,
      },
    ],
  },
  apis: ['./controllers/orderController.js', './controllers/productController.js'],
};

const specs = swaggerJsdoc(options);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

app.use('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(API_PORT || 3000, () => {
  console.log(`Listen on port ${API_PORT || 3000}`);
});
