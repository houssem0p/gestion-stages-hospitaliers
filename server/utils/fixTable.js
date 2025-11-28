const mysql = require('mysql2/promise');
require('dotenv').config();

const checkConnection = async () => {
  let connection;
  
  try {
    console.log('🔍 Checking MySQL connection...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'internship_platform'
    });

    // Get MySQL version and connection info
    const [version] = await connection.execute('SELECT VERSION() as version');
    const [db] = await connection.execute('SELECT DATABASE() as current_db');
    const [processes] = await connection.execute('SHOW PROCESSLIST');
    
    console.log('🐬 MySQL Version:', version[0].version);
    console.log('📁 Current Database:', db[0].current_db);
    console.log('🔗 Connection ID:', connection.threadId);
    console.log('👥 Active Connections:', processes.length);

    // Force refresh and check real data
    await connection.execute('FLUSH TABLES');
    const [realUsers] = await connection.execute('SELECT * FROM users');
    
    console.log('📊 REAL users in database (after flush):');
    if (realUsers.length === 0) {
      console.log('❌ No users found - database is empty');
    } else {
      console.table(realUsers);
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
};

checkConnection();