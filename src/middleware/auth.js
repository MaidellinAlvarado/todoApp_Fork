const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Extraer el token del header 
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Si no hay token, bloqueamos el acceso 
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied.' 
    });
  }

  // Verificar la firma del token con nuestro secreto
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; 
    
    next(); // Token válido 
  } catch (err) {
    // Si el token expiró o la firma es falsa, bloqueamos
    return res.status(401).json({ 
      error: 'Invalid.' 
    });
  }
}

module.exports = authenticateToken;