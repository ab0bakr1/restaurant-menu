/**
 * pages/SalesReports.jsx
 * صفحة الفواتير والمبيعات — للأدمن فقط
 *
 * تعرض:
 * - ملخص اليوم / الأسبوع / الشهر
 * - قائمة جميع الفواتير المدفوعة
 * - فلتر بالتاريخ
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api             from '../services/api';
import { authService } from '../services/authService';
import styles          from './SalesReports.module.css';

const METHOD_LABEL = {
  cash:   { ar:'نقداً',    en:'Cash',    color:'#10B981' },
  pos:    { ar:'POS',      en:'POS',     color:'#3B82F6' },
  online: { ar:'أونلاين', en:'Online',  color:'#8B5CF6' },
};

export default function SalesReports() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang,    setLang]    = useState('ar');
  const [invoices,setInvoices]= useState([]);
  const [range,   setRange]   = useState('today'); // today | week | month | custom
  const [from,    setFrom]    = useState(today());
  const [to,      setTo]      = useState(today());

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  function getRangeDates(r) {
    const now = new Date();
    const fmt  = d => d.toISOString().split('T')[0];
    if (r === 'today')  return { from: fmt(now), to: fmt(now) };
    if (r === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return { from: fmt(start), to: fmt(now) };
    }
    if (r === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: fmt(start), to: fmt(now) };
    }
    return { from, to };
  }

  const fetchData = () => {
    setLoading(true);
    const dates = getRangeDates(range);
    Promise.all([
      api.get(`/api/reports?from=${dates.from}&to=${dates.to}`),
      api.get(`/api/payments?from=${dates.from}&to=${dates.to}`),
    ])
      .then(([repRes, payRes]) => {
        setData(repRes.data);
        setInvoices(payRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [range, from, to]);

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  const T = {
    ar: {
      title:'تقارير المبيعات والفواتير', logout:'خروج',
      today:'اليوم', week:'الأسبوع', month:'الشهر', custom:'مخصص',
      from:'من', to:'إلى', search:'بحث',
      totalOrders:'إجمالي الطلبات', totalRevenue:'إجمالي الإيرادات',
      avgOrder:'متوسط الطلب', byMethod:'توزيع طرق الدفع',
      invoices:'الفواتير', noInvoices:'لا توجد فواتير في هذه الفترة',
      table:'طاولة', order:'طلب', amount:'المبلغ', method:'طريقة الدفع',
      date:'التاريخ', time:'الوقت', sar:'ر.س', loading:'جاري التحميل...',
      topItems:'الأصناف الأكثر طلباً', qty:'الكمية', revenue:'الإيراد',
    },
    en: {
      title:'Sales Reports & Invoices', logout:'Logout',
      today:'Today', week:'Week', month:'Month', custom:'Custom',
      from:'From', to:'To', search:'Search',
      totalOrders:'Total Orders', totalRevenue:'Total Revenue',
      avgOrder:'Avg Order', byMethod:'By Payment Method',
      invoices:'Invoices', noInvoices:'No invoices in this period',
      table:'Table', order:'Order', amount:'Amount', method:'Method',
      date:'Date', time:'Time', sar:'SAR', loading:'Loading...',
      topItems:'Top Items', qty:'Qty', revenue:'Revenue',
    },
  }[lang];

  return (
    <div className={styles.page} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* رأس الصفحة */}
      <header className={styles.header}>
        <h1 className={styles.title}>📊 {T.title}</h1>
        <div className={styles.headerActions}>
          <button className={styles.langBtn}
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}>
            {lang === 'ar' ? 'EN' : 'عر'}
          </button>
          <button className={styles.backBtn} onClick={() => navigate('/admin')}>
            {lang === 'ar' ? '← الإدارة' : '← Admin'}
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>{T.logout}</button>
        </div>
      </header>

      <div className={styles.body}>

        {/* فلتر الفترة */}
        <div className={styles.filterBar}>
          {['today','week','month','custom'].map(r => (
            <button
              key={r}
              className={`${styles.rangeBtn} ${range === r ? styles.rangeOn : ''}`}
              onClick={() => setRange(r)}
            >
              {T[r]}
            </button>
          ))}
          {range === 'custom' && (
            <div className={styles.customRange}>
              <span>{T.from}</span>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={styles.dateInput} />
              <span>{T.to}</span>
              <input type="date" value={to}   onChange={e => setTo(e.target.value)}   className={styles.dateInput} />
              <button className={styles.searchBtn} onClick={fetchData}>{T.search}</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className={styles.loading}><div className={styles.spinner}/><p>{T.loading}</p></div>
        ) : (
          <>
            {/* بطاقات الملخص */}
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryVal}>{data?.summary?.total_orders || 0}</div>
                <div className={styles.summaryLabel}>{T.totalOrders}</div>
              </div>
              <div className={styles.summaryCard} style={{ '--accent':'#D4A055' }}>
                <div className={styles.summaryVal} style={{ color:'#D4A055' }}>
                  {(data?.summary?.total_revenue || 0).toFixed(2)}
                  <span className={styles.summaryUnit}> {T.sar}</span>
                </div>
                <div className={styles.summaryLabel}>{T.totalRevenue}</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryVal}>
                  {(data?.summary?.avg_order || 0).toFixed(2)}
                  <span className={styles.summaryUnit}> {T.sar}</span>
                </div>
                <div className={styles.summaryLabel}>{T.avgOrder}</div>
              </div>
            </div>

            {/* توزيع طرق الدفع */}
            {data?.by_method?.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>{T.byMethod}</h2>
                <div className={styles.methodGrid}>
                  {data.by_method.map(m => (
                    <div key={m.method} className={styles.methodCard}>
                      <div className={styles.methodIcon}>
                        {m.method === 'cash' ? '💵' : m.method === 'pos' ? '💳' : '📱'}
                      </div>
                      <div className={styles.methodInfo}>
                        <div className={styles.methodName}
                          style={{ color: METHOD_LABEL[m.method]?.color || '#666' }}>
                          {lang === 'ar'
                            ? METHOD_LABEL[m.method]?.ar || m.method
                            : METHOD_LABEL[m.method]?.en || m.method}
                        </div>
                        <div className={styles.methodCount}>{m.count} {lang === 'ar' ? 'طلب' : 'orders'}</div>
                        <div className={styles.methodTotal}>{Number(m.total).toFixed(2)} {T.sar}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* قائمة الفواتير */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>🧾 {T.invoices}</h2>
              {invoices.length === 0 ? (
                <div className={styles.empty}>{T.noInvoices}</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.invoiceTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{T.order}</th>
                        <th>{T.table}</th>
                        <th>{T.method}</th>
                        <th>{T.amount}</th>
                        <th>{T.date}</th>
                        <th>{T.time}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => {
                        const d = new Date(inv.paid_at);
                        const mLabel = METHOD_LABEL[inv.method];
                        return (
                          <tr key={inv.id}>
                            <td className={styles.tdMuted}>{inv.id}</td>
                            <td><strong>#{inv.order_id}</strong></td>
                            <td>{inv.table_number || '—'}</td>
                            <td>
                              <span className={styles.methodBadge}
                                style={{ background: (mLabel?.color || '#999') + '22', color: mLabel?.color || '#999' }}>
                                {lang === 'ar' ? mLabel?.ar : mLabel?.en || inv.method}
                              </span>
                            </td>
                            <td className={styles.tdAmount}>
                              {Number(inv.amount).toFixed(2)} {T.sar}
                            </td>
                            <td className={styles.tdMuted}>
                              {d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                            </td>
                            <td className={styles.tdMuted}>
                              {d.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US',
                                { hour:'2-digit', minute:'2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}