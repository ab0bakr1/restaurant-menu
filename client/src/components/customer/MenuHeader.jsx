// ✅ يستقبل props فقط — لا منطق داخله
import { useTranslation } from 'react-i18next';
import styles from './MenuHeader.module.css';

export default function MenuHeader({ tableNumber, cartCount, onCartOpen, onLangToggle }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>🍽</span>
          <div>
            <h1 className={styles.name}>{lang === 'ar' ? 'مطعمنا' : 'Our Restaurant'}</h1>
            <p className={styles.table}>{lang === 'ar' ? `طاولة رقم ${tableNumber}` : `Table ${tableNumber}`}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.langBtn} onClick={onLangToggle}>
            {lang === 'ar' ? 'EN' : 'عر'}
          </button>
          <button className={styles.cartBtn} onClick={onCartOpen}>
            🛒
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}