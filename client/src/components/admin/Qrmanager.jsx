/**
 * components/admin/QRManager.jsx
 * توليد وطباعة QR Code لكل طاولة
 */
import { useState } from 'react';
import styles from './QRManager.module.css';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

export default function QRManager({ lang }) {
  const [tableCount, setTableCount] = useState(10);

  const T = {
    ar: {
      title: 'توليد QR Code للطاولات',
      sub: 'اطبع QR لكل طاولة وضعه عليها — العميل يمسحه للطلب مباشرة',
      count: 'عدد الطاولات',
      printAll: '🖨 طباعة جميع الطاولات',
      preview: 'معاينة QR الطاولة',
      table: 'طاولة رقم',
      single: 'عرض QR',
      how: 'كيف يعمل؟',
      step1: 'اطبع QR كل طاولة',
      step2: 'ضعه على الطاولة بإطار أنيق',
      step3: 'العميل يمسحه بالهاتف',
      step4: 'القائمة تفتح مباشرة مع رقم الطاولة',
    },
    en: {
      title: 'Generate Table QR Codes',
      sub: 'Print a QR for each table — customers scan it to order directly',
      count: 'Number of tables',
      printAll: '🖨 Print All Tables',
      preview: 'Preview table QR',
      table: 'Table',
      single: 'View QR',
      how: 'How it works',
      step1: 'Print each table\'s QR',
      step2: 'Place it on the table',
      step3: 'Customer scans with phone',
      step4: 'Menu opens with table number',
    },
  }[lang];

  const printAll = () => {
    window.open(`${SERVER}/api/qr/print/all?tables=${tableCount}`, '_blank');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>{T.title}</h2>
        <p className={styles.sub}>{T.sub}</p>
      </div>

      {/* شرح الخطوات */}
      <div className={styles.steps}>
        {[T.step1, T.step2, T.step3, T.step4].map((step, i) => (
          <div key={i} className={styles.step}>
            <div className={styles.stepNum}>{i + 1}</div>
            <div className={styles.stepText}>{step}</div>
          </div>
        ))}
      </div>

      {/* التحكم بعدد الطاولات */}
      <div className={styles.control}>
        <div className={styles.field}>
          <label className={styles.label}>{T.count}</label>
          <div className={styles.counterRow}>
            <button className={styles.counterBtn}
              onClick={() => setTableCount(n => Math.max(1, n - 1))}>−</button>
            <span className={styles.counterVal}>{tableCount}</span>
            <button className={styles.counterBtn}
              onClick={() => setTableCount(n => n + 1)}>+</button>
          </div>
        </div>

        <button className={styles.printAllBtn} onClick={printAll}>
          {T.printAll} ({tableCount} {lang === 'ar' ? 'طاولة' : 'tables'})
        </button>
      </div>

      {/* معاينة QR طاولة واحدة */}
      <div className={styles.previewSection}>
        <h3 className={styles.previewTitle}>{T.preview}</h3>
        <div className={styles.previewGrid}>
          {Array.from({ length: Math.min(tableCount, 6) }, (_, i) => i + 1).map(n => (
            <div key={n} className={styles.previewCard}>
              <img
                src={`${SERVER}/api/qr/${n}`}
                alt={`QR ${n}`}
                className={styles.qrImg}
                loading="lazy"
              />
              <div className={styles.tableLabel}>{T.table} {n}</div>
              <a
                href={`${SERVER}/api/qr/${n}`}
                download={`table-${n}-qr.png`}
                className={styles.downloadBtn}
              >
                ⬇ {lang === 'ar' ? 'تحميل' : 'Download'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}