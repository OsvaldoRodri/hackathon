import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para SQL Server
const sequelize = new Sequelize(
  process.env.DB_NAME || 'condominios_db',
  process.env.DB_USER || 'sa',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false, // Para desarrollo local
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: process.env.DB_INSTANCE || '', // Si usas instancia nombrada
      }
    },
    logging: console.log, // Para debug
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;