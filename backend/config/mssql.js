import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

let mssqlServer = process.env.MSSQL_HOST || '';
let mssqlInstance = undefined;

if (mssqlServer.includes('\\')) {
  [mssqlServer, mssqlInstance] = mssqlServer.split('\\');
}

const mssqlConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: mssqlServer,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: mssqlInstance,
    requestTimeout: 120000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise = null;

const connectMSSQL = async () => {
  try {
    if (!poolPromise) {
      console.log(`Connecting to MSSQL Database [${process.env.MSSQL_DATABASE}] on ${process.env.MSSQL_HOST}...`);
      poolPromise = new sql.ConnectionPool(mssqlConfig)
        .connect()
        .then(pool => {
          console.log(`✅ MSSQL Connected to ${process.env.MSSQL_DATABASE}`);
          return pool;
        })
        .catch(err => {
          console.error("❌ MSSQL Connection Failed: ", err);
          poolPromise = null; // reset so it can be retried
          throw err;
        });
    }
    return poolPromise;
  } catch (error) {
    console.error("❌ MSSQL Error in connectMSSQL: ", error);
  }
};

export { connectMSSQL, sql };
