require('dotenv').config();
const sql = require('mssql');
const config = require('./config/db.js');
const dbConfig = config.default || config;

async function run() {
  try {
    await sql.connect(dbConfig);
    const tables = ['Product', 'Vaaak.ProductCategory', 'Payment'];
    for (const table of tables) {
      try {
        const res = await sql.query(`SELECT TOP 1 * FROM ${table}`);
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
    sql.close();
  }
}
run();
