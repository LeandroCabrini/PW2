const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Defina as opções do Swagger

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              IdUser: {type: 'int' },
              NameUser: { type: 'string' },
              Age: { type: 'integer' },
              CPF: { type: 'string' },
              email: { type: 'string' },
              type: { type: 'integer' },
            },
          },
          Project: {
            type: 'object',
            properties: {
              IdProject: {type: 'int' },
              ProjectName: { type: 'string' },
              ProjectDescription: { type: 'string' },
              YearStart: { type: 'int' },
              YearEnd: { type: 'int' },
              IdUserResponsible: { type: 'int' },
            },
          },
          Application: {
            type: 'object',
            properties: {
              IdApplication: {type: 'int' },
              IdUser: { type: 'int' },
              IdProject: { type: 'int' },
              Stats: { type: 'int' },
            },
          },
        },
      },
      servers: [
        {
          url: 'http://localhost:8080',
          description: 'Servidor de desenvolvimento',
        },
      ],
    },
    apis: ['C:\\Users\\Leandro\\Desktop\\API\\app.js'], // Substitua pelo caminho correto para os arquivos com as rotas
  };
  
  const specs = swaggerJsdoc(options);
  
  module.exports = {
    swaggerUi,
    specs,
  };