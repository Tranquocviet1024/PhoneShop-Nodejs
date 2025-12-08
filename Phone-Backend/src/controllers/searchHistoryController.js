const SearchHistory = require('../models/SearchHistory');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op, fn, col, literal } = require('sequelize');

// Lưu lịch sử tìm kiếm
exports.saveSearch = async (req, res, next) => {
  try {
    const { keyword, resultCount = 0 } = req.body;

    if (!keyword || keyword.trim().length < 2) {
      return res.status(200).json(
        new ApiResponse(200, null, 'Keyword too short, not saved')
      );
    }

    // Kiểm tra nếu từ khóa này đã tìm gần đây (trong 5 phút) thì không lưu lại
    const recentSearch = await SearchHistory.findOne({
      where: {
        userId: req.userId,
        keyword: keyword.trim(),
        searchedAt: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // 5 phút
        }
      }
    });

    if (recentSearch) {
      // Cập nhật thời gian và số kết quả
      recentSearch.searchedAt = new Date();
      recentSearch.resultCount = resultCount;
      await recentSearch.save();
      return res.status(200).json(
        new ApiResponse(200, recentSearch, 'Search updated')
      );
    }

    const search = await SearchHistory.create({
      userId: req.userId,
      keyword: keyword.trim(),
      resultCount,
      searchedAt: new Date()
    });

    res.status(201).json(
      new ApiResponse(201, search, 'Search saved')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy lịch sử tìm kiếm của user
exports.getSearchHistory = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Lấy các từ khóa gần đây nhất, loại bỏ trùng lặp
    const searches = await SearchHistory.findAll({
      where: { userId: req.userId },
      attributes: ['keyword', 'resultCount', [fn('MAX', col('searchedAt')), 'lastSearched']],
      group: ['keyword', 'resultCount'],
      order: [[literal('lastSearched'), 'DESC']],
      limit: Number(limit)
    });

    res.status(200).json(
      new ApiResponse(200, searches, 'Search history retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa một từ khóa khỏi lịch sử
exports.deleteSearchKeyword = async (req, res, next) => {
  try {
    const { keyword } = req.params;

    await SearchHistory.destroy({
      where: { userId: req.userId, keyword }
    });

    res.status(200).json(
      new ApiResponse(200, null, 'Search keyword deleted')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa toàn bộ lịch sử tìm kiếm
exports.clearSearchHistory = async (req, res, next) => {
  try {
    await SearchHistory.destroy({
      where: { userId: req.userId }
    });

    res.status(200).json(
      new ApiResponse(200, null, 'Search history cleared')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy từ khóa phổ biến (trending)
exports.getTrendingSearches = async (req, res, next) => {
  try {
    const { limit = 10, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trending = await SearchHistory.findAll({
      attributes: [
        'keyword',
        [fn('COUNT', col('keyword')), 'searchCount'],
        [fn('AVG', col('resultCount')), 'avgResults']
      ],
      where: {
        searchedAt: { [Op.gte]: startDate }
      },
      group: ['keyword'],
      order: [[literal('searchCount'), 'DESC']],
      limit: Number(limit)
    });

    res.status(200).json(
      new ApiResponse(200, trending, 'Trending searches retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Gợi ý từ khóa (autocomplete)
exports.getSuggestions = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;

    // ✅ FIXED: Type confusion - Validate q is a string before using .length
    if (typeof q !== 'string' || q.length < 2) {
      return res.status(200).json(
        new ApiResponse(200, [], 'No suggestions')
      );
    }

    // Tìm từ khóa bắt đầu bằng q
    const suggestions = await SearchHistory.findAll({
      attributes: [
        'keyword',
        [fn('COUNT', col('keyword')), 'popularity']
      ],
      where: {
        keyword: { [Op.like]: `${q}%` }
      },
      group: ['keyword'],
      order: [[literal('popularity'), 'DESC']],
      limit: Number(limit)
    });

    res.status(200).json(
      new ApiResponse(200, suggestions.map(s => s.keyword), 'Suggestions retrieved')
    );
  } catch (error) {
    next(error);
  }
};
