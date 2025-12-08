import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchHistoryService from '../services/SearchHistoryService';
import { useAuth } from '../context/AuthContext';

const SearchWithHistory = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Debounce suggestions
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchInitialData = async () => {
    try {
      // Fetch user's search history if logged in
      if (user) {
        const historyResponse = await SearchHistoryService.getSearchHistory(5);
        setSearchHistory(historyResponse.data || []);
      }

      // Fetch trending searches
      const trendingResponse = await SearchHistoryService.getTrendingSearches(5);
      setTrending(trendingResponse.data || []);
    } catch (error) {
      console.error('Error fetching search data:', error);
    }
  };

  const fetchSuggestions = async (searchQuery) => {
    try {
      const response = await SearchHistoryService.getSuggestions(searchQuery, 5);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = async (searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setIsOpen(false);

    // Save to search history if user is logged in
    if (user) {
      try {
        await SearchHistoryService.saveSearch(trimmedQuery);
      } catch (error) {
        console.error('Error saving search:', error);
      }
    }

    // Navigate to products page with search query
    navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    setQuery('');
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleDeleteHistory = async (keyword, e) => {
    e.stopPropagation();
    try {
      await SearchHistoryService.deleteSearchKeyword(keyword);
      setSearchHistory(searchHistory.filter(h => h.keyword !== keyword));
    } catch (error) {
      console.error('Error deleting search history:', error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await SearchHistoryService.clearSearchHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Suggestions (when typing) */}
          {query.trim().length >= 2 && suggestions.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-xs text-gray-500 uppercase">Gợi ý</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion.keyword || suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-gray-700">{suggestion.keyword || suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search History (when not typing) */}
          {query.trim().length < 2 && user && searchHistory.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <div className="flex items-center justify-between px-4 py-1">
                <p className="text-xs text-gray-500 uppercase">Lịch sử tìm kiếm</p>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Xóa tất cả
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSearch(item.keyword)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{item.keyword}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistory(item.keyword, e)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {query.trim().length < 2 && trending.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-xs text-gray-500 uppercase">🔥 Tìm kiếm phổ biến</p>
              <div className="flex flex-wrap gap-2 px-4 py-2">
                {trending.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item.keyword)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition"
                  >
                    {item.keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {query.trim().length < 2 && searchHistory.length === 0 && trending.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p>Nhập từ khóa để tìm kiếm sản phẩm</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchWithHistory;
