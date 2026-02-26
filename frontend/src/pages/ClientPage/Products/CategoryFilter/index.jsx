import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../Products.module.scss';
import axios from '../../../../setup/axios';

const cx = classNames.bind(styles);

function CategoryFilter({ selectedCategories, onCategoryChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        if (response.data && response.data.length > 0) {
          const categoriesWithCount = await Promise.all(
            response.data.map(async (category) => {
              try {
                const productsResponse = await axios.get(
                  `/products/by-category?category_id=${category.id}`,
                );
                return {
                  ...category,
                  count: productsResponse.data
                    ? productsResponse.data.length
                    : 0,
                };
              } catch (error) {
                return { ...category, count: 0 };
              }
            }),
          );
          setCategories(categoriesWithCount);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className={cx('filter-section')}>
      <h3 className={cx('filter-title')}>Categories</h3>
      <div className={cx('filter-list')}>
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className={cx('filter-item-skeleton')}>
                <div className={cx('skeleton', 'checkbox-skeleton')} />
                <div className={cx('skeleton', 'label-skeleton')} />
              </div>
            ))
          : categories.map((category) => (
              <label key={category.id} className={cx('filter-item')}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => onCategoryChange(category.id)}
                />
                <span>
                  {category.name} ({category.count})
                </span>
              </label>
            ))}
      </div>
    </div>
  );
}

export default CategoryFilter;
