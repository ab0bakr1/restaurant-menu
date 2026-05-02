/**
 * components/cashier/InvoiceView.jsx
 * الفاتورة الكاملة مع خيارات الدفع والطباعة
 */
import { useState } from 'react';
import api from '../../services/api';       // ← api مع token تلقائي
import styles from './InvoiceView.module.css';

const PAYMENT_METHODS = [
  { id: 'cash',   icon: '💵', ar: 'نقداً',     en: 'Cash'     },
  { id: 'pos',    icon: '💳', ar: 'بطاقة POS',  en: 'Card/POS' },
  { id: 'online', icon: '📱', ar: 'أونلاين',   en: 'Online'   },
];

export default function InvoiceView({ order, menuItems, onPaid, lang }) {
  const [method,  setMethod]  = useState('cash');
  const [paying,  setPaying]  = useState(false);
  const [printed, setPrinted] = useState(false);
  const [error,   setError]   = useState('');

  const items    = parseItems(order.items_json, menuItems);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const vat      = subtotal * 0.15;
  const total    = subtotal + vat;

  const T = {
    ar: {
      invoice:'فاتورة', table:'طاولة', orderNum:'رقم الطلب',
      date:'التاريخ', item:'الصنف', qty:'الكمية', price:'السعر', lineTotal:'المجموع',
      subtotal:'المجموع الفرعي', vat:'ضريبة القيمة المضافة (15%)',
      grandTotal:'الإجمالي الكلي', payMethod:'طريقة الدفع',
      pay:'✓ تأكيد الدفع', paying:'جاري المعالجة...',
      print:'🖨 طباعة', printDone:'✓ تم الطباعة',
      errFail:'فشل تسجيل الدفع — حاول مجدداً',
    },
    en: {
      invoice:'Invoice', table:'Table', orderNum:'Order No.',
      date:'Date', item:'Item', qty:'Qty', price:'Price', lineTotal:'Total',
      subtotal:'Subtotal', vat:'VAT (15%)',
      grandTotal:'Grand Total', payMethod:'Payment Method',
      pay:'✓ Confirm Payment', paying:'Processing...',
      print:'🖨 Print', printDone:'✓ Printed',
      errFail:'Payment failed — please try again',
    },
  }[lang];

  // ── تأكيد الدفع ────────────────────────────────────────────
  const handlePay = async () => {
    setError('');
    setPaying(true);
    try {
      // 1. سجّل الدفع في قاعدة البيانات
      await api.post('/api/print/invoice', {
        order_id: order.id,
        method,
        amount:   parseFloat(total.toFixed(2)),
      });
      // 2. أبلغ الكاشير باختفاء الطلب
      onPaid(order.id);
    } catch (e) {
      console.error('Payment error:', e.response?.data || e.message);
      setError(T.errFail);
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
    setPrinted(true);
  };

  const dateStr = new Date().toLocaleDateString(
    lang === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className={styles.wrap}>

      {/* ── الفاتورة القابلة للطباعة ─────────────────────── */}
      <div className={styles.invoice} id="printable-invoice">

        <div className={styles.invoiceHead}>
          <div className={styles.restaurant}>
            <span className={styles.logo}>🍽</span>
            <div>
              <div className={styles.restName}>
                {lang === 'ar' ? 'مطعمنا' : 'Our Restaurant'}
              </div>
              <div className={styles.restSub}>{T.invoice}</div>
            </div>
          </div>
          <div className={styles.invoiceMeta}>
            <div className={styles.metaRow}>
              <span>{T.table}</span>
              <span><strong>{order.table_number}</strong></span>
            </div>
            <div className={styles.metaRow}>
              <span>{T.orderNum}</span>
              <span><strong>#{order.id}</strong></span>
            </div>
            <div className={styles.metaRow}>
              <span>{T.date}</span>
              <span>{dateStr}</span>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* جدول الأصناف */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{T.item}</th>
              <th>{T.qty}</th>
              <th>{T.price}</th>
              <th>{T.lineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign:'center', color:'#aaa', padding:'16px' }}>
                لا توجد أصناف
              </td></tr>
            ) : (
              items.map((item, i) => (
                <tr key={i}>
                  <td className={styles.itemName}>
                    {lang === 'ar' ? item.name_ar : (item.name_en || item.name_ar)}
                  </td>
                  <td className={styles.center}>{item.qty}</td>
                  <td className={styles.right}>{item.price.toFixed(2)}</td>
                  <td className={styles.right}>{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.divider} />

        {/* الإجماليات */}
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>{T.subtotal}</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>{T.vat}</span>
            <span>{vat.toFixed(2)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.grandRow}`}>
            <span>{T.grandTotal}</span>
            <span>{total.toFixed(2)} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
          </div>
        </div>
      </div>

      {/* ── قسم الدفع — يُخفى عند الطباعة ──────────────────── */}
      <div className={styles.paySection}>

        <h3 className={styles.payTitle}>{T.payMethod}</h3>

        <div className={styles.methods}>
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              className={`${styles.methodBtn} ${method === m.id ? styles.methodOn : ''}`}
              onClick={() => setMethod(m.id)}
            >
              <span className={styles.methodIcon}>{m.icon}</span>
              <span>{lang === 'ar' ? m.ar : m.en}</span>
            </button>
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.btnRow}>
          <button className={styles.printBtn} onClick={handlePrint}>
            {printed ? T.printDone : T.print}
          </button>
          <button
            className={styles.payBtn}
            onClick={handlePay}
            disabled={paying}
          >
            {paying
              ? T.paying
              : `${T.pay} — ${total.toFixed(2)} ${lang === 'ar' ? 'ر.س' : 'SAR'}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── تحليل أصناف الطلب ─────────────────────────────────────
function parseItems(items_json, menuItems) {
  if (!items_json) return [];

  let raw = [];
  try {
    const trimmed = String(items_json).trim();
    try       { raw = JSON.parse(trimmed); }
    catch (_) { raw = JSON.parse('[' + trimmed + ']'); }
    if (!Array.isArray(raw)) raw = [raw];
  } catch {
    return [];
  }

  return raw
    .filter(Boolean)
    .map(r => {
      // ابحث عن الصنف في menuItems بالاسم العربي أو الإنجليزي
      const menuItem = menuItems.find(
        m => m.name_ar === r.name_ar || m.name_en === r.name_en
      );
      return {
        name_ar: r.name_ar || r.name_en || '—',
        name_en: menuItem?.name_en || r.name_en || r.name_ar || '—',
        qty:     Number(r.qty || r.quantity || 1),
        price:   Number(menuItem?.price || r.price || 0),
      };
    });
}