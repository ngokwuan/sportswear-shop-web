import * as dashboardService from '../services/dashboard.service.js';

export const getDashboardStats = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardSummary();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê dashboard',
      error: error.message,
    });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const recentOrders = await dashboardService.getRecentOrders(limit);
    return res.status(200).json({ success: true, data: recentOrders });
  } catch (error) {
    console.error('Recent orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy đơn hàng gần đây',
      error: error.message,
    });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const topProducts = await dashboardService.getTopProducts(limit);
    return res.status(200).json({ success: true, data: topProducts });
  } catch (error) {
    console.error('Top products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy sản phẩm bán chạy',
      error: error.message,
    });
  }
};

export const getChartData = async (req, res) => {
  try {
    const { type = 'revenue', period = '7days' } = req.query;
    const chartData = await dashboardService.getChartData(type, period);
    return res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    console.error('Chart data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy dữ liệu biểu đồ',
      error: error.message,
    });
  }
};

export const getOrderStatusStats = async (req, res) => {
  try {
    const statusStats = await dashboardService.getOrderStatusStats();
    return res.status(200).json({ success: true, data: statusStats });
  } catch (error) {
    console.error('Order status stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê trạng thái đơn hàng',
      error: error.message,
    });
  }
};

export const getCategoryStats = async (req, res) => {
  try {
    const categoryStats = await dashboardService.getCategoryStats();
    return res.status(200).json({ success: true, data: categoryStats });
  } catch (error) {
    console.error('Category stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê danh mục',
      error: error.message,
    });
  }
};
