import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Koa MongoDB API',
      version: '1.0.0',
      description: 'A REST API built with Koa.js and MongoDB',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        HelloResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Hello World!',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            role: {
              type: 'string',
              enum: ['client', 'coach', 'project-manager', 'operations'],
              example: 'client',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Coaching: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            clientId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012',
            },
            coachId: {
              type: 'string',
              example: '507f1f77bcf86cd799439013',
            },
            projectId: {
              type: 'string',
              example: '507f1f77bcf86cd799439014',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);