import mysql2 from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: envFile });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 26045,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },

      connectTimeout: 60000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      max: 3,
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully to Aiven!');
    return sequelize;
  } catch (error) {
    try {
      console.log('Testing direct MySQL connection...');
      const connection = await mysql2.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      });
      await connection.ping();
      console.log('Direct MySQL connection successful!');
      await connection.end();
    } catch (directError) {
      console.error(
        'Direct MySQL connection also failed:',
        directError.message
      );
    }

    process.exit(1);
  }
};

export default sequelize;
