/**
 * server/routes/reports.js
 * تقارير المبيعات — مفلترة بالتاريخ
 */

const express = require('express');
const db      = require('../db/db');
const router  = express.Router();

// GET /api/reports?from=2024-01-01&to=2024-12-31
// إذا لم يُحدَّد التاريخ يُرجع اليوم الحالي
router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const from  = req.query.from || today;
    const to    = req.query.to   || today;

    // ── مبيعات يومية ─────────────────────────────────────
    const daily = db.prepare(`
      SELECT
        DATE(paid_at)      AS date,
        COUNT(*)           AS orders_count,
        SUM(amount)        AS total_revenue,
        AVG(amount)        AS avg_order
      FROM payments
      WHERE DATE(paid_at) BETWEEN ? AND ?
      GROUP BY DATE(paid_at)
      ORDER BY date DESC
    `).all(from, to);

    // ── إجمالي الفترة ────────────────────────────────────
    const summary = db.prepare(`
      SELECT
        COUNT(*)  AS total_orders,
        SUM(amount) AS total_revenue,
        AVG(amount) AS avg_order
      FROM payments
      WHERE DATE(paid_at) BETWEEN ? AND ?
    `).get(from, to);

    // ── توزيع طرق الدفع ──────────────────────────────────
    const byMethod = db.prepare(`
      SELECT
        method,
        COUNT(*)    AS count,
        SUM(amount) AS total
      FROM payments
      WHERE DATE(paid_at) BETWEEN ? AND ?
      GROUP BY method
    `).all(from, to);

    // ── الأصناف الأكثر طلباً ─────────────────────────────
    const topItems = db.prepare(`
      SELECT
        m.name_ar,
        m.name_en,
        m.category,
        SUM(oi.quantity)            AS total_qty,
        SUM(oi.quantity * m.price)  AS total_revenue
      FROM order_items oi
      JOIN menu_items m  ON m.id  = oi.menu_item_id
      JOIN orders o      ON o.id  = oi.order_id
      JOIN payments p    ON p.order_id = o.id
      WHERE DATE(p.paid_at) BETWEEN ? AND ?
      GROUP BY m.id
      ORDER BY total_qty DESC
      LIMIT 10
    `).all(from, to);

    res.json({
      period:   { from, to },
      summary:  {
        total_orders:   summary.total_orders  || 0,
        total_revenue:  summary.total_revenue || 0,
        avg_order:      summary.avg_order     || 0,
      },
      daily,
      by_method: byMethod,
      top_items: topItems,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;