/**
 * components/waiter/WaiterOrderCard.jsx
 * مع زر رفض الطلب ومربع السبب
 */
import { useState } from 'react';
import styles from './WaiterOrderCard.module.css';

const STATUS_CONFIG = {
  pending:   { bg:'#FFF8E1', border:'#F59E0B', label_ar:'جديد',       label_en:'New',        icon:'🆕' },
  confirmed: { bg:'#E3F2FD', border:'#3B82F6', label_ar:'في المطبخ',  label_en:'In Kitchen', icon:'👨‍🍳' },
  ready:     { bg:'#E8F5E9', border:'#10B981', label_ar:'جاهز ✓',     label_en:'Ready ✓',    icon:'✅' },
  rejected:  { bg:'#FFEBEE', border:'#E53935', label_ar:'مرفوض',      label_en:'Rejected',   icon:'❌' },
};

const REJECT_REASONS = {
  ar: ['الصنف غير متاح حالياً', 'المطبخ مشغول', 'انتهى المخزون', 'سبب آخر'],
  en: ['Item unavailable',       'Kitchen busy', 'Out of stock',   'Other reason'],
};

export default function WaiterOrderCard({ order, onAction, lang }) {
  const [loading,      setLoading]      = useState(false);
  const [showReject,   setShowReject]   = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const cfg   = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const items = parseItems(order.items_json);

  const T = {
    ar: {
      table:        'طاولة',
      order:        'طلب #',
      confirm:      '✓ تأكيد وإرسال للمطبخ',
      deliver:      '🛎 تسليم للعميل',
      reject:       '✗ رفض الطلب',
      rejectTitle:  'سبب الرفض',
      rejectConfirm:'تأكيد الرفض',
      rejectCancel: 'إلغاء',
      otherReason:  'اكتب السبب...',
      inKitchen:    '⏳ قيد التحضير في المطبخ...',
      rejected:     'تم رفض الطلب',
    },
    en: {
      table:        'Table',
      order:        'Order #',
      confirm:      '✓ Confirm & Send to Kitchen',
      deliver:      '🛎 Deliver to Customer',
      reject:       '✗ Reject Order',
      rejectTitle:  'Reason for rejection',
      rejectConfirm:'Confirm Rejection',
      rejectCancel: 'Cancel',
      otherReason:  'Write reason...',
      inKitchen:    '⏳ Being prepared in kitchen...',
      rejected:     'Order rejected',
    },
  }[lang];

  const handleAction = async (newStatus, extra = {}) => {
    setLoading(true);
    await onAction(order.id, newStatus, extra);
    setLoading(false);
  };

  const handleRejectConfirm = async () => {
    const reason = rejectReason === (lang === 'ar' ? 'سبب آخر' : 'Other reason')
      ? customReason
      : rejectReason;
    if (!reason) return;
    setShowReject(false);
    await handleAction('rejected', { reason });
  };

  const reasons = REJECT_REASONS[lang] || REJECT_REASONS.ar;

  return (
    <div
      className={`${styles.card} ${order.status === 'ready' ? styles.pulse : ''}`}
      style={{ '--bg': cfg.bg, '--border': cfg.border }}
    >
      {/* رأس البطاقة */}
      <div className={styles.head}>
        <div className={styles.left}>
          <span className={styles.icon}>{cfg.icon}</span>
          <div>
            <div className={styles.tableNum}>
              {T.table} <strong>{order.table_number}</strong>
            </div>
            <div className={styles.orderId}>{T.order}{order.id}</div>
          </div>
        </div>
        <div className={styles.right}>
          <span className={styles.statusBadge}
            style={{ background: cfg.border + '22', color: cfg.border }}>
            {lang === 'ar' ? cfg.label_ar : cfg.label_en}
          </span>
          <span className={styles.time}>
            {new Date(order.created_at).toLocaleTimeString(
              lang === 'ar' ? 'ar-SA' : 'en-US',
              { hour: '2-digit', minute: '2-digit' }
            )}
          </span>
        </div>
      </div>

      {/* أصناف الطلب */}
      <ul className={styles.items}>
        {items.map((item, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.qty}>{item.qty}×</span>
            <span className={styles.name}>
              {lang === 'ar' ? item.name_ar : (item.name_en || item.name_ar)}
            </span>
            {item.notes && <span className={styles.note}>({item.notes})</span>}
          </li>
        ))}
      </ul>

      {/* الأزرار */}
      <div className={styles.actions}>

        {/* pending → تأكيد أو رفض */}
        {order.status === 'pending' && !showReject && (
          <>
            <button
              className={`${styles.btn} ${styles.btnConfirm}`}
              onClick={() => handleAction('confirmed')}
              disabled={loading}
            >
              {loading ? '...' : T.confirm}
            </button>
            <button
              className={`${styles.btn} ${styles.btnReject}`}
              onClick={() => setShowReject(true)}
              disabled={loading}
            >
              {T.reject}
            </button>
          </>
        )}

        {/* confirmed → قيد التحضير */}
        {order.status === 'confirmed' && (
          <div className={styles.waiting}>{T.inKitchen}</div>
        )}

        {/* ready → تسليم */}
        {order.status === 'ready' && (
          <button
            className={`${styles.btn} ${styles.btnDeliver}`}
            onClick={() => handleAction('delivered')}
            disabled={loading}
          >
            {loading ? '...' : T.deliver}
          </button>
        )}

        {/* rejected */}
        {order.status === 'rejected' && (
          <div className={styles.rejectedMsg}>{T.rejected}</div>
        )}
      </div>

      {/* مربع سبب الرفض */}
      {showReject && (
        <div className={styles.rejectBox}>
          <p className={styles.rejectTitle}>{T.rejectTitle}</p>
          <div className={styles.reasonsList}>
            {reasons.map(r => (
              <button
                key={r}
                className={`${styles.reasonBtn} ${rejectReason === r ? styles.reasonOn : ''}`}
                onClick={() => setRejectReason(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* حقل السبب المخصص */}
          {rejectReason === reasons[reasons.length - 1] && (
            <input
              className={styles.customInput}
              placeholder={T.otherReason}
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              autoFocus
            />
          )}

          <div className={styles.rejectActions}>
            <button
              className={styles.rejectConfirmBtn}
              onClick={handleRejectConfirm}
              disabled={!rejectReason || loading}
            >
              {T.rejectConfirm}
            </button>
            <button
              className={styles.rejectCancelBtn}
              onClick={() => { setShowReject(false); setRejectReason(''); }}
            >
              {T.rejectCancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function parseItems(items_json) {
  if (!items_json) return [];
  try {
    const t = String(items_json).trim();
    try { const p = JSON.parse(t); return Array.isArray(p) ? p : [p]; } catch {}
    return JSON.parse('[' + t + ']');
  } catch { return []; }
}