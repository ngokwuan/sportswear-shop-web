import * as cartService from '../services/cart.service.js';

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    const { productId, quantity = 1, size = null } = req.body;

    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!productId)
      return res
        .status(400)
        .json({ success: false, message: 'productId required' });

    const product = await cartService.findProductById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    const availableStock = cartService.getAvailableStock(product);
    if (availableStock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: 'Not enough stock' });
    }

    const item = await cartService.addOrUpdateCartItem({
      userId,
      productId,
      quantity,
      size,
    });

    return res.json({ success: true, message: 'Added to cart', data: item });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
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

    const serializedCart = await cartService.getCartByUser(userId);
    res.json(serializedCart);
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
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ count: 0 });
    }

    const count = await cartService.getCartCountByUser(userId);
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

    const cartItem = await cartService.findCartItemForUpdate(cartId, userId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng',
      });
    }

    const updatedItem = await cartService.updateCartItemQuantity(
      cartItem,
      quantity,
    );

    return res.status(200).json({
      success: true,
      message: 'Đã cập nhật số lượng sản phẩm',
      cartItem: updatedItem,
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

    const deletedRows = await cartService.deleteCartItem(cart_id, userId);

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

    const deletedRows = await cartService.clearCartByUser(userId);

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
