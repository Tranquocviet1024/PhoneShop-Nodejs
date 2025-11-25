import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Bảo vệ route dựa trên role hoặc permissions
 * @param {React.Component} Component - Component cần bảo vệ
 * @param {string} requiredRole - Role cần thiết (ADMIN, USER, etc.)
 * @param {boolean} allowStaff - Cho phép STAFF và các role có permissions truy cập (mặc định: false)
 */
export const ProtectedRoute = ({ Component, requiredRole, allowStaff = false }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole = (user?.role || '').toUpperCase();
    const reqRole = requiredRole.toUpperCase();
    
    // Nếu yêu cầu ADMIN
    if (reqRole === 'ADMIN') {
      // Cho phép ADMIN và các role khác nếu allowStaff = true
      if (allowStaff) {
        // Cho phép tất cả role đăng nhập, nhưng UI sẽ giới hạn theo permissions
        return <Component />;
      } else {
        // Chỉ cho phép ADMIN
        if (userRole !== 'ADMIN') {
          return <Navigate to="/" replace />;
        }
      }
    } else {
      // Yêu cầu role cụ thể khác
      if (userRole !== reqRole) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <Component />;
};

export default ProtectedRoute;
