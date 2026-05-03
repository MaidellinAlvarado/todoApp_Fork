const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            // Retorna 422 si falta el título o si es una cadena vacía
            return res.status(422).json({
                error: "Unprocessable Entity",
                details: error.details.map(err => err.message)
            });
        }
        
        next();
    };
};

module.exports = validate;