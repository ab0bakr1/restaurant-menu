/**
 * components/ConnectionStatus.jsx
 * مؤشر حالة الاتصال بالسيرفر — يظهر عند انقطاع الشبكة
 */
import { useState, useEffect } from 'react';
import socket from '../services/socket';
import styles from './ConnectionStatus.module.css';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('connected'); // connected | disconnected | reconnecting

  useEffect(() => {
    socket.on('connect',          () => setStatus('connected'));
    socket.on('disconnect',       () => setStatus('disconnected'));
    socket.on('reconnect_attempt',() => setStatus('reconnecting'));
    socket.on('reconnect',        () => setStatus('connected'));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect');
    };
  }, []);

  if (status === 'connected') return null;

  const MSGS = {
    disconnected: { ar: '⚠ انقطع الاتصال بالسيرفر', en: '⚠ Server disconnected', cls: styles.offline },
    reconnecting: { ar: '🔄 جاري إعادة الاتصال...', en: '🔄 Reconnecting...', cls: styles.reconnecting },
  };

  const msg = MSGS[status];

  return (
    <div className={`${styles.bar} ${msg?.cls}`}>
      <span>{msg?.ar}</span>
    </div>
  );
}