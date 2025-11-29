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
    const dbName = process.env.DB_NAME || 'internship_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log('✅ Database created/verified');

    // Close the initial connection and create a new one with the database selected
    await connection.end();
    
    // Create new connection with database selected
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: dbName
    });
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

    // Create student_profiles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        matricule VARCHAR(50),
        speciality VARCHAR(100),
        academic_year VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_profile (user_id)
      )
    `);
    console.log('✅ Student profiles table created/verified');

    // Create messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message_type ENUM('student_mentor', 'student_hospital', 'mentor_hospital', 'admin_broadcast') DEFAULT 'student_mentor',
        subject VARCHAR(200),
        content TEXT NOT NULL,
        internship_id INT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id),
        FOREIGN KEY (internship_id) REFERENCES offers(id),
        INDEX idx_sender_receiver (sender_id, receiver_id),
        INDEX idx_receiver_read (receiver_id, is_read),
        INDEX idx_internship (internship_id)
      )
    `);
    console.log('✅ Messages table created/verified');

    // Create message_attachments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS message_attachments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        message_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Message attachments table created/verified');

    // Create hospitals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        type VARCHAR(100),
        wilaya VARCHAR(100),
        capacity INT,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Hospitals table created/verified');

    // Create internship_participants table - links students, doctors, teachers, hospitals to internships
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS internship_participants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        internship_id INT NOT NULL,
        student_id INT,
        doctor_id INT,
        teacher_id INT,
        hospital_id INT,
        role ENUM('student', 'doctor', 'teacher', 'hospital') NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        FOREIGN KEY (internship_id) REFERENCES offers(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
        INDEX idx_internship (internship_id),
        INDEX idx_student (student_id),
        INDEX idx_doctor (doctor_id),
        INDEX idx_teacher (teacher_id),
        INDEX idx_hospital (hospital_id),
        INDEX idx_role (role),
        UNIQUE KEY unique_participant (internship_id, student_id, doctor_id, teacher_id, role)
      )
    `);
    console.log('✅ Internship participants table created/verified');

    // Create evaluation_templates table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS evaluation_templates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        internship_id INT NOT NULL,
        template_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (internship_id) REFERENCES offers(id) ON DELETE CASCADE,
        INDEX idx_internship (internship_id)
      )
    `);
    console.log('✅ Evaluation templates table created/verified');

    // Create evaluation_criteria table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS evaluation_criteria (
        id INT PRIMARY KEY AUTO_INCREMENT,
        template_id INT NOT NULL,
        category VARCHAR(100),
        criteria_text VARCHAR(500) NOT NULL,
        description TEXT,
        criteria_type ENUM('scale', 'boolean', 'text') DEFAULT 'scale',
        weight DECIMAL(5,2) DEFAULT 1.0,
        max_score INT DEFAULT 5,
        sort_order INT DEFAULT 0,
        is_required BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES evaluation_templates(id) ON DELETE CASCADE,
        INDEX idx_template (template_id)
      )
    `);
    console.log('✅ Evaluation criteria table created/verified');

    // Create saved_internships table (for students to bookmark internships)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS saved_internships (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        internship_id INT NOT NULL,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (internship_id) REFERENCES offers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_saved (student_id, internship_id),
        INDEX idx_student (student_id),
        INDEX idx_internship (internship_id)
      )
    `);
    console.log('✅ Saved internships table created/verified');

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