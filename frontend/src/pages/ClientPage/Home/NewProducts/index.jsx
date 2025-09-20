import ProductCard from '../../../../components/ProductCard';
import HeaderSection from '../../../../components/HeaderSection';
import ScrollContainer from '../../../../components/ScrollContainer';
import { useEffect, useState } from 'react';
import axios from '../../../../setup/axios';
import classNames from 'classnames/bind';
import styles from './Products.module.scss';

const cx = classNames.bind(styles);

function NewProducts() {
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewProduct = async () => {
      try {
        const response = await axios.get('/products/new');
        if (response.data && response.data.length > 0) {
          setNewProducts(response.data);
        } else {
          throw new Error('No data from backend');
        }
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewProduct();
  }, []);

  const renderProduct = (product) => <ProductCard product={product} />;

  if (loading) return <div className={cx('loading')}>Loading...</div>;

  return (
    <div className={cx('container')}>
      <div className={cx('new-products-grid')}>
        {/* Yoga Section */}
        <div className={cx('yoga-section')}>
          <div className={cx('yoga-content')}>
            <h3 className={cx('yoga-title')}>FOR YOUR MIND AND BODY</h3>
            <p className={cx('yoga-subtitle')}>Find your perfect yoga gear</p>
            <button className={cx('shop-now-btn')}>Shop Now →</button>
          </div>
        </div>

        {/* Products Scroll Container */}
        <div className={cx('products-section')}>
          <HeaderSection title="New Products" viewAll=" View All →" />

          <ScrollContainer
            items={newProducts}
            itemsPreView={2}
            renderItem={renderProduct}
            className={cx('products-scroll')}
            showDots={true}
            showArrows={true}
            gap={16}
          />
        </div>
      </div>
    </div>
  );
}

export default NewProducts;
