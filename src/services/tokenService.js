const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user.model');

// usamos map para almacenar los refresh tokens, en producción esto debería ser una base de datos 
const refreshTokenStore = new Map();

//genera un token 
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } //15 min 
  );
}

// Genera un refresh token, lo guarda en el store y lo devuelve

function generateRefreshToken(user) {
  const refreshToken = jwt.sign(
    { id: user.id }, 
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } 
  );
  
  refreshTokenStore.set(refreshToken, { userId: user.id });
  
  return refreshToken;
}

// Valida el refresh token, genera nuevos tokens y revoca el token viejo 

async function refreshAccessToken(refreshToken) {
  if (!refreshTokenStore.has(refreshToken)) {
    throw new Error("Invalid ");
  }

  try {
    // Validar la firma y expiración del token
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Obtener el usuario de la base de datos para generar los nuevos tokens con datos frescos
    const user = await User.findById(payload.id);
    if (!user) throw new Error("User not found");

    // Eliminar el token viejo del store 
    revokeRefreshToken(refreshToken);

    // Generar nuevos tokens 
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    };
  } catch (error) {

    revokeRefreshToken(refreshToken);
    throw new Error("Invalid or revoked refresh token");
  }
}

// Elimina el refresh token del store para revocarlo
function revokeRefreshToken(refreshToken) {
  refreshTokenStore.delete(refreshToken);
}

// Exportamos las funciones para usarlas en otros módulos
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  revokeRefreshToken
};