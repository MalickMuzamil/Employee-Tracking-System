import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// ===============================
// 🔥 MySQL Connection Pool
// ===============================
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
});

// ===============================
// 🔥 Handle Initial Connection
// ===============================
pool.getConnection((err, connection) => {
    if (err) {
        console.log("❌ MySQL Connection Failed:", err.message);
    } 
    
    else {
        console.log("✅ MySQL Connected Successfully!");
        connection.release();
    }
});

// ===============================
// 🔥 Promisified Pool Export
// ===============================
const db = pool.promise();

export default db;
