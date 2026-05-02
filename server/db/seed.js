/**
 * server/db/seed.js
 * ينشئ حسابات افتراضية عند أول تشغيل فقط
 * تشغيل يدوي: node server/db/seed.js
 * أو يُستدعى تلقائياً من db.js
 */

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const db = new Database(path.join(__dirname, 'restaurant.db'));

const accounts = [
  { username: 'admin',   password: 'admin123',   role: 'admin'   },
  { username: 'waiter1', password: 'waiter123',  role: 'waiter'  },
  { username: 'cashier', password: 'cashier123', role: 'cashier' },
];

const insert = db.prepare(
  'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)'
);

let created = 0;
accounts.forEach(({ username, password, role }) => {
  const hash   = bcrypt.hashSync(password, 10);
  const result = insert.run(username, hash, role);
  if (result.changes > 0) {
    console.log(`✅ تم إنشاء حساب: ${username} (${role})`);
    created++;
  } else {
    console.log(`⏭  موجود مسبقاً: ${username}`);
  }
});

if (created > 0) {
  console.log('\n📋 بيانات الدخول الافتراضية:');
  console.log('─────────────────────────────');
  accounts.forEach(a => {
    console.log(`  ${a.role.padEnd(8)} │ ${a.username.padEnd(10)} │ ${a.password}`);
  });
  console.log('─────────────────────────────');
  console.log('⚠️  غيّر كلمات المرور بعد أول دخول!\n');
} else {
  console.log('\nℹ️  جميع الحسابات موجودة مسبقاً.\n');
}

process.exit(0);