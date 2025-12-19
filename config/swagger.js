// config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'XG Backend API',
      version: '1.0.0',
      description: 'API documentation for the Express backend with Passport OAuth authentication',
    },
    servers: [
      {
        url: 'https://xgbackend.onrender.com/',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid', // Default Express session cookie name
        },
      },
    },
    security: [{ sessionAuth: [] }], // Apply globally (optional)
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js')
  ] // Paths to files with JSDoc comments
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;