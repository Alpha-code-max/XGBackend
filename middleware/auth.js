// middleware/auth.js

// Middleware to check if a user is authenticated via Passport session
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // Redirect to home or login if not authenticated
  res.status(401).redirect('/'); 
};

module.exports = { isAuthenticated };
