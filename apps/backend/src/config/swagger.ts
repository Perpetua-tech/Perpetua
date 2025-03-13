import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Perpetua API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Perpetua real-world asset investment platform',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'Perpetua Support',
      url: 'https://perpetua.ltd',
      email: 'support@perpetua.ltd',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 4000}/api`,
      description: 'Development server',
    },
    {
      url: 'https://api.perpetua.ltd/api',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'name'],
        properties: {
          id: {
            type: 'string',
            description: 'User ID (UUID)',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN'],
            description: 'User role',
          },
          referralCode: {
            type: 'string',
            description: 'User referral code',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account last update timestamp',
          },
        },
      },
      Asset: {
        type: 'object',
        required: ['name', 'type', 'location', 'value', 'yield'],
        properties: {
          id: {
            type: 'string',
            description: 'Asset ID (UUID)',
          },
          name: {
            type: 'string',
            description: 'Asset name',
          },
          description: {
            type: 'string',
            description: 'Asset description',
          },
          type: {
            type: 'string',
            enum: ['REAL_ESTATE', 'AGRICULTURE', 'RENEWABLE_ENERGY', 'INFRASTRUCTURE', 'COMMERCIAL'],
            description: 'Asset type',
          },
          location: {
            type: 'string',
            description: 'Asset location',
          },
          value: {
            type: 'number',
            description: 'Asset value in USD',
          },
          yield: {
            type: 'number',
            description: 'Expected annual yield percentage',
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'FUNDING', 'COMPLETED'],
            description: 'Asset status',
          },
          minimumInvestment: {
            type: 'number',
            description: 'Minimum investment amount in USD',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Asset creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Asset last update timestamp',
          },
        },
      },
      Investment: {
        type: 'object',
        required: ['userId', 'assetId', 'amount'],
        properties: {
          id: {
            type: 'string',
            description: 'Investment ID (UUID)',
          },
          userId: {
            type: 'string',
            description: 'User ID who made the investment',
          },
          assetId: {
            type: 'string',
            description: 'Asset ID being invested in',
          },
          amount: {
            type: 'number',
            description: 'Investment amount in USD',
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'REDEEMED', 'CANCELLED'],
            description: 'Investment status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Investment creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Investment last update timestamp',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
          },
          code: {
            type: 'string',
            description: 'Error code',
          },
          status: {
            type: 'integer',
            description: 'HTTP status code',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication failed or token is invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Unauthorized: Invalid token',
              code: 'UNAUTHORIZED',
              status: 401,
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Resource not found',
              code: 'NOT_FOUND',
              status: 404,
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed for request data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              message: 'Validation error: Email is required',
              code: 'VALIDATION_ERROR',
              status: 400,
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization operations',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
    {
      name: 'Assets',
      description: 'Asset management operations',
    },
    {
      name: 'Investments',
      description: 'Investment operations',
    },
    {
      name: 'Referrals',
      description: 'Referral program operations',
    },
    {
      name: 'Governance',
      description: 'Community governance and DAO operations',
    },
  ],
};

// Path to the API routes
const routesDir = path.resolve(__dirname, '../routes');

const options = {
  swaggerDefinition,
  // API routes with JSDoc comments for Swagger
  apis: [
    `${routesDir}/**/*.ts`,
    `${routesDir}/*.ts`,
    path.resolve(__dirname, '../controllers/**/*.ts'),
    path.resolve(__dirname, '../middleware/**/*.ts'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 