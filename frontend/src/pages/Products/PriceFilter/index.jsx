import React from 'react';
import { useState, useEffect } from 'react';
import axios from '../../../setup/axios';
import classNames from 'classnames/bind';
import styles from '../Products.module.scss';

const cx = classNames.bind(styles);

function PriceFilter({ priceRange, onPriceChange }) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(99999);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const response = await axios.get('/products/price');
        if (response.data && response.data.actualPriceRange) {
          const min = 0; // Luôn bắt đầu từ 0
          const max = response.data.actualPriceRange.max_price || 99999;

          setMinPrice(min);
          setMaxPrice(max);

          // Set initial price range if not set
          if (!priceRange || priceRange.length === 0) {
            onPriceChange([min, max]);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy khoảng giá:', error);
        // Fallback to getting price range from products
        try {
          const productsResponse = await axios.get('/products');
          if (productsResponse.data && productsResponse.data.length > 0) {
            // Tính giá thực tế (ưu tiên sale_price nếu có)
            const actualPrices = productsResponse.data.map((product) => {
              return product.sale_price || product.price || 0;
            });

            const min = 0; // Luôn bắt đầu từ 0
            const max = Math.max(...actualPrices);

            setMinPrice(min);
            setMaxPrice(max);

            if (!priceRange || priceRange.length === 0) {
              onPriceChange([min, max]);
            }
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPriceRange();
  }, []);

  const handleMinPriceChange = (e) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= priceRange[1]) {
      onPriceChange([newMin, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (e) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= priceRange[0]) {
      onPriceChange([priceRange[0], newMax]);
    }
  };

  if (loading) {
    return <div className={cx('filter-loading')}>Loading price range...</div>;
  }

  return (
    <div className={cx('filter-section')}>
      <h3 className={cx('filter-title')}>Price</h3>
      <div className={cx('price-range')}>
        <div className={cx('price-sliders')}>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[0] || minPrice}
            onChange={handleMinPriceChange}
            className={cx('range-slider', 'range-min')}
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1] || maxPrice}
            onChange={handleMaxPriceChange}
            className={cx('range-slider', 'range-max')}
          />
        </div>

        <div className={cx('price-display')}>
          <span className={cx('price-label')}>
            ${priceRange[0] || minPrice} - ${priceRange[1] || maxPrice}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PriceFilter;
