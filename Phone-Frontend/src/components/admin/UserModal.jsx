import React from 'react';

const UserModal = ({ 
  isOpen, 
  isEditing,
  formData, 
  onFormChange, 
  onSave, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-96 overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{isEditing ? 'Sửa Người Dùng' : 'Thêm Người Dùng'}</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={(e) => onFormChange({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Tên đầy đủ"
            value={formData.fullName}
            onChange={(e) => onFormChange({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <select
            value={formData.role}
            onChange={(e) => onFormChange({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => onFormChange({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            Hoạt động
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onSave}
            className="flex-1 bg-primary text-white py-2 rounded hover:bg-accent transition text-sm"
          >
            Lưu
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400 transition text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
