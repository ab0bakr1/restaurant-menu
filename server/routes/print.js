/**
 * server/routes/print.js
 * طباعة الفاتورة وتسجيل الدفع
 * الحالة النهائية: paid (بدلاً من delivered)
 */

const express = require('express');
const db      = require('../db/db');
const { staffOnly } = require('../middleware/authMiddleware');
const router  = express.Router();

// طباعة تذكرة المطبخ
router.post('/kitchen', staffOnly, (req, res) => {
  try {
    const { order_id } = req.body;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    const items = db.prepare(`
      SELECT oi.quantity, oi.notes, m.name_ar, m.name_en
      FROM order_items oi
      JOIN menu_items m ON m.id = oi.menu_item_id
      WHERE oi.order_id = ?
    `).all(order_id);

    console.log('\n====== تذكرة مطبخ ======');
    console.log('طاولة:', order.table_number, '| طلب:', order.id);
    items.forEach(i => {
      console.log(`  ${i.quantity}x  ${i.name_ar}`);
      if (i.notes) console.log(`     ملاحظة: ${i.notes}`);
    });
    console.log('========================\n');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تسجيل الدفع وإصدار الفاتورة
router.post('/invoice', staffOnly, (req, res) => {
  try {
    const { order_id, method, amount } = req.body;
    if (!order_id || !method || !amount) {
      return res.status(400).json({ error: 'بيانات الدفع غير مكتملة' });
    }

    // تسجيل الدفع
    db.prepare(
      'INSERT INTO payments (order_id, method, amount) VALUES (?, ?, ?)'
    ).run(order_id, method, amount);

    // تحديث الحالة لـ paid
    db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(order_id);

    // إشعار لحظي
    req.app.get('io').emit('order:paid',           { id: Number(order_id) });
    req.app.get('io').emit('order:status_changed', { id: Number(order_id), status: 'paid' });

    console.log(`\n✅ دفع مسجّل — طلب ${order_id} | ${method} | ${amount} ر.س\n`);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;