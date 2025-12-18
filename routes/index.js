// routes/index.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/', (req, res) => {
  let html = '<h1>Welcome to the Auth Server!</h1>';

  if (req.user) {
    html += `
      <p>Logged in as <strong>${req.user.displayName || 'User'}</strong></p>
      ${req.user.photo ? `<img src="${req.user.photo}" alt="Profile" width="100"><br><br>` : ''}
      <a href="/protected">Go to Protected Route</a><br><br>
      <a href="/auth/logout">Logout</a>
    `;
  } else {
    html += `
      <p>You are not logged in.</p>
      <hr>
      <h3>Sign in with:</h3>
      <a href="/auth/google">Google</a><br><br>
      <a href="/auth/facebook">Facebook</a><br><br>
      <a href="/auth/discord">Discord</a><br><br>
      <form action="/auth/login" method="POST">
        <input type="text" name="username" placeholder="Username" required><br><br>
        <input type="password" name="password" placeholder="Password" required><br><br>
        <button type="submit">Local Login (demo)</button>
      </form>
    `;
  }

  res.send(html);
});

router.get('/protected', isAuthenticated, (req, res) => {
  res.send(`
    <h1>Protected Route</h1>
    <p>Congratulations! You are authenticated.</p>
    <p>Hello, ${req.user.displayName || 'User'}!</p>
    <a href="/">Back to Home</a>
  `);
});

module.exports = router;  // ← THIS IS CRITICAL!