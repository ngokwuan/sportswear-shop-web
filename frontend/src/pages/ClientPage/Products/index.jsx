import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTh,
  faList,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import ProductCard from '../../../components/ProductCard';
import FilterSidebar from './FilterSidebar';
import classNames from 'classnames/bind';
import styles from './Products.module.scss';

const cx = classNames.bind(styles);

function Products() {
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/products');
        if (response.data && response.data.length > 0) {
          setAllProducts(response.data);

          const actualPrices = response.data.map((product) => {
            return product.sale_price || product.price || 0;
          });
          const min = 0;
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

  // ✅ THÊM: Đọc category_ids từ URL query params khi component mount hoặc URL thay đổi
  useEffect(() => {
    const categoryIdsParam = searchParams.get('category_ids');

    if (categoryIdsParam) {
      // Parse category IDs từ URL: "1,2,3" -> [1, 2, 3]
      const categoryIds = categoryIdsParam
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));

      console.log('🔗 URL params category_ids:', categoryIds);

      if (categoryIds.length > 0) {
        setSelectedCategories(categoryIds);

        // Scroll to top khi filter từ URL
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Nếu không có query param, reset filter
      setSelectedCategories([]);
    }
  }, [searchParams]); // Chạy lại mỗi khi URL thay đổi

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // ✅ SỬA: Filter theo category_ids (array) - Handle type mismatch
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        const productCategories = product.category_ids || [];

        // Debug log
        console.log('Product:', product.name, 'Categories:', productCategories);

        // Convert về cùng kiểu để so sánh (handle cả string và number)
        const normalizedProductCats = productCategories.map((id) => Number(id));
        const normalizedSelectedCats = selectedCategories.map((id) =>
          Number(id)
        );

        return normalizedSelectedCats.some((selectedId) =>
          normalizedProductCats.includes(selectedId)
        );
      });
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSizes.includes(product.size)
      );
    }

    filtered = filtered.filter((product) => {
      const actualPrice = product.sale_price || product.price || 0;
      return actualPrice >= priceRange[0] && actualPrice <= priceRange[1];
    });

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

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedBrands, selectedSizes, priceRange, sortBy]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

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
                Showing{' '}
                {Math.min(startIndex + 1, filteredAndSortedProducts.length)}-
                {Math.min(endIndex, filteredAndSortedProducts.length)} of{' '}
                {filteredAndSortedProducts.length} Results
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
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
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

          {filteredAndSortedProducts.length > 0 && totalPages > 1 && (
            <div className={cx('pagination')}>
              <button
                className={cx('page-btn', 'nav-btn', {
                  disabled: currentPage === 1,
                })}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {getPaginationNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className={cx('pagination-dots')}>...</span>
                  ) : (
                    <button
                      className={cx('page-btn', {
                        active: currentPage === page,
                      })}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                className={cx('page-btn', 'nav-btn', {
                  disabled: currentPage === totalPages,
                })}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Products;
