import React from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

const UsersTab = ({ 
  users, 
  onAddClick, 
  onEditClick, 
  onDeleteClick 
}) => {
  return (
    <div>
      <div className="mb-6 flex gap-4">
        <button 
          onClick={onAddClick}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Thêm Người Dùng
        </button>
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Tìm người dùng..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary">
          <option>Tất cả</option>
          <option>ADMIN</option>
          <option>USER</option>
        </select>
      </div>

      {users.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-dark">Tên</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Email</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Role</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Trạng Thái</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Ngày Tạo</th>
                <th className="text-left py-3 px-6 font-semibold text-dark">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6 font-semibold">{u.fullName || u.username}</td>
                  <td className="py-3 px-6 text-sm">{u.email}</td>
                  <td className="py-3 px-6">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-6 flex gap-2">
                    <button 
                      onClick={() => onEditClick(u)}
                      className="text-primary hover:text-accent transition p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteClick(u.id)}
                      className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Không có người dùng</p>
          <p className="text-gray-500 text-sm mt-1">Cần kết nối API: GET /admin/users</p>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
