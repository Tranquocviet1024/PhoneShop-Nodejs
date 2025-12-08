import axiosInstance from '../api/axiosConfig';

const ReportService = {
  // Get revenue report
  getRevenueReport: async (startDate, endDate) => {
    const response = await axiosInstance.get('/reports/revenue', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get top products report
  getTopProductsReport: async (startDate, endDate, limit = 10) => {
    const response = await axiosInstance.get('/reports/top-products', {
      params: { startDate, endDate, limit }
    });
    return response.data;
  },

  // Export Excel report
  exportExcel: async (reportType, startDate, endDate) => {
    const response = await axiosInstance.get('/reports/export/excel', {
      params: { reportType, startDate, endDate },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${reportType}-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Export PDF report
  exportPDF: async (reportType, startDate, endDate) => {
    const response = await axiosInstance.get('/reports/export/pdf', {
      params: { reportType, startDate, endDate },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${reportType}-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default ReportService;
