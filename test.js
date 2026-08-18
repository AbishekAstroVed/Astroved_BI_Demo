import { connectMSSQL } from './backend/config/mssql.js';

async function test() {
    try {
        const pool = await connectMSSQL();
        const request = pool.request();
        // Exact copy from dashboardController.js
        const query = `
          DECLARE @today DATE = CAST(GETDATE() AS DATE);
          DECLARE @startDate DATE = NULL;
          DECLARE @yesterday DATE = DATEADD(day, -1, @today);
          
          DECLARE @thisMonth INT = MONTH(@today);
          DECLARE @thisYear INT = YEAR(@today);
          DECLARE @effStart DATE = ISNULL(@startDate, @today);
          DECLARE @effEnd DATE = ISNULL(@endDate, @today);
          DECLARE @daysDiff INT = DATEDIFF(day, @effStart, @effEnd);
          DECLARE @prevEffStart DATE = DATEADD(day, -(@daysDiff + 1), @effStart);
          DECLARE @prevEffEnd DATE = DATEADD(day, -(@daysDiff + 1), @effEnd);
          
          SELECT 1 AS test;
        `;
        const result = await request.query(query);
        console.log("Success:", result.recordsets);
    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit();
}
test();
