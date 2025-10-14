import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Groups.module.scss';
import axios from '../../../../setup/axios';

const cx = classNames.bind(styles);

function Groups() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping tên hiển thị với tên category trong database
  const categoryMapping = {
    RUNNING: 'Running',
    YOGA: 'Yoga',
    GYM: 'Gym',
  };

  const displayCategories = [
    {
      displayName: 'RUNNING',
      subtitle: 'Athletic Wear',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    },
    {
      displayName: 'YOGA',
      subtitle: 'Sports Equipment',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    },
    {
      displayName: 'GYM',
      subtitle: 'Fitness Gear',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        if (response.data && response.data.length > 0) {
          setCategories(response.data);
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

  const handleCategoryClick = (displayName) => {
    // Tìm category ID từ tên
    const categoryName = categoryMapping[displayName];
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (category) {
      // Điều hướng đến trang products với category được chọn
      navigate(`/products?category=${category.id}`);
    } else {
      // Fallback: điều hướng đến products không có filter
      navigate('/products');
    }
  };

  if (loading) {
    return <div className={cx('container')}>Loading...</div>;
  }

  return (
    <div className={cx('container')}>
      <div className={cx('team-grid')}>
        {displayCategories.map((item, index) => {
          const categoryName = categoryMapping[item.displayName];
          const category = categories.find(
            (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
          );

          return (
            <div
              key={index}
              className={cx('team-card')}
              onClick={() => handleCategoryClick(item.displayName)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={item.image}
                alt={`${item.displayName} Category`}
                className={cx('team-image')}
              />
              <div className={cx('team-overlay')}>
                <h3 className={cx('team-title')}>{item.displayName}</h3>
                <p className={cx('team-subtitle')}>{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Groups;
