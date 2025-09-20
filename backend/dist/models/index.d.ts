import { Sequelize, Model } from 'sequelize';
declare const sequelize: Sequelize;
export declare class Usuario extends Model {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono: string;
    cedula: string;
    rol: 'dueno' | 'admin' | 'tesorero';
    activo: boolean;
    fechaRegistro: Date;
}
export declare class Domicilio extends Model {
    id: number;
    numero: string;
    bloque: string;
    area: number;
    tipo: 'apartamento' | 'casa' | 'local';
    duenoId: number;
}
export declare class Recibo extends Model {
    id: number;
    numero: string;
    concepto: string;
    monto: number;
    fechaVencimiento: Date;
    fechaPago: Date | null;
    estado: 'pendiente' | 'pagado' | 'vencido';
    domicilioId: number;
}
export { sequelize };
//# sourceMappingURL=index.d.ts.map