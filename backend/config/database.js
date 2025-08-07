import mysql2 from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully');
    return sequelize;
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;
