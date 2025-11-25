import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { AlertCircle } from 'lucide-react';

/**
 * PermissionGuard - Bảo vệ component/page theo permission
 * Kiểm tra xem user có permission cụ thể không
 * Nếu không có → hiển thị thông báo hoặc redirect
 */
const PermissionGuard = ({ 
  children, 
  requiredPermission, 
  requiredPermissions = [], // Yêu cầu nhiều permissions
  requireAll = false, // true: cần TẤT CẢ permissions, false: chỉ cần 1
  fallback = null, // Component hiển thị khi không có quyền
  redirectTo = null // Redirect đến trang khác
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(null); // null = đang check, true/false = kết quả
  const [loading, setLoading] = useState(true);

  const checkPermission = useCallback(async () => {
    if (!user) {
      setHasPermission(false);
      setLoading(false);
      if (redirectTo) {
        navigate(redirectTo);
      }
      return;
    }

    try {
      // Gọi API lấy permissions của user
      const response = await api.get(`/roles/user/${user.id}/permissions`);
      const userPermissions = response.data?.data?.allPermissions || [];

      // Tạo danh sách permissions cần check
      const permissionsToCheck = requiredPermission 
        ? [requiredPermission]
        : requiredPermissions;

      if (permissionsToCheck.length === 0) {
        // Không yêu cầu permission cụ thể → cho phép
        setHasPermission(true);
        setLoading(false);
        return;
      }

      // Kiểm tra permissions
      let hasAccess = false;
      if (requireAll) {
        // Cần TẤT CẢ permissions
        hasAccess = permissionsToCheck.every(perm => userPermissions.includes(perm));
      } else {
        // Chỉ cần 1 trong các permissions
        hasAccess = permissionsToCheck.some(perm => userPermissions.includes(perm));
      }

      setHasPermission(hasAccess);
      setLoading(false);

      // Redirect nếu không có quyền
      if (!hasAccess && redirectTo) {
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(false);
      setLoading(false);
    }
  }, [user, requiredPermission, requiredPermissions, requireAll, redirectTo, navigate]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Đang loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Không có quyền
  if (!hasPermission) {
    // Nếu có fallback component → hiển thị nó
    if (fallback) {
      return fallback;
    }

    // Mặc định: hiển thị thông báo lỗi
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền để xem trang này. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Có quyền → hiển thị children
  return <>{children}</>;
};

export default PermissionGuard;
