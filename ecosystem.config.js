/**
 * ecosystem.config.js
 * إعدادات PM2 — يُشغّل السيرفر والنسخ الاحتياطي التلقائي
 *
 * الاستخدام:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [

    // ── السيرفر الرئيسي ──────────────────────────────────
    {
      name:        'restaurant',
      script:      'server/index.js',
      watch:       false,
      env: {
        NODE_ENV: 'production',
      },
      // إعادة تشغيل تلقائية عند الانهيار
      autorestart:  true,
      max_restarts: 10,
      restart_delay: 3000,

      // سجلات
      out_file:  'logs/server-out.log',
      error_file:'logs/server-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ── النسخ الاحتياطي التلقائي ─────────────────────────
    {
      name:           'db-backup',
      script:         'server/backup.js',
      // كل يوم الساعة 3:00 صباحاً
      cron_restart:   '0 3 * * *',
      watch:          false,
      autorestart:    false,  // لا يُعاد تشغيله تلقائياً — فقط بـ cron
      out_file:       'logs/backup-out.log',
      error_file:     'logs/backup-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

  ],
};