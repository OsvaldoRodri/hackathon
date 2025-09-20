import { Request, Response, NextFunction } from 'express';
declare const schemas: {
    usuario: {
        required: string[];
        optional: string[];
        validations: {
            email: (value: string) => boolean;
            cedula: (value: string) => boolean;
            telefono: (value: string) => boolean;
            password: (value: string) => boolean;
            rol: (value: string) => boolean;
            nombre: (value: string) => boolean;
            apellido: (value: string) => boolean;
        };
    };
    dueno: {
        required: string[];
        optional: string[];
        validations: {
            email: (value: string) => boolean;
            cedula: (value: string) => boolean;
            telefono: (value: string) => boolean;
        };
    };
    domicilio: {
        required: string[];
        optional: string[];
        validations: {
            numero: (value: string) => boolean;
            tipo: (value: string) => boolean;
            area: (value: number) => boolean;
            duenoId: (value: number) => boolean;
        };
    };
    recibo: {
        required: string[];
        optional: string[];
        validations: {
            numero: (value: string) => boolean;
            concepto: (value: string) => boolean;
            monto: (value: number) => boolean;
            fechaVencimiento: (value: string) => boolean;
            fechaPago: (value: string) => boolean;
            estado: (value: string) => boolean;
            domicilioId: (value: number) => boolean;
        };
    };
};
export declare const validateSchema: (schemaName: keyof typeof schemas) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateNumericParam: (paramName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const sanitizeInput: (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validation.d.ts.map