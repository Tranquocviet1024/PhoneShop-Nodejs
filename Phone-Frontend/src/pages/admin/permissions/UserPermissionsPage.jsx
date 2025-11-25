import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosConfig';
import { Users, Shield, Plus, Trash2, Search, Eye, Check, X } from 'lucide-react';

const UserPermissionsPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showGrantPermissionModal, setShowGrantPermissionModal] = useState(false);
  const [showDenyPermissionModal, setShowDenyPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('');
  const [selectedDenyPermission, setSelectedDenyPermission] = useState('');

  // Danh sách permissions
  const AVAILABLE_PERMISSIONS = [
    // Product
    { value: 'read_products', label: 'Xem sản phẩm', category: 'Product' },
    { value: 'create_product', label: 'Tạo sản phẩm', category: 'Product' },
    { value: 'update_product', label: 'Cập nhật sản phẩm', category: 'Product' },
    { value: 'delete_product', label: 'Xóa sản phẩm', category: 'Product' },
    
    // Order
    { value: 'create_order', label: 'Tạo đơn hàng', category: 'Order' },
    { value: 'view_orders', label: 'Xem đơn hàng', category: 'Order' },
    { value: 'update_order', label: 'Cập nhật đơn hàng', category: 'Order' },
    { value: 'cancel_order', label: 'Hủy đơn hàng', category: 'Order' },
    { value: 'delete_order', label: 'Xóa đơn hàng', category: 'Order' },
    
    // User
    { value: 'view_profile', label: 'Xem profile', category: 'User' },
    { value: 'update_profile', label: 'Cập nhật profile', category: 'User' },
    { value: 'manage_users', label: 'Quản lý users', category: 'User' },
    { value: 'view_users', label: 'Xem danh sách users', category: 'User' },
    { value: 'create_user', label: 'Tạo user', category: 'User' },
    { value: 'update_user', label: 'Cập nhật user', category: 'User' },
    { value: 'delete_user', label: 'Xóa user', category: 'User' },
    
    // Payment
    { value: 'confirm_payment', label: 'Xác nhận thanh toán', category: 'Payment' },
    { value: 'view_payments', label: 'Xem thanh toán', category: 'Payment' },
    { value: 'manage_payments', label: 'Quản lý thanh toán', category: 'Payment' },
    { value: 'create_payment', label: 'Tạo thanh toán', category: 'Payment' },
    { value: 'update_payment', label: 'Cập nhật thanh toán', category: 'Payment' },
    
    // Review
    { value: 'create_review', label: 'Tạo review', category: 'Review' },
    { value: 'update_review', label: 'Cập nhật review', category: 'Review' },
    { value: 'delete_review', label: 'Xóa review', category: 'Review' },
    { value: 'manage_reviews', label: 'Quản lý reviews', category: 'Review' },
    { value: 'view_reviews', label: 'Xem reviews', category: 'Review' },
    
    // Category
    { value: 'manage_categories', label: 'Quản lý danh mục', category: 'Category' },
    { value: 'create_category', label: 'Tạo danh mục', category: 'Category' },
    { value: 'update_category', label: 'Cập nhật danh mục', category: 'Category' },
    { value: 'delete_category', label: 'Xóa danh mục', category: 'Category' },
    { value: 'view_categories', label: 'Xem danh mục', category: 'Category' },
    
    // Cart
    { value: 'manage_cart', label: 'Quản lý giỏ hàng', category: 'Cart' },
    { value: 'view_cart', label: 'Xem giỏ hàng', category: 'Cart' },
    
    // Role & Permission
    { value: 'manage_roles', label: 'Quản lý roles', category: 'Role' },
    { value: 'view_roles', label: 'Xem roles', category: 'Role' },
    { value: 'create_role', label: 'Tạo role', category: 'Role' },
    { value: 'update_role', label: 'Cập nhật role', category: 'Role' },
    { value: 'delete_role', label: 'Xóa role', category: 'Role' },
    { value: 'assign_role', label: 'Gán role', category: 'Role' },
    { value: 'grant_permission', label: 'Cấp permission', category: 'Role' },
    { value: 'revoke_permission', label: 'Thu hồi permission', category: 'Role' },
    
    // Audit
    { value: 'view_audit_logs', label: 'Xem audit logs', category: 'Audit' },
    { value: 'view_statistics', label: 'Xem thống kê', category: 'Audit' },
    
    // Upload
    { value: 'upload_image', label: 'Upload hình ảnh', category: 'Upload' },
    { value: 'delete_image', label: 'Xóa hình ảnh', category: 'Upload' },
    
    // Dashboard
    { value: 'view_dashboard', label: 'Xem dashboard', category: 'Dashboard' },
    { value: 'view_admin_stats', label: 'Xem thống kê admin', category: 'Dashboard' },
  ];

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users?limit=100');
      const usersData = response.data?.data?.users || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      console.log('Roles API Response:', response.data);
      const rolesData = response.data?.data?.roles || [];
      console.log('Roles Data:', rolesData);
      setRoles(rolesData);
      if (rolesData.length === 0) {
        console.warn('No roles found or empty roles array');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Lỗi tải danh sách roles: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      const response = await api.get(`/roles/user/${userId}/permissions`);
      setUserPermissions(response.data?.data || null);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      alert('Lỗi khi tải permissions của user');
    }
  };

  const handleViewPermissions = async (user) => {
    setSelectedUser(user);
    await fetchUserPermissions(user.id);
  };

  const handleAssignRole = async () => {
    if (!selectedRole) {
      alert('Vui lòng chọn role');
      return;
    }

    try {
      await api.post('/roles/user/assign', {
        userId: selectedUser.id,
        roleId: parseInt(selectedRole)
      });
      setShowAssignRoleModal(false);
      setSelectedRole('');
      await fetchUserPermissions(selectedUser.id);
      alert('Gán role thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi gán role');
    }
  };

  const handleGrantPermission = async () => {
    if (!selectedPermission) {
      alert('Vui lòng chọn permission');
      return;
    }

    if (!userPermissions?.roles || userPermissions.roles.length === 0) {
      alert('User cần có ít nhất 1 role trước khi cấp permission riêng');
      return;
    }

    try {
      await api.post('/roles/user/grant-permission', {
        userId: selectedUser.id,
        roleId: userPermissions.roles[0].roleId,
        permission: selectedPermission
      });
      setShowGrantPermissionModal(false);
      setSelectedPermission('');
      await fetchUserPermissions(selectedUser.id);
      alert('Cấp permission thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi cấp permission');
    }
  };

  const handleRevokePermission = async (roleId, permission) => {
    if (!window.confirm(`Bạn có chắc muốn thu hồi quyền "${permission}"?`)) return;

    try {
      await api.post('/roles/user/revoke-permission', {
        userId: selectedUser.id,
        roleId: roleId,
        permission: permission
      });
      await fetchUserPermissions(selectedUser.id);
      alert('Thu hồi permission thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi thu hồi permission');
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa role này khỏi user?')) return;

    try {
      await api.delete(`/roles/user/${selectedUser.id}/role/${roleId}`);
      await fetchUserPermissions(selectedUser.id);
      alert('Xóa role thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi xóa role');
    }
  };

  const handleDenyPermission = async () => {
    if (!selectedDenyPermission) {
      alert('Vui lòng chọn permission cần chặn');
      return;
    }

    if (!userPermissions?.roles || userPermissions.roles.length === 0) {
      alert('User cần có ít nhất 1 role');
      return;
    }

    try {
      await api.post('/roles/user/deny-permission', {
        userId: selectedUser.id,
        roleId: userPermissions.roles[0].roleId,
        permission: selectedDenyPermission
      });
      setShowDenyPermissionModal(false);
      setSelectedDenyPermission('');
      await fetchUserPermissions(selectedUser.id);
      alert('Chặn permission thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi chặn permission');
    }
  };

  const handleAllowPermission = async (roleId, permission) => {
    if (!window.confirm(`Bạn có chắc muốn cho phép lại quyền "${permission}"?`)) return;

    try {
      await api.post('/roles/user/allow-permission', {
        userId: selectedUser.id,
        roleId: roleId,
        permission: permission
      });
      await fetchUserPermissions(selectedUser.id);
      alert('Cho phép permission thành công');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi cho phép permission');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-primary" />
          Quản lý Quyền Người Dùng
        </h1>
        <p className="text-gray-600 mt-1">Gán roles và permissions chi tiết cho từng user</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm user..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleViewPermissions(user)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                      selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{user.username}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        {user.fullName && (
                          <div className="text-xs text-gray-500">{user.fullName}</div>
                        )}
                      </div>
                      {selectedUser?.id === user.id && (
                        <Eye size={18} className="text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Permissions Detail */}
        <div className="lg:col-span-2">
          {!selectedUser ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Shield size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Chọn một user để xem và quản lý quyền</p>
            </div>
          ) : !userPermissions ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedUser.username}</h2>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAssignRoleModal(true)}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Gán Role
                    </button>
                    <button
                      onClick={() => setShowGrantPermissionModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Cấp Permission
                    </button>
                    <button
                      onClick={() => setShowDenyPermissionModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <X size={18} />
                      Chặn Permission
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Tổng số permissions:</span>
                    <span className="text-2xl font-bold text-primary">{userPermissions.totalPermissions || 0}</span>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  Roles ({userPermissions.roles?.length || 0})
                </h3>
                {userPermissions.roles && userPermissions.roles.length > 0 ? (
                  <div className="space-y-4">
                    {userPermissions.roles.map((userRole) => (
                      <div key={userRole.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-800">{userRole.Role.name}</h4>
                            <p className="text-sm text-gray-600">{userRole.Role.permissions?.length || 0} permissions từ role</p>
                          </div>
                          <button
                            onClick={() => handleRemoveRole(userRole.roleId)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Role Permissions */}
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">Permissions từ role:</div>
                          <div className="flex flex-wrap gap-2">
                            {userRole.Role.permissions?.map((perm) => (
                              <span key={perm} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {AVAILABLE_PERMISSIONS.find(p => p.value === perm)?.label || perm}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Additional Permissions */}
                        {userRole.additionalPermissions && userRole.additionalPermissions.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">Permissions riêng (đã cấp thêm):</div>
                            <div className="flex flex-wrap gap-2">
                              {userRole.additionalPermissions.map((perm) => (
                                <span key={perm} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
                                  {AVAILABLE_PERMISSIONS.find(p => p.value === perm)?.label || perm}
                                  <button
                                    onClick={() => handleRevokePermission(userRole.roleId, perm)}
                                    className="hover:text-red-600"
                                    title="Thu hồi permission"
                                  >
                                    <X size={14} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Denied Permissions */}
                        {userRole.deniedPermissions && userRole.deniedPermissions.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Permissions bị chặn:</div>
                            <div className="flex flex-wrap gap-2">
                              {userRole.deniedPermissions.map((perm) => (
                                <span key={perm} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1 line-through">
                                  {AVAILABLE_PERMISSIONS.find(p => p.value === perm)?.label || perm}
                                  <button
                                    onClick={() => handleAllowPermission(userRole.roleId, perm)}
                                    className="hover:text-green-600 no-underline"
                                    title="Cho phép lại permission"
                                  >
                                    <Check size={14} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">User chưa có role nào</p>
                )}
              </div>

              {/* All Permissions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Tất cả Permissions hiện tại</h3>
                <div className="flex flex-wrap gap-2">
                  {userPermissions.permissions && userPermissions.permissions.length > 0 ? (
                    userPermissions.permissions.map((perm) => (
                      <span key={perm} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                        <Check size={14} />
                        {AVAILABLE_PERMISSIONS.find(p => p.value === perm)?.label || perm}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Không có permissions</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Role Modal */}
      {showAssignRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Gán Role cho {selectedUser.username}</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2">Chọn Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Chọn role --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.permissions?.length || 0} permissions)
                  </option>
                ))}
              </select>
            </div>
            <div className="p-6 border-t flex gap-4">
              <button
                onClick={handleAssignRole}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-accent transition"
              >
                Gán Role
              </button>
              <button
                onClick={() => {
                  setShowAssignRoleModal(false);
                  setSelectedRole('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Permission Modal */}
      {showGrantPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Cấp Permission riêng cho {selectedUser.username}</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2">Chọn Permission</label>
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Chọn permission --</option>
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <option key={perm.value} value={perm.value}>
                    {perm.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Permission này sẽ được thêm riêng cho user, không ảnh hưởng đến role
              </p>
            </div>
            <div className="p-6 border-t flex gap-4">
              <button
                onClick={handleGrantPermission}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                Cấp Permission
              </button>
              <button
                onClick={() => {
                  setShowGrantPermissionModal(false);
                  setSelectedPermission('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Permission Modal */}
      {showDenyPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Chặn Permission cho {selectedUser.username}</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2">Chọn Permission cần chặn</label>
              <select
                value={selectedDenyPermission}
                onChange={(e) => setSelectedDenyPermission(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">-- Chọn permission --</option>
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <option key={perm.value} value={perm.value}>
                    {perm.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 mt-2">
                ⚠️ Permission này sẽ bị chặn ngay cả khi role có quyền đó. User sẽ không thể truy cập các trang yêu cầu permission này.
              </p>
            </div>
            <div className="p-6 border-t flex gap-4">
              <button
                onClick={handleDenyPermission}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Chặn Permission
              </button>
              <button
                onClick={() => {
                  setShowDenyPermissionModal(false);
                  setSelectedDenyPermission('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissionsPage;
