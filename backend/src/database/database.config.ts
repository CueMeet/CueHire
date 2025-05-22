import { IS_PRODUCTION } from '../constants/config';
import * as dotenv from 'dotenv';

dotenv.config();
import { SequelizeOptions } from 'sequelize-typescript';

export const databaseConfig: SequelizeOptions = {
  dialect: 'postgres',
  dialectOptions: {
    ...(IS_PRODUCTION && {
      ssl: {
        rejectUnauthorized: true,
        ca: [process.env.POSTGRES_CA_CERT],
      },
    }),
    supportBigNumbers: true,
    decimalNumbers: true,
  },
  define: {
    freezeTableName: true,
  },
  quoteIdentifiers: true,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  logging: false,
};
