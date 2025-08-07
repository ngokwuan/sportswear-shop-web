import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Cart from './Cart.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Review from './Review.js';

// User associations
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// Product associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Review associations
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

export { User, Category, Product, Cart, Order, OrderItem, Review };
