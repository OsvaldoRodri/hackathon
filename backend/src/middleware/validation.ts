import { Request, Response, NextFunction } from 'express';

// Esquemas de validación para diferentes entidades
const schemas = {
  usuario: {
    required: ['nombre', 'apellido', 'email', 'password', 'cedula', 'rol'],
    optional: ['telefono', 'activo'],
    validations: {
      email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      cedula: (value: string) => /^\d{8,12}$/.test(value.replace(/[.-]/g, '')),
      telefono: (value: string) => !value || /^\d{10,15}$/.test(value.replace(/[-()\s]/g, '')),
      password: (value: string) => value.length >= 6,
      rol: (value: string) => ['dueno', 'admin', 'tesorero'].includes(value),
      nombre: (value: string) => value.length >= 2 && value.length <= 50,
      apellido: (value: string) => value.length >= 2 && value.length <= 50
    }
  },
  dueno: {
    required: ['nombre', 'apellido', 'email', 'cedula'],
    optional: ['telefono'],
    validations: {
      email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      cedula: (value: string) => /^\d{8,12}$/.test(value.replace(/[.-]/g, '')),
      telefono: (value: string) => !value || /^\d{10,15}$/.test(value.replace(/[-()\s]/g, ''))
    }
  },
  domicilio: {
    required: ['numero', 'tipo', 'duenoId'],
    optional: ['bloque', 'area'],
    validations: {
      numero: (value: string) => value.length > 0,
      tipo: (value: string) => ['apartamento', 'casa', 'local'].includes(value),
      area: (value: number) => !value || value > 0,
      duenoId: (value: number) => Number.isInteger(value) && value > 0
    }
  },
  recibo: {
    required: ['numero', 'concepto', 'monto', 'fechaVencimiento', 'domicilioId'],
    optional: ['fechaPago', 'estado'],
    validations: {
      numero: (value: string) => value.length > 0,
      concepto: (value: string) => value.length > 0,
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