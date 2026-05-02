/**
 * client/src/services/socket.js
 *
 * اتصال Socket.IO واحد مشترك بين جميع الصفحات
 * يستخدم VITE_SERVER_URL من ملف .env
 */

import { io } from 'socket.io-client';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

const socket = io(SERVER, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

export default socket;