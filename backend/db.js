import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: false }
  : undefined;

const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslConfig,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'carimakan',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslConfig,
    };

const pool = mysql.createPool(poolConfig);

export async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('Database MySQL berhasil terhubung');
  } finally {
    connection.release();
  }
}

export default pool;
