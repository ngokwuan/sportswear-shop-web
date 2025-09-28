import {
  User,
  Product,
  Order,
  OrderItem,
  Blog,
  Category,
} from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalActiveUsers = await User.count({
      where: { deleted_at: null },
    });

    const totalProducts = await Product.count();
    const totalActiveProducts = await Product.count({
      where: { deleted_at: null },
    });

    const totalOrders = await Order.count();

    const revenueResult = await Order.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total_revenue'],
      ],
      where: {
        payment_status: 'paid',
      },
    });
    const totalRevenue = revenueResult?.dataValues?.total_revenue || 0;

    const totalBlogs = await Blog.count();
    const publishedBlogs = await Blog.count({
      where: { status: 'published' },
    });

    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const lastMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0,
      23,
      59,
      59
    );

    const usersThisMonth = await User.count({
      where: {
        created_at: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const usersLastMonth = await User.count({
      where: {
        created_at: {
          [Op.between]: [lastMonth, endOfLastMonth],
        },
      },
    });

    const ordersThisMonth = await Order.count({
      where: {
        created_at: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const ordersLastMonth = await Order.count({
      where: {
        created_at: {
          [Op.between]: [lastMonth, endOfLastMonth],
        },
      },
    });

    const revenueThisMonth = await Order.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'revenue'],
      ],
      where: {
        payment_status: 'paid',
        created_at: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const revenueLastMonth = await Order.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'revenue'],
      ],
      where: {
        payment_status: 'paid',
        created_at: {
          [Op.between]: [lastMonth, endOfLastMonth],
        },
      },
    });

    const calculateGrowthRate = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userGrowth = calculateGrowthRate(usersThisMonth, usersLastMonth);
    const orderGrowth = calculateGrowthRate(ordersThisMonth, ordersLastMonth);
    const revenueGrowthValue = calculateGrowthRate(
      revenueThisMonth?.dataValues?.revenue || 0,
      revenueLastMonth?.dataValues?.revenue || 0
    );

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalActiveUsers,
        totalProducts,
        totalActiveProducts,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue),
        totalBlogs,
        publishedBlogs,
        monthlyStats: {
          usersThisMonth,
          ordersThisMonth,
          revenueThisMonth: parseFloat(
            revenueThisMonth?.dataValues?.revenue || 0
          ),
          userGrowth,
          orderGrowth,
          revenueGrowth: revenueGrowthValue,
        },
      },
    });
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

    const recentOrders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'featured_image'],
            },
          ],
          limit: 1,
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
    });

    return res.status(200).json({
      success: true,
      data: recentOrders,
    });
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

    const topProducts = await Product.findAll({
      attributes: [
        'id',
        'name',
        'featured_image',
        'price',
        'sale_price',
        [
          Sequelize.literal(`(
            SELECT SUM(order_items.quantity)
            FROM order_items
            INNER JOIN orders ON order_items.order_id = orders.id
            WHERE order_items.product_id = Product.id
            AND orders.payment_status = 'paid'
          )`),
          'total_sold',
        ],
        [
          Sequelize.literal(`(
            SELECT SUM(order_items.total_price)
            FROM order_items
            INNER JOIN orders ON order_items.order_id = orders.id
            WHERE order_items.product_id = Product.id
            AND orders.payment_status = 'paid'
          )`),
          'total_revenue',
        ],
      ],
      having: Sequelize.literal('total_sold > 0'),
      order: [[Sequelize.literal('total_sold'), 'DESC']],
      limit: parseInt(limit),
    });

    return res.status(200).json({
      success: true,
      data: topProducts,
    });
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

    let dateRange;
    let groupBy;

    const now = new Date();

    switch (period) {
      case '7days':
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'DATE(created_at)';
        break;
      case '30days':
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'DATE(created_at)';
        break;
      case '12months':
        dateRange = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        break;
      default:
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'DATE(created_at)';
    }

    let chartData;

    if (type === 'revenue') {
      chartData = await Order.findAll({
        attributes: [
          [Sequelize.literal(groupBy), 'period'],
          [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'value'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        ],
        where: {
          created_at: {
            [Op.gte]: dateRange,
          },
          payment_status: 'paid',
        },
        group: [Sequelize.literal(groupBy)],
        order: [['period', 'ASC']],
      });
    } else if (type === 'orders') {
      chartData = await Order.findAll({
        attributes: [
          [Sequelize.literal(groupBy), 'period'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'value'],
        ],
        where: {
          created_at: {
            [Op.gte]: dateRange,
          },
        },
        group: [Sequelize.literal(groupBy)],
        order: [['period', 'ASC']],
      });
    } else if (type === 'users') {
      chartData = await User.findAll({
        attributes: [
          [Sequelize.literal(groupBy), 'period'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'value'],
        ],
        where: {
          created_at: {
            [Op.gte]: dateRange,
          },
        },
        group: [Sequelize.literal(groupBy)],
        order: [['period', 'ASC']],
      });
    }

    return res.status(200).json({
      success: true,
      data: chartData,
    });
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
    const statusStats = await Order.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });

    return res.status(200).json({
      success: true,
      data: statusStats,
    });
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
    const categoryStats = await Category.findAll({
      attributes: [
        'id',
        'name',
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM products
            WHERE products.category_id = Category.id
            AND products.deleted_at IS NULL
          )`),
          'product_count',
        ],
      ],
      order: [[Sequelize.literal('product_count'), 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: categoryStats,
    });
  } catch (error) {
    console.error('Category stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê danh mục',
      error: error.message,
    });
  }
};
