const mysql = require('mysql2/promise');
require('dotenv').config();

const checkUsers = async () => {
  let connection;
  
  try {
    console.log('🔍 Checking users in database...');
    console.log('📊 Connection details:');
    console.log('   Host:', process.env.DB_HOST || 'localhost');
    console.log('   Database:', process.env.DB_NAME || 'internship_db');
    console.log('   User:', process.env.DB_USER || 'root');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'internship_db'
    });

    console.log('✅ Connected to database');

    // Check what database we're using
    const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');
    console.log('📁 Current database:', dbResult[0].current_db);

    // Check all users
    const [users] = await connection.execute('SELECT id, email, role, created_at FROM users');
    
    console.log('📊 Users in database:');
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.table(users);
    }

    // Check table structure
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = ?
    `, [dbResult[0].current_db]);
    
    console.log('📋 Table structure:');
    console.table(columns);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
};

checkUsers();