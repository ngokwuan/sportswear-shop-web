import { Cart, Product } from '../models/index.js';
import { getUserByEmail } from './users.controller.js';

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    const newCartItem = await Cart.create({
      user_id: userId,
      product_id: productId,
      quantity: parseInt(quantity),
    });

    return res.status(201).json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      cartItem: newCartItem,
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
    const userId = req.user.id;

    const cart = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
        },
      ],
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({
      error: 'Lỗi khi lấy giỏ hàng',
      detail: error.message,
    });
  }
};

export const getCountCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItem = await Cart.findAll({
      where: { user_id: userId },
    });
    const count = cartItem.reduce((acc, item) => acc + item.quantity, 0);
    return res.json({ count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng' });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId, quantity } = req.body;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }
    if (!cartId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu cart_id hoặc quantity',
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
    const userEmail = req.user.email;

    // Tìm user để lấy user_id
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Tìm và xóa cart item, đảm bảo nó thuộc về user hiện tại
    const deletedRows = await Cart.destroy({
      where: {
        id: cart_id,
        user_id: user.id,
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
    const userEmail = req.user.email;

    // Tìm user để lấy user_id
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Xóa toàn bộ cart items của user
    const deletedRows = await Cart.destroy({
      where: {
        user_id: user.id,
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
