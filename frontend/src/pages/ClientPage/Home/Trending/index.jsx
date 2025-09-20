import { useState, useEffect } from 'react';
import axios from '../../../../setup/axios';
import ProductCard from '../../../../components/ProductCard';
import HeaderSection from '../../../../components/HeaderSection';
import Logo from '../../../../components/Logo';
import ScrollContainer from '../../../../components/ScrollContainer';
import classNames from 'classnames/bind';
import styles from './Trending.module.scss';

const cx = classNames.bind(styles);

function Trending() {
  const [trendingProduct, setTrendingProduct] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProduct = async () => {
      try {
        const response = await axios.get('/products/trending');
        if (response.data && response.data.length > 0) {
          setTrendingProduct(response.data);
        } else {
          throw new Error('No data from backend');
        }
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingProduct();
  }, []);

  const renderProduct = (product) => <ProductCard product={product} />;

  if (loading) return <div className={cx('loading')}>Loading...</div>;

  return (
    <div className={cx('container')}>
      <HeaderSection title="Trending Products" viewAll=" All Products →" />
      <div className={cx('trending-layout')}>
        <div className={cx('main-banner-2')}>
          <div className={cx('logo')}>
            <Logo />
          </div>
          <div className={cx('banner-content')}>
            <p className={cx('banner-subtitle')}>Promo</p>
            <h1 className={cx('banner-title')}>SMART WATCH</h1>
            <button className={cx('cta-button')}>SHOP NOW</button>
          </div>
        </div>

        {/* Bỏ div .trending-grid, để ScrollContainer tự xử lý layout */}
        <ScrollContainer
          items={trendingProduct}
          itemsPreView={6}
          renderItem={renderProduct}
          className={cx('products-scroll')}
          showDots={true}
          showArrows={true}
          gap={16}
        />
      </div>
    </div>
  );
}

export default Trending;
