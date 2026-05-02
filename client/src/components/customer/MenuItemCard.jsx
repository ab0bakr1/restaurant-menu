// ✅ هذا الكومبوننت يستقبل props فقط — لا يجلب بيانات بمفرده
import { useTranslation } from 'react-i18next';
import styles from './MenuItemCard.module.css';

export default function MenuItemCard({ item, qty, onAdd, onRemove }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const name = lang === 'ar' ? item.name_ar : item.name_en;
  const desc = lang === 'ar' ? item.desc_ar  : item.desc_en;

  return (
    <div className={`${styles.card} ${qty > 0 ? styles.active : ''}`}>

      {/* صورة الصنف */}
      <div className={styles.imgBox}>
        {item.image_url
          ? <img src={item.image_url} alt={name} className={styles.img} loading="lazy" />
          : <div className={styles.imgPlaceholder}>🍴</div>
        }
        {qty > 0 && <div className={styles.qtyBadge}>{qty}</div>}
      </div>

      {/* معلومات الصنف */}
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        {desc && <p className={styles.desc}>{desc}</p>}

        <div className={styles.footer}>
          <span className={styles.price}>
            {item.price.toFixed(2)}
            <span className={styles.currency}>{lang === 'ar' ? ' ر.س' : ' SAR'}</span>
          </span>

          {/* زر الإضافة أو التحكم في الكمية */}
          {qty === 0 ? (
            <button className={styles.addBtn} onClick={() => onAdd(item)}>
              + {lang === 'ar' ? 'أضف' : 'Add'}
            </button>
          ) : (
            <div className={styles.qtyCtrl}>
              <button onClick={() => onRemove(item)}>−</button>
              <span>{qty}</span>
              <button onClick={() => onAdd(item)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}