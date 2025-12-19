require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport'); // Standard import
const connectDB = require('./config/database');

// Import your passport config logic to ensure strategies are loaded
require('./config/passport'); 

const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Connect to Database immediately
connectDB();

// 2. Body Parsing Middleware (Must be before routes)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 3. Session Middleware (Must be before passport.session)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS in 2025
}));

// 4. Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// 5. Documentation Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 6. Application Routes
app.use('/auth', authRoutes);
app.use('/', indexRoutes);

// 7. 404 handler
app.use((req, res) => {
  res.status(404).send('Route not found');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
