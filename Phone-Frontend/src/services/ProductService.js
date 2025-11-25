import api from '../api/axiosConfig';

const ProductService = {
  // Get all products with filters
  getAllProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : '/products';

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single product
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create product (ADMIN ONLY)
  createProduct: async (data) => {
    try {
      const response = await api.post('/products', {
        name: data.name,
        category: data.category,
        price: data.price,
        originalPrice: data.originalPrice,
        discount: data.discount || 0,
        image: data.image,
        description: data.description,
        specifications: data.specifications || [],
        stock: data.stock || 0,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update product (ADMIN ONLY)
  updateProduct: async (id, data) => {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete product (ADMIN ONLY)
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default ProductService;
