const express = require('express');
const searchHistoryController = require('../controllers/searchHistoryController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public - gợi ý tìm kiếm
router.get('/suggestions', searchHistoryController.getSuggestions);
router.get('/trending', searchHistoryController.getTrendingSearches);

// User routes - cần đăng nhập
router.post('/', authenticateToken, searchHistoryController.saveSearch);
router.get('/', authenticateToken, searchHistoryController.getSearchHistory);
router.delete('/keyword/:keyword', authenticateToken, searchHistoryController.deleteSearchKeyword);
router.delete('/', authenticateToken, searchHistoryController.clearSearchHistory);

module.exports = router;
