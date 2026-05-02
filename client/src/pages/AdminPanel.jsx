/**
 * pages/AdminPanel.jsx
 * لوحة الإدارة الرئيسية — تجمع كل كومبوننتس الإدارة
 */
import { useState } from 'react';
import AdminNav     from '../components/admin/AdminNav';
import MenuManager  from '../components/admin/MenuManager';
import StaffManager from '../components/admin/StaffManager';
import QRManager    from '../components/admin/QRManager';
import styles       from './AdminPanel.module.css';

export default function AdminPanel() {
  const [tab,  setTab]  = useState('menu');
  const [lang, setLang] = useState('ar');

  return (
    <div className={styles.page} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* شريط التنقل الجانبي */}
      <AdminNav active={tab} onSelect={setTab} lang={lang} />

      {/* المحتوى الرئيسي */}
      <main className={styles.main}>

        {/* زر تبديل اللغة */}
        <button
          className={styles.langBtn}
          style={lang === 'ar' ? { left: "16px" } : { right: "16px" }}
          onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
        >
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>

        {tab === 'menu'  && <MenuManager  lang={lang} />}
        {tab === 'users' && <StaffManager lang={lang} />}
        {tab === 'qr'    && <QRManager    lang={lang} />}
      </main>
    </div>
  );
}