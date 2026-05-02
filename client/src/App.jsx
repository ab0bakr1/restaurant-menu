/**
 * client/src/App.jsx — مع ErrorBoundary على كل مسار
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary    from './components/ErrorBoundary';
import ProtectedRoute   from './components/ProtectedRoute';
import ConnectionStatus from './components/ConnectionStatus';
import Login            from './pages/Login';
import CustomerMenu     from './pages/CustomerMenu';
import WaiterApp        from './pages/WaiterApp';
import AdminPanel       from './pages/AdminPanel';
import Cashier          from './pages/Cashier';
import KitchenDisplay   from './pages/KitchenDisplay';
import SalesReports     from './pages/SalesReports';
import './App.css';

// مساعد — يلف الصفحة بـ ErrorBoundary برسالة مناسبة
function Page({ children, message }) {
  return (
    <ErrorBoundary message={message}>
      {children}
    </ErrorBoundary>
  );
}

function App() {
  return (
    <>
      <ConnectionStatus />

      <Routes>

        {/* ── عامة ────────────────────────────────────────── */}
        <Route path="/login" element={
          <Page message="تعذّر تحميل صفحة الدخول">
            <Login />
          </Page>
        } />

        <Route path="/table/:tableNumber" element={
          <Page message="تعذّر تحميل القائمة — أعِد مسح QR">
            <CustomerMenu />
          </Page>
        } />

        <Route path="/kitchen" element={
          <Page message="تعذّر تحميل شاشة المطبخ">
            <KitchenDisplay />
          </Page>
        } />

        {/* ── محمية ────────────────────────────────────────── */}
        <Route path="/waiter" element={
          <ProtectedRoute role="waiter">
            <Page message="تعذّر تحميل لوحة النادل">
              <WaiterApp />
            </Page>
          </ProtectedRoute>
        } />

        <Route path="/cashier" element={
          <ProtectedRoute role="cashier">
            <Page message="تعذّر تحميل صفحة الكاشير">
              <Cashier />
            </Page>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <Page message="تعذّر تحميل لوحة الإدارة">
              <AdminPanel />
            </Page>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute role="admin">
            <Page message="تعذّر تحميل التقارير">
              <SalesReports />
            </Page>
          </ProtectedRoute>
        } />

        {/* ── افتراضي ───────────────────────────────────────── */}
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

      </Routes>
    </>
  );
}

export default App;