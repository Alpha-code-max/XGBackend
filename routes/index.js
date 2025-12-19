const express = require('express');
const router = express.Router();
// Destructured import from your middleware/auth.js
const { isAuthenticated } = require('../middleware/auth');

router.get('/', (req, res) => {
  let html = `
    <style>
      body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
      .container { display: flex; gap: 40px; flex-wrap: wrap; }
      .auth-box { border: 1px solid #ddd; padding: 20px; border-radius: 8px; width: 300px; background: #f9f9f9; }
      input { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
      button { width: 100%; padding: 10px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 4px; }
      button:hover { background-color: #0056b3; }
      .social-btn { background-color: #28a745; margin-bottom: 10px; }
    </style>
    <h1>Welcome to the XG Auth Server</h1>
  `;

  if (req.user) {
    // UI for Authenticated Users
    html += `
      <div class="auth-box">
        <p>Logged in as <strong>${req.user.displayName || req.user.username}</strong></p>
        ${req.user.photo ? `<img src="${req.user.photo}" alt="Profile" width="100" style="border-radius:50%"><br><br>` : ''}
        <p>Email: ${req.user.email || 'N/A'}</p>
        <p>Provider: <code>${req.user.provider}</code></p>
        <a href="/protected"><button>Go to Protected Route</button></a><br><br>
        <a href="/auth/logout" style="color: red;">Logout</a>
      </div>
    `;
  } else {
    // UI for Guests (Login and Register on one page)
    html += `
      <div class="container">
        <!-- LOGIN FORM -->
        <div class="auth-box">
          <h3>Login</h3>
          <form action="/auth/login" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
          </form>
          <hr>
          <h3>Social Sign-in</h3>
          <a href="/auth/google"><button class="social-btn">Google</button></a>
          <a href="/auth/discord"><button class="social-btn" style="background-color: #5865F2;">Discord</button></a>
        </div>

        <!-- REGISTER FORM -->
        <div class="auth-box">
          <h3>Create Account</h3>
          <form action="/auth/register" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="email" name="email" placeholder="Email">
            <input type="text" name="displayName" placeholder="Display Name">
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit" style="background-color: #6c757d;">Register</button>
          </form>
        </div>
      </div>
    `;
  }

  res.send(html);
});

// Protected Route Example
router.get('/protected', isAuthenticated, (req, res) => {
  res.send(`
    <h1>Protected Route</h1>
    <p>Success! You have a valid session.</p>
    <p>Hello, ${req.user.displayName || req.user.username}!</p>
    <a href="/">Back to Home</a>
  `);
});

module.exports = router;
