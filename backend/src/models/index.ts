import { Sequelize, DataTypes, Model } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'condominios_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// Modelo Usuario (con roles: dueno, admin, tesorero)
export class Usuario extends Model {
  public id!: number;
  public nombre!: string;
  public apellido!: string;
  public email!: string;
  public password!: string;
  public telefono!: string;
  public curp!: string;
  public rol!: 'dueno' | 'admin' | 'tesorero';
  public activo!: boolean;
  public fechaRegistro!: Date;
}

Usuario.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: true }, // Made optional
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  telefono: { type: DataTypes.STRING, allowNull: true }, // Made optional
  curp: { type: DataTypes.STRING, unique: true, allowNull: true }, // Made optional
  rol: { 
    type: DataTypes.ENUM('dueno', 'admin', 'tesorero'), 
    allowNull: false,
    defaultValue: 'dueno',
    comment: 'Rol del usuario: dueno (propietario), admin (administrador), tesorero (finanzas)'
  },
  activo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true,
    comment: 'Si false, el usuario no puede acceder al sistema'
  },
  fechaRegistro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { sequelize, modelName: 'usuario' });

// Modelo Domicilio
export class Domicilio extends Model {
  public id!: number;
  public calle!: string;
  public numero!: string;
  public colonia!: string;
  public municipio!: string;
  public estado!: string;
  public tipo!: 'apartamento' | 'casa' | 'local' | 'otro';
  public duenoId!: number;
}

Domicilio.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  calle: { type: DataTypes.STRING, allowNull: false },
  numero: { type: DataTypes.STRING, allowNull: true }, // Made optional
  colonia: { type: DataTypes.STRING, allowNull: true }, // Made optional
  municipio: { type: DataTypes.STRING, allowNull: true }, // Made optional
  estado: { type: DataTypes.STRING, allowNull: true }, // Made optional
  tipo: { type: DataTypes.ENUM('apartamento', 'casa', 'local', 'otro'), allowNull: false }, // Added 'otro'
  duenoId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: Usuario, key: 'id' },
    comment: 'Referencia al usuario propietario (rol: dueno)'
  }
}, { sequelize, modelName: 'domicilio' });

// Modelo Recibos
export class Recibo extends Model {
  public id!: number;
  public numero!: string;
  public concepto!: "luz" | "agua" ;
  public monto!: number;
  public fechaVencimiento!: Date;
  public fechaPago!: Date | null;
  public estado!: 'pendiente' | 'pagado' | 'vencido';
  public domicilioId!: number;
}

Recibo.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero: { type: DataTypes.STRING, unique: true, allowNull: false },
  concepto: { type: DataTypes.ENUM('luz', 'agua'), allowNull: false },
  monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  fechaVencimiento: { type: DataTypes.DATE, allowNull: false },
  fechaPago: { type: DataTypes.DATE, allowNull: true },
  estado: { 
    type: DataTypes.ENUM('pendiente', 'pagado', 'vencido'), 
    defaultValue: 'pendiente' 
  },
  domicilioId: { type: DataTypes.INTEGER, references: { model: Domicilio, key: 'id' } }
}, { sequelize, modelName: 'recibo' });

// Relaciones
Usuario.hasMany(Domicilio, { 
  foreignKey: 'duenoId', 
  as: 'propiedades'
});
Domicilio.belongsTo(Usuario, { 
  foreignKey: 'duenoId', 
  as: 'propietario'
});
Domicilio.hasMany(Recibo, { foreignKey: 'domicilioId' });
Recibo.belongsTo(Domicilio, { foreignKey: 'domicilioId' });

export { sequelize };