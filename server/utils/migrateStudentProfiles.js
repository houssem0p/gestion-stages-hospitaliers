const mysql = require('mysql2/promise');
require('dotenv').config();

const migrateStudentProfiles = async () => {
  let connection;
  
  try {
    console.log('🚀 Migrating student_profiles table...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'internship_db'
    });

    console.log('✅ Connected to database');

    // Check if first_name column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'student_profiles' 
      AND COLUMN_NAME = 'first_name'
    `, [process.env.DB_NAME || 'internship_db']);

    if (columns.length === 0) {
      // Add first_name column
      await connection.execute(`
        ALTER TABLE student_profiles 
        ADD COLUMN first_name VARCHAR(100) AFTER user_id
      `);
      console.log('✅ Added first_name column');
    } else {
      console.log('ℹ️  first_name column already exists');
    }

    // Check if last_name column exists
    const [lastNameColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'student_profiles' 
      AND COLUMN_NAME = 'last_name'
    `, [process.env.DB_NAME || 'internship_db']);

    if (lastNameColumns.length === 0) {
      // Add last_name column
      await connection.execute(`
        ALTER TABLE student_profiles 
        ADD COLUMN last_name VARCHAR(100) AFTER first_name
      `);
      console.log('✅ Added last_name column');
    } else {
      console.log('ℹ️  last_name column already exists');
    }

    console.log('🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Error migrating student_profiles:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the migration
if (require.main === module) {
  migrateStudentProfiles().then(() => {
    console.log('🏁 Migration process completed');
    process.exit(0);
  });
}

module.exports = migrateStudentProfiles;

