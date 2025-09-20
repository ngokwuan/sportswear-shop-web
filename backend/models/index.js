import User from './users.model.js';
import Category from './categories.model.js';
import Product from './products.model.js';
import Cart from './cart.model.js';
import Order from './orders.model.js';
import OrderItem from './order-items.model.js';
import Review from './reviews.model.js';
import Blog from './blogs.model.js';

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

User.hasMany(Blog, {
  foreignKey: 'author_id',
  as: 'blogs',
});

Blog.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author',
});

Category.hasMany(Blog, {
  foreignKey: 'category_id',
  as: 'blogs',
});

Blog.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});
export { User, Category, Product, Cart, Order, OrderItem, Review, Blog };
