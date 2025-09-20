import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index.js';

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

class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
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

Wallet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
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
  },
  {
    sequelize,
    tableName: 'wallets',
    timestamps: true,
  }
);

export { Wallet };