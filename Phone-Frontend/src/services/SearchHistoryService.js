import axiosInstance from '../api/axiosConfig';

const SearchHistoryService = {
  // Save a search keyword
  saveSearch: async (keyword, resultCount = 0) => {
    const response = await axiosInstance.post('/search-history', {
      keyword,
      resultCount
    });
    return response.data;
  },

  // Get user's search history
  getSearchHistory: async (limit = 10) => {
    const response = await axiosInstance.get('/search-history', {
      params: { limit }
    });
    return response.data;
  },

  // Delete a specific keyword from history
  deleteSearchKeyword: async (keyword) => {
    const response = await axiosInstance.delete(`/search-history/${encodeURIComponent(keyword)}`);
    return response.data;
  },

  // Clear entire search history
  clearSearchHistory: async () => {
    const response = await axiosInstance.delete('/search-history');
    return response.data;
  },

  // Get trending searches (public)
  getTrendingSearches: async (limit = 10) => {
    const response = await axiosInstance.get('/search-history/trending', {
      params: { limit }
    });
    return response.data;
  },

  // Get search suggestions based on query
  getSuggestions: async (query, limit = 5) => {
    const response = await axiosInstance.get('/search-history/suggestions', {
      params: { query, limit }
    });
    return response.data;
  }
};

export default SearchHistoryService;
