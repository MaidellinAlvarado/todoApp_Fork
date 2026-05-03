const User = require('../models/user.model');
// Este módulo actúa como un "gateway" entre las rutas de autenticación y los servicios de token
const tokenService = require('./tokenService');



async function register(email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;  //  409 Conflict — el recurso ya existe
      throw error;
    }
    const user = new User({ email, password });
    await user.save();
   
// Después de registrar, generamos los tokens para el nuevo usuario
const accessToken = tokenService.generateAccessToken(user);
const refreshToken = tokenService.generateRefreshToken(user);
// Devolvemos los tokens junto con la información del usuario
    return { accessToken, refreshToken, user };
}

// En el login, hacemos lo mismo: después de validar las credenciales, generamos y devolvemos los tokens
async function login(email, password) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;  
        throw error;
    }
    
    // Generar tokens para el usuario autenticado
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    // Devolvemos los tokens junto con la información del usuario
    return { accessToken, refreshToken, user };
}

module.exports = {
    register,
    login
};  