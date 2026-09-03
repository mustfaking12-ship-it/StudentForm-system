const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure database directory exists
const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open SQLite database
const db = new Database(config.DB_PATH, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable WAL mode for high performance and durability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

module.exports = db;
