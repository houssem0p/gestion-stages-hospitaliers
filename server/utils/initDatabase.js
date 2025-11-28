const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    console.log('🚀 Initializing database...');
    
    // Create connection without selecting database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'internship_db'}`);
    console.log('✅ Database created/verified');

    // Switch to the database
    await connection.execute(`USE ${process.env.DB_NAME || 'internship_db'}`);
    console.log('✅ Using database');

    // Create users table with correct structure
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'doctor', 'teacher', 'hospital_admin', 'super_admin') NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        specialty VARCHAR(100),
        phone VARCHAR(20),
        hospital_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        profile_completed BOOLEAN DEFAULT FALSE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');

    console.log('🎉 Database initialization completed!');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the initialization
initDatabase().then(() => {
  console.log('🏁 Database setup completed');
  process.exit(0);
});