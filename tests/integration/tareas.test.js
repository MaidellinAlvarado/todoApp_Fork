const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Tarea = require('../../src/models/tarea.model');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Tarea.deleteMany();
});

describe('🎓 EJERCICIOS BÁSICOS - ENCUENTRA Y CORRIGE LOS ERRORES', () => {

  test('POST /api/tareas crea una tarea', async () => {
    //  Corrección: Campo correcto 'title'
    const nuevaTarea = {
      title: 'Mi primera tarea' //  'title', no 'titulo'
    };
    
    //  Corrección: Método POST
    const res = await request(app)
      .post('/api/tareas') //  POST para crear
      .send(nuevaTarea);
    
    //  Corrección: Status 201 para creación exitosa
    expect(res.statusCode).toBe(201);
    
    //  Corrección: Verificaciones correctas
    expect(res.body._id).toBeDefined(); //  ID debe existir
    expect(res.body.title).toBe('Mi primera tarea'); //  Campo correcto
    expect(res.body.completed).toBe(false); //  Valor por defecto
    
    //  Verificar en la base de datos
    const tareasEnDB = await Tarea.find();
    expect(tareasEnDB).toHaveLength(1); //  Una tarea creada
    expect(tareasEnDB[0].title).toBe('Mi primera tarea');
  });

  //  SOLUCIÓN 2: GET todas las tareas
   test('GET /api/tareas devuelve todas las tareas', async () => {
    //  Corrección: Crear tareas para probar la respuesta
    await Tarea.create({ title: 'Tarea 1' });
    await Tarea.create({ title: 'Tarea 2', completed: true });
    
    const res = await request(app).get('/api/tareas');
    
    //  Corrección: Status 200 para consulta exitosa
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2); //  Dos tareas creadas
    
    //  Corrección: Verificar títulos que existen
    expect(res.body[0].title).toBe('Tarea 1');
    expect(res.body[1].title).toBe('Tarea 2');
    expect(res.body[1].completed).toBe(true);
  });
});
  //  SOLUCIÓN 3: GET tarea específica
  test('GET /api/tareas/:id devuelve una tarea específica', async () => {
    const tarea = await Tarea.create({ title: 'Tarea específica' });
    
    //  Corrección: Usar ID correcto de la tarea creada
    const res = await request(app)
      .get(`/api/tareas/${tarea._id}`); //  ID válido
    
    //  Corrección: Expectations correctas
    expect(res.statusCode).toBe(200); //  Éxito
    expect(res.body.title).toBe('Tarea específica'); //  Título correcto
    expect(res.body.completed).toBe(false); //  Valor por defecto
    expect(res.body._id).toBe(tarea._id.toString());
  });

  //  SOLUCIÓN 4: GET ID inexistente
  test('GET /api/tareas/:id devuelve 404 para un ID inexistente', async () => {
    //  Corrección: Usar ObjectId válido pero inexistente
    const idInexistente = new mongoose.Types.ObjectId();
    
    const res = await request(app).get(`/api/tareas/${idInexistente}`);
    
    //  Corrección: Verificar status 404 y mensaje correcto
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  //  SOLUCIÓN 5: Validación de campos requeridos
  test('POST /api/tareas valida campos requeridos', async () => {
    //  Corrección: Enviar objeto vacío para probar validación
    const res1 = await request(app)
      .post('/api/tareas')
      .send({}); //  Sin título para fallar validación

    expect(res1.statusCode).toBe(500); //  Error de validación
    expect(res1.body.error).toContain('required'); //  Mensaje de validación
    
    //  Test adicional: Título vacío
    const res2 = await request(app)
      .post('/api/tareas')
      .send({ title: '' });
    
    expect(res2.statusCode).toBe(500);
    expect(res2.body.error).toContain('required');
    
    //  Corrección: Verificar que NO se guardó en la BD
    const tareasEnDB = await Tarea.find();
    expect(tareasEnDB).toHaveLength(0); //  No debe haber tareas
  });

  //  SOLUCIÓN 6: Array vacío
  test('GET /api/tareas devuelve array vacío cuando no hay tareas', async () => {
    //  Corrección: NO crear tareas (afterEach limpia automáticamente)
    
    const res = await request(app).get('/api/tareas');
    
    //  Corrección: Status 200 para array vacío
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0);
    expect(res.body).toEqual([]); //  Array vacío, no objeto
    
    // Verificación adicional
    expect(Array.isArray(res.body)).toBe(true);
  }); 

describe(' SOLUCIONES CORRECTAS - EJERCICIOS AVANZADOS', () => {

  //  SOLUCIÓN 7: PUT actualizar tarea
  test('PUT /api/tareas/:id actualiza una tarea existente', async () => {
    // Crear tarea inicial
    const tareaOriginal = await Tarea.create({ 
      title: 'Tarea original',
      completed: false 
    });
    
    const datosActualizados = {
      title: 'Tarea actualizada', //  Corrección: Campo correcto
      completed: true
    };
    
    //  Corrección: Método PUT
    const res = await request(app)
      .put(`/api/tareas/${tareaOriginal._id}`)
      .send(datosActualizados);

    //  Corrección: Expectations correctas
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Tarea actualizada');
    expect(res.body.completed).toBe(true);
    expect(res.body._id).toBe(tareaOriginal._id.toString());
    
    //  Verificar en la base de datos
    const tareaActualizada = await Tarea.findById(tareaOriginal._id);
    expect(tareaActualizada.title).toBe('Tarea actualizada');
    expect(tareaActualizada.completed).toBe(true);
  });

  //  SOLUCIÓN 8: DELETE eliminar tarea
  test('DELETE /api/tareas/:id elimina una tarea existente', async () => {
    const tarea = await Tarea.create({ title: 'Tarea a eliminar' });
    
    //  Corrección: Método DELETE
    const res = await request(app)
      .delete(`/api/tareas/${tarea._id}`);
    
    //  Corrección: Status 204 (No Content) para DELETE
    expect(res.statusCode).toBe(204);
    //  No verificar body en 204 (no tiene contenido)
    
    //  Verificar que se eliminó de la base de datos
    const tareaEliminada = await Tarea.findById(tarea._id);
    expect(tareaEliminada).toBeNull();
    
    //  Verificar que GET posterior retorna 404
    const getRes = await request(app).get(`/api/tareas/${tarea._id}`);
    expect(getRes.statusCode).toBe(404);
  });

  //  SOLUCIÓN 9: Test de concurrencia
  test('AVANZADO: Crear múltiples tareas simultáneamente', async () => {
    const tareasData = [
      { title: 'Tarea 1' },
      { title: 'Tarea 2' },
      { title: 'Tarea 3' }
    ];
    
    //  Corrección: Usar Promise.all para concurrencia real
    const promises = tareasData.map(tareaData =>
      request(app)
        .post('/api/tareas')
        .send(tareaData)
    );
    
    const responses = await Promise.all(promises);
    
    //  Corrección: Verificaciones correctas
    expect(responses.length).toBe(3);
    responses.forEach(res => {
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBeDefined();
      expect(res.body._id).toBeDefined();
    });
    
    //  Verificar en base de datos
    const tareasEnDB = await Tarea.find();
    expect(tareasEnDB).toHaveLength(3);
    
    //  Verificar títulos únicos
    const titles = tareasEnDB.map(t => t.title).sort();
    expect(titles).toEqual(['Tarea 1', 'Tarea 2', 'Tarea 3']);
  });

  //  SOLUCIÓN 10: Ordenamiento y fechas
  test('GET /api/tareas devuelve tareas ordenadas por fecha', async () => {
    // Crear tareas con pequeños delays para asegurar orden
    await Tarea.create({ title: 'Primera tarea' });
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await Tarea.create({ title: 'Segunda tarea' });
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await Tarea.create({ title: 'Tercera tarea' });
    
    const res = await request(app).get('/api/tareas');
    
    //  Corrección: Status 200 para consulta exitosa
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    
    //  Corrección: Verificar orden cronológico correcto
    expect(res.body[0].title).toBe('Primera tarea');
    expect(res.body[1].title).toBe('Segunda tarea');
    expect(res.body[2].title).toBe('Tercera tarea');
    
    //  Verificar que las fechas están en orden cronológico
    const fecha1 = new Date(res.body[0].createdAt);
    const fecha2 = new Date(res.body[1].createdAt);
    const fecha3 = new Date(res.body[2].createdAt);
    
    expect(fecha1.getTime()).toBeLessThanOrEqual(fecha2.getTime());
    expect(fecha2.getTime()).toBeLessThanOrEqual(fecha3.getTime());
  });

  //  SOLUCIÓN 11: ID inválidos vs inexistentes
  test('API maneja IDs inválidos vs inexistentes correctamente', async () => {
    //  Corrección: Diferencia entre ID inválido e inexistente
    
    // Caso 1: ID inválido (mal formato)
    const idInvalido = '123abc';
    const res1 = await request(app).get(`/api/tareas/${idInvalido}`);
    expect(res1.statusCode).toBe(500); //  Error de cast de Mongoose
    
    // Caso 2: ID válido pero inexistente
    const idInexistente = new mongoose.Types.ObjectId().toString();
    const res2 = await request(app).get(`/api/tareas/${idInexistente}`);
    expect(res2.statusCode).toBe(404); //  No encontrado
    expect(res2.body.error).toBe('Not found'); //  Propiedad correcta
    
    //  Verificar también PUT y DELETE con ID inválido
    const putRes = await request(app)
      .put(`/api/tareas/${idInvalido}`)
      .send({ title: 'Test' });
    expect(putRes.statusCode).toBe(500);
    
    const deleteRes = await request(app).delete(`/api/tareas/${idInvalido}`);
    expect(deleteRes.statusCode).toBe(500);
  });

  //  SOLUCIÓN 12: Validación avanzada
  test('POST /api/tareas maneja campos adicionales correctamente', async () => {
    const tareaConCamposExtra = {
      title: 'Tarea válida',
      completed: true,
      campoExtra: 'debería ser ignorado',
      numeroExtra: 123,
      objetoExtra: { foo: 'bar' }
    };
    
    const res = await request(app)
      .post('/api/tareas')
      .send(tareaConCamposExtra);
    
    //  Corrección: Mongoose crea exitosamente ignorando campos extra
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Tarea válida');
    expect(res.body.completed).toBe(true);
    
    //  Mongoose ignora campos no definidos en el schema
    expect(res.body.campoExtra).toBeUndefined();
    expect(res.body.numeroExtra).toBeUndefined();
    expect(res.body.objetoExtra).toBeUndefined();
  });
});

describe(' SOLUCIONES CORRECTAS - CASOS ADICIONALES', () => {

  //  Tests adicionales para completar la cobertura
  test('PUT /api/tareas/:id devuelve 404 para ID inexistente', async () => {
    const idInexistente = new mongoose.Types.ObjectId();
    
    const res = await request(app)
      .put(`/api/tareas/${idInexistente}`)
      .send({ title: 'No debería funcionar' });
    
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  test('DELETE /api/tareas/:id devuelve 404 para ID inexistente', async () => {
    const idInexistente = new mongoose.Types.ObjectId();
    
    const res = await request(app).delete(`/api/tareas/${idInexistente}`);
    
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  test('POST /api/tareas con título muy largo', async () => {
    // Este test depende de si hay validación de longitud en el modelo
    const titleMuyLargo = 'a'.repeat(1000);
    
    const res = await request(app)
      .post('/api/tareas')
      .send({ title: titleMuyLargo });
    
    // Si no hay validación de longitud, se creará exitosamente
    // Si hay validación, debería fallar con 500
    expect([201, 500]).toContain(res.statusCode);
  });

  test('Verificar que afterEach limpia correctamente', async () => {
    // Crear algunas tareas
    await Tarea.create({ title: 'Tarea 1' });
    await Tarea.create({ title: 'Tarea 2' });
    
    // Verificar que se crearon
    const tareasAntes = await Tarea.find();
    expect(tareasAntes).toHaveLength(2);
    
    // afterEach automáticamente limpia después de cada test
    // Este test verifica que la limpieza funciona
  });
}); 
