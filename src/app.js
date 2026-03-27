
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
app.use(helmet());
const cors = require('cors');
const tareasRouter = require('./routes/tareas');
const authRouter = require('./routes/auth');
const app = express();


// capa 2: CONTROL DE ORIGENES
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// capa 3: limite del payload
app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', authRouter);
app.use('/api/tareas', tareasRouter);


app.get('/', (req, res) => res.json({ ok: true }));

module.exports = app;