/**
 * server/routes/orders.js
 *
 * views:
 *   waiter        → pending + confirmed + ready
 *   kitchen       → confirmed فقط (قيد التحضير)
 *   kitchen_ready → ready فقط (جاهز للتسليم)
 *   cashier       → delivered فقط (ينتظر الدفع)
 */

const express    = require('express');
const db         = require('../db/db');
const { printKitchenTicket } = require('../services/printer');
const { staffOnly } = require('../middleware/authMiddleware');
const router     = express.Router();

// ── مساعد: جلب طلب مع أصنافه ──────────────────────────────
function getOrderWithItems(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return null;
  const items = db.prepare(`
    SELECT oi.quantity as qty, oi.notes,
           m.name_ar, m.name_en, m.price
    FROM order_items oi
    JOIN menu_items m ON m.id = oi.menu_item_id
    WHERE oi.order_id = ?
  `).all(orderId);
  return { ...order, items };
}

// ── GET /api/orders?view=... ────────────────────────────────
router.get('/', staffOnly, (req, res) => {
  try {
    const view = req.query.view || 'waiter';

    const STATUS_MAP = {
      waiter:        `o.status IN ('pending','confirmed','ready')`,
      kitchen:       `o.status = 'confirmed'`,
      kitchen_ready: `o.status = 'ready'`,
      cashier:       `o.status = 'delivered'`,
    };

    const statusFilter = STATUS_MAP[view] || STATUS_MAP.waiter;

    const orders = db.prepare(`
      SELECT o.*,
        GROUP_CONCAT(
          json_object(
            'name_ar', m.name_ar,
            'name_en', m.name_en,
            'price',   m.price,
            'qty',     oi.quantity,
            'notes',   oi.notes
          )
        ) as items_json
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN menu_items  m  ON m.id = oi.menu_item_id
      WHERE ${statusFilter}
      GROUP BY o.id
      ORDER BY o.created_at ASC
    `).all();

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/orders ────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { table_number, items } = req.body;
    if (!table_number || !items?.length) {
      return res.status(400).json({ error: 'table_number و items مطلوبان' });
    }

    const order = db.prepare(
      'INSERT INTO orders (table_number, status) VALUES (?, ?)'
    ).run(table_number, 'pending');

    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, menu_item_id, quantity, notes) VALUES (?, ?, ?, ?)'
    );
    items.forEach(item => {
      insertItem.run(order.lastInsertRowid, item.id, item.qty, item.notes || null);
    });

    const newOrder = {
      id:          order.lastInsertRowid,
      table_number,
      status:      'pending',
      items,
      created_at:  new Date().toISOString(),
    };

    req.app.get('io').emit('order:new', newOrder);
    res.json({ success: true, order_id: order.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/orders/:id/status ───────────────────────────
router.patch('/:id/status', staffOnly, (req, res) => {
  try {
    const { status } = req.body;
    const orderId    = req.params.id;

    const valid = ['confirmed', 'ready', 'delivered', 'paid', 'rejected'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);

    
    const order = getOrderWithItems(orderId);
    const io    = req.app.get('io');
    const { reason } = req.body;
    
    // أحداث مخصصة حسب الحالة
    if (status === 'confirmed') {
      io.emit('order:to_kitchen', order);
      printKitchenTicket(order).catch(console.error);
    }
    if (status === 'ready') {
      io.emit('order:ready_for_waiter', order);
    }
    if (status === 'delivered') {
      io.emit('order:to_cashier', order);
    }
    if (status === 'paid') {
      io.emit('order:paid', { id: Number(orderId), id_str: String(orderId) });
    }
    if (status === 'rejected') {
      // أرسل إشعار للعميل بسبب الرفض
      io.emit('order:rejected', {
        id:     Number(orderId),
        status: 'rejected',
        reason: reason || (lang === 'ar' ? 'تم رفض طلبك' : 'Order rejected'),
      });
    }

    // حدث عام
    io.emit('order:status_changed', { id: Number(orderId), status });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;