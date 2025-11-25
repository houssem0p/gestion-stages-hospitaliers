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

    // Create offers table if it doesn't exist (basic structure compatible with existing queries)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS offers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        description TEXT,
        speciality VARCHAR(191),
        doctor_id INT,
        requirements TEXT,
        startDate DATE,
        endDate DATE,
        address VARCHAR(255),
        hospital VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Offers table created/verified');

    // Create evaluations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        internship_id INT NOT NULL,
        student_id INT NOT NULL,
        doctor_id INT,
        scores JSON,
        comments TEXT,
        final_grade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_intern_student (internship_id, student_id)
      )
    `);
    console.log('✅ Evaluations table created/verified');

    // Create reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        internship_id INT NOT NULL,
        student_id INT NOT NULL,
        title VARCHAR(255),
        content TEXT,
        file_url VARCHAR(1024),
        status ENUM('draft','submitted','reviewed') DEFAULT 'draft',
        feedback TEXT,
        submission_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Reports table created/verified');

    // Create attestations metadata table (stores generated attestation records)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attestations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        internship_id INT NOT NULL,
        student_id INT NOT NULL,
        generated_by INT,
        file_url VARCHAR(1024),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Attestations table created/verified');

    // Create applications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        internship_id INT NOT NULL,
        student_id INT NOT NULL,
        cover_letter TEXT,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Applications table created/verified');

    // Create student_documents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_documents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        document_type ENUM('cv','transcripts','school_certificate','other') NOT NULL,
        file_path VARCHAR(1024) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INT,
        mime_type VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP NULL
      )
    `);
    console.log('✅ Student documents table created/verified');

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