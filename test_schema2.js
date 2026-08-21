import { connectMSSQL } from './backend/config/mssql.js';

async function test() {
  try {
    const pool = await connectMSSQL();
    const result = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'Vaaak' AND TABLE_NAME = 'ProductAdditionalInfo'");
    console.log(result.recordset);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
test();
