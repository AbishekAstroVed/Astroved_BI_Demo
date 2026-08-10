import { connectMSSQL, sql } from './config/mssql.js';

async function run() {
  try {
    const pool = await connectMSSQL();
    const tables = ['Product', 'Vaaak.ProductCategory', 'Payment'];
    for (const table of tables) {
      try {
        const res = await pool.request().query(`SELECT TOP 1 * FROM ${table}`);
        console.log(`--- ${table} ---`);
        if (res.recordset.length > 0) {
          console.log(Object.keys(res.recordset[0]));
        } else {
          console.log("Empty table");
        }
      } catch (e) {
        console.log(`Failed to query ${table}: ${e.message}`);
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
