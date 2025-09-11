import { Cart, Product } from '../models/index.js';
import { getUserByEmail } from './users.controller.js';

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingCartItem = await Cart.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Nếu đã có, cập nhật số lượng
      existingCartItem.quantity += parseInt(quantity);
      cartItem = await existingCartItem.save();
    } else {
      // Nếu chưa có, tạo mới
      cartItem = await Cart.create({
        user_id: userId,
        product_id: productId,
        quantity: parseInt(quantity),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      cartItem: cartItem,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng',
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Vui lòng đăng nhập để xem giỏ hàng',
      });
    }

    const cart = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: [
            'id',
            'name',
            'price',
            'sale_price',
            'featured_image',
            'size',
            'brand',
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(cart);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy giỏ hàng',
      detail: error.message,
    });
  }
};

export const getCountCart = async (req, res) => {
  try {
    // Sử dụng optionalUserJWT middleware để endpoint này không yêu cầu bắt buộc phải đăng nhập
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ count: 0 });
    }

    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      attributes: ['quantity'],
    });

    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    return res.json({ count });
  } catch (error) {
    console.error('Error getting cart count:', error);
    return res.status(500).json({
      count: 0,
      message: 'Lỗi khi lấy số lượng giỏ hàng',
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cartId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để cập nhật giỏ hàng',
      });
    }

    if (!cartId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin cập nhật không hợp lệ',
      });
    }

    // Tìm cart item và đảm bảo nó thuộc về user hiện tại
    const cartItem = await Cart.findOne({
      where: {
        id: cartId,
        user_id: userId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng',
      });
    }

    // Cập nhật số lượng
    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: 'Đã cập nhật số lượng sản phẩm',
      cartItem: cartItem,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật giỏ hàng',
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cart_id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng',
      });
    }

    // Tìm và xóa cart item, đảm bảo nó thuộc về user hiện tại
    const deletedRows = await Cart.destroy({
      where: {
        id: cart_id,
        user_id: userId,
      },
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng',
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để xóa giỏ hàng',
      });
    }

    const deletedRows = await Cart.destroy({
      where: {
        user_id: userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Đã xóa toàn bộ giỏ hàng (${deletedRows} sản phẩm)`,
      deletedCount: deletedRows,
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa giỏ hàng',
    });
  }
};
