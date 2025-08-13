// seed-products.js
import Product from '../models/products.model.js'; // Sửa đường dẫn từ './models/Product.js' thành '../models/Product.js'
import sequelize from '../config/database.js'; // Sửa đường dẫn từ './config/database.js' thành '../config/database.js'

const sampleProducts = [
  {
    name: 'Nike Air Max Running Shoes',
    slug: 'nike-air-max-running-shoes',
    description: 'Giày chạy bộ Nike Air Max với công nghệ đệm khí tiên tiến',
    price: 1299.0,
    sale_price: null,
    stock_quantity: 50,
    category_id: 1,
    brand: 'Nike',
    size: 'M',
    color: 'Black/White',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    ]),
    featured_image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    is_featured: true,
    status: 'active',
  },
  {
    name: 'Adidas Ultraboost 22',
    slug: 'adidas-ultraboost-22',
    description:
      'Giày chạy bộ Adidas Ultraboost 22 với đế giữa BOOST responsive',
    price: 1899.0,
    sale_price: 1599.0,
    stock_quantity: 30,
    category_id: 1,
    brand: 'Adidas',
    size: 'L',
    color: 'White/Blue',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
    ]),
    featured_image:
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop',
    is_featured: false,
    status: 'active',
  },
  {
    name: 'Nike Tech Fleece Hoodie',
    slug: 'nike-tech-fleece-hoodie',
    description:
      'Áo hoodie Nike Tech Fleece với chất liệu cao cấp, giữ ấm tối ưu',
    price: 799.0,
    sale_price: null,
    stock_quantity: 25,
    category_id: 2,
    brand: 'Nike',
    size: 'M',
    color: 'Black',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    ]),
    featured_image:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
    is_featured: true,
    status: 'active',
  },
  {
    name: 'Under Armour Storm Duffel Bag',
    slug: 'under-armour-storm-duffel-bag',
    description: 'Túi tập gym Under Armour với công nghệ chống nước Storm',
    price: 599.0,
    sale_price: 450.0,
    stock_quantity: 40,
    category_id: 3,
    brand: 'Under Armour',
    size: 'L',
    color: 'Green',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=800&h=800&fit=crop',
    ]),
    featured_image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
    is_featured: false,
    status: 'active',
  },
  {
    name: 'Puma RS-X Sneakers',
    slug: 'puma-rs-x-sneakers',
    description: 'Giày sneakers Puma RS-X với thiết kế retro-futuristic',
    price: 999.0,
    sale_price: null,
    stock_quantity: 35,
    category_id: 1,
    brand: 'Puma',
    size: 'M',
    color: 'Multi',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&h=800&fit=crop',
    ]),
    featured_image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    is_featured: true,
    status: 'active',
  },
  {
    name: 'Adidas 3-Stripes Track Jacket',
    slug: 'adidas-3-stripes-track-jacket',
    description: 'Áo khoác thể thao Adidas 3-Stripes classic',
    price: 899.0,
    sale_price: null,
    stock_quantity: 20,
    category_id: 2,
    brand: 'Adidas',
    size: 'L',
    color: 'Black/White',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    ]),
    featured_image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    is_featured: false,
    status: 'active',
  },
  {
    name: 'Premium Yoga Training Mat',
    slug: 'premium-yoga-training-mat',
    description: 'Thảm tập yoga cao cấp với bề mặt chống trượt',
    price: 249.0,
    sale_price: 199.0,
    stock_quantity: 60,
    category_id: 3,
    brand: 'YogaPro',
    size: 'L',
    color: 'Purple',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
    ]),
    featured_image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
    is_featured: false,
    status: 'active',
  },
  {
    name: 'Nike Basketball Shorts',
    slug: 'nike-basketball-shorts',
    description: 'Quần short bóng rổ Nike với chất liệu Dri-FIT',
    price: 549.0,
    sale_price: null,
    stock_quantity: 45,
    category_id: 2,
    brand: 'Nike',
    size: 'M',
    color: 'Navy Blue',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop',
    ]),
    featured_image:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop',
    is_featured: false,
    status: 'active',
  },
];

async function seedProducts() {
  try {
    console.log('🚀 Bắt đầu seed dữ liệu sản phẩm...');

    // Kết nối database
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    // Sync models
    await sequelize.sync();
    console.log('✅ Sync database thành công');

    // Xóa dữ liệu cũ (tùy chọn)
    console.log('🗑️ Xóa dữ liệu cũ...');
    await Product.destroy({ where: {}, force: true });

    // Thêm dữ liệu mới
    console.log('📦 Thêm sản phẩm mới...');
    const products = await Product.bulkCreate(sampleProducts);

    console.log(`✅ Đã thêm thành công ${products.length} sản phẩm!`);

    // Hiển thị danh sách sản phẩm
    console.log('\n📋 Danh sách sản phẩm đã thêm:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Giá: ${product.price}$`);
      console.log(`   - Brand: ${product.brand}`);
      console.log(`   - Ảnh: ${product.featured_image}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error.message);
    console.error('Chi tiết lỗi:', error);
  } finally {
    await sequelize.close();
    console.log('📕 Đã đóng kết nối database');
    process.exit();
  }
}

// Chạy seed
seedProducts();
