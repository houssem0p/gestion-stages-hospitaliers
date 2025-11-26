const mysql = require('mysql2/promise');
require('dotenv').config();
const path = require('path');

const normalizeFilePath = (filePath) => {
  if (!filePath) return null;
  
  // If already a relative path starting with /uploads, return as is
  if (filePath.startsWith('/uploads/')) {
    return filePath;
  }
  
  // Extract just the uploads part from any path
  // This handles both absolute paths and paths with extra directory segments
  const uploadsIndex = filePath.indexOf('uploads');
  if (uploadsIndex !== -1) {
    // Extract everything from 'uploads' onwards and normalize
    let relativePath = filePath.substring(uploadsIndex).replace(/\\/g, '/');
    // Ensure it starts with /
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath;
    }
    return relativePath;
  }
  
  // If no 'uploads' found, try to convert absolute path to relative
  const serverDir = path.join(__dirname, '..');
  try {
    let relativePath = path.relative(serverDir, filePath).replace(/\\/g, '/');
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath;
    }
    return relativePath;
  } catch (err) {
    console.error('Error normalizing file path:', filePath, err);
    return null;
  }
};

const fixDocumentPaths = async () => {
  let connection;
  
  try {
    console.log('🚀 Fixing document paths in database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'internship_db'
    });

    console.log('✅ Connected to database');

    // Get all documents that don't have the correct relative path format
    const [documents] = await connection.execute(`
      SELECT id, file_path 
      FROM student_documents 
      WHERE file_path NOT LIKE '/uploads/%'
    `);

    console.log(`Found ${documents.length} documents that need path normalization`);

    let fixed = 0;
    let skipped = 0;
    for (const doc of documents) {
      const normalizedPath = normalizeFilePath(doc.file_path);
      
      if (!normalizedPath) {
        console.log(`⚠️  Could not normalize document ${doc.id}: ${doc.file_path}`);
        skipped++;
        continue;
      }
      
      if (normalizedPath !== doc.file_path) {
        await connection.execute(
          `UPDATE student_documents SET file_path = ? WHERE id = ?`,
          [normalizedPath, doc.id]
        );
        console.log(`✅ Fixed document ${doc.id}: ${doc.file_path.substring(0, 60)}... -> ${normalizedPath}`);
        fixed++;
      } else {
        console.log(`ℹ️  Document ${doc.id} already normalized: ${doc.file_path}`);
      }
    }
    
    if (skipped > 0) {
      console.log(`⚠️  Skipped ${skipped} documents that could not be normalized`);
    }

    console.log(`🎉 Fixed ${fixed} document paths!`);

  } catch (error) {
    console.error('❌ Error fixing document paths:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the fix
if (require.main === module) {
  fixDocumentPaths().then(() => {
    console.log('🏁 Path fix process completed');
    process.exit(0);
  });
}

module.exports = fixDocumentPaths;

