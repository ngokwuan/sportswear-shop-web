import { Cart, Product } from '../models/index.js';

// export const addToCart = async (req, res) => {
//   try {
//     const userId = req.user?.id || req.body.user_id;
//     const { productId, quantity = 1, size = null } = req.body;

//     if (!userId)
//       return res.status(401).json({ success: false, message: 'Unauthorized' });
//     if (!productId)
//       return res
//         .status(400)
//         .json({ success: false, message: 'productId required' });

//     // check product exists and global stock
//     const product = await Product.findByPk(productId);
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Product not found' });

//     const availableStock = product.stock ?? product.stock_quantity ?? 0;
//     if (availableStock < quantity) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Not enough stock' });
//     }

//     // try find existing cart item with same size (size can be null)
//     const where = {
//       user_id: userId,
//       product_id: productId,
//       size: size || null,
//     };

//     let item = await Cart.findOne({ where });

//     if (item) {
//       item.quantity = item.quantity + Number(quantity);
//       await item.save();
//     } else {
//       item = await Cart.create({
//         user_id: userId,
//         product_id: productId,
//         quantity: Number(quantity),
//         size: size || null,
//       });
//     }

//     return res.json({ success: true, message: 'Added to cart', data: item });
//   } catch (error) {
//     console.error('Add to cart error:', error);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    const { productId, quantity = 1, size = null } = req.body;

    console.log('Add to cart request:', { userId, productId, quantity, size });

    if (!userId)
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!productId)
      return res
        .status(400)
        .json({ success: false, message: 'productId required' });

    // check product exists and global stock
    const product = await Product.findByPk(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    const availableStock = product.stock ?? product.stock_quantity ?? 0;
    if (availableStock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: 'Not enough stock' });
    }

    // Tìm cart item với cùng user_id, product_id VÀ size
    // Nếu size là null, tìm item có size = null
    const where = {
      user_id: userId,
      product_id: productId,
    };

    // Xử lý size: nếu size được truyền thì match size đó, nếu không thì match null
    if (size) {
      where.size = size;
    } else {
      where.size = null;
    }

    console.log('Finding existing cart item with:', where);

    let item = await Cart.findOne({ where });

    if (item) {
      // Cập nhật số lượng
      console.log('Updating existing cart item');
      item.quantity = item.quantity + Number(quantity);
      await item.save();
    } else {
      // Tạo mới
      console.log('Creating new cart item');
      item = await Cart.create({
        user_id: userId,
        product_id: productId,
        quantity: Number(quantity),
        size: size || null,
      });
    }

    console.log('Cart item saved:', item.toJSON());

    return res.json({ success: true, message: 'Added to cart', data: item });
  } catch (error) {
    console.error('Add to cart error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      details: error.stack,
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
      raw: false,
    });

    // Serialize và format featured_image
    const serializedCart = cart.map((item) => {
      const plain = item.toJSON();

      // Format featured_image
      if (plain.product?.featured_image) {
        const img = plain.product.featured_image;
        if (typeof img === 'object' && img.url) {
          plain.product.featured_image = img.url;
        } else if (typeof img !== 'string') {
          plain.product.featured_image = null;
        }
      }

      return plain;
    });

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
