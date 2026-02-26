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
  const [categoriesWithCount, setCategoriesWithCount] = useState({});

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
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    },
    {
      displayName: 'GYM',
      subtitle: 'Fitness Gear',
      image:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        if (response.data && response.data.length > 0) {
          setCategories(response.data);

          const countsMap = {};
          for (const category of response.data) {
            try {
              const productsResponse = await axios.get(
                `/products/by-category?category_id=${category.id}`,
              );
              countsMap[category.id] = productsResponse.data?.length || 0;
            } catch (error) {
              console.error(
                `Error fetching products for category ${category.id}:`,
                error,
              );
              countsMap[category.id] = 0;
            }
          }
          setCategoriesWithCount(countsMap);
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
    const categoryName = categoryMapping[displayName];
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase(),
    );

    if (category) {
      navigate(`/products?category_ids=${category.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.warn(`Category not found: ${categoryName}`);
      navigate('/products');
    }
  };

  return (
    <div className={cx('container')}>
      <div className={cx('team-grid')}>
        {displayCategories.map((item, index) => {
          const categoryName = categoryMapping[item.displayName];
          const category = categories.find(
            (cat) => cat.name.toLowerCase() === categoryName.toLowerCase(),
          );
          const productCount = category
            ? categoriesWithCount[category.id] || 0
            : 0;

          return (
            <div
              key={index}
              className={cx('team-card', { loading })}
              onClick={() => !loading && handleCategoryClick(item.displayName)}
              style={{ cursor: loading ? 'default' : 'pointer' }}
            >
              {loading ? (
                <>
                  <div className={cx('image-skeleton')} />
                  <div className={cx('team-overlay')}>
                    <div className={cx('skeleton', 'title-skeleton')} />
                    <div className={cx('skeleton', 'subtitle-skeleton')} />
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={item.image}
                    alt={`${item.displayName} Category`}
                    className={cx('team-image')}
                  />
                  <div className={cx('team-overlay')}>
                    <h3 className={cx('team-title')}>{item.displayName}</h3>
                    <p className={cx('team-subtitle')}>
                      {item.subtitle}
                      {category && ` • ${productCount} products`}
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Groups;
