import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

/**
 * PermissionButton - Nút bấm có điều kiện theo permission
 * Tự động ẩn hoặc disable nếu user không có quyền
 */
const PermissionButton = ({ 
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  hideIfNoPermission = false, // true: ẩn nút, false: disable nút
  onClick,
  className = '',
  disabledClassName = 'opacity-50 cursor-not-allowed',
  ...props
}) => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);

  const checkPermission = useCallback(async () => {
    if (!user) {
      setHasPermission(false);
      return;
    }

    try {
      const response = await api.get(`/roles/user/${user.id}/permissions`);
      const userPermissions = response.data?.data?.allPermissions || [];

      const permissionsToCheck = requiredPermission 
        ? [requiredPermission]
        : requiredPermissions;

      if (permissionsToCheck.length === 0) {
        setHasPermission(true);
        return;
      }

      let hasAccess = false;
      if (requireAll) {
        hasAccess = permissionsToCheck.every(perm => userPermissions.includes(perm));
      } else {
        hasAccess = permissionsToCheck.some(perm => userPermissions.includes(perm));
      }

      setHasPermission(hasAccess);
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(false);
    }
  }, [user, requiredPermission, requiredPermissions, requireAll]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Đang loading
  if (hasPermission === null) {
    return null; // Hoặc skeleton
  }

  // Ẩn nút nếu không có quyền
  if (!hasPermission && hideIfNoPermission) {
    return null;
  }

  // Hiển thị nút nhưng disable
  return (
    <button
      onClick={hasPermission ? onClick : undefined}
      disabled={!hasPermission}
      className={`${className} ${!hasPermission ? disabledClassName : ''}`}
      title={!hasPermission ? 'Bạn không có quyền thực hiện thao tác này' : ''}
      {...props}
    >
      {children}
    </button>
  );
};

export default PermissionButton;
