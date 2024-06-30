const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Be Milk API',
      version: '1.0.0',
      description: 'API documentation for Be Milk',
      contact: {
        name: 'Be Milk'
      },
      servers: [
        {
          url: `https://be-milk-axccdqpeh-hoangphuongs-projects.vercel.app`
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/swagger-docs/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
