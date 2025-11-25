import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import CategoryService from '../../../services/CategoryService';
import CategoryTable from './CategoryTable';
import CategoryModal from './CategoryModal';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const CategoriesPage = () => {
  // Data states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Show toast message
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch categories with search & sort
  const fetchCategories = useCallback(
    async (searchTerm = '', sort = 'createdAt', order = 'desc') => {
      try {
        setLoading(true);
        const response = await CategoryService.getAllCategories(searchTerm, sort, order);
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        const message = error.response?.data?.error?.message || 'Failed to load categories';
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Fetch on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch on search change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(search, sortBy, sortOrder);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, sortBy, sortOrder, fetchCategories]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter category name';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Add Click
  const handleAddClick = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setErrors({});
    setShowModal(true);
  };

  // Handle Edit Click
  const handleEditClick = (category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle Delete Click
  const handleDeleteClick = (id) => {
    const category = categories.find(c => c.id === id);
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await CategoryService.deleteCategory(categoryToDelete.id);
      if (response.success) {
        showToast('Category deleted successfully', 'success');
        fetchCategories(search, sortBy, sortOrder);
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to delete category';
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
      let response;
      if (isEditing) {
        response = await CategoryService.updateCategory(editingId, formData);
      } else {
        response = await CategoryService.createCategory(formData);
      }

      if (response.success) {
        showToast(
          isEditing ? 'Category updated successfully' : 'Category created successfully',
          'success'
        );
        setShowModal(false);
        setFormData({ name: '', description: '' });
        fetchCategories(search, sortBy, sortOrder);
      }
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        (isEditing ? 'Failed to update category' : 'Failed to create category');
      setErrors({ general: message });
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setShowModal(false);
    setFormData({ name: '', description: '' });
    setErrors({});
  };

  // Handle Sort Change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change field and reset order
      setSortBy(field);
      setSortOrder('desc');
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <label className="text-sm text-gray-600 flex items-center">Sort by:</label>
            <button
              onClick={() => handleSortChange('name')}
              className={`px-3 py-1 text-sm rounded-md transition ${
                sortBy === 'name'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('createdAt')}
              className={`px-3 py-1 text-sm rounded-md transition ${
                sortBy === 'createdAt'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('updatedAt')}
              className={`px-3 py-1 text-sm rounded-md transition ${
                sortBy === 'updatedAt'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Updated {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <CategoryTable
          categories={categories}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          loading={loading}
        />
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={showModal}
        isEditing={isEditing}
        formData={formData}
        onFormChange={setFormData}
        onSave={handleSave}
        onCancel={handleCancel}
        errors={errors}
        isLoading={modalLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        categoryName={categoryToDelete?.name}
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
};

export default CategoriesPage;
