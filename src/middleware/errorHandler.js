
const errorHandler = (err, req, res, next) => {
    // Registro centralizado en el servidor
    console.error(`[Error] ${err.message}`);
    console.error(err.stack);
    //  Manejo de error específico para ID inválido 
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
        return res.status(400).json({ error: "Invalid request" });
    }

    // Respuesta genérica para cualquier otro error del servidor
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: "Internal Server Error"
    });
};

module.exports = errorHandler;