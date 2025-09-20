import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from '../Products.module.scss';
import CategoryFilter from '../CategoryFilter';
import BrandFilter from '../BrandFilter';
import SizeFilter from '../SizeFilter';
import PriceFilter from '../PriceFilter';

const cx = classNames.bind(styles);

const FilterSidebar = ({
  // Selected values
  selectedCategories,
  selectedBrands,
  selectedSizes,
  priceRange,

  // Handlers
  onCategoryChange,
  onBrandChange,
  onSizeChange,
  onPriceChange,
  onClearFilters,
}) => {
  return (
    <aside className={cx('sidebar')}>
      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoryChange={onCategoryChange}
      />

      <BrandFilter
        selectedBrands={selectedBrands}
        onBrandChange={onBrandChange}
      />

      <SizeFilter selectedSizes={selectedSizes} onSizeChange={onSizeChange} />

      <PriceFilter priceRange={priceRange} onPriceChange={onPriceChange} />

      <button className={cx('clear-filters')} onClick={onClearFilters}>
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
  );
};

export default FilterSidebar;
