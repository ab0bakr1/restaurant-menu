// ✅ يستقبل كل شيء من CustomerMenu عبر props
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CartItem from './CartItem';
import styles from './CartDrawer.module.css';

export default function CartDrawer({
  isOpen, onClose, cartItems, menuItems,
  onAdd, onRemove, onSubmit, submitting
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const total = cartItems.reduce((sum, ci) => {
    const item = menuItems.find(m => m.id === ci.id);
    return sum + (item ? item.price * ci.qty : 0);
  }, 0);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.show : ''}`} onClick={onClose} />

      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.handle} />

        <div className={styles.head}>
          <h2 className={styles.title}>{t('cart')}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {cartItems.length === 0 ? (
            <div className={styles.empty}>
              <span>🛒</span>
              <p>{t('emptyCart')}</p>
              <small>{t('emptyCartSub')}</small>
            </div>
          ) : (
            cartItems.map(ci => {
              const item = menuItems.find(m => m.id === ci.id);
              if (!item) return null;
              return (
                <CartItem key={ci.id} item={item} qty={ci.qty} onAdd={onAdd} onRemove={onRemove} />
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>{t('total')}</span>
              <span className={styles.totalVal}>
                {total.toFixed(2)} {lang === 'ar' ? 'ر.س' : 'SAR'}
              </span>
            </div>
            <button className={styles.submitBtn} onClick={onSubmit} disabled={submitting}>
              {submitting ? t('sending') : t('submitOrder')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}