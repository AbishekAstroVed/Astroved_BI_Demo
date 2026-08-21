import { connectMSSQL } from './backend/config/mssql.js';

async function test() {
  const pool = await connectMSSQL();
  const result = await pool.request().query("SELECT TOP 1 * FROM Vaaak.ProductAdditionalInfo");
  console.log(result.recordset[0]);
  process.exit(0);
}
test();
