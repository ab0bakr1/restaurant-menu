/**
 * components/admin/AdminNav.jsx
 */
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import styles from './AdminNav.module.css';

const TABS = [
  { id: 'menu',    icon: '🍽', ar: 'القائمة',    en: 'Menu'    },
  { id: 'users',   icon: '👥', ar: 'الموظفون',   en: 'Staff'   },
  { id: 'qr',      icon: '📱', ar: 'QR Code',    en: 'QR Code' },
];

export default function AdminNav({ active, onSelect, lang }) {
  const navigate = useNavigate();

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span>🍽</span>
        <span className={styles.logoText}>{lang === 'ar' ? 'الإدارة' : 'Admin'}</span>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${active === t.id ? styles.active : ''}`}
            onClick={() => onSelect(t.id)}
          >
            <span className={styles.tabIcon}>{t.icon}</span>
            <span>{lang === 'ar' ? t.ar : t.en}</span>
          </button>
        ))}

        {/* رابط خارجي لصفحة التقارير */}
        <button
          className={styles.tab}
          onClick={() => navigate('/reports')}
        >
          <span className={styles.tabIcon}>📊</span>
          <span>{lang === 'ar' ? 'التقارير' : 'Reports'}</span>
        </button>
      </div>

      <div className={styles.bottom}>
        <div className={styles.userInfo}>
          <span className={styles.userIcon}>👤</span>
          <span>{authService.getUser()?.username}</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          {lang === 'ar' ? 'خروج' : 'Logout'}
        </button>
      </div>
    </nav>
  );
}