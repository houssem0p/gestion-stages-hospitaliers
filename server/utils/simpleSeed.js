const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const seedAdmin = async () => {
  let connection;
  
  try {
    console.log('🌱 Starting admin setup...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'internship_db'
    });

    console.log('✅ Connected to database');

    // First, let's check the table structure
    const [tableInfo] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = '${process.env.DB_NAME || 'internship_db'}'
    `);

    console.log('📊 Table columns:', tableInfo.map(col => col.COLUMN_NAME));

    // Check if admin exists
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      ['admin@internship.com']
    );

    if (rows.length > 0) {
      console.log('✅ Admin already exists:');
      console.log('📧 Email:', rows[0].email);
      console.log('👤 Role:', rows[0].role);
      return;
    }

    // Create admin - use the correct column names based on your table structure
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Try different column combinations
    try {
      await connection.execute(
        `INSERT INTO users (email, password, role, first_name, last_name, is_active, profile_completed) 
         VALUES (?, ?, 'super_admin', 'System', 'Administrator', 1, 1)`,
        ['admin@internship.com', hashedPassword]
      );
      console.log('✅ Admin created with basic columns');
    } catch (error) {
      // If that fails, try with minimal columns
      console.log('🔄 Trying minimal columns...');
      await connection.execute(
        `INSERT INTO users (email, password, role) 
         VALUES (?, ?, 'super_admin')`,
        ['admin@internship.com', hashedPassword]
      );
      console.log('✅ Admin created with minimal columns');
    }

    console.log('🎉 Super admin created successfully!');
    console.log('====================================');
    console.log('📧 Email: admin@internship.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: super_admin');
    console.log('====================================');
    console.log('⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Database does not exist. Please run: node utils/initDatabase.js');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('💡 Users table does not exist. Please run: node utils/initDatabase.js');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the seed
seedAdmin().then(() => {
  console.log('🏁 Seed process completed');
  process.exit(0);
});