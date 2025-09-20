// Middleware para logging de requests
export const requestLogger = (req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log(`[${timestamp}] Body:`, JSON.stringify(req.body, null, 2));
    }
    next();
};
// Middleware para manejo de errores
export const errorHandler = (error, _req, res, _next) => {
    const timestamp = new Date().toISOString();
    // Log del error
    console.error(`[${timestamp}] Error:`, {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode || 500
    });
    // Determinar el código de estado
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Error interno del servidor';
    // Manejar errores específicos de Sequelize
    if (error.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Error de validación en la base de datos';
    }
    else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'El registro ya existe (conflicto de datos únicos)';
    }
    else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        message = 'Referencia inválida a datos relacionados';
    }
    else if (error.name === 'SequelizeDatabaseError') {
        statusCode = 500;
        message = 'Error de base de datos';
    }
    // Respuesta de error
    const errorResponse = {
        success: false,
        error: message,
        timestamp,
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            details: error
        })
    };
    res.status(statusCode).json(errorResponse);
};
// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
};
// Wrapper para manejar errores asíncronos
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// Función para crear errores personalizados
export const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
//# sourceMappingURL=errorHandler.js.map