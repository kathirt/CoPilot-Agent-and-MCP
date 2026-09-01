const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sanitizeLogMessage } = require('../utils');

// generated-by-copilot: token lifetime and rate-limit window for the forgot-password flow
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const FORGOT_PASSWORD_RATE_LIMIT_MAX = 5;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createAuthRouter({ usersFile, readJSON, writeJSON, SECRET_KEY, sendEmail }) {
  const router = express.Router();
  // generated-by-copilot: in-memory request log used to rate-limit forgot-password requests per email
  const forgotPasswordRequestLog = new Map();

  function isRateLimited(key) {
    const now = Date.now();
    const timestamps = (forgotPasswordRequestLog.get(key) || []).filter(
      t => now - t < FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS
    );
    if (timestamps.length >= FORGOT_PASSWORD_RATE_LIMIT_MAX) {
      forgotPasswordRequestLog.set(key, timestamps);
      return true;
    }
    timestamps.push(now);
    forgotPasswordRequestLog.set(key, timestamps);
    return false;
  }

  router.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    const users = readJSON(usersFile);
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const newUser = { username, password, favorites: [] };
    if (email) newUser.email = email.toLowerCase();
    users.push(newUser);
    writeJSON(usersFile, users);
    res.status(201).json({ message: 'User registered' });
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON(usersFile);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });

  router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const normalizedEmail = email.toLowerCase();

    if (isRateLimited(normalizedEmail)) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    const users = readJSON(usersFile);
    const user = users.find(u => u.email === normalizedEmail);

    // Always respond with a generic message to avoid leaking whether an email is registered
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordTokenHash = hashToken(token);
      user.resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRY_MS;
      writeJSON(usersFile, users);

      const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
      if (typeof sendEmail === 'function') {
        sendEmail(normalizedEmail, 'Password Reset Request', `Reset your password using this link: ${resetLink}`);
      } else {
        console.log(`Password reset link for ${sanitizeLogMessage(normalizedEmail)}: ${sanitizeLogMessage(resetLink)}`);
      }
    }

    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  });

  router.post('/reset-password', (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required' });
    }
    const normalizedEmail = email.toLowerCase();

    const users = readJSON(usersFile);
    const user = users.find(u => u.email === normalizedEmail);
    if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (Date.now() > user.resetPasswordExpires) {
      delete user.resetPasswordTokenHash;
      delete user.resetPasswordExpires;
      writeJSON(usersFile, users);
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (hashToken(token) !== user.resetPasswordTokenHash) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    // Invalidate the token so it can only be used once
    delete user.resetPasswordTokenHash;
    delete user.resetPasswordExpires;
    writeJSON(usersFile, users);

    res.status(200).json({ message: 'Password has been reset successfully' });
  });

  return router;
}

module.exports = createAuthRouter;
