/**
 * components/admin/StaffManager.jsx
 * إدارة حسابات الموظفين
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StaffManager.module.css';

const ROLES = ['waiter', 'cashier', 'admin'];

const ROLE_LABELS = {
  ar: { waiter:'نادل', cashier:'كاشير', admin:'مدير' },
  en: { waiter:'Waiter', cashier:'Cashier', admin:'Admin' },
};

export default function StaffManager({ lang }) {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ username:'', password:'', role:'waiter' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const T = {
    ar: {
      title:'إدارة الموظفين', add:'+ إضافة موظف',
      username:'اسم المستخدم', password:'كلمة المرور', role:'الدور',
      save:'إضافة', cancel:'إلغاء', del:'حذف', delConfirm:'حذف هذا الحساب؟',
      addTitle:'إضافة حساب جديد', loading:'جاري التحميل...', noUsers:'لا توجد حسابات',
      errRequired:'اسم المستخدم وكلمة المرور مطلوبان',
    },
    en: {
      title:'Staff Management', add:'+ Add Staff',
      username:'Username', password:'Password', role:'Role',
      save:'Add', cancel:'Cancel', del:'Delete', delConfirm:'Delete this account?',
      addTitle:'Add New Account', loading:'Loading...', noUsers:'No accounts',
      errRequired:'Username and password are required',
    },
  }[lang];

  const fetchUsers = () => {
    setLoading(true);
    axios.get('/api/auth/users')
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async () => {
    setError('');
    if (!form.username || !form.password) { setError(T.errRequired); return; }
    setSaving(true);
    try {
      await axios.post('/api/auth/register', form);
      setShowForm(false);
      setForm({ username:'', password:'', role:'waiter' });
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.error || 'خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(T.delConfirm)) return;
    await axios.delete(`/api/auth/users/${id}`);
    fetchUsers();
  };

  const roleLabels = ROLE_LABELS[lang];
  const ROLE_COLORS = { admin:'#8B5CF6', waiter:'#3B82F6', cashier:'#10B981' };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>{T.title}</h2>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>{T.add}</button>
      </div>

      {loading ? (
        <div className={styles.loading}>{T.loading}</div>
      ) : (
        <div className={styles.list}>
          {users.map(u => (
            <div key={u.id} className={styles.card}>
              <div className={styles.avatar}
                style={{ background: (ROLE_COLORS[u.role] || '#999') + '22',
                          color: ROLE_COLORS[u.role] || '#999' }}>
                {u.username[0].toUpperCase()}
              </div>
              <div className={styles.info}>
                <div className={styles.uname}>{u.username}</div>
                <span className={styles.roleBadge}
                  style={{ background: (ROLE_COLORS[u.role]||'#999')+'22',
                           color: ROLE_COLORS[u.role]||'#999' }}>
                  {roleLabels[u.role] || u.role}
                </span>
              </div>
              <button className={styles.delBtn} onClick={() => handleDelete(u.id)}>
                {T.del}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{T.addTitle}</h3>

            <div className={styles.field}>
              <label>{T.username} *</label>
              <input value={form.username}
                onChange={e => setForm(p => ({...p, username: e.target.value}))} />
            </div>
            <div className={styles.field}>
              <label>{T.password} *</label>
              <input type="password" value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))} />
            </div>
            <div className={styles.field}>
              <label>{T.role}</label>
              <select value={form.role}
                onChange={e => setForm(p => ({...p, role: e.target.value}))}>
                {ROLES.map(r => (
                  <option key={r} value={r}>{roleLabels[r]}</option>
                ))}
              </select>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn}
                onClick={() => { setShowForm(false); setError(''); }}>{T.cancel}</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? '...' : T.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}