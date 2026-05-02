import { useState, useEffect } from 'react';
import styles from './KitchenStats.module.css';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={styles.clock}>
      {time.toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
    </div>
  );
}

export default function KitchenStats({ orders, lang }) {
  const pending   = orders.filter(o => o.status === 'pending').length;
  const preparing = orders.filter(o => o.status === 'confirmed').length;
  const total     = orders.length;
  const T = {
    ar: { new:'جديد', preparing:'قيد التحضير', total:'إجمالي', kitchen:'شاشة المطبخ' },
    en: { new:'New',  preparing:'Preparing',    total:'Total',  kitchen:'Kitchen Display' },
  }[lang];

  return (
    <div className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>👨‍🍳</span>
        <span className={styles.brandText}>{T.kitchen}</span>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color:'#FBBF24' }}>{pending}</span>
          <span className={styles.statLabel}>{T.new}</span>
        </div>
        <div className={styles.sep} />
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color:'#60A5FA' }}>{preparing}</span>
          <span className={styles.statLabel}>{T.preparing}</span>
        </div>
        <div className={styles.sep} />
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color:'#fff' }}>{total}</span>
          <span className={styles.statLabel}>{T.total}</span>
        </div>
      </div>
      <LiveClock />
    </div>
  );
}