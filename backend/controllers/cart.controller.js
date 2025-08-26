import Cart from '../models/cart.model.js';
import Product from '../models/products.model.js';
import { getUserByEmail } from '../services/user.service.js';

export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    // Lấy thông tin user từ token (đã được xác thực qua middleware)
    const userEmail = req.user.email;

    // Tìm user để lấy user_id
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingCartItem = await Cart.findOne({
      where: {
        user_id: user.id,
        product_id: product_id,
      },
    });

    if (existingCartItem) {
      return res.status(409).json({
        success: false,
        message: 'Sản phẩm đã có trong giỏ hàng',
      });
    } else {
      // Nếu chưa có, tạo mới
      const newCartItem = await Cart.create({
        user_id: user.id,
        product_id: product_id,
        quantity: parseInt(quantity),
      });

      return res.status(201).json({
        success: true,
        message: 'Đã thêm sản phẩm vào giỏ hàng',
        cartItem: newCartItem,
      });
    }
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
    const userEmail = req.user.email;

    // Tìm user để lấy user_id
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Lấy giỏ hàng với thông tin sản phẩm
    const cartItems = await Cart.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Product,
          as: 'product',
        },
      ],
    });

    return res.status(200).json({
      success: true,
      cartItems: cartItems,
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy giỏ hàng',
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { cart_id, quantity } = req.body;
    const userEmail = req.user.email;

    // Tìm user để lấy user_id
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Tìm cart item và đảm bảo nó thuộc về user hiện tại
    const cartItem = await Cart.findOne({
      where: {
        id: cart_id,
        user_id: user.id,
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
