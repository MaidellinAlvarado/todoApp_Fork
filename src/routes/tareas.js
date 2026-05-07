const express = require('express');
const router = express.Router();
const Tarea = require('../models/tarea.model');

const validate = require('../middleware/validate');
const { createTareaSchema, updateTareaSchema } = require('../validators/tarea.validator');


// Inyectamos validate(createTareaSchema) antes del controlador
router.post('/', validate(createTareaSchema), async (req, res, next) => {
  try {
    const { title, completed } = req.body;
    const tarea = new Tarea({ title, completed });
    await tarea.save();
    return res.status(201).json(tarea);
  } catch (err) {

    next(err);
  }
});

// GET /api/tareas
router.get('/', async (req, res, next) => {
  try {
    const tareas = await Tarea.find().lean();
    return res.json(tareas);
  } catch (err) {
    next(err);
  }
});

// GET /api/tareas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const tarea = await Tarea.findById(req.params.id).lean();
    if (!tarea) return res.status(404).json({ error: 'Not found' });
    return res.json(tarea);
  } catch (err) {
    next(err);
  }
});

// PUT Actualizar tarea
// Inyectamos validate(updateTareaSchema)
router.put('/:id', validate(updateTareaSchema), async (req, res, next) => {
  try {
    const { title, completed } = req.body;
    const tarea = await Tarea.findByIdAndUpdate(
      req.params.id,
      { title, completed },
      { new: true, runValidators: true }
    );
    
    if (!tarea) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    return res.json(tarea);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tareas/:id - Eliminar tarea
router.delete('/:id', async (req, res, next) => {
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    
    if (!tarea) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    return res.status(204).send(); 
  } catch (err) {
    next(err);
  }
});

module.exports = router;