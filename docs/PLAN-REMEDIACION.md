# Resumen Ejecutivo


La auditoría de seguridad realizada a la plataforma nos indica que si bien la aplicación es funcionalmente estable para la gestión de tareas, presenta un estado de vulnerabilidad crítica debido a la ausencia total de medidas de protección.

Actualmente, la aplicación opera bajo un principio de cero seguridad, permitiendo que cualquier atacante inyecte scripts maliciosos o realice borrados masivos de información sin ninguna restricción. El sistema ignora pilares fundamentales como la la defensa en produndida y el  minimo privilegio ya que todos tiene privilegios exponiendo los datos.

**Objetivo del Plan:**
Este documento establece la hoja de ruta para transformar la app en un sistema seguro mediante tres prioridades estratégicas:
1. *Autenticación robusta:** Implementación de JWT para identificar a cada usuario.
2. **Sanitización de entradas:** Detener ataques de inyección mediante validación estricta.
3. **Control de acceso:** Asegurar que cada usuario interactúe únicamente con sus propios datos.




## 2. Tabla de Vulnerabilidades


| # | Vulnerabilidad | Severidad | OWASP (2021) | Principio Violado | Solución Propuesta |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Ausencia de autenticación | Crítica | A01: Broken Access Control | Seguro por Defecto | Implementar Middleware con JWT. |
| 2 | Exposición de errores técnicos | Crítica | A05: Security Misconfiguration | Falla de forma segura |Middleware global de manejo de errores. |
| 3 | Inyección de datos (No validación) | Alta | A03: Injection | Defensa en Profundidad | Uso de express-validator y sanitización. |
| 4 | Asignación masiva (Mass Assignment) | Media | A08: Integrity Failures | Mínimo Privilegio | Desestructuración de objetos en el body. |
| 5 | IDOR (Referencia Insegura) | Alta | A01: Broken Access Control | Mediación Completa | Validar propiedad del recurso con usuariold. |
| 6 | Exposición excesiva de datos | Alta | A01: Broken Access Control | Mínimo Privilegio |Filtrar consultas por ID de usuario logeado. |
| 7 | Componentes vulnerables (npm audit) | Alta | A06: Vulnerable Components | Economía de Mecanismo | Ejecución de npm audit fix --force. |
| 8 | Falta de restricción de duplicados | Baja | A08: Integrity Failures | Integridad de Datos | Lógica de validación de unicidad en controller. |




## 3. Detalle de Vulnerabilidades

### Vulnerabilidad #1: Ausencia de Autenticación y Autorización
- **Severidad**: Crítica 
- **OWASP**: A01:2021 — Broken Access Control 
- **Principio violado**: Seguro por Defecto 
- **Descripción**: La API no implementa ninguna autenticacion de entrada, permitiendo que cualquier usuario anónimo realice operaciones con los datos sin ninguna restriccion.
- **Solución concreta**: Implementar un middleware de autenticación basado en JWT. Se debe crear una ruta  y proteger todos los endpoints de tareas y sino se authentica o no se valida el token debera de dar un error.

### Vulnerabilidad #2: Exposición de Detalles Técnicos en Errores
- **Severidad**: Crítica 
- **OWASP**: A05:2021 — Security Misconfiguration
- **Principio violado**: Falla de forma segura 
- **Descripción**: La aplicación retorna objetos de error completos  revelando detalles de la infraestructura como el motor de base de datos.
- **Solución concreta**: Crear un Middleware  de manejo de errores que capture todas las excepciones y devuelva mensajes genéricos, registrando el error detallado únicamente en los logs del servidor.

### Vulnerabilidad #3: Inyección de Datos no Validados
- **Severidad**: Alta 
- **OWASP**: A03:2021 — Injection 
- **Principio violado**: Defensa en Profundidad 
- **Descripción**: La API acepta cualquier entrada en los campos, permitiendo la inyección de código malicioso (XSS) o scripts que podrían ejecutarse en el navegador de un administrador
- **Solución concreta**: Utilizar la librería express-validator para definir esquemas de validación estrictos que rechacen etiquetas HTML, limiten la longitud del texto y saniticen la entrada antes de procesarla.



### Vulnerabilidad #4: Asignación Masiva de Atributos 
- **Severidad**: Media 
- **OWASP**: A08:2021 — Software and Data Integrity Failures
- **Principio violado**: Mínimo Privilegio.
- **Descripción**: Al no restringir los campos recibidos en el body, un atacante puede inyectar propiedades extra, y asociarse como admin o inyectar maliciosamente.
-**Solución concreta**: Aplicar desestructuración de objetos en los controladores para extraer únicamente los campos permitidos antes de pasarlos.

### Vulnerabilidad #5: Referencia Directa Insegura a Objetos (IDOR)
- **Severidad**: Alta 
- **OWASP**: A01:2021 — Broken Access Control 
- **Principio violado**: Zero Trust 
- **Descripción**: El sistema confía ciegamente, permitiendo que un usuario interactúe con tareas de otros usuarios  adivinando o iterando identificadores.
- **Solución concreta**: Modificar las consultas a la base de datos para que siempre incluyan el  id del usuario autenticado  y considerar el uso de UUIDs para identificadores menos predecibles.

### Vulnerabilidad #6: Exposición Excesiva de Datos
- **Severidad**: Alta 
- **OWASP**: A01:2021 — Broken Access Control 
- **Principio violado**: Mínimo Privilegio 
- **Descripción**: El endpoint tareas devuelve la lista global de todas las tareas del sistema en lugar de filtrar por el usuario propietario
-**Solución concreta**: Implementar el concepto de  aislamiento agregando un campo en el modelo y filtrando los resultados en el controlador basándose en el ID del usuario logeado

### Vulnerabilidad #7: Uso de Componentes Vulnerables
- **Severidad**: Alta 
- **OWASP**: A06:2021 — Vulnerable and Outdated Components 
- **Principio violado**: Economía de Mecanismo
- **Descripción**: La aplicación utiliza dependencias con fallos de seguridad documentados que podrian permitir ataques.
- **Solución concreta**: Ejecutar periódicamente npm audit fix para actualizar parches de seguridad y mantener las librerías en versiones estables y auditadas.

### Vulnerabilidad #8: Falta de Restricción de Duplicados
- **Severidad**: Baja 
- **OWASP**: A08:2021 — Software and Data Integrity Failures 
- **Principio violado**: Integridad de Datos
- **Descripción**: La falta de validación de unicidad permite la creación de múltiples tareas idénticas, facilitando ataques de saturación de almacenamiento y degradando la calidad y rendimiento.
- **Solución concreta**: Implementar lógica de validación en el controlador para verificar si ya existe una tarea con el mismo título para ese usuario antes de proceder con el guardado.

### Vulnerabilidad #9: Ausencia de Rate Limiting 
- **Severidad**: Media
- **OWASP**: A04:2021 — Next-Generation Intrusion Detection
- **Principio violado**:  Defensa en Profundidad
- **Descripción**: La API no limita la cantidad de peticiones que un usuario puede hacer en un tiempo determinado, lo que facilita ataques de denegación de servicio.
- **Solución concreta**: Implementar la librería express-rate-limit para restringir cada IP.

### Vulnerabilidad #10: Configuración de CORS no Restrictiva
- **Severidad**: Media
- **OWASP**: A05:2021 — Security Misconfiguration
- **Principio violado**: Menor Privilegio
- **Descripción**: Al no tener configurado CORS, la API podría aceptar peticiones de cualquier origen malicioso.
- **Solución concreta**: Configurar el middleware cors permitiendo únicamente el dominio oficial del frontend.


### Vulnerabilidad #11: Ausencia de Headers de Seguridad
- **Severidad**: Media
- **OWASP**: A05:2021 — Security Misconfiguration
- **Principio violado**: Defensa en Profundidad
- **Descripción**: La API no utiliza cabeceras HTTP de seguridad, lo que la hace vulnerable a ataques.
- **Solución concreta**: Instalar e implementar helmet como middleware global para configurar automáticamente cabeceras

### Vulnerabilidad #12: Datos Sensibles Hardcodeados 
- **Severidad**: Alta
- **OWASP**: A05:2021 — Security Misconfiguration
- **Principio violado**:Seguro por Defecto
- **Descripción**: Las credenciales de la base de datos están escritas directamente en el código, lo que las expone si el repositorio es filtrado.
- **Solución concreta**: Mover todas las credenciales y secretos a un archivo .env y asegurar que este se encuentre en el .gitignore.



## 4. Ausencia de Autenticación y Autorización

### Análisis Profundo de la Vulnerabilidad más Crítica

Tras el análisis técnico, se ha determinado que la falta de autenticacion es el riesgo más severo del sistema, ya que invalida cualquier otro esfuerzo de seguridad  de manera transversal a todos los endpoints de la API.

#### 1. Dimensiones del Impacto 

* *Pérdida de Confidencialidad:** Cualquier persona malintencionada con acceso a la red puede extraer la totalidad de la información almacenada en la base de datos de tareas.  No existe privacidad para los usuarios, ya que sus datos están expuestos.

* *Violación de la Integridad:** Un atacante puede realizar modificaciones no autorizadas en los registros existentes o inyectar datos maliciosos 

**Compromiso de la Disponibilidad:** Dado que el endpoint borrar es accesible sin restricciones, un atacante podría ejecutar un borrado masivo de toda la colección de tareas en segundos, provocando una pérdida total de servicio y datos para la aplicación



#### 2. Escenario de Riesgo Real
Sin un Middleware de autenticación, la aplicación confía ciegamente en cualquier petición,. En un entorno de producción, esto permitiría ataques automatizados de bots que saturen la base de datos con basura o borren el progreso de todos los estudiantes de la plataforma de forma irreversible

Se ha asignado a esta remediación la **Prioridad 1** porque es el requisito previo para implementar el resto de los controles. Sin saber quién es el usuario es imposible aplicar reglas de **Mínimo Privilegio** o evitar ataques de **IDOR**, ya que el sistema no tiene un punto de referencia para validar la propiedad de los recursos.

**Remediación Estratégica:**
La solución inmediata es la implementación de JWT y un modelo de datos que relacione cada tarea con un user único, asegurando que el sistema verifique la identidad en cada solicitud.