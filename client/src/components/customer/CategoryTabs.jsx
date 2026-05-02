import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import styles from './CategoryTabs.module.css';


// ✅ يستقبل قائمة التصنيفات من الأب — لا يجلب بيانات بمفرده

export default function CategoryTabs({ categories, active, onSelect }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const ICONS = { all:'✦', mains:'🍽', appetizers:'🥗', drinks:'🥤', desserts:'🍰' };

  const getLabel = (cat) => {
    if (cat === 'all') return t('all');
    return t(`categories.${cat}`, cat);
  };

  const allCats = ['all', ...categories];

  return (
    <div className={styles.wrap}>
      <div className={styles.scroll}>
        {allCats.map(cat => (
          <button
            key={cat}
            className={`${styles.tab} ${active === cat ? styles.active : ''}`}
            onClick={() => onSelect(cat)}
          >
            <span>{ICONS[cat] || '🍴'}</span>
            <span>{getLabel(cat)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}





{ /*const CategoryTabs = () => {
    const [category, setCategory] = useState([]);



    useEffect(() => {
        // جلب القائمة
        axios.get('/api/menu').then(c =>
        setCategory(c.data.map(i => i.category).filter((v, i, a) => a.indexOf(v) === i))
        );
    }, []);
  return (
    <div>
        {category.length === 0 ? (
        <p>لا توجد اصناف .</p>
      ) : (
        category.map(item => (
            <div key={item}>
                <h3>{item}</h3>
            </div>
        ))
      )}
    </div>
  )
}
export default CategoryTabs
*/
};
