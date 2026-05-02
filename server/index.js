/**
 * server/index.js
 */

require('dotenv').config();                    // ← يقرأ .env

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' }
});

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// المسارات
app.use('/api/menu',    require('./routes/menu'));
app.use('/api/orders',  require('./routes/orders'));
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/print',   require('./routes/print'));
app.use('/api/payments', require('./routes/payments'));  // ← جديد
app.use('/api/reports', require('./routes/reports'));   // ← مضاف
app.use('/api/qr',      require('./routes/qr'));        // ← مضاف



// حماية السيرفر من الانهيار المفاجئ
process.on('uncaughtException', (err) => {
    console.error('❌ خطأ غير متوقع في الكود:', err);
    // السيرفر سيستمر في العمل ولن يتوقف
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ وعد (Promise) لم يتم معالجته:', reason);
});

// Socket.IO
io.on('connection', socket => {
  console.log('جهاز متصل:', socket.id);
  socket.on('disconnect', () => console.log('جهاز انقطع:', socket.id));
});
app.set('io', io);

// وضع الإنتاج: خدّم ملفات الفرونت
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'المسار غير موجود' });
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ السيرفر يعمل على http://0.0.0.0:${PORT}`);
});