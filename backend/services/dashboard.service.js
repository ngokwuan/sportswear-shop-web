import {
  User,
  Product,
  Order,
  OrderItem,
  Blog,
  Category,
} from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

// ---------- Helpers ----------

export const getMonthRanges = () => {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
  );

  return { startOfMonth, endOfMonth, lastMonth, endOfLastMonth };
};

export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// ---------- Dashboard summary ----------

export const getDashboardSummary = async () => {
  const totalUsers = await User.count();
  const totalActiveUsers = await User.count({ where: { deleted_at: null } });

  const totalProducts = await Product.count();
  const totalActiveProducts = await Product.count({
    where: { deleted_at: null },
  });

  const totalOrders = await Order.count();

  const revenueResult = await Order.findOne({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total_revenue'],
    ],
    where: { payment_status: 'paid' },
  });
  const totalRevenue = revenueResult?.dataValues?.total_revenue || 0;

  const totalBlogs = await Blog.count();
  const publishedBlogs = await Blog.count({ where: { status: 'published' } });

  const { startOfMonth, endOfMonth, lastMonth, endOfLastMonth } =
    getMonthRanges();

  const usersThisMonth = await User.count({
    where: { created_at: { [Op.between]: [startOfMonth, endOfMonth] } },
  });
  const usersLastMonth = await User.count({
    where: { created_at: { [Op.between]: [lastMonth, endOfLastMonth] } },
  });

  const ordersThisMonth = await Order.count({
    where: { created_at: { [Op.between]: [startOfMonth, endOfMonth] } },
  });
  const ordersLastMonth = await Order.count({
    where: { created_at: { [Op.between]: [lastMonth, endOfLastMonth] } },
  });

  const revenueThisMonth = await Order.findOne({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'revenue'],
    ],
    where: {
      payment_status: 'paid',
      created_at: { [Op.between]: [startOfMonth, endOfMonth] },
    },
  });

  const revenueLastMonth = await Order.findOne({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'revenue'],
    ],
    where: {
      payment_status: 'paid',
      created_at: { [Op.between]: [lastMonth, endOfLastMonth] },
    },
  });

  const userGrowth = calculateGrowthRate(usersThisMonth, usersLastMonth);
  const orderGrowth = calculateGrowthRate(ordersThisMonth, ordersLastMonth);
  const revenueGrowth = calculateGrowthRate(
    revenueThisMonth?.dataValues?.revenue || 0,
    revenueLastMonth?.dataValues?.revenue || 0,
  );

  return {
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
      revenueThisMonth: parseFloat(revenueThisMonth?.dataValues?.revenue || 0),
      userGrowth,
      orderGrowth,
      revenueGrowth,
    },
  };
};

// ---------- Recent orders ----------

export const getRecentOrders = async (limit = 4) => {
  return Order.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
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
};

// ---------- Top products ----------

export const getTopProducts = async (limit = 5) => {
  const topProductsData = await OrderItem.findAll({
    attributes: [
      'product_id',
      [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_sold'],
      [Sequelize.fn('SUM', Sequelize.col('total_price')), 'total_revenue'],
    ],
    include: [
      {
        model: Order,
        as: 'order',
        attributes: [],
        where: { payment_status: 'paid' },
      },
    ],
    group: ['product_id'],
    having: Sequelize.where(Sequelize.fn('SUM', Sequelize.col('quantity')), {
      [Op.gt]: 0,
    }),
    order: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'DESC']],
    limit: parseInt(limit),
    raw: true,
    subQuery: false,
  });

  const productIds = topProductsData.map((item) => item.product_id);
  if (productIds.length === 0) return [];

  const products = await Product.findAll({
    where: {
      id: { [Op.in]: productIds },
      deleted_at: null,
    },
    attributes: ['id', 'name', 'featured_image', 'price', 'sale_price'],
  });

  return topProductsData
    .map((data) => {
      const product = products.find((p) => p.id === data.product_id);
      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        featured_image: product.featured_image,
        price: product.price,
        sale_price: product.sale_price,
        dataValues: {
          total_sold: parseInt(data.total_sold) || 0,
          total_revenue: parseFloat(data.total_revenue) || 0,
        },
      };
    })
    .filter(Boolean);
};

// ---------- Chart data ----------

const resolveChartRange = (period) => {
  const now = new Date();

  switch (period) {
    case '30days':
      return {
        dateRange: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        groupBy: 'DATE(created_at)',
      };
    case '12months':
      return {
        dateRange: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        groupBy: 'DATE_FORMAT(created_at, "%Y-%m")',
      };
    case '7days':
    default:
      return {
        dateRange: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        groupBy: 'DATE(created_at)',
      };
  }
};

export const getChartData = async (type, period) => {
  const { dateRange, groupBy } = resolveChartRange(period);

  if (type === 'revenue') {
    return Order.findAll({
      attributes: [
        [Sequelize.literal(groupBy), 'period'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'value'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      where: {
        created_at: { [Op.gte]: dateRange },
        payment_status: 'paid',
      },
      group: [Sequelize.literal(groupBy)],
      order: [['period', 'ASC']],
    });
  }

  if (type === 'orders') {
    return Order.findAll({
      attributes: [
        [Sequelize.literal(groupBy), 'period'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'value'],
      ],
      where: { created_at: { [Op.gte]: dateRange } },
      group: [Sequelize.literal(groupBy)],
      order: [['period', 'ASC']],
    });
  }

  if (type === 'users') {
    return User.findAll({
      attributes: [
        [Sequelize.literal(groupBy), 'period'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'value'],
      ],
      where: { created_at: { [Op.gte]: dateRange } },
      group: [Sequelize.literal(groupBy)],
      order: [['period', 'ASC']],
    });
  }

  // type không hợp lệ — giữ đúng hành vi gốc: trả về undefined
  return undefined;
};

// ---------- Order status stats ----------

export const getOrderStatusStats = async () => {
  return Order.findAll({
    attributes: [
      'status',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
    ],
    group: ['status'],
  });
};

// ---------- Category stats ----------

export const getCategoryStats = async () => {
  return Category.findAll({
    attributes: [
      'id',
      'name',
      [
        Sequelize.literal(`(
          SELECT COUNT(*)
          FROM products
          WHERE JSON_CONTAINS(products.category_ids, CAST(Category.id AS JSON))
          AND products.deleted_at IS NULL
        )`),
        'product_count',
      ],
    ],
    order: [[Sequelize.literal('product_count'), 'DESC']],
  });
};
