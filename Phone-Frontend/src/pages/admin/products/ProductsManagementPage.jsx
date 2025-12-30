import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import ProductService from '../../../services/ProductService';
import CategoryService from '../../../services/CategoryService';
import ProductTable from './ProductTable';
import ProductModal from './ProductModal';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const ProductsManagementPage = () => {
  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    discount: '',
    image: '',
    description: '',
    specifications: [],
    stock: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Show toast message
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts editing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Fetch categories on mount
  const fetchCategories = useCallback(async () => {
    try {
      const response = await CategoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch products with filters
  const fetchProducts = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        const filters = {
          search,
          category: selectedCategory,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          sort: sortBy,
          page: pageNum,
          limit: 10,
        };

        const response = await ProductService.getAllProducts(filters);
        if (response.success) {
          setProducts(response.data.products || []);
          setPagination(response.data.pagination || {});
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        const message = error.response?.data?.error?.message || 'Failed to load products';
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [search, selectedCategory, minPrice, maxPrice, sortBy, showToast]
  );

  // Fetch on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.originalPrice) newErrors.originalPrice = 'Original price is required';
    if (!formData.image.trim()) newErrors.image = 'Product image URL is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (formData.price && formData.originalPrice && parseFloat(formData.price) > parseFloat(formData.originalPrice)) {
      newErrors.price = 'Price cannot be greater than original price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Add Click
  const handleAddClick = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      originalPrice: '',
      discount: '',
      image: '',
      description: '',
      specifications: [],
      stock: '',
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle Edit Click
  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      discount: product.discount?.toString() || '',
      image: product.image,
      description: product.description,
      specifications: product.specifications || [],
      stock: product.stock?.toString() || '',
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle Delete Click
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await ProductService.deleteProduct(productToDelete.id);
      if (response.success) {
        showToast('Product deleted successfully', 'success');
        fetchProducts(page);
        setShowDeleteDialog(false);
        setProductToDelete(null);
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to delete product';
      showToast(message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setModalLoading(true);
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        image: formData.image,
        description: formData.description,
        specifications: formData.specifications.filter(s => {
          // Handle both string format (legacy) and object format {name, value}
          if (typeof s === 'string') {
            return s.trim() !== '';
          }
          return s && s.name && s.name.trim() !== '' && s.value && s.value.trim() !== '';
        }),
        stock: formData.stock ? parseInt(formData.stock) : 0,
      };

      let response;
      if (isEditing) {
        response = await ProductService.updateProduct(editingId, data);
      } else {
        response = await ProductService.createProduct(data);
      }

      if (response.success) {
        showToast(
          isEditing ? 'Product updated successfully' : 'Product created successfully',
          'success'
        );
        setShowModal(false);
        fetchProducts(1);
        setPage(1);
      }
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        (isEditing ? 'Failed to update product' : 'Failed to create product');
      setErrors({ general: message });
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      name: '',
      category: '',
      price: '',
      originalPrice: '',
      discount: '',
      image: '',
      description: '',
      specifications: [],
      stock: '',
    });
    setErrors({});
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white z-40 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Min Price */}
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Max Price */}
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="price">Price (Low to High)</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="inline-flex items-center gap-2 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
        >
          <Filter size={16} />
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ProductTable
          products={products}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          loading={loading}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => {
              setPage(Math.max(1, page - 1));
              fetchProducts(Math.max(1, page - 1));
            }}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPage(p);
                fetchProducts(p);
              }}
              className={`px-3 py-1 rounded-md transition ${
                page === p
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => {
              setPage(Math.min(pagination.totalPages, page + 1));
              fetchProducts(Math.min(pagination.totalPages, page + 1));
            }}
            disabled={page === pagination.totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <ProductModal
        isOpen={showModal}
        isEditing={isEditing}
        formData={formData}
        onFormChange={handleFormChange}
        onSave={handleSave}
        onCancel={handleCancel}
        categories={categories}
        errors={errors}
        isLoading={modalLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        productName={productToDelete?.name}
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};

export default ProductsManagementPage;
