// ✅ يعرض الأصناف فقط — يستقبل كل شيء من الأب CustomerMenu
import { useTranslation } from 'react-i18next';
import MenuItemCard from './MenuItemCard';
import styles from './MenuGrid.module.css';

export default function MenuGrid({ items, cart, onAdd, onRemove }) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span>🍽</span>
        <p>{t('noItems')}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((item, i) => (
        <div key={item.id} className={styles.item} style={{ animationDelay: `${i * 0.04}s` }}>
          <MenuItemCard
            item={item}
            qty={cart[item.id] || 0}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </div>
      ))}
    </div>
  );
}