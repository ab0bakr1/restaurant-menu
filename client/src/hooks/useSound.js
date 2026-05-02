/**
 * hooks/useSound.js
 * صوت تنبيه عند وصول طلب جديد
 * يعمل بدون ملف صوت خارجي — يولّد النغمة بـ Web Audio API
 */
import { useRef, useCallback } from 'react';

export function useSound() {
  const ctx = useRef(null);

  const play = useCallback(() => {
    try {
      if (!ctx.current) {
        ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ac = ctx.current;

      // نغمتان متتاليتان — تنبيه واضح
      const beep = (freq, start, duration) => {
        const osc  = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.4, ac.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + duration);
        osc.start(ac.currentTime + start);
        osc.stop(ac.currentTime + start + duration);
      };

      beep(880, 0,    0.15);
      beep(660, 0.18, 0.15);
      beep(880, 0.36, 0.25);
    } catch (e) {
      // المتصفح قد يحجب الصوت بدون تفاعل مستخدم — نتجاهل الخطأ
      console.warn('Sound blocked:', e.message);
    }
  }, []);

  return { play };
}