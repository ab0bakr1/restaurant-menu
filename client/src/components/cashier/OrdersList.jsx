/**
 * components/cashier/OrdersList.jsx
 * قائمة الطلبات الجاهزة في انتظار الدفع
 */
import styles from './OrdersList.module.css';

const STATUS_COLOR = {
  ready:     '#10B981',
  confirmed: '#3B82F6',
  pending:   '#F59E0B',
  delivered: '#8B5CF6',
};

export default function OrdersList({ orders, selected, onSelect, lang }) {
  const T = {
    ar: { title:'الطلبات الجاهزة', empty:'لا توجد طلبات جاهزة', table:'طاولة', order:'طلب رقم' },
    en: { title:'Ready Orders',     empty:'No orders ready',      table:'Table', order:'Order #' },
  }[lang];

  const ready = orders.filter(o => o.status === 'delivered');

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{T.title}</h2>
      <div className={styles.list}>
        {ready.length === 0 ? (
          <div className={styles.empty}>{T.empty}</div>
        ) : (
          ready.map(order => (
            <button
              key={order.id}
              className={`${styles.card} ${selected?.id === order.id ? styles.selected : ''}`}
              onClick={() => onSelect(order)}
            >
              <div className={styles.cardTop}>
                <span className={styles.tableNum}>{T.table} {order.table_number}</span>
                <span className={styles.dot} style={{ background: STATUS_COLOR[order.status] || '#999' }} />
              </div>
              <div className={styles.orderNum}>{T.order}{order.id}</div>
              <div className={styles.time}>
                {new Date(order.created_at).toLocaleTimeString(
                  lang === 'ar' ? 'ar-SA' : 'en-US',
                  { hour:'2-digit', minute:'2-digit' }
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}