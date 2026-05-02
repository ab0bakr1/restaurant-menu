/**
 * client/src/services/authService.js
 * إدارة الـ token وبيانات المستخدم
 */

const TOKEN_KEY = 'restaurant_token';
const USER_KEY  = 'restaurant_user';

export const authService = {

  // حفظ بيانات تسجيل الدخول
  login(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // تسجيل الخروج
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // جلب الـ token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // جلب بيانات المستخدم
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  // هل المستخدم مسجّل الدخول؟
  isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;
    try {
      // تحقق بسيط من انتهاء الـ token بدون مكتبة
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  // هل للمستخدم صلاحية معينة؟
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role || user?.role === 'admin';
  },
};