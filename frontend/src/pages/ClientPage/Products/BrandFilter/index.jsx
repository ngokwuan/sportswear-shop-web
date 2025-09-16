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
        // Sửa endpoint để phù hợp với database structure
        const response = await axios.get('/products');
        if (response.data && response.data.length > 0) {
          // Extract unique brands from products và đếm số lượng
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
            })
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

  if (loading) {
    return <div className={cx('filter-loading')}>Loading brands...</div>;
  }

  return (
    <div className={cx('filter-section')}>
      <h3 className={cx('filter-title')}>Brands</h3>
      <div className={cx('filter-list')}>
        {brands.map((brand) => (
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
