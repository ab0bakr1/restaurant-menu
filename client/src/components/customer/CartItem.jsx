// ✅ يستقبل props فقط
import { useTranslation } from 'react-i18next';
import styles from './CartItem.module.css';

export default function CartItem({ item, qty, onAdd, onRemove }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const name = lang === 'ar' ? item.name_ar : item.name_en;

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.unit}>{item.price.toFixed(2)} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
      </div>
      <div className={styles.right}>
        <span className={styles.total}>{(item.price * qty).toFixed(2)}</span>
        <div className={styles.ctrl}>
          <button onClick={() => onRemove(item)}>−</button>
          <span>{qty}</span>
          <button onClick={() => onAdd(item)}>+</button>
        </div>
      </div>
    </div>
  );
}