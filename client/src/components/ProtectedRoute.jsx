/**
 * client/src/components/ProtectedRoute.jsx
 *
 * الاستخدام:
 *   <ProtectedRoute>                    ← يمنع غير المسجّلين فقط
 *   <ProtectedRoute role="admin">       ← يمنع غير الأدمن
 *   <ProtectedRoute role="waiter">      ← يمنع من ليس له دور waiter أو admin
 */

import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children, role }) {

  // غير مسجّل الدخول → صفحة Login
  if (!authService.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // مسجّل لكن الدور غير مناسب → صفحة Login
  if (role && !authService.hasRole(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}