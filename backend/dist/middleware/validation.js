// Esquemas de validación para diferentes entidades
const schemas = {
    usuario: {
        required: ['nombre', 'apellido', 'email', 'password', 'cedula', 'rol'],
        optional: ['telefono', 'activo'],
        validations: {
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            cedula: (value) => /^\d{8,12}$/.test(value.replace(/[.-]/g, '')),
            telefono: (value) => !value || /^\d{10,15}$/.test(value.replace(/[-()\s]/g, '')),
            password: (value) => value.length >= 6,
            rol: (value) => ['dueno', 'admin', 'tesorero'].includes(value),
            nombre: (value) => value.length >= 2 && value.length <= 50,
            apellido: (value) => value.length >= 2 && value.length <= 50
        }
    },
    dueno: {
        required: ['nombre', 'apellido', 'email', 'cedula'],
        optional: ['telefono'],
        validations: {
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            cedula: (value) => /^\d{8,12}$/.test(value.replace(/[.-]/g, '')),
            telefono: (value) => !value || /^\d{10,15}$/.test(value.replace(/[-()\s]/g, ''))
        }
    },
    domicilio: {
        required: ['numero', 'tipo', 'duenoId'],
        optional: ['bloque', 'area'],
        validations: {
            numero: (value) => value.length > 0,
            tipo: (value) => ['apartamento', 'casa', 'local'].includes(value),
            area: (value) => !value || value > 0,
            duenoId: (value) => Number.isInteger(value) && value > 0
        }
    },
    recibo: {
        required: ['numero', 'concepto', 'monto', 'fechaVencimiento', 'domicilioId'],
        optional: ['fechaPago', 'estado'],
        validations: {
            numero: (value) => value.length > 0,
            concepto: (value) => value.length > 0,
            monto: (value) => Number(value) > 0,
            fechaVencimiento: (value) => !isNaN(Date.parse(value)),
            fechaPago: (value) => !value || !isNaN(Date.parse(value)),
            estado: (value) => !value || ['pendiente', 'pagado', 'vencido'].includes(value),
            domicilioId: (value) => Number.isInteger(value) && value > 0
        }
    }
};
export const validateSchema = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        const data = req.body;
        const errors = [];
        // Validar campos requeridos
        for (const field of schema.required) {
            if (!data[field] || data[field] === '') {
                errors.push(`El campo '${field}' es requerido`);
            }
        }
        // Validar formato de campos
        for (const [field, validator] of Object.entries(schema.validations)) {
            if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
                if (!validator(data[field])) {
                    errors.push(`El campo '${field}' tiene un formato inválido`);
                }
            }
        }
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Errores de validación',
                details: errors
            });
            return;
        }
        next();
    };
};
// Middleware para validar parámetros numéricos de URL
export const validateNumericParam = (paramName) => {
    return (req, res, next) => {
        const paramValue = req.params[paramName];
        if (!paramValue) {
            res.status(400).json({
                success: false,
                error: `El parámetro '${paramName}' es requerido`
            });
            return;
        }
        const numericValue = parseInt(paramValue, 10);
        if (isNaN(numericValue) || numericValue <= 0) {
            res.status(400).json({
                success: false,
                error: `El parámetro '${paramName}' debe ser un número válido mayor que 0`
            });
            return;
        }
        next();
    };
};
// Middleware para limpiar datos de entrada
export const sanitizeInput = (req, _res, next) => {
    if (req.body) {
        // Trimear strings
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
};
//# sourceMappingURL=validation.js.map