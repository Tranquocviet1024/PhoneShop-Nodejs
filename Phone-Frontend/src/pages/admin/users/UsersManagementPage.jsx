import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  RefreshCw,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import UserService from '../../../services/UserService';
import UserTable from './UserTable';
import UserModal from './UserModal';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả', icon: Users },
  { id: 'active', label: 'Hoạt động', icon: UserCheck },
  { id: 'inactive', label: 'Tạm khóa', icon: UserX },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'username', label: 'Username' },
  { value: 'email', label: 'Email' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const INITIAL_FORM = {
  username: '',
  email: '',
  password: '',
  fullName: '',
  roleName: 'USER',
  isActive: true,
};

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Modal & CRUD state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await UserService.getAllRoles();
        if (response.success) {
          setAvailableRoles(response.data.roles || []);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        setAvailableRoles([
          { id: 1, name: 'USER' },
          { id: 2, name: 'ADMIN' },
        ]);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const query = {
          page,
          limit: pageSize,
          sort: filters.sortBy,
          order: filters.sortOrder,
        };

        if (filters.role) {
          query.role = filters.role;
        }
        if (debouncedSearch) {
          query.search = debouncedSearch;
        }
        if (filters.status === 'active') {
          query.isActive = true;
        } else if (filters.status === 'inactive') {
          query.isActive = false;
        }

        const response = await UserService.getAllUsers(query);

        if (!ignore && response.success) {
          setUsers(response.data.users || []);
          setPagination(response.data.pagination || { total: 0, totalPages: 1 });
          setSummary(response.data.summary || null);
        }
      } catch (error) {
        if (!ignore) {
          const message = error.response?.data?.error?.message || 'Failed to load users';
          showToast(message, 'error');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      ignore = true;
    };
  }, [page, pageSize, filters, debouncedSearch, refreshIndex, showToast]);

  const roleFilters = useMemo(() => {
    const distribution = summary?.roleDistribution || [];

    const mergedRoles = [...availableRoles];

    distribution.forEach((item) => {
      if (item.role && !mergedRoles.find((role) => role.name === item.role)) {
        mergedRoles.push({ id: item.role, name: item.role });
      }
    });

    return mergedRoles;
  }, [availableRoles, summary]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    // Use ReDoS-safe email regex with limited quantifiers
    if (!/^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setErrors({});
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setIsEditing(true);
    setEditingId(user.id);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      fullName: user.fullName || '',
      roleName: user.assignedRole?.name || 'USER',
      isActive: user.isActive,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await UserService.deleteUser(userToDelete.id);
      if (response.success) {
        showToast('Đã xóa người dùng', 'success');
        setShowDeleteDialog(false);
        setUserToDelete(null);
        setRefreshIndex((prev) => prev + 1);
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to delete user';
      showToast(message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setModalLoading(true);
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        roleName: formData.roleName || 'USER',
        isActive: formData.isActive,
      };

      if (!isEditing || formData.password) {
        payload.password = formData.password;
      }

      const response = isEditing
        ? await UserService.updateUser(editingId, payload)
        : await UserService.createUser(payload);

      if (response.success) {
        showToast(response.message || (isEditing ? 'Cập nhật thành công' : 'Tạo người dùng thành công'));
        setShowModal(false);
        setFormData(INITIAL_FORM);
        setIsEditing(false);
        setEditingId(null);
        setRefreshIndex((prev) => prev + 1);
      }
    } catch (error) {
      const message = error.response?.data?.error?.message;
      setErrors({ general: message || (isEditing ? 'Failed to update user' : 'Failed to create user') });
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleToggleStatus = async (user) => {
    try {
      setActionLoadingId(user.id);
      const response = await UserService.updateUser(user.id, { isActive: !user.isActive });
      if (response.success) {
        const updatedUser = response.data;
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        showToast(`User ${updatedUser.isActive ? 'đã được kích hoạt' : 'đã bị tạm khóa'}`);
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Không thể cập nhật trạng thái';
      showToast(message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilters({ role: '', status: 'all', sortBy: 'createdAt', sortOrder: 'desc' });
    setPage(1);
  };

  const totalResults = pagination.total || users.length;
  const pageStart = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalResults || page * pageSize);

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white z-40 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
          <p className="text-sm text-gray-500">Theo dõi quyền, trạng thái và hoạt động của toàn bộ tài khoản</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setRefreshIndex((prev) => prev + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={18} />
            Thêm người dùng
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={Users}
          label="Tổng người dùng"
          value={summary?.totalUsers ?? pagination.total ?? 0}
          accent="blue"
        />
        <StatsCard
          icon={UserCheck}
          label="Đang hoạt động"
          value={summary?.activeUsers ?? 0}
          hint={summary ? `${Math.round((summary.activeUsers / (summary.totalUsers || 1)) * 100)}% tổng số` : ''}
          accent="green"
        />
        <StatsCard
          icon={UserX}
          label="Tạm khóa"
          value={summary?.inactiveUsers ?? 0}
          accent="rose"
        />
        <StatsCard
          icon={ShieldCheck}
          label="Tài khoản mới (7 ngày)"
          value={summary?.newThisWeek ?? 0}
          accent="purple"
        />
      </section>

      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo username, email, họ tên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sắp xếp theo: {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <Filter size={16} />
              Đặt lại
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = filters.status === tab.id;
            const badgeValue =
              tab.id === 'all'
                ? summary?.totalUsers ?? pagination.total ?? 0
                : tab.id === 'active'
                ? summary?.activeUsers ?? 0
                : summary?.inactiveUsers ?? 0;

          return (
              <button
                key={tab.id}
                onClick={() => handleFilterChange('status', tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600 hover:border-blue-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100 text-gray-500'}`}>
                  {badgeValue}
                </span>
              </button>
            );
          })}
        </div>

        {roleFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200">
            <button
              onClick={() => handleFilterChange('role', '')}
              className={`px-3 py-1.5 text-sm rounded-full border ${
                !filters.role ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'
              }`}
            >
              Tất cả vai trò
            </button>
            {roleFilters.map((role) => (
              <button
                key={role.id || role.name}
                onClick={() => handleFilterChange('role', role.name)}
                className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-2 ${
                  filters.role === role.name ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                {role.name}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {summary?.roleDistribution?.find((r) => r.role === role.name)?.count ?? 0}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <UserTable
          users={users}
          loading={loading}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
          actionLoadingId={actionLoadingId}
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-500">
          Hiển thị {pageStart}-{pageEnd} trên tổng {totalResults} người dùng
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="px-3 py-2 text-sm text-gray-600">
            Trang {page} / {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min((pagination.totalPages || 1), prev + 1))}
            disabled={page === (pagination.totalPages || 1)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      </div>

      <UserModal
        isOpen={showModal}
        isEditing={isEditing}
        formData={formData}
        onFormChange={handleFormChange}
        onSave={handleSave}
        onCancel={handleCancel}
        errors={errors}
        isLoading={modalLoading}
        availableRoles={availableRoles}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        userName={userToDelete?.username}
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, hint, accent = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    rose: 'text-rose-600 bg-rose-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
      <div className={`p-3 rounded-full ${colorMap[accent]}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default UsersManagementPage;
