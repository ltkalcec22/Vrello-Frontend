// db.js
const mysql = require('mysql2/promise');

async function initDb() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',          // Your DB user
      password: '4Keh7zZd',  // Your DB password
      database: 'mydatabase',// Your DB name
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test the connection
    const connection = await pool.getConnection();
    console.log('Connected to the database!');
    connection.release();

    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    // In production, you might want to exit the process if DB is critical
    process.exit(1);
  }
}

module.exports = initDb;
