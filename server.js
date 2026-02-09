// server.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/database');
const swaggerDefinition = require('./config/swagger.config'); // adjust path if needed
const swaggerJsdoc = require('swagger-jsdoc');

// Load passport strategies
require('./config/passport');

const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ────────────────────────────────────────────────
// 1. Database Connection
// ────────────────────────────────────────────────
connectDB();

// ────────────────────────────────────────────────
// 2. Middleware
// ────────────────────────────────────────────────

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    name: 'sid', // optional - change default connect.sid name
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// ────────────────────────────────────────────────
// 3. Swagger Documentation
// ────────────────────────────────────────────────
const specs = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [
    './routes/*.js',           // should include auth.js, index.js, etc.
    './routes/**/*.js',        // optional: recursive if you have subfolders
  ],
});

// Debug log – very useful for Render
console.log('Swagger scanning files:', [
  './routes/*.js',
  './routes/**/*.js',
]);
console.log('Swagger docs mounted at /api-docs');

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {           // ← use specs here (not swaggerDefinition)
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
    },
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e }',
  })
);

// ────────────────────────────────────────────────
// 4. Routes
// ────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/', indexRoutes);

// ────────────────────────────────────────────────
// 5. Global Error Handler (recommended)
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      status,
    },
  });
});

// ────────────────────────────────────────────────
// 6. 404 Handler (after all routes)
// ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
    },
  });
});

// ────────────────────────────────────────────────
// 7. Start Server
// ────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI:      http://localhost:${PORT}/api-docs`);
});

// Optional: Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});