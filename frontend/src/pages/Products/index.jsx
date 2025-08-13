import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faEye,
  faShoppingCart,
  faFilter,
  faTh,
  faList,
  faChevronDown,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Products.module.scss';

const cx = classNames.bind(styles);

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([500, 5000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Mock data for filters
  const categories = [
    { id: 'new', name: 'New In Class', count: 20 },
    { id: 'featured', name: 'Featured Items', count: 15 },
    { id: 'mens', name: "Men's Wear", count: 203 },
    { id: 'womens', name: "Women's Wear", count: 156 },
    { id: 'kids', name: 'Kids Wear', count: 89 },
    { id: 'sports', name: 'Sports Shoes', count: 67 },
    { id: 'equipment', name: 'Sports Equipment', count: 45 },
  ];

  const brands = [
    { id: 'nike', name: 'Nike', count: 246 },
    { id: 'puma', name: 'Puma', count: 203 },
    { id: 'adidas', name: 'Adidas', count: 156 },
    { id: 'reebok', name: 'Reebok', count: 89 },
    { id: 'new-balance', name: 'New Balance', count: 67 },
    { id: 'sketchers', name: 'Sketchers', count: 45 },
    { id: 'others', name: 'Others', count: 89 },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  // Function để tạo random ảnh từ Unsplash
  const getRandomSportsImage = (index) => {
    const sportImages = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', // Nike shoes
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', // Adidas shoes
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', // Hoodie
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', // Sports bag
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop', // Running shoes
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', // Sports gear
      'https://images.unsplash.com/photo-1520256862855-398228c41684?w=400&h=400&fit=crop', // Basketball
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop', // Sports shorts
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop', // Yoga mat
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', // Track jacket
    ];
    return sportImages[index % sportImages.length];
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products');
        // Nếu có data từ backend, sử dụng và thêm ảnh
        if (response.data && response.data.length > 0) {
          const productsWithImages = response.data.map((product, index) => ({
            ...product,
            image: product.featured_image || getRandomSportsImage(index),
            category:
              product.category_id === 1
                ? 'SHOES'
                : product.category_id === 2
                ? 'APPAREL'
                : 'EQUIPMENT',
            rating: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
            isNew: product.is_featured || false,
            isSale: product.sale_price !== null,
            oldPrice: product.sale_price ? product.price : null,
            price: product.sale_price || product.price,
          }));
          setProducts(productsWithImages);
        } else {
          throw new Error('No data from backend');
        }
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        // Fallback với mock data với ảnh hoạt động
        const mockProducts = [
          {
            id: 1,
            name: 'Nike Air Max Running Shoes',
            price: 1299,
            oldPrice: null,
            image:
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
            category: 'SHOES',
            brand: 'Nike',
            rating: 5,
            isNew: true,
            isSale: false,
          },
          {
            id: 2,
            name: 'Adidas Ultraboost 22',
            price: 1599,
            oldPrice: 1899,
            image:
              'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
            category: 'SHOES',
            brand: 'Adidas',
            rating: 4,
            isNew: false,
            isSale: true,
          },
          {
            id: 3,
            name: 'Nike Tech Fleece Hoodie',
            price: 799,
            oldPrice: null,
            image:
              'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
            category: 'APPAREL',
            brand: 'Nike',
            rating: 5,
            isNew: true,
            isSale: false,
          },
          {
            id: 4,
            name: 'Under Armour Storm Duffel Bag',
            price: 450,
            oldPrice: 599,
            image:
              'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
            category: 'EQUIPMENT',
            brand: 'Under Armour',
            rating: 4,
            isNew: false,
            isSale: true,
          },
          {
            id: 5,
            name: 'Puma RS-X Sneakers',
            price: 999,
            oldPrice: null,
            image:
              'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
            category: 'SHOES',
            brand: 'Puma',
            rating: 4,
            isNew: true,
            isSale: false,
          },
          {
            id: 6,
            name: 'Adidas 3-Stripes Track Jacket',
            price: 899,
            oldPrice: null,
            image:
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            category: 'APPAREL',
            brand: 'Adidas',
            rating: 3,
            isNew: false,
            isSale: false,
          },
          {
            id: 7,
            name: 'Premium Yoga Training Mat',
            price: 199,
            oldPrice: 249,
            image:
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
            category: 'EQUIPMENT',
            brand: 'YogaPro',
            rating: 5,
            isNew: false,
            isSale: true,
          },
          {
            id: 8,
            name: 'Nike Basketball Shorts',
            price: 549,
            oldPrice: null,
            image:
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
            category: 'APPAREL',
            brand: 'Nike',
            rating: 4,
            isNew: false,
            isSale: false,
          },
          {
            id: 9,
            name: 'Professional Basketball',
            price: 89,
            oldPrice: null,
            image:
              'https://images.unsplash.com/photo-1520256862855-398228c41684?w=400&h=400&fit=crop',
            category: 'EQUIPMENT',
            brand: 'Wilson',
            rating: 4,
            isNew: false,
            isSale: false,
          },
          {
            id: 10,
            name: 'Complete Sports Gear Set',
            price: 2999,
            oldPrice: null,
            image:
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
            category: 'EQUIPMENT',
            brand: 'Nike',
            rating: 5,
            isNew: true,
            isSale: false,
          },
          {
            id: 11,
            name: 'Reebok CrossFit Shoes',
            price: 1199,
            oldPrice: null,
            image:
              'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
            category: 'SHOES',
            brand: 'Reebok',
            rating: 4,
            isNew: false,
            isSale: false,
          },
          {
            id: 12,
            name: 'New Balance Running Tights',
            price: 699,
            oldPrice: 899,
            image:
              'https://images.unsplash.com/photo-1506629905607-47b7921b2050?w=400&h=400&fit=crop',
            category: 'APPAREL',
            brand: 'New Balance',
            rating: 3,
            isNew: false,
            isSale: true,
          },
        ];
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setPriceRange([500, 5000]);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={cx('star', { filled: i < rating })}
      />
    ));
  };

  const ProductCard = ({ product }) => (
    <div className={cx('product-card')}>
      {product.isSale && <span className={cx('sale-badge')}>Sale</span>}
      {product.isNew && <span className={cx('new-badge')}>New</span>}

      <div className={cx('product-image')}>
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            // Fallback nếu ảnh không load được
            e.target.src =
              'https://via.placeholder.com/400x400/f0f0f0/666?text=Product+Image';
          }}
        />
        <div className={cx('product-overlay')}>
          <button className={cx('overlay-btn')} title="Add to Wishlist">
            <FontAwesomeIcon icon={faHeart} />
          </button>
          <button className={cx('overlay-btn')} title="Quick View">
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
        <button className={cx('add-to-cart')}>ADD TO CART</button>
      </div>

      <div className={cx('product-info')}>
        <div className={cx('product-category')}>{product.category}</div>
        <h3 className={cx('product-name')}>{product.name}</h3>
        <div className={cx('product-rating')}>
          {renderStars(product.rating)}
        </div>
        <div className={cx('product-price')}>
          <span className={cx('current-price')}>${product.price}</span>
          {product.oldPrice && (
            <span className={cx('old-price')}>${product.oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cx('loading')}>
        <div className={cx('spinner')}></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className={cx('products-page')}>
      {/* Breadcrumb */}
      <div className={cx('breadcrumb')}>
        <span>Home</span> / <span className={cx('current')}>Products</span>
      </div>

      <div className={cx('products-container')}>
        {/* Sidebar */}
        <aside className={cx('sidebar')}>
          {/* Categories */}
          <div className={cx('filter-section')}>
            <h3 className={cx('filter-title')}>Categories</h3>
            <div className={cx('filter-list')}>
              {categories.map((category) => (
                <label key={category.id} className={cx('filter-item')}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  <span>
                    {category.name} ({category.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className={cx('filter-section')}>
            <h3 className={cx('filter-title')}>Brands</h3>
            <div className={cx('filter-list')}>
              {brands.map((brand) => (
                <label key={brand.id} className={cx('filter-item')}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => handleBrandChange(brand.id)}
                  />
                  <span>
                    {brand.name} ({brand.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className={cx('filter-section')}>
            <h3 className={cx('filter-title')}>Size</h3>
            <div className={cx('size-grid')}>
              {sizes.map((size) => (
                <button
                  key={size}
                  className={cx('size-btn', {
                    active: selectedSizes.includes(size),
                  })}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className={cx('filter-section')}>
            <h3 className={cx('filter-title')}>Price</h3>
            <div className={cx('price-range')}>
              <input
                type="range"
                min="0"
                max="3000"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseInt(e.target.value), priceRange[1]])
                }
                className={cx('range-slider')}
              />
              <input
                type="range"
                min="0"
                max="3000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className={cx('range-slider')}
              />
              <div className={cx('price-values')}>
                <span>$ {priceRange[0]}</span>
                <span>$ {priceRange[1]}</span>
              </div>
            </div>
          </div>

          <button className={cx('clear-filters')} onClick={clearAllFilters}>
            <FontAwesomeIcon icon={faFilter} />
            CLEAR ALL FILTER
          </button>

          {/* Banner */}
          <div className={cx('sidebar-banner')}>
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=280&h=400&fit=crop&crop=center"
              alt="Best Gears"
              onError={(e) => {
                e.target.src =
                  'https://via.placeholder.com/280x400/333/fff?text=Best+Gears';
              }}
            />
            <div className={cx('banner-content')}>
              <h4>BEST GEARS</h4>
              <button className={cx('banner-btn')}>SHOP NOW</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cx('main-content')}>
          {/* Header */}
          <div className={cx('products-header')}>
            <div className={cx('results-info')}>
              <h1>Products</h1>
              <span>
                Showing 1 - {products.length} of {products.length} Results
              </span>
            </div>

            <div className={cx('header-controls')}>
              <div className={cx('sort-by')}>
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={cx('sort-select')}
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              <div className={cx('view-modes')}>
                <button
                  className={cx('view-btn', { active: viewMode === 'grid' })}
                  onClick={() => setViewMode('grid')}
                >
                  <FontAwesomeIcon icon={faTh} />
                </button>
                <button
                  className={cx('view-btn', { active: viewMode === 'list' })}
                  onClick={() => setViewMode('list')}
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={cx('products-grid', viewMode)}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className={cx('pagination')}>
            <button className={cx('page-btn', 'active')}>1</button>
            <button className={cx('page-btn')}>2</button>
            <button className={cx('page-btn')}>3</button>
            <button className={cx('page-btn')}>...</button>
            <button className={cx('page-btn')}>10</button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Products;
