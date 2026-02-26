import React, { useState, useEffect } from 'react';
import axios from '../../../../setup/axios';
import classNames from 'classnames/bind';
import styles from '../Products.module.scss';

const cx = classNames.bind(styles);

const SizeFilter = ({ selectedSizes, onSizeChange }) => {
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await axios.get('/products');
        if (response.data && response.data.length > 0) {
          const sizeCounts = response.data.reduce((acc, product) => {
            if (product.size) {
              acc[product.size] = (acc[product.size] || 0) + 1;
            }
            return acc;
          }, {});

          const sizeList = Object.entries(sizeCounts).map(([size, count]) => ({
            size,
            count,
          }));

          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          sizeList.sort(
            (a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size),
          );

          setAvailableSizes(sizeList);
        }
      } catch (error) {
        console.error('Lỗi khi lấy kích thước:', error);
        setAvailableSizes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSizes();
  }, []);

  return (
    <div className={cx('filter-section')}>
      <h3 className={cx('filter-title')}>Size</h3>
      <div className={cx('size-grid')}>
        {loading
          ? [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={cx('skeleton', 'size-btn-skeleton')} />
            ))
          : availableSizes.map(({ size, count }) => (
              <button
                key={size}
                className={cx('size-btn', {
                  active: selectedSizes.includes(size),
                })}
                onClick={() => onSizeChange(size)}
                title={`${count} products available`}
              >
                {size}
              </button>
            ))}
      </div>
    </div>
  );
};

export default SizeFilter;
