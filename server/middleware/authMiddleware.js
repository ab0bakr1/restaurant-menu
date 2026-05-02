/**
 * server/middleware/authMiddleware.js
 * يتحقق من JWT token في كل طلب محمي
 *
 * الاستخدام في routes:
 *   const { protect, adminOnly } = require('../middleware/authMiddleware');
 *
 *   router.post('/',       protect,    handler);  // أي مستخدم مسجّل
 *   router.delete('/:id',  adminOnly,  handler);  // admin فقط
 */

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'restaurant-super-secret-2024-change-this';

// ── التحقق من الـ token ──────────────────────────────────────
const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'غير مصرح — يجب تسجيل الدخول' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'انتهت صلاحية الجلسة — سجّل الدخول مجدداً' });
    }
    return res.status(403).json({ error: 'token غير صالح' });
  }
};

// ── Admin فقط ────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  // يمر أولاً عبر protect ثم يتحقق من الدور
  protect(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'هذه العملية للمدير فقط' });
    }
    next();
  });
};

// ── Waiter أو Admin ──────────────────────────────────────────
const staffOnly = (req, res, next) => {
  protect(req, res, () => {
    const allowed = ['admin', 'waiter', 'cashier'];
    if (!allowed.includes(req.user?.role)) {
      return res.status(403).json({ error: 'غير مصرح' });
    }
    next();
  });
};

module.exports = { protect, adminOnly, staffOnly };