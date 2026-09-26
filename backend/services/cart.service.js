import { Cart, Product } from '../models/index.js';

export const findProductById = async (productId) => {
  return Product.findByPk(productId);
};

export const getAvailableStock = (product) => {
  return product.stock ?? product.stock_quantity ?? 0;
};

export const findCartItem = async ({ userId, productId, size }) => {
  return Cart.findOne({
    where: {
      user_id: userId,
      product_id: productId,
      size: size || null,
    },
  });
};

export const incrementCartItem = async (item, quantity) => {
  item.quantity = item.quantity + Number(quantity);
  await item.save();
  return item;
};

export const createCartItem = async ({ userId, productId, quantity, size }) => {
  return Cart.create({
    user_id: userId,
    product_id: productId,
    quantity: Number(quantity),
    size: size || null,
  });
};

/**
 * Thêm sản phẩm vào giỏ: nếu đã có item cùng user/product/size thì cộng dồn
 * số lượng, chưa có thì tạo mới.
 * Nếu DB có unique constraint chỉ trên (user_id, product_id) không bao gồm size,
 * việc thêm cùng sản phẩm với size khác sẽ bị lỗi duplicate key.
 * Trường hợp này ta bắt lỗi và fallback về cộng dồn số lượng của item hiện có.
 */
export const addOrUpdateCartItem = async ({
  userId,
  productId,
  quantity,
  size,
}) => {
  const existing = await findCartItem({ userId, productId, size });

  if (existing) {
    return incrementCartItem(existing, quantity);
  }

  try {
    return await createCartItem({ userId, productId, quantity, size });
  } catch (err) {
    // Handle DB-level unique constraint (e.g. unique on user_id+product_id only)
    if (
      err.name === 'SequelizeUniqueConstraintError' ||
      (err.original && err.original.code === 'ER_DUP_ENTRY')
    ) {
      // Re-fetch the conflicting item (may differ in size stored in DB)
      const conflict = await Cart.findOne({
        where: { user_id: userId, product_id: productId },
      });
      if (conflict) {
        return incrementCartItem(conflict, quantity);
      }
    }
    throw err;
  }
};

/**
 * Chuẩn hoá featured_image về dạng string URL (hoặc null) khi trả về client
 */
const serializeCartItem = (item) => {
  const plain = item.toJSON();

  if (plain.product?.featured_image) {
    const img = plain.product.featured_image;
    if (typeof img === 'object' && img.url) {
      plain.product.featured_image = img.url;
    } else if (typeof img !== 'string') {
      plain.product.featured_image = null;
    }
  }

  return plain;
};

export const getCartByUser = async (userId) => {
  const cart = await Cart.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: [
          'id',
          'name',
          'slug',
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

  return cart.map(serializeCartItem);
};

export const getCartCountByUser = async (userId) => {
  const cartItems = await Cart.findAll({
    where: { user_id: userId },
    attributes: ['quantity'],
  });

  return cartItems.reduce((acc, item) => acc + item.quantity, 0);
};

export const findCartItemForUpdate = async (cartId, userId) => {
  return Cart.findOne({
    where: { id: cartId, user_id: userId },
  });
};

export const updateCartItemQuantity = async (cartItem, quantity) => {
  cartItem.quantity = parseInt(quantity);
  await cartItem.save();
  return cartItem;
};

export const deleteCartItem = async (cartId, userId) => {
  return Cart.destroy({
    where: { id: cartId, user_id: userId },
  });
};

export const clearCartByUser = async (userId) => {
  return Cart.destroy({
    where: { user_id: userId },
  });
};
