/**
 * components/customer/GeofenceGate.jsx
 *
 * يعرض شاشة التحقق من الموقع قبل السماح بإرسال الطلب
 * إذا كان العميل بعيداً يظهر تنبيه واضح
 */
import { useEffect } from 'react';
import { useGeofence } from '../../hooks/useGeofence';
import styles from './GeofenceGate.module.css';

export default function GeofenceGate({ lang, onAllowed, onCancel }) {
  const { allowed, distance, status, check, MAX_DISTANCE_M } = useGeofence();

  // ابدأ الفحص فور فتح المكوّن
  useEffect(() => { check(); }, [check]);

  // إذا مُسمح — أبلغ الأب فوراً
  useEffect(() => {
    if (allowed && status !== 'idle') onAllowed();
  }, [allowed, status]);

  const T = {
    ar: {
      checking:     'جاري التحقق من موقعك...',
      checkSub:     'نتأكد أنك داخل المطعم',
      denied:       'أنت خارج المطعم',
      deniedSub:    `يجب أن تكون على بُعد أقل من ${MAX_DISTANCE_M} متراً من المطعم لإرسال الطلب`,
      distance:     `مسافتك الحالية: ${distance} متر`,
      retry:        '🔄 حاول مجدداً',
      cancel:       'إلغاء',
      unsupported:  'جهازك لا يدعم GPS',
      unsupportedSub: 'تواصل مع النادل لتسجيل طلبك',
      error:        'تعذّر تحديد موقعك',
      errorSub:     'تأكد من السماح بالوصول للموقع وحاول مجدداً',
    },
    en: {
      checking:     'Verifying your location...',
      checkSub:     'Making sure you\'re inside the restaurant',
      denied:       'You\'re outside the restaurant',
      deniedSub:    `You must be within ${MAX_DISTANCE_M} meters of the restaurant to place an order`,
      distance:     `Your distance: ${distance}m`,
      retry:        '🔄 Try Again',
      cancel:       'Cancel',
      unsupported:  'GPS not supported',
      unsupportedSub: 'Please ask a waiter to place your order',
      error:        'Could not determine your location',
      errorSub:     'Please allow location access and try again',
    },
  }[lang];

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>

        {/* ── جاري الفحص ── */}
        {status === 'checking' || status === 'idle' ? (
          <>
            <div className={styles.spinner} />
            <h3 className={styles.title}>{T.checking}</h3>
            <p className={styles.sub}>{T.checkSub}</p>
          </>
        ) : null}

        {/* ── مرفوض — بعيد عن المطعم ── */}
        {status === 'denied' && (
          <>
            <div className={styles.iconDenied}>📍</div>
            <h3 className={styles.titleDenied}>{T.denied}</h3>
            <p className={styles.sub}>{T.deniedSub}</p>
            {distance !== null && (
              <div className={styles.distanceBadge}>{T.distance}</div>
            )}
            <div className={styles.btns}>
              <button className={styles.btnRetry} onClick={check}>{T.retry}</button>
              <button className={styles.btnCancel} onClick={onCancel}>{T.cancel}</button>
            </div>
          </>
        )}

        {/* ── GPS غير مدعوم ── */}
        {status === 'unsupported' && (
          <>
            <div className={styles.iconWarn}>⚠️</div>
            <h3 className={styles.title}>{T.unsupported}</h3>
            <p className={styles.sub}>{T.unsupportedSub}</p>
            <button className={styles.btnCancel} onClick={onCancel}>{T.cancel}</button>
          </>
        )}

        {/* ── خطأ في GPS — نسمح بالمتابعة ── */}
        {status === 'error' && (
          <>
            <div className={styles.iconWarn}>⚠️</div>
            <h3 className={styles.title}>{T.error}</h3>
            <p className={styles.sub}>{T.errorSub}</p>
            <div className={styles.btns}>
              <button className={styles.btnRetry} onClick={check}>{T.retry}</button>
              <button className={styles.btnCancel} onClick={onCancel}>{T.cancel}</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}