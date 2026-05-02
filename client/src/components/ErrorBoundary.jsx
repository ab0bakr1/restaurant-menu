/**
 * components/ErrorBoundary.jsx
 *
 * يلتقط أي خطأ في React ويعرض شاشة واضحة بدلاً من الشاشة البيضاء
 *
 * الاستخدام:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 *
 *   أو مع رسالة مخصصة:
 *   <ErrorBoundary message="تعذّر تحميل القائمة">
 *     <CustomerMenu />
 *   </ErrorBoundary>
 */

import React from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError:  false,
      error:     null,
      errorInfo: null,
    };
  }

  // يُستدعى عند حدوث خطأ في أي كومبوننت داخلي
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // للتسجيل التفصيلي — مفيد للتشخيص
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { message, lang = 'ar' } = this.props;

    const T = {
      ar: {
        title:   'حدث خطأ غير متوقع',
        sub:     message || 'تعذّر تحميل هذا القسم',
        reload:  'إعادة تحميل الصفحة',
        retry:   'حاول مجدداً',
        details: 'تفاصيل الخطأ (للمطوّر)',
      },
      en: {
        title:   'Something went wrong',
        sub:     message || 'Failed to load this section',
        reload:  'Reload page',
        retry:   'Try again',
        details: 'Error details (for developer)',
      },
    }[lang] || {};

    return (
      <div className={styles.wrap} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className={styles.card}>
          <div className={styles.icon}>⚠️</div>
          <h2 className={styles.title}>{T.title}</h2>
          <p className={styles.sub}>{T.sub}</p>

          <div className={styles.btns}>
            <button className={styles.btnPrimary} onClick={this.handleReload}>
              🔄 {T.reload}
            </button>
            <button className={styles.btnSecondary} onClick={this.handleReset}>
              {T.retry}
            </button>
          </div>

          {/* تفاصيل الخطأ — للمطوّر فقط في وضع التطوير */}
          {import.meta.env.DEV && this.state.error && (
            <details className={styles.details}>
              <summary>{T.details}</summary>
              <pre>{this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;