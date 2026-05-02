/**
 * pages/KitchenDisplay.jsx
 *
 * عمودان:
 *  👨‍🍳 قيد التحضير (confirmed) → زر "جاهز"
 *  ✅ جاهز للتسليم  (ready)     → ينتظر النادل
 */

import { useState, useEffect } from 'react';
import axios        from 'axios';
import socket       from '../services/socket';
import { useSound } from '../hooks/useSound';
import KitchenStats from '../components/kitchen/KitchenStats';
import KitchenOrderCard from '../components/kitchen/KitchenOrderCard';
import styles       from './KitchenDisplay.module.css';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';
const token  = () => localStorage.getItem('restaurant_token') || '';

export default function KitchenDisplay() {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [lang,      setLang]      = useState('ar');
  const [connected, setConnected] = useState(true);
  const { play }                  = useSound();

  // ── جلب الطلبات: confirmed + ready ─────────────────────────
  const fetchOrders = () => {
    // نجلب بطريقتين ونجمعهما: confirmed و ready
    Promise.all([
      axios.get(`${SERVER}/api/orders?view=kitchen`, {
        headers: { Authorization: `Bearer ${token()}` }
      }),
      axios.get(`${SERVER}/api/orders?view=kitchen_ready`, {
        headers: { Authorization: `Bearer ${token()}` }
      }),
    ])
      .then(([r1, r2]) => {
        const combined = [...(r1.data || []), ...(r2.data || [])];
        // أزِل المكررات
        const unique = combined.filter(
          (o, i, arr) => arr.findIndex(x => x.id === o.id) === i
        );
        setOrders(unique);
      })
      .catch(() => {
        // fallback: جلب كل الطلبات النشطة
        axios.get(`${SERVER}/api/orders?view=waiter`, {
          headers: { Authorization: `Bearer ${token()}` }
        })
          .then(r => setOrders(
            (r.data || []).filter(o => ['confirmed','ready'].includes(o.status))
          ));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  // ── Socket.IO ───────────────────────────────────────────────
  useEffect(() => {
    // النادل أكّد → طلب جديد للمطبخ
    socket.on('order:to_kitchen', order => {
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev;
        play();
        return [order, ...prev];
      });
    });

    // تحديث عام للحالة
    socket.on('order:status_changed', ({ id, status }) => {
      if (status === 'confirmed') {
        // أضِف إذا لم يكن موجوداً
        fetchOrders();
      } else if (status === 'ready') {
        // حدّث الحالة في المكان
        setOrders(prev =>
          prev.map(o => String(o.id) === String(id) ? { ...o, status: 'ready' } : o)
        );
      } else if (['delivered', 'paid'].includes(status)) {
        setOrders(prev => prev.filter(o => String(o.id) !== String(id)));
      }
    });

    socket.on('order:paid', ({ id }) => {
      setOrders(prev => prev.filter(o => String(o.id) !== String(id)));
    });

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('order:to_kitchen');
      socket.off('order:status_changed');
      socket.off('order:paid');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [play]);

  // ── تحديث الحالة إلى ready ──────────────────────────────────
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.patch(
        `${SERVER}/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      // حدّث محلياً فوراً بدون انتظار السوكيت
      setOrders(prev =>
        prev.map(o => String(o.id) === String(orderId) ? { ...o, status } : o)
      );
    } catch (err) {
      console.error('فشل التحديث:', err);
    }
  };

  const T = {
    ar: {
      preparing:  '👨‍🍳 قيد التحضير',
      ready:      '✅ جاهز للتسليم',
      noItems:    'لا توجد طلبات',
      loading:    'جاري التحميل...',
      offline:    '⚠ انقطع الاتصال بالسيرفر',
    },
    en: {
      preparing:  '👨‍🍳 Preparing',
      ready:      '✅ Ready',
      noItems:    'No orders',
      loading:    'Loading...',
      offline:    '⚠ Disconnected',
    },
  }[lang];

  const preparing = orders.filter(o => o.status === 'confirmed');
  const ready     = orders.filter(o => o.status === 'ready');

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>{T.loading}</p>
    </div>
  );

  return (
    <div className={styles.page} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* شريط الإحصائيات */}
      <KitchenStats orders={orders} lang={lang} />

      {/* شريط الانقطاع */}
      {!connected && <div className={styles.offlineBanner}>{T.offline}</div>}

      {/* زر اللغة */}
      <button
        className={styles.langBtn}
        onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
      >
        {lang === 'ar' ? 'EN' : 'عر'}
      </button>

      {/* العمودان */}
      <div className={styles.columns}>

        {/* عمود 1: قيد التحضير */}
        <div className={styles.column}>
          <div className={styles.colHead} style={{ borderColor:'#3B82F6', background:'rgba(59,130,246,.1)' }}>
            <span className={styles.colDot} style={{ background:'#3B82F6' }} />
            <span className={styles.colTitle}>{T.preparing}</span>
            <span className={styles.colCount} style={{ background:'rgba(59,130,246,.2)', color:'#60A5FA' }}>
              {preparing.length}
            </span>
          </div>
          <div className={styles.cards}>
            {preparing.length === 0
              ? <div className={styles.empty}>{T.noItems}</div>
              : preparing.map(order => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  lang={lang}
                />
              ))
            }
          </div>
        </div>

        {/* فاصل */}
        <div className={styles.divider} />

        {/* عمود 2: جاهز للتسليم */}
        <div className={styles.column}>
          <div className={styles.colHead} style={{ borderColor:'#10B981', background:'rgba(16,185,129,.1)' }}>
            <span className={styles.colDot} style={{ background:'#10B981' }} />
            <span className={styles.colTitle}>{T.ready}</span>
            <span className={styles.colCount} style={{ background:'rgba(16,185,129,.2)', color:'#34D399' }}>
              {ready.length}
            </span>
          </div>
          <div className={styles.cards}>
            {ready.length === 0
              ? <div className={styles.empty}>{T.noItems}</div>
              : ready.map(order => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  lang={lang}
                />
              ))
            }
          </div>
        </div>

      </div>
    </div>
  );
}