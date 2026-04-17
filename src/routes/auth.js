const express = require('express');
const router = express.Router();
const authGateway = require('../services/authGateway');
const tokenService = require('../services/tokenService');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authGateway.register(email, password);
    
    res.status(201).json({
      message: "Registration successful",
      accessToken: result.accessToken, // Devolvemos el access token para que el usuario pueda autenticarse inmediatamente
      refreshToken: result.refreshToken,// Devolvemos el refresh token para que el cliente pueda obtener nuevos access tokens sin necesidad de re-login
   
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

    //  Llamamos a la función que valida, rota y genera nuevos tokens
    const tokens = await tokenService.refreshAccessToken(refreshToken);
    
    //Devolvemos los nuevos tokens 
    res.json(tokens);
  } catch (error) {
    //  devolvemos el error exacto puede ayudar a los clientes a manejar mejor la situación
    res.status(401).json({ error: "Invalid or revoked refresh token" });
  }
});



//recibe lougout, lo invalida
router.post('/logout', (req, res) => {
  // A. Extraemos el refreshToken d
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  // Lo borramos del store 
  tokenService.revokeRefreshToken(refreshToken);
  
  // Devolvemos el mensaje de éxito del 
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
//PDF CON LA EXPLICACION EN EL CODIGO 