/**
 * pages/Cashier.jsx — المحدّث
 *
 * يرى الكاشير الطلبات بعد تسليم النادل (delivered)
 * بعد الدفع → status = 'paid' → يختفي من القائمة
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api             from '../services/api';
import socket          from '../services/socket';
import { authService } from '../services/authService';
import { useSound }    from '../hooks/useSound';
import OrdersList      from '../components/cashier/OrdersList';
import InvoiceView     from '../components/cashier/InvoiceView';
import styles          from './Cashier.module.css';

export default function Cashier() {
  const navigate = useNavigate();
  const [orders,    setOrders]    = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [lang,      setLang]      = useState('ar');
  const { play }                  = useSound();

  useEffect(() => {
    // الكاشير يجلب الطلبات المسلّمة فقط
    api.get('/api/orders?view=cashier')
      .then(r => {
        console.log('cashier orders:', r.data.length, r.data);
        setOrders(r.data);
      })
      .catch(err => console.error('cashier fetch error:', err.response?.data || err.message));
    api.get('/api/menu').then(r => setMenuItems(r.data));

    // طلب جديد وصل للكاشير (النادل سلّمه)
    socket.on('order:to_cashier', order => {
      setOrders(prev => [order, ...prev]);
      play();
    });

    // طلب دُفع → اختفى
    socket.on('order:paid', ({ id }) => {
      setOrders(prev => prev.filter(o => String(o.id) !== String(id)));
      setSelected(s => s && String(s.id) === String(id) ? null : s);
    });

    return () => {
      socket.off('order:to_cashier');
      socket.off('order:paid');
    };
  }, [play]);

  // بعد تأكيد الدفع → status = 'paid'
  const handlePaid = async (orderId) => {
    await api.patch(`/api/orders/${orderId}/status`, { status: 'paid' });
    setOrders(prev => prev.filter(o => String(o.id) !== String(orderId)));
    setSelected(null);
  };

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  const T = {
    ar: { title:'الكاشير', noSelection:'اختر طلباً من القائمة', logout:'خروج', pending:`${orders.length} طلب بانتظار الدفع` },
    en: { title:'Cashier',  noSelection:'Select an order', logout:'Logout', pending:`${orders.length} orders pending payment` },
  }[lang];

  return (
    <div className={styles.page} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>💰 {T.title}</h1>
          {orders.length > 0 && (
            <span className={styles.pendingBadge}>{T.pending}</span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.langBtn}
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}>
            {lang === 'ar' ? 'EN' : 'عر'}
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>{T.logout}</button>
        </div>
      </header>

      <div className={styles.body}>
        <OrdersList
          orders={orders}
          selected={selected}
          onSelect={setSelected}
          lang={lang}
        />

        {selected ? (
          <InvoiceView
            order={selected}
            menuItems={menuItems}
            onPaid={handlePaid}
            lang={lang}
          />
        ) : (
          <div className={styles.empty}>
            <span>🧾</span>
            <p>{T.noSelection}</p>
          </div>
        )}
      </div>
    </div>
  );
}