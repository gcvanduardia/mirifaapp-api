import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST || "",
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export const poolPromise = sql
  .connect(config)
  .then(pool => {
    console.log('✅ Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error al conectar DB:', err);
    process.exit(1);
  });