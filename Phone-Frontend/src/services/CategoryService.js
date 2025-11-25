import api from '../api/axiosConfig';

const CategoryService = {
  // Get all categories with optional search and sorting
  getAllCategories: async (search = '', sort = 'createdAt', order = 'desc') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      if (order) params.append('order', order);
      
      const queryString = params.toString();
      const url = queryString ? `/categories?${queryString}` : '/categories';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single category by ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get enum values (all categories)
  getCategoryEnumValues: async () => {
    try {
      const response = await api.get('/categories/enum/values');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new category (ADMIN ONLY)
  createCategory: async (data) => {
    try {
      const response = await api.post('/categories', {
        name: data.name,
        description: data.description || '',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update category (ADMIN ONLY)
  updateCategory: async (id, data) => {
    try {
      const response = await api.put(`/categories/${id}`, {
        name: data.name,
        description: data.description || '',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete category (ADMIN ONLY)
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default CategoryService;
