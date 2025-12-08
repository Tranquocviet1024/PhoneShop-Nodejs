const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op, fn, col, literal } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Lấy báo cáo doanh thu
exports.getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const where = { status: 'delivered' };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const orders = await Order.findAll({
      where,
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('SUM', col('totalAmount')), 'revenue'],
        [fn('COUNT', col('id')), 'orderCount']
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.revenue), 0);
    const totalOrders = orders.reduce((sum, o) => sum + Number(o.orderCount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.status(200).json(
      new ApiResponse(200, {
        data: orders,
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          period: { startDate, endDate }
        }
      }, 'Revenue report retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy báo cáo sản phẩm bán chạy
exports.getTopProductsReport = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const where = { status: 'delivered' };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const orders = await Order.findAll({ where, raw: true });

    // Aggregate product sales from order items
    const productSales = {};
    orders.forEach(order => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      items?.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.name,
            image: item.image,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, Number(limit));

    res.status(200).json(
      new ApiResponse(200, topProducts, 'Top products report retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Xuất báo cáo Excel
exports.exportExcel = async (req, res, next) => {
  try {
    const { reportType = 'revenue', startDate, endDate } = req.query;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PhoneShop';
    workbook.created = new Date();

    if (reportType === 'revenue') {
      await generateRevenueExcel(workbook, startDate, endDate);
    } else if (reportType === 'products') {
      await generateProductsExcel(workbook, startDate, endDate);
    } else if (reportType === 'orders') {
      await generateOrdersExcel(workbook, startDate, endDate);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${reportType}-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// Xuất báo cáo PDF
exports.exportPDF = async (req, res, next) => {
  try {
    const { reportType = 'revenue', startDate, endDate } = req.query;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${reportType}-${Date.now()}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('BÁO CÁO PHONESHOP', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Loại báo cáo: ${reportType.toUpperCase()}`, { align: 'center' });
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, { align: 'center' });
    if (startDate && endDate) {
      doc.text(`Khoảng thời gian: ${startDate} - ${endDate}`, { align: 'center' });
    }
    doc.moveDown(2);

    if (reportType === 'revenue') {
      await generateRevenuePDF(doc, startDate, endDate);
    } else if (reportType === 'products') {
      await generateProductsPDF(doc, startDate, endDate);
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

// Helper functions for Excel generation
async function generateRevenueExcel(workbook, startDate, endDate) {
  const sheet = workbook.addWorksheet('Doanh thu');

  sheet.columns = [
    { header: 'Ngày', key: 'date', width: 15 },
    { header: 'Số đơn hàng', key: 'orderCount', width: 15 },
    { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 }
  ];

  const where = { status: 'delivered' };
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  }

  const orders = await Order.findAll({
    where,
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('SUM', col('totalAmount')), 'revenue'],
      [fn('COUNT', col('id')), 'orderCount']
    ],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']],
    raw: true
  });

  orders.forEach(order => {
    sheet.addRow({
      date: order.date,
      orderCount: order.orderCount,
      revenue: Number(order.revenue).toLocaleString('vi-VN')
    });
  });

  // Summary row
  sheet.addRow({});
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.revenue), 0);
  const totalOrders = orders.reduce((sum, o) => sum + Number(o.orderCount), 0);
  sheet.addRow({
    date: 'TỔNG CỘNG',
    orderCount: totalOrders,
    revenue: totalRevenue.toLocaleString('vi-VN')
  });

  // Style header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
}

async function generateProductsExcel(workbook, startDate, endDate) {
  const sheet = workbook.addWorksheet('Sản phẩm bán chạy');

  sheet.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'Tên sản phẩm', key: 'name', width: 40 },
    { header: 'Số lượng bán', key: 'quantity', width: 15 },
    { header: 'Doanh thu (VNĐ)', key: 'revenue', width: 20 }
  ];

  const where = { status: 'delivered' };
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  }

  const orders = await Order.findAll({ where, raw: true });

  const productSales = {};
  orders.forEach(order => {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    items?.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20);

  topProducts.forEach((product, index) => {
    sheet.addRow({
      stt: index + 1,
      name: product.name,
      quantity: product.quantity,
      revenue: product.revenue.toLocaleString('vi-VN')
    });
  });

  sheet.getRow(1).font = { bold: true };
}

async function generateOrdersExcel(workbook, startDate, endDate) {
  const sheet = workbook.addWorksheet('Đơn hàng');

  sheet.columns = [
    { header: 'Mã đơn', key: 'orderId', width: 20 },
    { header: 'Khách hàng', key: 'customer', width: 25 },
    { header: 'Ngày đặt', key: 'date', width: 15 },
    { header: 'Tổng tiền', key: 'total', width: 18 },
    { header: 'Trạng thái', key: 'status', width: 15 }
  ];

  const where = {};
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  }

  const orders = await Order.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['username', 'email'] }],
    order: [['createdAt', 'DESC']],
    limit: 500
  });

  const statusMap = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };

  orders.forEach(order => {
    sheet.addRow({
      orderId: order.orderId,
      customer: order.user?.username || order.user?.email || 'N/A',
      date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
      total: Number(order.totalAmount).toLocaleString('vi-VN'),
      status: statusMap[order.status] || order.status
    });
  });

  sheet.getRow(1).font = { bold: true };
}

// Helper functions for PDF generation
async function generateRevenuePDF(doc, startDate, endDate) {
  const where = { status: 'delivered' };
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  }

  const orders = await Order.findAll({
    where,
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('SUM', col('totalAmount')), 'revenue'],
      [fn('COUNT', col('id')), 'orderCount']
    ],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']],
    raw: true
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.revenue), 0);
  const totalOrders = orders.reduce((sum, o) => sum + Number(o.orderCount), 0);

  doc.fontSize(14).text('TỔNG QUAN', { underline: true });
  doc.moveDown();
  doc.fontSize(12)
    .text(`Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} VNĐ`)
    .text(`Tổng số đơn hàng: ${totalOrders}`)
    .text(`Giá trị đơn hàng trung bình: ${(totalRevenue / totalOrders || 0).toLocaleString('vi-VN')} VNĐ`);

  doc.moveDown(2);
  doc.fontSize(14).text('CHI TIẾT THEO NGÀY', { underline: true });
  doc.moveDown();

  orders.slice(0, 30).forEach(order => {
    doc.fontSize(10).text(
      `${order.date} | ${order.orderCount} đơn | ${Number(order.revenue).toLocaleString('vi-VN')} VNĐ`
    );
  });
}

async function generateProductsPDF(doc, startDate, endDate) {
  const where = { status: 'delivered' };
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  }

  const orders = await Order.findAll({ where, raw: true });

  const productSales = {};
  orders.forEach(order => {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    items?.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 15);

  doc.fontSize(14).text('TOP SẢN PHẨM BÁN CHẠY', { underline: true });
  doc.moveDown();

  topProducts.forEach((product, index) => {
    doc.fontSize(10).text(
      `${index + 1}. ${product.name.substring(0, 40)}... | SL: ${product.quantity} | DT: ${product.revenue.toLocaleString('vi-VN')} VNĐ`
    );
  });
}
