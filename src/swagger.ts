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
    security: [
      {
        UserIdHeader: []
      }
    ],
    components: {
      securitySchemes: {
        UserIdHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-User-Id',
          description: 'User ID for authentication'
        }
      },
      schemas: {
        HelloResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Hello World!',
              description: 'Simple greeting message'
            },
          },
          required: ['message']
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'healthy',
              description: 'Health status of the server'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00.000Z',
              description: 'Current server timestamp'
            },
            uptime: {
              type: 'number',
              example: 3600.123,
              description: 'Server uptime in seconds'
            },
            memory: {
              type: 'object',
              properties: {
                rss: {
                  type: 'number',
                  description: 'Resident set size'
                },
                heapTotal: {
                  type: 'number',
                  description: 'Total heap size'
                },
                heapUsed: {
                  type: 'number',
                  description: 'Used heap size'
                },
                external: {
                  type: 'number',
                  description: 'External memory usage'
                },
                arrayBuffers: {
                  type: 'number',
                  description: 'Array buffers memory usage'
                }
              }
            }
          },
          required: ['status', 'timestamp', 'uptime', 'memory']
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
              description: 'Unique user identifier'
            },
            role: {
              type: 'string',
              enum: ['client', 'coach', 'pm', 'ops'],
              example: 'client',
              description: 'User role determining access permissions'
            },
            firstName: {
              type: 'string',
              example: 'John',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              example: 'Doe',
              description: 'User last name'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00.000Z',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00.000Z',
              description: 'Last update timestamp'
            },
          },
          required: ['_id', 'role', 'firstName']
        },
        Project: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439015',
              description: 'Unique project identifier'
            },
            managerIds: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
              description: 'Array of user IDs who manage this project'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00.000Z',
              description: 'Project creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00.000Z',
              description: 'Last update timestamp'
            },
          },
          required: ['_id', 'managerIds']
        },
        Coaching: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439020',
              description: 'Unique coaching session identifier'
            },
            clientId: {
              type: 'string',
              example: '507f1f77bcf86cd799439012',
              description: 'ID of the client being coached'
            },
            coachId: {
              type: 'string',
              example: '507f1f77bcf86cd799439013',
              description: 'ID of the coach providing guidance'
            },
            projectId: {
              type: 'string',
              example: '507f1f77bcf86cd799439014',
              description: 'ID of the associated project'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00.000Z',
              description: 'Coaching session creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00.000Z',
              description: 'Last update timestamp'
            },
          },
          required: ['_id', 'clientId', 'coachId', 'projectId']
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);