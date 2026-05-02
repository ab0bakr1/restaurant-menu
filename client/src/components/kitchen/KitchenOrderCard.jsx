/**
 * components/kitchen/KitchenOrderCard.jsx
 */
import { useState, useEffect } from 'react';
import styles from './KitchenOrderCard.module.css';

const STATUS_CONFIG = {
  confirmed: { bg: '#E3F2FD', border: '#3B82F6', dot: '#3B82F6', ar: 'قيد التحضير', en: 'Preparing' },
  ready:     { bg: '#E8F5E9', border: '#10B981', dot: '#10B981', ar: 'جاهز',         en: 'Ready'     },
};

function useElapsed(createdAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(createdAt).getTime();
    const tick  = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ✅ parseItems مُصلَح — يتعامل مع جميع صيغ items_json
function parseItems(items_json) {
  if (!items_json) return [];

  // إذا كان array بالفعل
  if (Array.isArray(items_json)) return items_json;

  // إذا كان string JSON كامل
  if (typeof items_json === 'string') {
    const trimmed = items_json.trim();

    // محاولة 1: JSON array مباشر [ {...}, {...} ]
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {}

    // محاولة 2: GROUP_CONCAT بدون أقواس خارجية {...},{...}
    try {
      const parsed = JSON.parse('[' + trimmed + ']');
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    // محاولة 3: فصل يدوي بـ },{ وإعادة البناء
    try {
      const parts = trimmed
        .replace(/^\[|\]$/g, '')      // أزِل [ ] إذا وُجدت
        .split(/\},\s*\{/)            // افصل بين الكائنات
        .map((part, i, arr) => {
          let s = part.trim();
          if (!s.startsWith('{')) s = '{' + s;
          if (!s.endsWith('}'))   s = s + '}';
          return s;
        });

      return parts.map(p => {
        try { return JSON.parse(p); }
        catch { return null; }
      }).filter(Boolean);
    } catch {}
  }

  return [];
}

export default function KitchenOrderCard({ order, onUpdateStatus, lang }) {
  const [loading, setLoading] = useState(false);
  const elapsed  = useElapsed(order.created_at);
  const cfg      = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;
  const isUrgent = elapsed > 600;
  const items    = parseItems(order.items_json);

  const T = {
    ar: { table:'طاولة', ready:'✓ جاهز للتسليم', urgent:'متأخر!' },
    en: { table:'Table',  ready:'✓ Mark Ready',   urgent:'Late!'   },
  }[lang];

  const handleReady = async () => {
    setLoading(true);
    await onUpdateStatus(order.id, 'ready');
    setLoading(false);
  };

  return (
    <div
      className={`${styles.card} ${isUrgent ? styles.urgent : ''}`}
      style={{ '--card-bg': cfg.bg, '--card-border': cfg.border }}
    >
      {/* رأس البطاقة */}
      <div className={styles.head}>
        <div className={styles.tableInfo}>
          <span className={styles.dot} style={{ background: cfg.dot }} />
          <span className={styles.tableNum}>{T.table} <strong>{order.table_number}</strong></span>
          <span className={styles.orderId}>#{order.id}</span>
        </div>
        <div className={`${styles.timer} ${isUrgent ? styles.timerUrgent : ''}`}>
          {isUrgent && <span className={styles.urgentLabel}>{T.urgent}</span>}
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* أصناف الطلب */}
      {items.length > 0 ? (
        <ul className={styles.items}>
          {items.map((item, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.qty}>{item.qty || item.quantity || 1}×</span>
              <span className={styles.name}>{item.name_ar || item.name_en || '—'}</span>
              {item.notes && <span className={styles.note}>({item.notes})</span>}
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.noItems}>لا تفاصيل متاحة</div>
      )}

      {/* زر جاهز — يظهر فقط في عمود "قيد التحضير" */}
      {order.status === 'confirmed' && (
        <button
          className={styles.btnReady}
          onClick={handleReady}
          disabled={loading}
        >
          {loading ? '...' : T.ready}
        </button>
      )}

      {/* علامة جاهز في العمود الثاني */}
      {order.status === 'ready' && (
        <div className={styles.readyBadge}>✅ جاهز — في انتظار النادل</div>
      )}
    </div>
  );
}