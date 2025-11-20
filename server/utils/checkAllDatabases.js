const mysql = require('mysql2/promise');
require('dotenv').config();

const checkAllDatabases = async () => {
  let connection;
  
  try {
    console.log('🔍 Checking all databases...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });

    // List all databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📁 All databases:');
    console.table(databases);

    // Check each database for users table
    for (const db of databases) {
      const dbName = db.Database;
      if (dbName !== 'information_schema' && dbName !== 'mysql' && dbName !== 'performance_schema' && dbName !== 'sys') {
        console.log(`\n🔍 Checking database: ${dbName}`);
        
        try {
          await connection.execute(`USE ${dbName}`);
          const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
          
          if (tables.length > 0) {
            const [users] = await connection.execute('SELECT COUNT(*) as user_count FROM users');
            console.log(`   👥 Users table found with ${users[0].user_count} users`);
            
            const [sampleUsers] = await connection.execute('SELECT id, email, role FROM users LIMIT 3');
            console.log('   Sample users:', sampleUsers);
          }
        } catch (error) {
          // Skip databases we can't access
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
};

checkAllDatabases();