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

// Modelo Wallet para OpenPayments
export interface WalletAttributes {
  id: number;
  userId: number;
  walletUrl: string;
  publicKey: string;
  accessToken?: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletCreationAttributes extends Omit<WalletAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public id!: number;
  public userId!: number;
  public walletUrl!: string;
  public publicKey!: string;
  public accessToken?: string;
  public balance!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wallet.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  walletUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'OpenPayments wallet URL'
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Public key for OpenPayments wallet'
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'OpenPayments access token'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Current wallet balance'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, { 
  sequelize, 
  tableName: 'wallets',
  timestamps: true 
});

// Modelo PaymentTransaction para transacciones OpenPayments
export interface PaymentTransactionAttributes {
  id: number;
  reciboId: number;
  senderWalletId: number;
  receiverWalletId: number;
  amount: number;
  paymentPointer: string;
  openPaymentsTransactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransactionCreationAttributes extends Omit<PaymentTransactionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PaymentTransaction extends Model<PaymentTransactionAttributes, PaymentTransactionCreationAttributes> implements PaymentTransactionAttributes {
  public id!: number;
  public reciboId!: number;
  public senderWalletId!: number;
  public receiverWalletId!: number;
  public amount!: number;
  public paymentPointer!: string;
  public openPaymentsTransactionId?: string;
  public status!: 'pending' | 'completed' | 'failed' | 'cancelled';
  public metadata?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentTransaction.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reciboId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Recibo,
      key: 'id'
    }
  },
  senderWalletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Wallet,
      key: 'id'
    }
  },
  receiverWalletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Wallet,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentPointer: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'OpenPayments payment pointer'
  },
  openPaymentsTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'OpenPayments transaction ID'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional transaction metadata'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, { 
  sequelize, 
  tableName: 'payment_transactions',
  timestamps: true 
});

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

// Relaciones para Wallets
Usuario.hasOne(Wallet, { 
  foreignKey: 'userId', 
  as: 'wallet'
});
Wallet.belongsTo(Usuario, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Relaciones para PaymentTransactions
PaymentTransaction.belongsTo(Recibo, { 
  foreignKey: 'reciboId', 
  as: 'recibo'
});
PaymentTransaction.belongsTo(Wallet, { 
  foreignKey: 'senderWalletId', 
  as: 'senderWallet'
});
PaymentTransaction.belongsTo(Wallet, { 
  foreignKey: 'receiverWalletId', 
  as: 'receiverWallet'
});

Recibo.hasMany(PaymentTransaction, { 
  foreignKey: 'reciboId', 
  as: 'transactions'
});
Wallet.hasMany(PaymentTransaction, { 
  foreignKey: 'senderWalletId', 
  as: 'sentTransactions'
});
Wallet.hasMany(PaymentTransaction, { 
  foreignKey: 'receiverWalletId', 
  as: 'receivedTransactions'
});

export { sequelize };