/**
 * components/admin/MenuManager.jsx
 * إدارة القائمة — إضافة / تعديل / حذف / تفعيل
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MenuManager.module.css';

const EMPTY_FORM = {
  name_ar: '', name_en: '',
  desc_ar: '', desc_en: '',
  price: '', category: 'mains', image_url: '',
};

const CATEGORIES = ['mains', 'appetizers', 'drinks', 'desserts'];

const CAT_LABELS = {
  ar: { mains:'أطباق رئيسية', appetizers:'مقبلات', drinks:'مشروبات', desserts:'حلويات' },
  en: { mains:'Mains', appetizers:'Starters', drinks:'Drinks', desserts:'Desserts' },
};

export default function MenuManager({ lang }) {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null); // null = إضافة جديدة
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [filter,   setFilter]   = useState('all');

  const T = {
    ar: {
      title:'إدارة القائمة', add:'+ إضافة صنف', save:'حفظ', cancel:'إلغاء',
      edit:'تعديل', del:'حذف', delConfirm:'هل أنت متأكد من الحذف؟',
      nameAr:'الاسم (عربي)', nameEn:'الاسم (إنجليزي)',
      descAr:'الوصف (عربي)', descEn:'الوصف (إنجليزي)',
      price:'السعر', cat:'التصنيف', img:'رابط الصورة',
      active:'نشط', inactive:'موقوف', all:'الكل',
      noItems:'لا توجد أصناف', loading:'جاري التحميل...',
      addTitle:'إضافة صنف جديد', editTitle:'تعديل الصنف',
    },
    en: {
      title:'Menu Management', add:'+ Add Item', save:'Save', cancel:'Cancel',
      edit:'Edit', del:'Delete', delConfirm:'Are you sure you want to delete?',
      nameAr:'Name (Arabic)', nameEn:'Name (English)',
      descAr:'Description (Arabic)', descEn:'Description (English)',
      price:'Price', cat:'Category', img:'Image URL',
      active:'Active', inactive:'Inactive', all:'All',
      noItems:'No items', loading:'Loading...',
      addTitle:'Add New Item', editTitle:'Edit Item',
    },
  }[lang];

  // جلب القائمة
  const fetchItems = () => {
    setLoading(true);
    axios.get('/api/menu')
      .then(r => setItems(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  // فتح فورم الإضافة
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  // فتح فورم التعديل
  const openEdit = (item) => {
    setEditing(item.id);
    setForm({
      name_ar: item.name_ar || '',
      name_en: item.name_en || '',
      desc_ar: item.desc_ar || '',
      desc_en: item.desc_en || '',
      price:   item.price   || '',
      category:item.category|| 'mains',
      image_url:item.image_url||'',
    });
    setShowForm(true);
  };

  // حفظ (إضافة أو تعديل)
  const handleSave = async () => {
    if (!form.name_ar || !form.name_en || !form.price) return;
    setSaving(true);
    try {
      if (editing) {
        await axios.patch(`/api/menu/${editing}`, { ...form, price: Number(form.price) });
      } else {
        await axios.post('/api/menu', { ...form, price: Number(form.price) });
      }
      setShowForm(false);
      fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // حذف
  const handleDelete = async (id) => {
    if (!window.confirm(T.delConfirm)) return;
    await axios.delete(`/api/menu/${id}`);
    fetchItems();
  };

  // تفعيل / إيقاف
  const toggleActive = async (item) => {
    await axios.patch(`/api/menu/${item.id}`, { is_active: item.is_active ? 0 : 1 });
    fetchItems();
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);
  const catLabels = CAT_LABELS[lang];

  return (
    <div className={styles.wrap}>

      {/* رأس الصفحة */}
      <div className={styles.header}>
        <h2 className={styles.title}>{T.title}</h2>
        <button className={styles.addBtn} onClick={openAdd}>{T.add}</button>
      </div>

      {/* فلتر التصنيف */}
      <div className={styles.filters}>
        {['all', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${filter === cat ? styles.filterOn : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? T.all : catLabels[cat]}
          </button>
        ))}
      </div>

      {/* جدول الأصناف */}
      {loading ? (
        <div className={styles.loading}>{T.loading}</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>{T.noItems}</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>الصنف</span>
            <span>التصنيف</span>
            <span>السعر</span>
            <span>الحالة</span>
            <span>إجراء</span>
          </div>
          {filtered.map(item => (
            <div key={item.id} className={`${styles.row} ${!item.is_active ? styles.rowInactive : ''}`}>
              <div className={styles.itemInfo}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.name_ar} className={styles.thumb} />
                )}
                <div>
                  <div className={styles.itemName}>{lang === 'ar' ? item.name_ar : item.name_en}</div>
                  <div className={styles.itemSub}>{lang === 'ar' ? item.name_en : item.name_ar}</div>
                </div>
              </div>
              <span className={styles.catBadge}>{catLabels[item.category] || item.category}</span>
              <span className={styles.price}>{Number(item.price).toFixed(2)}</span>
              <button
                className={`${styles.statusBtn} ${item.is_active ? styles.statusOn : styles.statusOff}`}
                onClick={() => toggleActive(item)}
              >
                {item.is_active ? T.active : T.inactive}
              </button>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => openEdit(item)}>{T.edit}</button>
                <button className={styles.delBtn}  onClick={() => handleDelete(item.id)}>{T.del}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* فورم الإضافة/التعديل */}
      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {editing ? T.editTitle : T.addTitle}
            </h3>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>{T.nameAr} *</label>
                <input value={form.name_ar} onChange={e => setForm(p => ({...p, name_ar: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label>{T.nameEn} *</label>
                <input value={form.name_en} onChange={e => setForm(p => ({...p, name_en: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label>{T.descAr}</label>
                <input value={form.desc_ar} onChange={e => setForm(p => ({...p, desc_ar: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label>{T.descEn}</label>
                <input value={form.desc_en} onChange={e => setForm(p => ({...p, desc_en: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label>{T.price} *</label>
                <input type="number" min="0" step="0.01" value={form.price}
                  onChange={e => setForm(p => ({...p, price: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label>{T.cat}</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{catLabels[c]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label>{T.img}</label>
              <input value={form.image_url} onChange={e => setForm(p => ({...p, image_url: e.target.value}))}
                placeholder="https://..." />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>{T.cancel}</button>
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