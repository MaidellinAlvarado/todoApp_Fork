const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,       // Evita duplicados
    lowercase: true,    // Normaliza a minúsculas
    trim: true,         // Elimina espacios extra
  },
  password: {
    type: String,
    required: true,
    minlength: 8,       // Longitud mínima de seguridad
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',    // "Seguro por Defecto"
  },
}, { timestamps: true });

//  MIDDLEWARE DE SEGURIDAD 
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// MÉTODOS DE INSTANCIA
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// EXCLUSIÓN DE CAMPOS SENSIBLES EN RESPUESTAS
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);