/**
 * server/routes/qr.js
 * توليد QR Code لكل طاولة
 * GET /api/qr/:table → صورة PNG
 * GET /api/qr/all    → HTML صفحة طباعة لجميع الطاولات
 */

const express  = require('express');
const QRCode   = require('qrcode');
const router   = express.Router();

// رابط الفرونت — يُقرأ من .env
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// QR لطاولة واحدة — يُرجع PNG
router.get('/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const url = `${CLIENT_URL}/table/${table}`;
    const png = await QRCode.toBuffer(url, {
      width: 400,
      margin: 2,
      color: { dark: '#2C1810', light: '#FFF8F0' }
    });
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// صفحة HTML تحتوي QR جميع الطاولات — جاهزة للطباعة
router.get('/print/all', async (req, res) => {
  try {
    const tables = Number(req.query.tables) || 10;
    const cards  = [];

    for (let i = 1; i <= tables; i++) {
      const url      = `${CLIENT_URL}/table/${i}`;
      const dataUrl  = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: '#2C1810', light: '#FFF8F0' }
      });
      cards.push({ table: i, url, dataUrl });
    }

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>QR Code الطاولات</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', sans-serif; background: #f5f5f5; padding: 20px; }
    h1 { text-align: center; margin-bottom: 24px; color: #2C1810; font-size: 22px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }
    .card {
      background: #FFF8F0; border: 2px solid #D4A055;
      border-radius: 16px; padding: 20px;
      text-align: center; break-inside: avoid;
    }
    .card img { width: 100%; max-width: 220px; border-radius: 8px; }
    .table-num { font-size: 20px; font-weight: 700; color: #2C1810; margin-top: 10px; }
    .scan-txt { font-size: 13px; color: #9C7040; margin-top: 4px; }
    .url { font-size: 10px; color: #ccc; margin-top: 6px; word-break: break-all; }
    @media print {
      body { background: white; padding: 0; }
      h1 { margin-bottom: 16px; }
      .grid { gap: 12px; }
    }
  </style>
</head>
<body>
  <h1>🍽 QR Code الطاولات — جاهزة للطباعة</h1>
  <div class="grid">
    ${cards.map(c => `
      <div class="card">
        <img src="${c.dataUrl}" alt="QR طاولة ${c.table}">
        <div class="table-num">طاولة رقم ${c.table}</div>
        <div class="scan-txt">امسح للطلب مباشرة</div>
        <div class="url">${c.url}</div>
      </div>
    `).join('')}
  </div>
  <div style="text-align:center; margin-top:24px;">
    <button onclick="window.print()" style="padding:12px 32px;background:#2C1810;color:#f5deb3;border:none;border-radius:10px;font-size:15px;font-family:'Cairo',sans-serif;cursor:pointer;">
      🖨 طباعة الصفحة
    </button>
  </div>
</body>
</html>`;

    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;