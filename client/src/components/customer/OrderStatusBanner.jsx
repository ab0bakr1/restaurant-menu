// ✅ يستقبل props فقط — يعرض حالة الطلب ويتحدث لحظياً
import { useTranslation } from 'react-i18next';
import styles from './OrderStatusBanner.module.css';

const STEPS = ['pending', 'confirmed', 'ready', 'delivered'];

const COLORS = {
  pending:   '#F59E0B',
  confirmed: '#3B82F6',
  ready:     '#10B981',
  delivered: '#8B5CF6',
};

const ICONS = {
  pending:   '⏳',
  confirmed: '👨‍🍳',
  ready:     '✅',
  delivered: '🎉',
};

export default function OrderStatusBanner({ orderId, status, onNewOrder }) {
  const { t } = useTranslation();
  const color       = COLORS[status] || COLORS.pending;
  const icon        = ICONS[status]  || '⏳';
  const currentStep = STEPS.indexOf(status);

  return (
    <div className={styles.wrap}>
      <div className={styles.banner} style={{ '--accent': color }}>

        {/* أيقونة + رسالة */}
        <div className={styles.top}>
          <div className={styles.iconBox}>
            <span>{icon}</span>
          </div>
          <div>
            <p className={styles.orderNum}>{t('orderNum')}{orderId}</p>
            <p className={styles.msg}>{t(`statusMsg.${status}`)}</p>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div key={step} className={styles.stepRow}>
              <div className={`${styles.dot} ${i <= currentStep ? styles.dotOn : ''}`}>
                {i < currentStep && '✓'}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`${styles.line} ${i < currentStep ? styles.lineOn : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* زر طلب جديد عند التسليم */}
        {status === 'delivered' && (
          <button className={styles.newBtn} onClick={onNewOrder}>
            {t('newOrder')}
          </button>
        )}
      </div>
    </div>
  );
}