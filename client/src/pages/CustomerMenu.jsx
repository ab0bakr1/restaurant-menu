/**
 * pages/CustomerMenu.jsx — مع التحقق الجغرافي
 *
 * عند ضغط "إرسال الطلب":
 *  1. يفتح GeofenceGate للتحقق من الموقع
 *  2. إذا داخل المطعم → يُرسل الطلب
 *  3. إذا خارج المطعم → يعرض رسالة واضحة
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios         from 'axios';
import { io }        from 'socket.io-client';
import { useTranslation } from 'react-i18next';

import MenuHeader        from '../components/customer/MenuHeader';
import CategoryTabs      from '../components/customer/CategoryTabs';
import MenuGrid          from '../components/customer/MenuGrid';
import CartDrawer        from '../components/customer/CartDrawer';
import OrderStatusBanner from '../components/customer/OrderStatusBanner';
import GeofenceGate      from '../components/customer/GeofenceGate';
import styles            from './CustomerMenu.module.css';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';
const socket = io(SERVER);

export default function CustomerMenu() {
  const { tableNumber } = useParams();
  const { i18n }        = useTranslation();

  const [menuItems,      setMenuItems]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [cart,           setCart]           = useState({});
  const [cartOpen,       setCartOpen]       = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [orderId,        setOrderId]        = useState(null);
  const [orderStatus,    setOrderStatus]    = useState(null);
  const [submitting,     setSubmitting]     = useState(false);

  // ── حالة التحقق الجغرافي ──────────────────────────────────
  const [showGeofence,   setShowGeofence]   = useState(false);

  const lang = i18n.language;

  useEffect(() => {
    axios.get(`${SERVER}/api/menu`)
      .then(r => setMenuItems(r.data.filter(i => i.is_active)))
      .catch(() => setError('تعذّر تحميل القائمة'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    socket.on('order:status_changed', ({ id, status }) => {
      if (String(id) === String(orderId)) setOrderStatus(status);
    });
    return () => socket.off('order:status_changed');
  }, [orderId]);

  useEffect(() => {
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleAdd = useCallback((item) => {
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  }, []);

  const handleRemove = useCallback((item) => {
    setCart(prev => {
      const newQty = (prev[item.id] || 0) - 1;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return { ...prev, [item.id]: newQty };
    });
  }, []);

  // ── المستخدم يضغط "إرسال الطلب" ← نفتح GeofenceGate أولاً
  const handleSubmitRequest = () => {
    setCartOpen(false);       // أغلق درج السلة
    setShowGeofence(true);    // افتح شاشة التحقق
  };

  // ── GeofenceGate أكّدت أن العميل داخل المطعم ──────────────
  const handleGeofenceAllowed = async () => {
    setShowGeofence(false);
    await doSubmitOrder();
  };

  // ── الإرسال الفعلي ─────────────────────────────────────────
  const doSubmitOrder = async () => {
    const items = Object.entries(cart).map(([id, qty]) => ({
      id: Number(id), qty,
    }));
    if (!items.length) return;

    setSubmitting(true);
    try {
      const res = await axios.post(`${SERVER}/api/orders`, {
        table_number: tableNumber,
        items,
      });
      setOrderId(res.data.order_id);
      setOrderStatus('pending');
      setCart({});
    } catch {
      alert(lang === 'ar'
        ? 'فشل إرسال الطلب — حاول مجدداً'
        : 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  const cartCount  = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartItems  = Object.entries(cart).map(([id, qty]) => ({ id: Number(id), qty }));
  const categories = [...new Set(menuItems.map(i => i.category).filter(Boolean))];
  const filtered   = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory);

  if (loading) return (
    <div className={styles.center}>
      <div className={styles.spinner} />
      <p>{lang === 'ar' ? 'جاري تحميل القائمة...' : 'Loading menu...'}</p>
    </div>
  );

  if (error) return (
    <div className={styles.center}>
      <span style={{ fontSize:44 }}>⚠️</span>
      <p>{error}</p>
    </div>
  );

  return (
    <div className={styles.page}>

      <MenuHeader
        tableNumber={tableNumber}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onLangToggle={() => i18n.changeLanguage(lang === 'ar' ? 'en' : 'ar')}
      />

      {orderStatus && (
        <OrderStatusBanner
          orderId={orderId}
          status={orderStatus}
          onNewOrder={() => { setOrderId(null); setOrderStatus(null); }}
        />
      )}

      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      <MenuGrid
        items={filtered}
        cart={cart}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />

      {/* درج السلة — زر الإرسال يفتح GeofenceGate */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        menuItems={menuItems}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onSubmit={handleSubmitRequest}   // ← يفتح التحقق الجغرافي
        submitting={submitting}
      />

      {/* التحقق الجغرافي */}
      {showGeofence && (
        <GeofenceGate
          lang={lang}
          onAllowed={handleGeofenceAllowed}
          onCancel={() => {
            setShowGeofence(false);
            setCartOpen(true);   // أعِد فتح السلة
          }}
        />
      )}

      {cartCount > 0 && !cartOpen && !orderStatus && (
        <button
          className={styles.floatBtn}
          onClick={() => setCartOpen(true)}
        >
          <span>🛒 {lang === 'ar' ? 'عرض الطلب' : 'View Order'}</span>
          <span className={styles.floatBadge}>{cartCount}</span>
        </button>
      )}
    </div>
  );
}