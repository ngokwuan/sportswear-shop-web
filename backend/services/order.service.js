import { Order, OrderItem, Cart, Product, User } from '../models/index.js';
import { Op } from 'sequelize';

export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

export const findUserById = async (userId) => {
  return User.findByPk(userId);
};

export const getAvailableStock = (product) => {
  return product.stock ?? product.stock_quantity ?? 0;
};

/**
 * Lock sản phẩm trong transaction để check/trừ kho an toàn (tránh race condition)
 */
export const lockProductForUpdate = async (productId, transaction) => {
  return Product.findByPk(productId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
};

/**
 * Validate từng item: sản phẩm tồn tại + đủ hàng, tính subtotal.
 * Ném lỗi có `.status` để controller trả đúng mã lỗi (404/400).
 */
export const buildOrderItems = async (items, transaction) => {
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await lockProductForUpdate(item.product_id, transaction);
    if (!product) {
      const err = new Error(`Sản phẩm ID ${item.product_id} không tồn tại`);
      err.status = 404;
      throw err;
    }

    const availableStock = getAvailableStock(product);
    if (availableStock < item.quantity) {
      const err = new Error(
        `Sản phẩm "${product.name}" không đủ hàng trong kho`,
      );
      err.status = 400;
      throw err;
    }

    const price = item.price || product.sale_price || product.price;
    const totalPrice = price * item.quantity;
    subtotal += totalPrice;

    orderItems.push({
      product_id: item.product_id,
      product_name: product.name,
      product_price: price,
      quantity: item.quantity,
      total_price: totalPrice,
      size: item.size || null,
    });
  }

  return { orderItems, subtotal };
};

export const createOrderRecord = async (orderData, transaction) => {
  return Order.create(orderData, { transaction });
};

export const createOrderItems = async (orderItems, orderId, transaction) => {
  const rows = orderItems.map((it) => ({ ...it, order_id: orderId }));
  return OrderItem.bulkCreate(rows, { transaction });
};

export const decrementStock = async (items, transaction) => {
  for (const item of items) {
    const product = await lockProductForUpdate(item.product_id, transaction);
    if (product) {
      const currentStock = getAvailableStock(product);
      const newStock = Math.max(0, currentStock - Number(item.quantity));

      const updateData = {};
      if (product.stock !== undefined) updateData.stock = newStock;
      if (product.stock_quantity !== undefined)
        updateData.stock_quantity = newStock;

      await product.update(updateData, { transaction });
    }
  }
};

export const restoreStock = async (items, transaction) => {
  for (const item of items) {
    const product = await lockProductForUpdate(item.product_id, transaction);
    if (product) {
      const currentStock = getAvailableStock(product);
      const newStock = currentStock + Number(item.quantity);

      const updateData = {};
      if (product.stock !== undefined) updateData.stock = newStock;
      if (product.stock_quantity !== undefined)
        updateData.stock_quantity = newStock;

      await product.update(updateData, { transaction });
    }
  }
};

export const clearCartForUser = async (userId, transaction) => {
  return Cart.destroy({ where: { user_id: userId }, transaction });
};

export const getOrderWithItems = async (orderId) => {
  return Order.findByPk(orderId, {
    include: [
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
      },
    ],
  });
};

export const getOrdersByUser = async ({ userId, status, limit, offset }) => {
  const whereCondition = { user_id: userId };
  if (status) whereCondition.status = status;

  return Order.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'featured_image', 'slug'],
          },
        ],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
};

export const getOrderDetail = async (orderId, userId) => {
  const whereCondition = { id: orderId };
  if (userId) whereCondition.user_id = userId;

  return Order.findOne({
    where: whereCondition,
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'featured_image', 'slug', 'description'],
          },
        ],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'name'],
      },
    ],
  });
};

export const findOrderById = async (orderId) => {
  return Order.findByPk(orderId);
};

export const updateOrder = async (order, updateData, transaction) => {
  await order.update(updateData, transaction ? { transaction } : undefined);
  return order;
};

export const findOrderForCancel = async (orderId, userId) => {
  return Order.findOne({
    where: { id: orderId, user_id: userId },
    include: [{ model: OrderItem, as: 'items' }],
  });
};

export const getAllOrdersAdmin = async ({
  status,
  paymentStatus,
  search,
  limit,
  offset,
}) => {
  const whereCondition = {};
  if (status) whereCondition.status = status;
  if (paymentStatus) whereCondition.payment_status = paymentStatus;
  if (search) {
    whereCondition[Op.or] = [
      { order_number: { [Op.like]: `%${search}%` } },
      { customer_name: { [Op.like]: `%${search}%` } },
      { customer_email: { [Op.like]: `%${search}%` } },
    ];
  }

  return Order.findAndCountAll({
    where: whereCondition,
    include: [
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
      },
      { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
};
