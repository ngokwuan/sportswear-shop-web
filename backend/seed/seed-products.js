import Product from '../models/products.model.js';
import sequelize from '../config/database.js';
import slugify from 'slugify';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    console.log(`Loaded .env from: ${envPath}`);
    envLoaded = true;
    break;
  } catch (error) {
    continue;
  }
}

if (!envLoaded) {
  console.warn(
    'Warning: No .env file found, using default environment variables'
  );
}

const sampleProducts = [
  ,
  {
    name: 'Áo khoác thể thao Nike 5',
    description:
      'Sản phẩm áo khoác thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 281616,
    salePrice: 244067,
    categoryId: 10,
    stockQuantity: 44,
    brand: 'Nike',
    size: 'L',
    color: 'Xám',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần dài thể thao Adidas 1',
    description:
      'Sản phẩm quần dài thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 272827,
    salePrice: 282708,
    categoryId: 11,
    stockQuantity: 39,
    brand: 'Adidas',
    size: 'M',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần dài thể thao Puma 2',
    description:
      'Sản phẩm quần dài thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 421257,
    salePrice: 331510,
    categoryId: 11,
    stockQuantity: 56,
    brand: 'Puma',
    size: 'S',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần dài thể thao Reebok 3',
    description:
      'Sản phẩm quần dài thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 495540,
    salePrice: 216990,
    categoryId: 11,
    stockQuantity: 24,
    brand: 'Reebok',
    size: 'M',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần dài thể thao Under Armour 4',
    description:
      'Sản phẩm quần dài thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 481017,
    salePrice: 235853,
    categoryId: 11,
    stockQuantity: 38,
    brand: 'Under Armour',
    size: 'S',
    color: 'Đen',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần dài thể thao Nike 5',
    description:
      'Sản phẩm quần dài thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 484342,
    salePrice: 317370,
    categoryId: 11,
    stockQuantity: 59,
    brand: 'Nike',
    size: 'M',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ bơi Adidas 1',
    description:
      'Sản phẩm đồ bơi chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 462102,
    salePrice: 211554,
    categoryId: 12,
    stockQuantity: 43,
    brand: 'Adidas',
    size: 'XL',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ bơi Puma 2',
    description:
      'Sản phẩm đồ bơi chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 295018,
    salePrice: 232794,
    categoryId: 12,
    stockQuantity: 24,
    brand: 'Puma',
    size: 'S',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ bơi Reebok 3',
    description:
      'Sản phẩm đồ bơi chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 448867,
    salePrice: 385750,
    categoryId: 12,
    stockQuantity: 59,
    brand: 'Reebok',
    size: 'M',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ bơi Under Armour 4',
    description:
      'Sản phẩm đồ bơi chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 342553,
    salePrice: 391115,
    categoryId: 12,
    stockQuantity: 20,
    brand: 'Under Armour',
    size: 'S',
    color: 'Xám',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ bơi Nike 5',
    description:
      'Sản phẩm đồ bơi chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 352892,
    salePrice: 272211,
    categoryId: 12,
    stockQuantity: 54,
    brand: 'Nike',
    size: 'S',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo tank top thể thao Adidas 1',
    description:
      'Sản phẩm áo tank top thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 475143,
    salePrice: 380482,
    categoryId: 13,
    stockQuantity: 30,
    brand: 'Adidas',
    size: 'L',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo tank top thể thao Puma 2',
    description:
      'Sản phẩm áo tank top thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 259867,
    salePrice: 321069,
    categoryId: 13,
    stockQuantity: 55,
    brand: 'Puma',
    size: 'XL',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo tank top thể thao Reebok 3',
    description:
      'Sản phẩm áo tank top thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 342463,
    salePrice: 228642,
    categoryId: 13,
    stockQuantity: 33,
    brand: 'Reebok',
    size: 'XL',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo tank top thể thao Under Armour 4',
    description:
      'Sản phẩm áo tank top thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 256754,
    salePrice: 335397,
    categoryId: 13,
    stockQuantity: 45,
    brand: 'Under Armour',
    size: 'XL',
    color: 'Đỏ',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo tank top thể thao Nike 5',
    description:
      'Sản phẩm áo tank top thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 320203,
    salePrice: 339103,
    categoryId: 13,
    stockQuantity: 40,
    brand: 'Nike',
    size: 'L',
    color: 'Đen',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ yoga Adidas 1',
    description:
      'Sản phẩm đồ yoga chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 396802,
    salePrice: 386921,
    categoryId: 14,
    stockQuantity: 34,
    brand: 'Adidas',
    size: 'M',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ yoga Puma 2',
    description:
      'Sản phẩm đồ yoga chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 396643,
    salePrice: 396001,
    categoryId: 14,
    stockQuantity: 45,
    brand: 'Puma',
    size: 'S',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ yoga Reebok 3',
    description:
      'Sản phẩm đồ yoga chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 259697,
    salePrice: 397448,
    categoryId: 14,
    stockQuantity: 22,
    brand: 'Reebok',
    size: 'S',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ yoga Under Armour 4',
    description:
      'Sản phẩm đồ yoga chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 334387,
    salePrice: 376552,
    categoryId: 14,
    stockQuantity: 37,
    brand: 'Under Armour',
    size: 'XL',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Đồ yoga Nike 5',
    description:
      'Sản phẩm đồ yoga chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 448093,
    salePrice: 314396,
    categoryId: 14,
    stockQuantity: 19,
    brand: 'Nike',
    size: 'S',
    color: 'Xám',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo bra thể thao Adidas 1',
    description:
      'Sản phẩm áo bra thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 308099,
    salePrice: 251516,
    categoryId: 15,
    stockQuantity: 42,
    brand: 'Adidas',
    size: 'S',
    color: 'Đen',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo bra thể thao Puma 2',
    description:
      'Sản phẩm áo bra thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 286184,
    salePrice: 254291,
    categoryId: 15,
    stockQuantity: 16,
    brand: 'Puma',
    size: 'L',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo bra thể thao Reebok 3',
    description:
      'Sản phẩm áo bra thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 374986,
    salePrice: 267640,
    categoryId: 15,
    stockQuantity: 14,
    brand: 'Reebok',
    size: 'M',
    color: 'Xám',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo bra thể thao Under Armour 4',
    description:
      'Sản phẩm áo bra thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 288629,
    salePrice: 263638,
    categoryId: 15,
    stockQuantity: 53,
    brand: 'Under Armour',
    size: 'S',
    color: 'Xám',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo bra thể thao Nike 5',
    description:
      'Sản phẩm áo bra thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 269812,
    salePrice: 222318,
    categoryId: 15,
    stockQuantity: 58,
    brand: 'Nike',
    size: 'L',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần tights thể thao Adidas 1',
    description:
      'Sản phẩm quần tights thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 348608,
    salePrice: 209520,
    categoryId: 16,
    stockQuantity: 34,
    brand: 'Adidas',
    size: 'M',
    color: 'Đen',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần tights thể thao Puma 2',
    description:
      'Sản phẩm quần tights thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 437136,
    salePrice: 381718,
    categoryId: 16,
    stockQuantity: 30,
    brand: 'Puma',
    size: 'S',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần tights thể thao Reebok 3',
    description:
      'Sản phẩm quần tights thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 375398,
    salePrice: 229844,
    categoryId: 16,
    stockQuantity: 22,
    brand: 'Reebok',
    size: 'S',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần tights thể thao Under Armour 4',
    description:
      'Sản phẩm quần tights thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 497324,
    salePrice: 269211,
    categoryId: 16,
    stockQuantity: 16,
    brand: 'Under Armour',
    size: 'XL',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Quần tights thể thao Nike 5',
    description:
      'Sản phẩm quần tights thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 315312,
    salePrice: 259116,
    categoryId: 16,
    stockQuantity: 39,
    brand: 'Nike',
    size: 'S',
    color: 'Đỏ',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo polo thể thao Adidas 1',
    description:
      'Sản phẩm áo polo thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 431979,
    salePrice: 389217,
    categoryId: 17,
    stockQuantity: 47,
    brand: 'Adidas',
    size: 'L',
    color: 'Đen',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo polo thể thao Puma 2',
    description:
      'Sản phẩm áo polo thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 252683,
    salePrice: 298512,
    categoryId: 17,
    stockQuantity: 11,
    brand: 'Puma',
    size: 'XL',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo polo thể thao Reebok 3',
    description:
      'Sản phẩm áo polo thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 424928,
    salePrice: 339769,
    categoryId: 17,
    stockQuantity: 39,
    brand: 'Reebok',
    size: 'S',
    color: 'Trắng',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo polo thể thao Under Armour 4',
    description:
      'Sản phẩm áo polo thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 487704,
    salePrice: 271336,
    categoryId: 17,
    stockQuantity: 12,
    brand: 'Under Armour',
    size: 'L',
    color: 'Đen',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
  {
    name: 'Áo polo thể thao Nike 5',
    description:
      'Sản phẩm áo polo thể thao chất lượng cao, thoải mái và phong cách cho tập luyện.',
    price: 302631,
    salePrice: 358232,
    categoryId: 17,
    stockQuantity: 36,
    brand: 'Nike',
    size: 'S',
    color: 'Xanh',
    images: [
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    ],
    featuredImage:
      'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
  },
];

async function seedProducts() {
  try {
    console.log('🚀 Bắt đầu seed dữ liệu sản phẩm...');

    // Check required environment variables
    const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST'];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    // Sync models
    await sequelize.sync();
    console.log('✅ Sync database thành công');

    console.log('🗑️ Xóa dữ liệu cũ...');
    await Product.destroy({ where: {}, force: true });

    const products = await Product.bulkCreate(sampleProducts);

    console.log(`✅ Đã thêm thành công ${products.length} sản phẩm!`);
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
