/**
 * pages/WaiterApp.jsx
 *
 * التدفق:
 *  pending  → النادل يؤكد → confirmed (يذهب للمطبخ)
 *  ready    → النادل يسلّم → delivered (يذهب للكاشير)
 *
 * الأعمدة الثلاثة:
 *  🆕 جديد (pending)    → زر "تأكيد وإرسال للمطبخ"
 *  👨‍🍳 في المطبخ (confirmed) → "قيد التحضير..."
 *  ✅ جاهز (ready)      → زر "تسليم للعميل"
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api             from '../services/api';
import socket          from '../services/socket';
import { authService } from '../services/authService';
import { useSound }    from '../hooks/useSound';
import WaiterOrderCard from '../components/waiter/WaiterOrderCard';
import styles          from './WaiterApp.module.css';

export default function WaiterApp() {
  const navigate       = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading,setLoading]  = useState(true);
  const [lang,   setLang]     = useState('ar');
  const { play }              = useSound();

  // ── جلب طلبات النادل (pending + confirmed + ready) ────────
  useEffect(() => {
    api.get('/api/orders?view=waiter')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Socket.IO ──────────────────────────────────────────────
  useEffect(() => {
    // طلب جديد من العميل
    socket.on('order:new', order => {
      setOrders(prev => [order, ...prev]);
      play();
    });

    // المطبخ جهّز الطلب → تحديث الحالة + تنبيه
    socket.on('order:ready_for_waiter', order => {
      setOrders(prev =>
        prev.map(o => String(o.id) === String(order.id)
          ? { ...o, status: 'ready' }
          : o
        )
      );
      play();
    });

    // تحديث عام للحالات الأخرى
    socket.on('order:status_changed', ({ id, status }) => {
      if (status === 'rejected' || status === 'delivered' || status === 'paid') {
        // أزِل من قائمة النادل
        setOrders(prev => prev.filter(o => String(o.id) !== String(id)));
      } else {
        setOrders(prev =>
          prev.map(o => String(o.id) === String(id) ? { ...o, status } : o)
        );
      }
    });

    return () => {
      socket.off('order:new');
      socket.off('order:ready_for_waiter');
      socket.off('order:status_changed');
    };
  }, [play]);

  // ── تحديث حالة الطلب ──────────────────────────────────────
  const handleAction = useCallback(async (orderId, newStatus, extra = {}) => {
  try {
    await api.patch(`/api/orders/${orderId}/status`, {
      status: newStatus,
      ...extra,           // { reason: 'سبب الرفض' }
    });
  } catch (err) {
    console.error('فشل التحديث:', err);
  }
}, []);

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  // ── تقسيم الطلبات للأعمدة ─────────────────────────────────
  const pending   = orders.filter(o => o.status === 'pending');
  const inKitchen = orders.filter(o => o.status === 'confirmed');
  const ready     = orders.filter(o => o.status === 'ready');

  const T = {
    ar: {
      title:     'لوحة النادل',
      pending:   '🆕 جديد',
      kitchen:   '👨‍🍳 في المطبخ',
      ready:     '✅ جاهز للتسليم',
      noOrders:  'لا توجد طلبات',
      loading:   'جاري التحميل...',
      logout:    'خروج',
    },
    en: {
      title:     'Waiter Dashboard',
      pending:   '🆕 New',
      kitchen:   '👨‍🍳 In Kitchen',
      ready:     '✅ Ready',
      noOrders:  'No orders',
      loading:   'Loading...',
      logout:    'Logout',
    },
  }[lang];

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>{T.loading}</p>
    </div>
  );

  return (
    <div className={styles.page} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* رأس الصفحة */}
      <header className={styles.header}>
        <h1 className={styles.title}>{T.title}</h1>
        <div className={styles.headerRight}>
          <div className={styles.counts}>
            <span className={styles.countBadge} style={{ background:'#FEF3C7', color:'#92400E' }}>
              {pending.length} {T.pending}
            </span>
            <span className={styles.countBadge} style={{ background:'#DBEAFE', color:'#1E40AF' }}>
              {inKitchen.length} {T.kitchen}
            </span>
            <span className={styles.countBadge} style={{ background:'#D1FAE5', color:'#065F46' }}>
              {ready.length} {T.ready}
            </span>
          </div>
          <button className={styles.langBtn}
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}>
            {lang === 'ar' ? 'EN' : 'عر'}
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>{T.logout}</button>
        </div>
      </header>

      {/* الأعمدة الثلاثة */}
      <div className={styles.columns}>

        {/* عمود 1: طلبات جديدة */}
        <div className={styles.column}>
          <div className={styles.colHead} style={{ borderColor:'#F59E0B' }}>
            <span className={styles.colDot} style={{ background:'#F59E0B' }} />
            <span>{T.pending}</span>
            <span className={styles.colCount}>{pending.length}</span>
          </div>
          <div className={styles.cards}>
            {pending.length === 0
              ? <div className={styles.empty}>{T.noOrders}</div>
              : pending.map(o => (
                <WaiterOrderCard key={o.id} order={o} onAction={handleAction} lang={lang} />
              ))
            }
          </div>
        </div>

        {/* عمود 2: في المطبخ */}
        <div className={styles.column}>
          <div className={styles.colHead} style={{ borderColor:'#3B82F6' }}>
            <span className={styles.colDot} style={{ background:'#3B82F6' }} />
            <span>{T.kitchen}</span>
            <span className={styles.colCount}>{inKitchen.length}</span>
          </div>
          <div className={styles.cards}>
            {inKitchen.length === 0
              ? <div className={styles.empty}>{T.noOrders}</div>
              : inKitchen.map(o => (
                <WaiterOrderCard key={o.id} order={o} onAction={handleAction} lang={lang} />
              ))
            }
          </div>
        </div>

        {/* عمود 3: جاهز للتسليم */}
        <div className={styles.column}>
          <div className={styles.colHead} style={{ borderColor:'#10B981' }}>
            <span className={styles.colDot} style={{ background:'#10B981' }} />
            <span>{T.ready}</span>
            <span className={styles.colCount}>{ready.length}</span>
          </div>
          <div className={styles.cards}>
            {ready.length === 0
              ? <div className={styles.empty}>{T.noOrders}</div>
              : ready.map(o => (
                <WaiterOrderCard key={o.id} order={o} onAction={handleAction} lang={lang} />
              ))
            }
          </div>
        </div>

      </div>
    </div>
  );
}