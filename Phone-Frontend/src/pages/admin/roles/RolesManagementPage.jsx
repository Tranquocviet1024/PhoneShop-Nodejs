import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosConfig';
import { Shield, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const RolesManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  // Danh sách permissions có sẵn
  const AVAILABLE_PERMISSIONS = {
    'Products': [
      { value: 'read_products', label: 'Xem sản phẩm' },
      { value: 'create_product', label: 'Tạo sản phẩm' },
      { value: 'update_product', label: 'Cập nhật sản phẩm' },
      { value: 'delete_product', label: 'Xóa sản phẩm' },
    ],
    'Orders': [
      { value: 'create_order', label: 'Tạo đơn hàng' },
      { value: 'view_orders', label: 'Xem đơn hàng' },
      { value: 'update_order', label: 'Cập nhật đơn hàng' },
      { value: 'cancel_order', label: 'Hủy đơn hàng' },
      { value: 'delete_order', label: 'Xóa đơn hàng' },
    ],
    'Users': [
      { value: 'view_profile', label: 'Xem profile' },
      { value: 'update_profile', label: 'Cập nhật profile' },
      { value: 'manage_users', label: 'Quản lý users' },
      { value: 'view_users', label: 'Xem danh sách users' },
      { value: 'create_user', label: 'Tạo user' },
      { value: 'update_user', label: 'Cập nhật user' },
      { value: 'delete_user', label: 'Xóa user' },
    ],
    'Payments': [
      { value: 'confirm_payment', label: 'Xác nhận thanh toán' },
      { value: 'view_payments', label: 'Xem thanh toán' },
      { value: 'manage_payments', label: 'Quản lý thanh toán' },
      { value: 'create_payment', label: 'Tạo thanh toán' },
      { value: 'update_payment', label: 'Cập nhật thanh toán' },
    ],
    'Reviews': [
      { value: 'create_review', label: 'Tạo review' },
      { value: 'update_review', label: 'Cập nhật review' },
      { value: 'delete_review', label: 'Xóa review' },
      { value: 'manage_reviews', label: 'Quản lý reviews' },
      { value: 'view_reviews', label: 'Xem reviews' },
    ],
    'Categories': [
      { value: 'manage_categories', label: 'Quản lý danh mục' },
      { value: 'create_category', label: 'Tạo danh mục' },
      { value: 'update_category', label: 'Cập nhật danh mục' },
      { value: 'delete_category', label: 'Xóa danh mục' },
      { value: 'view_categories', label: 'Xem danh mục' },
    ],
    'Cart': [
      { value: 'manage_cart', label: 'Quản lý giỏ hàng' },
      { value: 'view_cart', label: 'Xem giỏ hàng' },
    ],
    'Roles & Permissions': [
      { value: 'manage_roles', label: 'Quản lý roles' },
      { value: 'view_roles', label: 'Xem roles' },
      { value: 'create_role', label: 'Tạo role' },
      { value: 'update_role', label: 'Cập nhật role' },
      { value: 'delete_role', label: 'Xóa role' },
      { value: 'assign_role', label: 'Gán role' },
      { value: 'grant_permission', label: 'Cấp permission' },
      { value: 'revoke_permission', label: 'Thu hồi permission' },
    ],
    'Audit & Logs': [
      { value: 'view_audit_logs', label: 'Xem audit logs' },
      { value: 'view_statistics', label: 'Xem thống kê' },
    ],
    'Upload': [
      { value: 'upload_image', label: 'Upload hình ảnh' },
      { value: 'delete_image', label: 'Xóa hình ảnh' },
    ],
    'Dashboard': [
      { value: 'view_dashboard', label: 'Xem dashboard' },
      { value: 'view_admin_stats', label: 'Xem thống kê admin' },
    ]
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      const rolesData = response.data?.data?.roles || [];
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await api.post('/roles', formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', permissions: [] });
      fetchRoles();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi tạo role');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/roles/${selectedRole.id}`, formData);
      setShowEditModal(false);
      setSelectedRole(null);
      setFormData({ name: '', description: '', permissions: [] });
      fetchRoles();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi cập nhật role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa role này?')) return;
    try {
      await api.delete(`/roles/${roleId}`);
      fetchRoles();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi xóa role');
    }
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setShowEditModal(true);
  };

  const togglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-primary" />
            Quản lý Quyền
          </h1>
          <p className="text-gray-600 mt-1">Quản lý roles và permissions trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition flex items-center gap-2"
        >
          <Plus size={20} />
          Tạo Role Mới
        </button>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield size={20} className="text-primary" />
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(role)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Permissions Count */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Permissions:</span>
                  <span className="font-bold text-primary">{role.permissions?.length || 0}</span>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2 text-sm">
                {role.isActive ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    <span className="text-green-600">Đang hoạt động</span>
                  </>
                ) : (
                  <>
                    <X size={16} className="text-red-600" />
                    <span className="text-red-600">Không hoạt động</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Tạo Role Mới</h2>
            </div>
            <form onSubmit={handleCreateRole} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Role</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="space-y-4">
                    {Object.entries(AVAILABLE_PERMISSIONS).map(([category, permissions]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-gray-700">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {permissions.map((perm) => (
                            <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.value)}
                                onChange={() => togglePermission(perm.value)}
                                className="rounded text-primary focus:ring-primary"
                              />
                              <span className="text-sm">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-accent transition"
                >
                  Tạo Role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '', permissions: [] });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Chỉnh sửa Role: {selectedRole.name}</h2>
            </div>
            <form onSubmit={handleUpdateRole} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Role</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="space-y-4">
                    {Object.entries(AVAILABLE_PERMISSIONS).map(([category, permissions]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-gray-700">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {permissions.map((perm) => (
                            <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.value)}
                                onChange={() => togglePermission(perm.value)}
                                className="rounded text-primary focus:ring-primary"
                              />
                              <span className="text-sm">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-accent transition"
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                    setFormData({ name: '', description: '', permissions: [] });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManagementPage;
