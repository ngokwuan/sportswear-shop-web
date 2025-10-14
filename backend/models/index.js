import User from './users.model.js';
import Category from './categories.model.js';
import Product from './products.model.js';
import Cart from './cart.model.js';
import Order from './orders.model.js';
import OrderItem from './order-items.model.js';
import Review from './reviews.model.js';
import Blog from './blogs.model.js';

// User Associations
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
User.hasMany(Blog, { foreignKey: 'author_id', as: 'blogs' });

// Product Associations (REMOVED category relationships)
// Since category_ids is a JSON array, we cannot use standard Sequelize associations
// You'll need to handle category relationships manually in your queries
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

// Cart Associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order Associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// OrderItem Associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Review Associations
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Blog Associations
Blog.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
// REMOVED category relationship for Blog since it also uses category_ids as JSON array

// NOTE: Category associations are removed because category_ids is a JSON array field
// If you need to query products by category, do it manually in your controllers like this:
//
// Get all products in a category:
// const products = await Product.findAll({
//   where: Sequelize.literal(`JSON_CONTAINS(category_ids, '${categoryId}')`)
// });
//
// Or use raw queries for more complex category filtering

export { User, Category, Product, Cart, Order, OrderItem, Review, Blog };
