import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index.js';

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

class PaymentTransaction extends Model<PaymentTransactionAttributes, PaymentTransactionCreationAttributes> implements PaymentTransactionAttributes {
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

PaymentTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reciboId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recibos',
        key: 'id'
      }
    },
    senderWalletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id'
      }
    },
    receiverWalletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'wallets',
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
  },
  {
    sequelize,
    tableName: 'payment_transactions',
    timestamps: true,
  }
);

export { PaymentTransaction };