require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors'); 
const tareasRouter = require('./routes/tareas');
const authRouter = require('./routes/auth');
const authenticateToken = require('./middleware/auth');



// 1. PRIMERO  LA APP
const app = express(); 

// 2. ESCUDOS
app.use(helmet());

// capa 2: CONTROL DE ORIGENES
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// limite del payload
app.use(express.json({ limit: '10kb' }));

// rutas protegidas por el middleware de autenticación

app.use('/api/auth', authRouter);
app.use('/api/tareas', authenticateToken, tareasRouter);

app.get('/', (req, res) => res.json({ ok: true }));

module.exports = app;