const rateLimit = require('express-rate-limit');

// Limiter para Login
const rateLimitLogin = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { error: 'Demasiados intentos de login. Intente nuevamente más tarde.' },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// Limiter para Register
const rateLimitRegister = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 3, //
    message: { error: 'Demasiadas cuentas creadas desde esta IP. Intente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    rateLimitLogin,
    rateLimitRegister
};