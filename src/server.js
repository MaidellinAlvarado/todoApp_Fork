require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;


// En tu server.js
const MONGO_URI = process.env.MONGODB_URI;

console.log('--- Intentando conectar a:', MONGO_URI);

if (!MONGO_URI) {
    console.error('ERROR: La variable MONGODB_URI es undefined. Revisa tu archivo .env');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ Error de conexión:', err.message));