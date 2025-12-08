const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(authenticateToken, authorizeRole(['ADMIN']));

/**
 * @route   GET /api/reports/revenue
 * @desc    Get revenue report
 * @access  Admin
 */
router.get('/revenue', reportController.getRevenueReport);

/**
 * @route   GET /api/reports/top-products
 * @desc    Get top selling products report
 * @access  Admin
 */
router.get('/top-products', reportController.getTopProductsReport);

/**
 * @route   GET /api/reports/export/excel
 * @desc    Export report to Excel
 * @access  Admin
 */
router.get('/export/excel', reportController.exportExcel);

/**
 * @route   GET /api/reports/export/pdf
 * @desc    Export report to PDF
 * @access  Admin
 */
router.get('/export/pdf', reportController.exportPDF);

module.exports = router;
