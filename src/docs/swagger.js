const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mobile Invoice API',
      version: '1.0.0',
      description: 'Multi-tenant API for managing mobile phone invoices. Upload TXT invoice files, parse them automatically, and manage invoice data via CRUD operations.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development' },
    ],
    tags: [
      { name: 'Tenants', description: 'Tenant management' },
      { name: 'Invoices', description: 'Invoice CRUD operations' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
