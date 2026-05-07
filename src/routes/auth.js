const express = require('express');
const router = express.Router();
const authGateway = require('../services/authGateway');
const tokenService = require('../services/tokenService');
const { rateLimitLogin, rateLimitRegister } = require('../security/rateLimiter');

// POST /api/auth/register
// Aplicamos rateLimitRegister como middleware antes de la función asíncrona
router.post('/register', rateLimitRegister, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authGateway.register(email, password);
    
    res.status(201).json({
      message: "Registration successful",
      accessToken: result.accessToken, 
      refreshToken: result.refreshToken,
      user: result.user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// POST /api/auth/login
// Aplicamos rateLimitLogin como middleware
router.post('/login', rateLimitLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authGateway.login(email, password);
    
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// POST /refresh - Recibe refreshToken, devuelve nuevos tokens
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const tokens = await tokenService.refreshAccessToken(refreshToken);
    
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: "Invalid or revoked refresh token" });
  }
});

// recibe logout, lo invalida
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  tokenService.revokeRefreshToken(refreshToken);
  
  res.json({ message: "Logged out successfully" });
});

module.exports = router;