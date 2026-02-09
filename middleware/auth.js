// middleware/auth.js
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized - please log in' });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) { // assuming you have isAdmin field in User model
    return next();
  }
  return res.status(403).json({ message: 'Forbidden - admin access required' });
};

module.exports = { isAuthenticated, isAdmin };