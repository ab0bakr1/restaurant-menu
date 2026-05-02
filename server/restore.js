/**
 * server/restore.js
 *
 * استعادة قاعدة البيانات من نسخة احتياطية
 *
 * الاستخدام:
 *   node server/restore.js                          ← يعرض قائمة النسخ المتاحة
 *   node server/restore.js restaurant_2024-01-15.db ← يستعيد نسخة محددة
 *   node server/restore.js latest                   ← يستعيد أحدث نسخة
 */

require('dotenv').config({ path: __dirname + '/.env' });

const fs   = require('fs');
const path = require('path');
const readline = require('readline');

const DB_PATH    = path.join(__dirname, 'db', 'restaurant.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatDate(ms) {
  return new Date(ms).toLocaleString('ar-SA');
}

// عرض النسخ المتاحة
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ لا يوجد مجلد نسخ احتياطية');
    return [];
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('restaurant_') && f.endsWith('.db'))
    .map(f => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      return { name: f, size: stat.size, time: stat.mtimeMs };
    })
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) {
    console.log('⚠️  لا توجد نسخ احتياطية متاحة');
    return [];
  }

  console.log('\n📦 النسخ الاحتياطية المتاحة:\n');
  console.log('  #  │ الاسم                              │ الحجم    │ التاريخ');
  console.log('─────┼────────────────────────────────────┼──────────┼─────────────────────');

  files.forEach((f, i) => {
    const num    = String(i + 1).padStart(3);
    const name   = f.name.padEnd(35);
    const size   = formatBytes(f.size).padEnd(9);
    const date   = formatDate(f.time);
    const marker = i === 0 ? ' ← الأحدث' : '';
    console.log(`  ${num}│ ${name}│ ${size}│ ${date}${marker}`);
  });

  console.log('');
  return files;
}

// استعادة نسخة محددة
function restore(backupName) {
  const backupPath = path.join(BACKUP_DIR, backupName);

  if (!fs.existsSync(backupPath)) {
    console.error(`❌ الملف غير موجود: ${backupName}`);
    process.exit(1);
  }

  // نسخة احتياطية من الحالي قبل الاستعادة
  const safetyPath = DB_PATH + '.before_restore';
  if (fs.existsSync(DB_PATH)) {
    fs.copyFileSync(DB_PATH, safetyPath);
    console.log(`💾 نسخة أمان من الحالي: ${safetyPath}`);
  }

  fs.copyFileSync(backupPath, DB_PATH);
  console.log(`\n✅ تمت الاستعادة بنجاح من: ${backupName}`);
  console.log('🔄 أعِد تشغيل السيرفر: pm2 restart restaurant\n');
}

// ── Main ────────────────────────────────────────────────────
const arg = process.argv[2];

const files = listBackups();
if (files.length === 0) process.exit(0);

if (!arg) {
  console.log('الاستخدام:');
  console.log('  node server/restore.js latest                    ← أحدث نسخة');
  console.log('  node server/restore.js restaurant_2024-01-15.db  ← نسخة محددة\n');
  process.exit(0);
}

if (arg === 'latest') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(`⚠️  هل تريد الاستعادة من "${files[0].name}"؟ (نعم/yes): `, answer => {
    rl.close();
    if (answer.toLowerCase() === 'yes' || answer === 'نعم') {
      restore(files[0].name);
    } else {
      console.log('تم الإلغاء.');
    }
  });
} else {
  restore(arg);
}