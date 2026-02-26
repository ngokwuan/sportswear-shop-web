import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../Products.module.scss';
import axios from '../../../../setup/axios';

const cx = classNames.bind(styles);

function BrandFilter({ selectedBrands, onBrandChange }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await axios.get('/products');
        if (response.data && response.data.length > 0) {
          const brandCounts = response.data.reduce((acc, product) => {
            if (product.brand) {
              acc[product.brand] = (acc[product.brand] || 0) + 1;
            }
            return acc;
          }, {});

          const brandList = Object.entries(brandCounts).map(
            ([brand, count]) => ({
              id: brand,
              name: brand,
              count: count,
            }),
          );

          setBrands(brandList);
        }
      } catch (error) {
        console.error('Lỗi khi lấy nhãn hiệu:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, []);

  return (
    <div className={cx('filter-section')}>
      <h3 className={cx('filter-title')}>Brands</h3>
      <div className={cx('filter-list')}>
        {loading
          ? [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cx('filter-item-skeleton')}>
                <div className={cx('skeleton', 'checkbox-skeleton')} />
                <div className={cx('skeleton', 'label-skeleton')} />
              </div>
            ))
          : brands.map((brand) => (
              <label key={brand.id} className={cx('filter-item')}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => onBrandChange(brand.id)}
                />
                <span>
                  {brand.name} ({brand.count})
                </span>
              </label>
            ))}
      </div>
    </div>
  );
}

export default BrandFilter;
