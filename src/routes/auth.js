const express = require('express');
const router = express.Router();
const authGateway = require('../services/gateway');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authGateway.register(email, password);
    
    res.status(201).json({
      message: "Registration successful",
      user: result.user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authGateway.login(email, password);
    
    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user
    });
  } catch (error) {
    // No revelamos detalles específicos de por qué falló el login
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

module.exports = router;