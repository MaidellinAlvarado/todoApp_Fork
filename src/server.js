
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then(() => {
app.listen(PORT, () => {
console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
})
.catch(err => console.error(err));