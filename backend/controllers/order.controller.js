import { Order, OrderItem, Cart, Product, User } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
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

    // Validate required fields
    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: user_id, items',
      });
    }

    if (!shipping_address || !phone || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin giao hàng',
      });
    }

    // Kiểm tra user tồn tại
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    // Generate unique order number
    const generateOrderNumber = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      return `ORD${timestamp}${random}`;
    };

    const orderNumber = generateOrderNumber();

    // Lấy thông tin chi tiết sản phẩm và tính tổng tiền
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Sản phẩm ID ${item.product_id} không tồn tại`,
        });
      }

      // Kiểm tra tồn kho (nếu có field stock)
      if (product.stock && product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" không đủ hàng trong kho`,
        });
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
      });
    }

    // Tính phí vận chuyển (mặc định 30000 theo model)
    const shippingFee = 0; // Miễn phí vận chuyển theo checkout component
    const totalAmount = subtotal + shippingFee;

    // Tạo đơn hàng với order_number
    const order = await Order.create(
      {
        user_id,
        order_number: orderNumber, // Add this line
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
      { transaction }
    );

    // Tạo order items
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction });

    // Cập nhật stock sản phẩm (nếu có)
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (product.stock !== null && product.stock !== undefined) {
        await product.update(
          {
            stock: product.stock - item.quantity,
          },
          { transaction }
        );
      }
    }

    // Clear user's cart after successful order creation
    await Cart.destroy({
      where: { user_id },
      transaction,
    });

    await transaction.commit();

    // Trả về thông tin đơn hàng
    const createdOrder = await Order.findByPk(order.id, {
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
    await transaction.rollback();
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tạo đơn hàng',
      error: error.message,
    });
  }
};
// Lấy danh sách đơn hàng của user
export const getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = { user_id };

    if (status) {
      whereCondition.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
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

// Lấy chi tiết đơn hàng
export const getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { user_id } = req.query;

    const whereCondition = { id: order_id };
    if (user_id) {
      whereCondition.user_id = user_id;
    }

    const order = await Order.findOne({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: [
                'id',
                'name',
                'featured_image',
                'slug',
                'description',
              ],
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

// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { payment_status, transaction_id, payment_info } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    const updateData = { payment_status };

    // Nếu thanh toán thành công, cập nhật status đơn hàng
    if (payment_status === 'paid') {
      updateData.status = 'processing';
    } else if (payment_status === 'failed') {
      updateData.status = 'cancelled';
    }

    await order.update(updateData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: order,
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
// Cập nhật trạng thái đơn hàng
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

    const order = await Order.findByPk(order_id);
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

    await order.update(updateData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order,
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

// Hủy đơn hàng
export const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { order_id } = req.params;
    const { user_id } = req.body;

    const order = await Order.findOne({
      where: { id: order_id, user_id },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc processing
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng ở trạng thái hiện tại',
      });
    }

    // Hoàn trả stock sản phẩm
    for (const item of order.items) {
      const product = await Product.findByPk(item.product_id);
      if (product && product.stock !== null) {
        await product.update(
          {
            stock: product.stock + item.quantity,
          },
          { transaction }
        );
      }
    }

    // Cập nhật trạng thái đơn hàng
    await order.update(
      {
        status: 'cancelled',
        notes: (order.notes || '') + '\nĐơn hàng đã được hủy bởi khách hàng.',
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hủy đơn hàng',
      error: error.message,
    });
  }
};

// Lấy tất cả đơn hàng (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, payment_status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (status) whereCondition.status = status;
    if (payment_status) whereCondition.payment_status = payment_status;
    if (search) {
      whereCondition[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
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
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
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
