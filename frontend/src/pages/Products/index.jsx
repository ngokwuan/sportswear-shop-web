import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faList } from '@fortawesome/free-solid-svg-icons';
import ProductCard from '../../components/ProductCard';
import FilterSidebar from './FilterSidebar';
import classNames from 'classnames/bind';
import styles from './Products.module.scss';

const cx = classNames.bind(styles);

function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/products');
        if (response.data && response.data.length > 0) {
          setAllProducts(response.data);

          // Set initial price range based on ACTUAL prices (sale_price hoặc price)
          const actualPrices = response.data.map((product) => {
            return product.sale_price || product.price || 0;
          });
          const min = 0; // Luôn bắt đầu từ 0
          const max = Math.max(...actualPrices);
          setPriceRange([min, max]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter và sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category_id)
      );
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    // Filter by sizes
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSizes.includes(product.size)
      );
    }

    // Filter by price range - sử dụng giá thực tế (sale_price hoặc price)
    filtered = filtered.filter((product) => {
      const actualPrice = product.sale_price || product.price || 0;
      return actualPrice >= priceRange[0] && actualPrice <= priceRange[1];
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.sale_price || a.price || 0;
          const priceB = b.sale_price || b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.sale_price || a.price || 0;
          const priceB = b.sale_price || b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => (b.star || 0) - (a.star || 0));
        break;
    }

    return filtered;
  }, [
    allProducts,
    selectedCategories,
    selectedBrands,
    selectedSizes,
    priceRange,
    sortBy,
  ]);

  // Filter handlers
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

  const handlePriceChange = (newPriceRange) => {
    setPriceRange(newPriceRange);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    // Reset to original price range dựa trên giá thực tế
    if (allProducts.length > 0) {
      const actualPrices = allProducts.map((product) => {
        return product.sale_price || product.price || 0;
      });
      const min = 0;
      const max = Math.max(...actualPrices);
      setPriceRange([min, max]);
    }
  };

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
      <div className={cx('products-container')}>
        <FilterSidebar
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          selectedSizes={selectedSizes}
          priceRange={priceRange}
          onCategoryChange={handleCategoryChange}
          onBrandChange={handleBrandChange}
          onSizeChange={handleSizeChange}
          onPriceChange={handlePriceChange}
          onClearFilters={clearAllFilters}
        />

        <main className={cx('main-content')}>
          <div className={cx('products-header')}>
            <div className={cx('results-info')}>
              <h2>Products</h2>
              <span>
                Showing {filteredAndSortedProducts.length} of{' '}
                {allProducts.length} Results
              </span>
            </div>

            <div className={cx('header-controls')}>
              <div className={cx('sort-by')}>
                <label>Sort by</label>
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

          <div className={cx('products-grid', viewMode)}>
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                />
              ))
            ) : (
              <div className={cx('no-products')}>
                <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
                <button
                  onClick={clearAllFilters}
                  className={cx('reset-filters-btn')}
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>

          {filteredAndSortedProducts.length > 0 && (
            <div className={cx('pagination')}>
              <button className={cx('page-btn', 'active')}>1</button>
              <button className={cx('page-btn')}>2</button>
              <button className={cx('page-btn')}>3</button>
              <button className={cx('page-btn')}>...</button>
              <button className={cx('page-btn')}>10</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Products;
