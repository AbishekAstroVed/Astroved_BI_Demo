const sql = require('mssql');

async function test() {
    try {
        const pool = await sql.connect("Server=192.168.0.112\\DBSERVER;Database=VaaakQA;User Id=bi_user;Password=bi_password;TrustServerCertificate=true;");
        const request = pool.request();
        
        let trackingConditions = "TS.TrackingCode LIKE '%NLW%' OR TS.TrackingCode LIKE '%NLI%' OR TS.TrackingCode LIKE '%OML%'";
        let eventName = undefined;
        
        request.input('startDate', '2025-12-31');
        request.input('endDate', '2026-08-12');
        request.input('prevStartDate', '2025-05-21');
        request.input('prevEndDate', '2025-12-30');
        
        const fs = require('fs');
        let p = 'C:\\Users\\Abishek\\Demo_AstroVed_BI\\backend\\controllers\\dashboardController.js';
        let code = fs.readFileSync(p, 'utf8');
        let start = code.indexOf('const query = `') + 'const query = `'.length;
        let end = code.indexOf('    `;', start);
        let queryStrTemplate = code.substring(start, end);
        
        let query = queryStrTemplate.replace(/\$\{trackingConditions\}/g, trackingConditions);
        let eventStr = eventName && eventName !== 'All' ? "AND (CASE WHEN LEN(PAI.EventName) > 0 THEN PAI.EventName ELSE 'Regular Store Item' END) = @eventName" : "";
        query = query.replace(/\$\{eventName && eventName !== 'All' \? "AND \(CASE WHEN LEN\(PAI.EventName\) > 0 THEN PAI.EventName ELSE 'Regular Store Item' END\) = @eventName" : ""\}/g, eventStr);
        
        await request.query(query);
        console.log("Success!");
    } catch (err) {
        console.error("ERROR CAUGHT:");
        console.error(err.message);
        if (err.precedingErrors) {
            console.error("PRECEDING ERRORS:");
            err.precedingErrors.forEach(e => {
                console.error("Line", e.lineNumber, "-", e.message);
            });
        } else {
            console.error("Line", err.lineNumber);
        }
    }
}
test();
