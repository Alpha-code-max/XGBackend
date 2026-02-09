const m2s = require('mongoose-to-swagger');
const User = require('../models/User'); // adjust path if needed

// 1. Convert Mongoose model → OpenAPI schema
const userSchema = m2s(User, {
  // Optional: exclude, rename, or customize fields here
});

// 2. Remove sensitive/internal fields (critical!)
if (userSchema.properties?.password) {
  delete userSchema.properties.password;
}
// Optional: remove other hidden fields
// delete userSchema.properties.__v;
// delete userSchema.properties.resetPasswordToken;
// delete userSchema.properties.resetPasswordExpires;

// 3. Improve schema readability
if (userSchema.properties?._id) {
  userSchema.properties.id = {
    ...userSchema.properties._id,
    readOnly: true,
    description: 'Auto-generated MongoDB ObjectId',
  };
  delete userSchema.properties._id;
}

if (userSchema.properties?.createdAt) {
  userSchema.properties.createdAt = {
    ...userSchema.properties.createdAt,
    readOnly: true,
    description: 'Timestamp when the document was created',
  };
}

if (userSchema.properties?.updatedAt) {
  userSchema.properties.updatedAt = {
    ...userSchema.properties.updatedAt,
    readOnly: true,
    description: 'Timestamp when the document was last updated',
  };
}

// 4. Full OpenAPI definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My Express API',
    version: '1.0.0',
    description: 'API documentation with auto-generated schemas from Mongoose models',
    contact: {
      name: 'Your Name or Team',
      email: 'your.email@example.com',
      url: 'https://yourwebsite.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server (local)',
    },
    {
      url: 'https://api.yourdomain.com',
      description: 'Production server',
    },
  ],
  components: {
    schemas: {
      User: userSchema,

      UserResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          email: { type: 'string' },
          provider: { type: 'string' },
          photo: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time', readOnly: true },
          updatedAt: { type: 'string', format: 'date-time', readOnly: true },
        },
      },

      AuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Authenticated' },
          user: { $ref: '#/components/schemas/UserResponse' },
          token: {
            type: 'string',
            description: 'JWT token for subsequent authenticated requests',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },

      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Something went wrong' },
          status: { type: 'integer', example: 400 },
          errors: {
            type: 'array',
            items: { type: 'object' },
            nullable: true,
            example: [{ msg: 'Username is required', param: 'username' }],
          },
        },
      },
    },

    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained after login or /auth/me',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sid', // updated to match your session cookie name
        description: 'Session cookie for browser-based authentication',
      },
    },

    // Optional: reusable request bodies
    requestBodies: {
      RegisterBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string', minLength: 3, maxLength: 30 },
                password: { type: 'string', minLength: 8 },
                email: { type: 'string', format: 'email' },
                displayName: { type: 'string' },
              },
            },
          },
        },
      },
      LoginBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },

  // No manual paths here — rely on JSDoc comments in routes
  paths: {},
};

module.exports = swaggerDefinition;