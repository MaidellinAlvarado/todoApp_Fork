const Joi = require('joi');

const createTareaSchema = Joi.object({
  title:     Joi.string().min(1).max(20).required(),
  completed: Joi.boolean().default(false)
});

module.exports = {
  createTareaSchema
}


const Joi = require('joi');

// Esquema para POST (Crear tarea)
const createTareaSchema = Joi.object({
    title: Joi.string().trim().min(1).required().messages({
        'string.empty': 'El título no puede estar vacío',
        'any.required': 'El título es obligatorio'
    }),
    completed: Joi.boolean().optional()
});

// Esquema para PUT (Actualizar tarea)
const updateTareaSchema = Joi.object({
    title: Joi.string().trim().min(1).optional(),
    completed: Joi.boolean().optional()
});

module.exports = {
    createTareaSchema,
    updateTareaSchema
};