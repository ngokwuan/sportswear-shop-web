import sequelize from '../config/database.js';
import * as orderService from '../services/order.service.js';

/**
 * Rollback an toàn: chỉ rollback nếu transaction chưa commit/rollback trước đó.
 */
const safeRollback = async (transaction) => {
  if (!transaction.finished) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }
  }
};

export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      user_id,
      items,
      shipping_address,
      phone,
      email,
      name,
      notes,
      payment_method = 'vnpay',
    } = req.body;

    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      await safeRollback(transaction);
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: user_id, items',
      });
    }

    if (!shipping_address || !phone || !email || !name) {
      await safeRollback(transaction);
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin giao hàng',
      });
    }

    const user = await orderService.findUserById(user_id);
    if (!user) {
      await safeRollback(transaction);
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    const orderNumber = orderService.generateOrderNumber();

    const { orderItems, subtotal } = await orderService.buildOrderItems(
      items,
      transaction,
    );

    const shippingFee = 0;
    const totalAmount = subtotal + shippingFee;

    const order = await orderService.createOrderRecord(
      {
        user_id,
        order_number: orderNumber,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address,
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        payment_method,
        payment_status: 'pending',
        status: 'pending',
        notes: notes || null,
      },
      transaction,
    );

    await orderService.createOrderItems(orderItems, order.id, transaction);
    await orderService.decrementStock(items, transaction);
    await orderService.clearCartForUser(user_id, transaction);

    await transaction.commit();

    const createdOrder = await orderService.getOrderWithItems(order.id);

    return res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: {
        order_id: createdOrder.id,
        order_number: createdOrder.order_number,
        total_amount: createdOrder.total_amount,
        order: createdOrder,
      },
    });
  } catch (error) {
    await safeRollback(transaction);
    console.error('Create order error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Lỗi tạo đơn hàng',
      error: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await orderService.getOrdersByUser({
      userId: user_id,
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách đơn hàng',
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { user_id } = req.query;

    const order = await orderService.getOrderDetail(order_id, user_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết đơn hàng',
      error: error.message,
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { payment_status } = req.body;

    const order = await orderService.findOrderById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    const updateData = { payment_status };

    if (payment_status === 'paid') {
      updateData.status = 'processing';
    } else if (payment_status === 'failed') {
      updateData.status = 'cancelled';
    }

    const updatedOrder = await orderService.updateOrder(order, updateData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái thanh toán',
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }

    const order = await orderService.findOrderById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    const updateData = { status };
    if (notes) {
      updateData.notes = notes;
    }

    const updatedOrder = await orderService.updateOrder(order, updateData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái đơn hàng',
      error: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { order_id } = req.params;
    const { user_id } = req.body;

    const order = await orderService.findOrderForCancel(order_id, user_id);

    if (!order) {
      await safeRollback(transaction);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      await safeRollback(transaction);
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng ở trạng thái hiện tại',
      });
    }

    await orderService.restoreStock(order.items, transaction);

    await orderService.updateOrder(
      order,
      {
        status: 'cancelled',
        notes: (order.notes || '') + '\nĐơn hàng đã được hủy bởi khách hàng.',
      },
      transaction,
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
    });
  } catch (error) {
    await safeRollback(transaction);
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hủy đơn hàng',
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, payment_status, search } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await orderService.getAllOrdersAdmin({
      status,
      paymentStatus: payment_status,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách đơn hàng',
      error: error.message,
    });
  }
};
