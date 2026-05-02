/**
 * server/backup.js
 *
 * نسخ احتياطي تلقائي لقاعدة البيانات
 *
 * الميزات:
 *  ✅ نسخة يومية بالتاريخ
 *  ✅ حذف النسخ القديمة تلقائياً (يحتفظ بآخر 30 نسخة)
 *  ✅ تقرير بحجم الملف والنتيجة
 *  ✅ يعمل مستقلاً أو مع PM2 cron
 *
 * التشغيل اليدوي:
 *   node server/backup.js
 *
 * التشغيل التلقائي مع PM2 (كل يوم الساعة 3 صباحاً):
 *   pm2 start server/backup.js --name "db-backup" --cron "0 3 * * *" --no-autorestart
 */

require('dotenv').config({ path: __dirname + '/.env' });

const fs   = require('fs');
const path = require('path');

// ── الإعدادات ──────────────────────────────────────────────
const DB_PATH      = path.join(__dirname, 'db', 'restaurant.db');
const BACKUP_DIR   = path.join(__dirname, 'backups');
const MAX_BACKUPS  = Number(process.env.MAX_BACKUPS) || 30;  // احتفظ بآخر 30 نسخة
const LOG_FILE     = path.join(BACKUP_DIR, 'backup.log');

// ── مساعدات ────────────────────────────────────────────────
function log(msg) {
  const line = `[${new Date().toLocaleString('ar-SA')}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch {}
}

function formatBytes(bytes) {
  if (bytes < 1024)       return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getTimestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

// ── الوظيفة الرئيسية ────────────────────────────────────────
function runBackup() {
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('🔄 بدء النسخ الاحتياطي...');

  // 1. تأكد من وجود قاعدة البيانات
  if (!fs.existsSync(DB_PATH)) {
    log('❌ لم يتم العثور على قاعدة البيانات: ' + DB_PATH);
    process.exit(1);
  }

  // 2. أنشئ مجلد النسخ الاحتياطية إذا لم يكن موجوداً
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log('📁 تم إنشاء مجلد النسخ الاحتياطية');
  }

  // 3. اسم ملف النسخة الجديدة
  const timestamp  = getTimestamp();
  const backupName = `restaurant_${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  // 4. نسخ الملف
  try {
    fs.copyFileSync(DB_PATH, backupPath);
  } catch (err) {
    log('❌ فشل النسخ: ' + err.message);
    process.exit(1);
  }

  // 5. تحقق من النجاح
  const originalSize = fs.statSync(DB_PATH).size;
  const backupSize   = fs.statSync(backupPath).size;

  if (backupSize !== originalSize) {
    log(`⚠️  تحذير: حجم النسخة (${formatBytes(backupSize)}) لا يطابق الأصل (${formatBytes(originalSize)})`);
  } else {
    log(`✅ تم النسخ بنجاح: ${backupName} (${formatBytes(backupSize)})`);
  }

  // 6. احذف النسخ القديمة — احتفظ بآخر MAX_BACKUPS فقط
  cleanOldBackups();

  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('restaurant_') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time); // الأحدث أولاً

  if (files.length <= MAX_BACKUPS) {
    log(`📦 عدد النسخ الاحتياطية: ${files.length} / ${MAX_BACKUPS}`);
    return;
  }

  const toDelete = files.slice(MAX_BACKUPS);
  toDelete.forEach(f => {
    fs.unlinkSync(path.join(BACKUP_DIR, f.name));
    log(`🗑  حُذفت نسخة قديمة: ${f.name}`);
  });

  log(`📦 النسخ المتبقية: ${MAX_BACKUPS}`);
}

// ── تشغيل ──────────────────────────────────────────────────
runBackup();