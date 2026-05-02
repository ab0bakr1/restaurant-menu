/**
 * server/routes/payments.js
 * جلب الفواتير المدفوعة — للأدمن فقط
 */
const express    = require('express');
const db         = require('../db/db');
const { adminOnly } = require('../middleware/authMiddleware');
const router     = express.Router();

// GET /api/payments?from=2024-01-01&to=2024-12-31
router.get('/', adminOnly, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const from  = req.query.from || today;
    const to    = req.query.to   || today;

    const payments = db.prepare(`
      SELECT
        p.id,
        p.order_id,
        p.method,
        p.amount,
        p.paid_at,
        o.table_number
      FROM payments p
      LEFT JOIN orders o ON o.id = p.order_id
      WHERE DATE(p.paid_at) BETWEEN ? AND ?
      ORDER BY p.paid_at DESC
    `).all(from, to);

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;