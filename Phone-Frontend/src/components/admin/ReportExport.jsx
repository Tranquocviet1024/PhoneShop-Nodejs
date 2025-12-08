import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Calendar, Loader } from 'lucide-react';
import ReportService from '../../services/ReportService';

const ReportExport = () => {
  const [reportType, setReportType] = useState('revenue');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      setError('');
      await ReportService.exportExcel(reportType, startDate, endDate);
    } catch (err) {
      setError('Lỗi khi xuất file Excel');
      console.error('Error exporting Excel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      setError('');
      await ReportService.exportPDF(reportType, startDate, endDate);
    } catch (err) {
      setError('Lỗi khi xuất file PDF');
      console.error('Error exporting PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const setQuickDateRange = (range) => {
    const today = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = end = today;
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date();
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Download className="text-blue-600" />
        Xuất Báo Cáo
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại báo cáo
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="revenue">Báo cáo doanh thu</option>
            <option value="products">Sản phẩm bán chạy</option>
            <option value="orders">Danh sách đơn hàng</option>
          </select>
        </div>

        {/* Quick Date Ranges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khoảng thời gian nhanh
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickDateRange('today')}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setQuickDateRange('week')}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              7 ngày
            </button>
            <button
              onClick={() => setQuickDateRange('month')}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Tháng này
            </button>
            <button
              onClick={() => setQuickDateRange('quarter')}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Quý này
            </button>
            <button
              onClick={() => setQuickDateRange('year')}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Năm nay
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline mr-1" size={16} />
            Từ ngày
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline mr-1" size={16} />
            Đến ngày
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleExportExcel}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <FileSpreadsheet size={20} />
          )}
          Xuất Excel
        </button>

        <button
          onClick={handleExportPDF}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <FileText size={20} />
          )}
          Xuất PDF
        </button>
      </div>

      {/* Report Description */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Mô tả báo cáo:</h3>
        {reportType === 'revenue' && (
          <p className="text-sm text-gray-600">
            Báo cáo doanh thu theo ngày, bao gồm tổng doanh thu, số đơn hàng và giá trị đơn hàng trung bình.
          </p>
        )}
        {reportType === 'products' && (
          <p className="text-sm text-gray-600">
            Danh sách top sản phẩm bán chạy nhất, số lượng bán và doanh thu từng sản phẩm.
          </p>
        )}
        {reportType === 'orders' && (
          <p className="text-sm text-gray-600">
            Danh sách chi tiết các đơn hàng, bao gồm mã đơn, khách hàng, tổng tiền và trạng thái.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportExport;
