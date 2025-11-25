import React from 'react';
import { Edit2, Trash2, UserCheck, UserX } from 'lucide-react';

const ROLE_COLORS = {
  ADMIN: 'bg-purple-50 text-purple-700 border border-purple-100',
  STAFF: 'bg-green-50 text-green-700 border border-green-100',
  MODERATOR: 'bg-amber-50 text-amber-700 border border-amber-100',
  USER: 'bg-blue-50 text-blue-700 border border-blue-100',
};

const UserTable = ({ users, onEditClick, onDeleteClick, onToggleStatus, loading, actionLoadingId }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-semibold text-gray-700">Không có người dùng nào phù hợp</p>
        <p className="text-sm text-gray-500">Hãy thay đổi bộ lọc hoặc tạo mới một tài khoản</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Người dùng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vai trò
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hoạt động
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
                    {getInitials(user.fullName || user.username)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.fullName || user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">ID: {user.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.assignedRole ? (
                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        ROLE_COLORS[user.assignedRole.name] || 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {user.assignedRole.name}
                    </span>
                    {user.assignedRole.description && (
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {user.assignedRole.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 border border-dashed border-gray-300">
                    Chưa gán vai trò
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  type="button"
                  disabled={!onToggleStatus || actionLoadingId === user.id}
                  onClick={() => onToggleStatus && onToggleStatus(user)}
                  className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full transition ${
                    user.isActive
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  } ${actionLoadingId === user.id ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {user.isActive ? <UserCheck size={14} /> : <UserX size={14} />}
                  {user.isActive ? 'Active' : 'Suspended'}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
                <p className="text-xs text-gray-500">Cập nhật {timeAgo(user.updatedAt || user.createdAt)}</p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEditClick?.(user)}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                    title="Edit user"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteClick?.(user)}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                    title="Delete user"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getInitials = (value = '') => {
  const parts = value
    .trim()
    .split(' ')
    .filter(Boolean);

  if (parts.length === 0) return 'NA';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const timeAgo = (date) => {
  if (!date) return 'không xác định';
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

export default UserTable;
