import api from '../api/axiosConfig';

const UserService = {
  /**
   * Get all users with filters, search, and pagination
   * @param {Object} filters - Filter options
   * @returns {Promise}
   */
  getAllUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.role) params.append('role', filters.role);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
      if (filters.isActive !== undefined && filters.isActive !== null) {
        params.append('isActive', filters.isActive);
      }

      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise}
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new user
   * @param {Object} data - User data
   * @returns {Promise}
   */
  createUser: async (data) => {
    try {
      const roleName = data.roleName || data.role || 'USER';
      const response = await api.post('/admin/users', {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName || '',
        roleName,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} data - User data to update
   * @returns {Promise}
   */
  updateUser: async (id, data) => {
    try {
      const updateData = {};
      
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.password !== undefined && data.password) updateData.password = data.password;
      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.roleName !== undefined || data.role !== undefined) {
        updateData.roleName = data.roleName || data.role;
      }
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const response = await api.put(`/admin/users/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise}
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all available roles
   * @returns {Promise}
   */
  getAllRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },
};

export default UserService;
