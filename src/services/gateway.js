const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model'); 

// Función para generar JWT
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

// Lógica de Registro
async function register(email, password) {
  // Usamos UserModel (el nombre que elegimos arriba)
  const existingUser = await UserModel.findOne({ email }); 
  
  if (existingUser) {
    const error = new Error('no valido'); 
    error.statusCode = 409;
    throw error;
  }
  
  // ¡AQUÍ ESTABA EL ERROR! Cambié User.create por UserModel.create
  const user = await UserModel.create({ email, password });
  return { user };
}

// Lógica de Login
async function login(email, password) {
  // Usamos UserModel para buscar
  const user = await UserModel.findOne({ email }); 
  
  if (!user) { 
    const e = new Error('Invalid credentials'); 
    e.statusCode = 401; 
    throw e; 
  }

  // 'user' (en minúscula) es la instancia que encontramos, esa sí tiene comparePassword
  const isValid = await user.comparePassword(password);
  if (!isValid) { 
    const e = new Error('Invalid credentials'); 
    e.statusCode = 401; 
    throw e; 
  }

  const token = generateToken(user);
  return { token, user };
}

module.exports = { register, login };