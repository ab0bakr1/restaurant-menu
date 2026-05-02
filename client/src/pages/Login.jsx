/**
 * client/src/pages/Login.jsx
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import styles from './Login.module.css';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

export default function Login() {
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [lang,    setLang]    = useState('ar');

  const T = {
    ar: {
      title:    'تسجيل الدخول',
      sub:      'نظام إدارة المطعم',
      user:     'اسم المستخدم',
      pass:     'كلمة المرور',
      btn:      'دخول',
      loading:  'جاري التحقق...',
      errEmpty: 'يرجى إدخال اسم المستخدم وكلمة المرور',
      errWrong: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      errConn:  'تعذّر الاتصال بالسيرفر',
    },
    en: {
      title:    'Sign In',
      sub:      'Restaurant Management System',
      user:     'Username',
      pass:     'Password',
      btn:      'Sign In',
      loading:  'Verifying...',
      errEmpty: 'Please enter username and password',
      errWrong: 'Invalid username or password',
      errConn:  'Cannot connect to server',
    },
  }[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.password) {
      setError(T.errEmpty);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${SERVER}/api/auth/login`, form);
      authService.login(res.data.token, {
        username: res.data.username,
        role:     res.data.role,
      });

      // توجيه حسب الدور
      const role = res.data.role;
      if (role === 'admin')   navigate('/admin');
      else if (role === 'cashier') navigate('/cashier');
      else navigate('/waiter');

    } catch (err) {
      if (err.response?.status === 401) setError(T.errWrong);
      else setError(T.errConn);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      <button
        className={styles.langBtn}
        onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
      >
        {lang === 'ar' ? 'EN' : 'عر'}
      </button>

      <div className={styles.card}>

        {/* شعار */}
        <div className={styles.logo}>🍽</div>
        <h1 className={styles.title}>{T.title}</h1>
        <p className={styles.sub}>{T.sub}</p>

        {/* فورم */}
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.field}>
            <label className={styles.label}>{T.user}</label>
            <input
              type="text"
              className={styles.input}
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{T.pass}</label>
            <input
              type="password"
              className={styles.input}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.error}>⚠️ {error}</div>
          )}

          <button
            type="submit"
            className={styles.btn}
            disabled={loading}
          >
            {loading ? T.loading : T.btn}
          </button>

        </form>

        {/* تلميح حسابات التطوير */}
        <div className={styles.hint}>
          <p>admin / admin123</p>
          <p>waiter1 / waiter123</p>
          <p>cashier / cashier123</p>
        </div>

      </div>
    </div>
  );
}