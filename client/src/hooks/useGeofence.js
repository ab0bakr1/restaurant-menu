/**
 * client/src/hooks/useGeofence.js
 *
 * يتحقق من موقع العميل ويقارنه بموقع المطعم
 * إذا كان أبعد من MAX_DISTANCE يمنع الطلب
 *
 * الاستخدام:
 *   const { allowed, distance, status, check } = useGeofence();
 */

import { useState, useCallback } from 'react';

// ── إعدادات المطعم — غيّر هذه القيم ──────────────────────
const RESTAURANT_LAT  = 16.053198;   // خط العرض  ← ضع إحداثيات مطعمك
const RESTAURANT_LNG  = 48.9979856;   // خط الطول  ← من Google Maps
const MAX_DISTANCE_M  = 50;        // الحد الأقصى بالأمتار (50 متر)

// ── حساب المسافة بين نقطتين (Haversine Formula) ──────────
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R    = 6371000; // نصف قطر الأرض بالأمتار
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * (Math.PI / 180); }

// ── الـ Hook ───────────────────────────────────────────────
export function useGeofence() {
  const [status,   setStatus]   = useState('idle');
  // idle | checking | allowed | denied | error | unsupported
  const [distance, setDistance] = useState(null);
  const [allowed,  setAllowed]  = useState(false);

  const check = useCallback(() => {
    // المتصفح لا يدعم GPS
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setAllowed(false);
      return;
    }

    setStatus('checking');

    navigator.geolocation.getCurrentPosition(
      // نجح جلب الموقع
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = getDistanceMeters(
          latitude, longitude,
          RESTAURANT_LAT, RESTAURANT_LNG
        );

        setDistance(Math.round(dist));

        if (dist <= MAX_DISTANCE_M) {
          setStatus('allowed');
          setAllowed(true);
        } else {
          setStatus('denied');
          setAllowed(false);
        }
      },
      // فشل جلب الموقع
      (error) => {
        console.warn('Geolocation error:', error.message);
        // إذا رفض المستخدم أو حدث خطأ — نسمح بالطلب
        // (لا نعاقب العميل على مشاكل GPS)
        setStatus('error');
        setAllowed(true);
      },
      {
        enableHighAccuracy: true,
        timeout:            8000,
        maximumAge:         30000,
      }
    );
  }, []);

  return { allowed, distance, status, check, MAX_DISTANCE_M };
}