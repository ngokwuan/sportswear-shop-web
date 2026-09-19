import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
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

/* Cùng "ngôn ngữ chuyển động" với trang Home: lao vào từ vạch xuất phát bên trái */
const EASE_BURST = [0.16, 1, 0.3, 1];

const cardIn = {
  hidden: { opacity: 0, x: -40 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: EASE_BURST,
      delay: Math.min(i, 8) * 0.05, // chỉ stagger 8 card đầu để không bị chờ lâu
    },
  }),
};

const getActualPrice = (product) => product.sale_price || product.price || 0;

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
          setPriceRange([0, Math.max(...response.data.map(getActualPrice))]);
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

  useEffect(() => {
    const categoryIdsParam = searchParams.get('category_ids');

    if (categoryIdsParam) {
      const categoryIds = categoryIdsParam
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));

      if (categoryIds.length > 0) {
        setSelectedCategories(categoryIds);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (selectedCategories.length > 0) {
      const normalizedSelectedCats = selectedCategories.map((id) => Number(id));
      filtered = filtered.filter((product) => {
        const normalizedProductCats = (product.category_ids || []).map((id) =>
          Number(id),
        );
        return normalizedSelectedCats.some((selectedId) =>
          normalizedProductCats.includes(selectedId),
        );
      });
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand),
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSizes.includes(product.size),
      );
    }

    filtered = filtered.filter((product) => {
      const actualPrice = getActualPrice(product);
      return actualPrice >= priceRange[0] && actualPrice <= priceRange[1];
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => getActualPrice(a) - getActualPrice(b));
        break;
      case 'price-high':
        filtered.sort((a, b) => getActualPrice(b) - getActualPrice(a));
        break;
      case 'newest':
        filtered.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
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
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
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
        : [...prev, categoryId],
    );
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId],
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
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
      setPriceRange([0, Math.max(...allProducts.map(getActualPrice))]);
    }
  };

  const skeletonItems = Array.from({ length: itemsPerPage }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  return (
    <MotionConfig reducedMotion="user">
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
            {/* motion ở lớp ngoài, skew (CSS) ở lớp trong để không bị ghi đè */}
            <motion.div
              className={cx('products-header-slot')}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: EASE_BURST }}
            >
              <div className={cx('products-header')}>
                <div className={cx('products-header-inner')}>
                  <div className={cx('results-info')}>
                    <h2 className={cx('page-title')}>
                      ALL <span className={cx('accent')}>GEAR</span>
                    </h2>
                    <p className={cx('results-count')}>
                      Showing{' '}
                      {Math.min(
                        startIndex + 1,
                        filteredAndSortedProducts.length,
                      )}
                      -{Math.min(endIndex, filteredAndSortedProducts.length)} of{' '}
                      {filteredAndSortedProducts.length} results
                    </p>
                  </div>

                  <div className={cx('header-controls')}>
                    <div className={cx('sort-by')}>
                      <label htmlFor="products-sort">Sort by</label>
                      <select
                        id="products-sort"
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
                        type="button"
                        aria-label="Grid view"
                        aria-pressed={viewMode === 'grid'}
                        className={cx('view-btn', {
                          active: viewMode === 'grid',
                        })}
                        onClick={() => setViewMode('grid')}
                      >
                        <FontAwesomeIcon icon={faTh} />
                      </button>
                      <button
                        type="button"
                        aria-label="List view"
                        aria-pressed={viewMode === 'list'}
                        className={cx('view-btn', {
                          active: viewMode === 'list',
                        })}
                        onClick={() => setViewMode('list')}
                      >
                        <FontAwesomeIcon icon={faList} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className={cx('products-grid', viewMode)}>
              {loading ? (
                skeletonItems.map((item) => (
                  <div className={cx('product-slot')} key={item.id}>
                    <div className={cx('product-frame')}>
                      <ProductCard isLoading={true} viewMode={viewMode} />
                    </div>
                  </div>
                ))
              ) : currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className={cx('product-slot')}
                    custom={index}
                    variants={cardIn}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className={cx('product-frame')}>
                      <ProductCard product={product} viewMode={viewMode} />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={cx('no-products')}>
                  <p>No gear matches your filters.</p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className={cx('reset-filters-btn')}
                  >
                    CLEAR ALL FILTERS
                  </button>
                </div>
              )}
            </div>

            {filteredAndSortedProducts.length > 0 && totalPages > 1 && (
              <nav className={cx('pagination')} aria-label="Pagination">
                <button
                  type="button"
                  aria-label="Previous page"
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
                        type="button"
                        aria-current={currentPage === page ? 'page' : undefined}
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
                  type="button"
                  aria-label="Next page"
                  className={cx('page-btn', 'nav-btn', {
                    disabled: currentPage === totalPages,
                  })}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}

export default Products;
