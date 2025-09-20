import { Request, Response, NextFunction } from 'express';

// Esquemas de validación para diferentes entidades
const schemas = {
  usuario: {
    required: ['nombre', 'email', 'password', 'rol'],
    optional: ['apellido', 'telefono', 'curp', 'activo'],
    validations: {
      email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      curp: (value: string) => !value || (value.length >= 8 && value.length <= 18), // CURP opcional y más flexible
      telefono: (value: string) => !value || value.length >= 10, // Solo verificar longitud mínima
      password: (value: string) => value.length >= 4, // Contraseña más flexible
      rol: (value: string) => ['dueno', 'admin', 'tesorero'].includes(value),
      nombre: (value: string) => value.length >= 1 && value.length <= 100, // Más flexible
      apellido: (value: string) => !value || (value.length >= 1 && value.length <= 100) // Opcional y más flexible
    }
  },
  dueno: {
    required: ['nombre', 'email'],
    optional: ['apellido', 'telefono', 'curp'],
    validations: {
      email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      curp: (value: string) => !value || (value.length >= 8 && value.length <= 18), // CURP opcional
      telefono: (value: string) => !value || value.length >= 10 // Solo verificar longitud mínima
    }
  },
  domicilio: {
    required: ['calle', 'tipo', 'duenoId'],
    optional: ['numero', 'colonia', 'municipio', 'estado'],
    validations: {
      calle: (value: string) => value.length > 0,
      numero: (value: string) => !value || value.length > 0,
      colonia: (value: string) => !value || value.length > 0,
      municipio: (value: string) => !value || value.length > 0,
      estado: (value: string) => !value || value.length > 0,
      tipo: (value: string) => ['apartamento', 'casa', 'local', 'otro'].includes(value), // Agregado 'otro'
      duenoId: (value: number) => Number.isInteger(value) && value > 0
    }
  },
  recibo: {
    required: ['numero', 'concepto', 'monto', 'fechaVencimiento', 'domicilioId'],
    optional: ['fechaPago', 'estado'],
    validations: {
      numero: (value: string) => value.length > 0,
      concepto: (value: string) => ['luz', 'agua'].includes(value),
      monto: (value: number) => Number(value) > 0,
      fechaVencimiento: (value: string) => !isNaN(Date.parse(value)),
      fechaPago: (value: string) => !value || !isNaN(Date.parse(value)),
      estado: (value: string) => !value || ['pendiente', 'pagado', 'vencido'].includes(value),
      domicilioId: (value: number) => Number.isInteger(value) && value > 0
    }
  }
};

export const validateSchema = (schemaName: keyof typeof schemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schema = schemas[schemaName];
    const data = req.body;
    const errors: string[] = [];

    // Validar campos requeridos
    for (const field of schema.required) {
      if (!data[field] || data[field] === '') {
        errors.push(`El campo '${field}' es requerido`);
      }
    }

    // Validar formato de campos
    for (const [field, validator] of Object.entries(schema.validations)) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        if (!(validator as (value: any) => boolean)(data[field])) {
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
export const validateNumericParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
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