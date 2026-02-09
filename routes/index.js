const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { renderHome, renderProtected } = require('../controllers/indexControllers');

router.get('/', renderHome);
router.get('/protected', isAuthenticated, renderProtected);

module.exports = router;