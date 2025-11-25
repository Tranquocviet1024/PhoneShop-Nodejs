import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';

const DEFAULT_PRICE_RANGE = [0, 50000000];
const PAGE_LIMIT = 12;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await CategoryService.getAllCategories();
      if (response.success) {
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data?.categories || [];
        const categoryNames = payload
          .map((cat) => (typeof cat === 'string' ? cat : cat?.name))
          .filter(Boolean);
        setCategories(['all', ...new Set(categoryNames)]);
      } else {
        setCategories(['all']);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories(['all']);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page,
        limit: PAGE_LIMIT,
        sort: 'newest',
      };

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      if (priceRange[0] > DEFAULT_PRICE_RANGE[0]) {
        filters.minPrice = priceRange[0];
      }
      if (priceRange[1] < DEFAULT_PRICE_RANGE[1]) {
        filters.maxPrice = priceRange[1];
      }

      const response = await ProductService.getAllProducts(filters);
      if (response.success) {
        const productList = Array.isArray(response.data?.products)
          ? response.data.products
          : Array.isArray(response.data)
          ? response.data
          : [];

        setProducts(productList);

        const paginationData = response.data?.pagination || {};
        setPagination({
          page: paginationData.page || page,
          limit: paginationData.limit || PAGE_LIMIT,
          total: paginationData.total ?? productList.length,
          totalPages: paginationData.totalPages || 1,
        });
      } else {
        throw new Error(response.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
      const message = err.response?.data?.error?.message || err.message || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchTerm, priceRange]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPriceRange(DEFAULT_PRICE_RANGE);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePriceChange = (value) => {
    setPriceRange([DEFAULT_PRICE_RANGE[0], value]);
    setPage(1);
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalVisible = products.length;
  const totalProducts = pagination.total || totalVisible;
  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.page || page;

  return (
    <main className="min-h-screen bg-light">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm">
          <Link to="/" className="text-primary hover:text-accent">
            Trang chủ
          </Link>
          <ChevronLeft size={16} className="rotate-180" />
          <span className="text-dark">Sản phẩm</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {/* Search */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Tìm kiếm</h3>
                <input
                  type="text"
                  placeholder="Tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-bold mb-3">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const catName = typeof cat === 'string' ? cat : cat.name;
                    const catKey = typeof cat === 'string' ? cat : cat.id;
                    return (
                      <label key={catKey} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={catName}
                          checked={selectedCategory === catName}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="capitalize">{catName === 'all' ? 'Tất cả' : catName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-bold mb-3">Giá tiền</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="50000000"
                    step="1000000"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>0 VND</span>
                    <span>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(priceRange[1])}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="w-full mt-6 px-4 py-2 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">Sản phẩm</h1>
              <span className="text-gray-600">
                Hiển thị {totalVisible} / {totalProducts} sản phẩm
              </span>
            </div>

            {!loading && error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-xl text-gray-600 mb-4">
                  {(error && 'Không thể tải sản phẩm. Vui lòng thử lại sau.') || 'Không tìm thấy sản phẩm nào'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-accent transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => changePage(p)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      currentPage === p
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductsPage;
