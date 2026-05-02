/**
 * server/db/db.js
 * يفتح قاعدة البيانات وينشئ الجداول
 * ويستدعي seed.js تلقائياً إذا لم يكن هناك مستخدمون
 */

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');
const fs       = require('fs');

const dbPath     = path.join(__dirname, 'restaurant.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// إنشاء الجداول
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// إنشاء حسابات افتراضية إذا كانت قاعدة البيانات فارغة من المستخدمين
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  console.log('🌱 قاعدة البيانات جديدة — إنشاء حسابات افتراضية...');

  const insert = db.prepare(
    'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)'
  );

  const accounts = [
    { username: 'admin',   password: 'admin123',   role: 'admin'   },
    { username: 'waiter1', password: 'waiter123',  role: 'waiter'  },
    { username: 'cashier', password: 'cashier123', role: 'cashier' },
  ];

  accounts.forEach(({ username, password, role }) => {
    insert.run(username, bcrypt.hashSync(password, 10), role);
    console.log(`  ✅ ${role}: ${username} / ${password}`);
  });

  console.log('⚠️  غيّر كلمات المرور بعد أول دخول!\n');
}

module.exports = db;