/**
 * server/routes/menu.js — محمي بـ JWT
 *
 * GET  /api/menu       → عام (العميل يجلب القائمة بدون token)
 * POST /api/menu       → admin فقط
 * PATCH /api/menu/:id  → admin فقط
 * DELETE /api/menu/:id → admin فقط
 */

const express    = require('express');
const db         = require('../db/db');
const { adminOnly } = require('../middleware/authMiddleware');
const router     = express.Router();

// ── عام: جلب القائمة ─────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const items = db.prepare(
      'SELECT * FROM menu_items ORDER BY category, name_ar'
    ).all();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── admin فقط: إضافة صنف ─────────────────────────────────────
router.post('/', adminOnly, (req, res) => {
  try {
    const { name_en, name_ar, desc_en, desc_ar, price, category, image_url } = req.body;
    if (!name_ar || !name_en || !price) {
      return res.status(400).json({ error: 'name_ar و name_en و price مطلوبة' });
    }
    const result = db.prepare(
      'INSERT INTO menu_items (name_en, name_ar, desc_en, desc_ar, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name_en, name_ar, desc_en||'', desc_ar||'', price, category||'mains', image_url||'');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── admin فقط: تعديل صنف ─────────────────────────────────────
router.patch('/:id', adminOnly, (req, res) => {
  try {
    const fields = req.body;
    const keys   = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ error: 'لا توجد بيانات' });

    const set  = keys.map(k => `${k} = ?`).join(', ');
    const vals = [...keys.map(k => fields[k]), req.params.id];
    db.prepare(`UPDATE menu_items SET ${set} WHERE id = ?`).run(...vals);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── admin فقط: حذف صنف ───────────────────────────────────────
router.delete('/:id', adminOnly, (req, res) => {
  try {
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;