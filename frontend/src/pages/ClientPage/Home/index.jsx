import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faCreditCard,
  faShield,
} from '@fortawesome/free-solid-svg-icons';

import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import Question from './Question';
import Blogs from './Blogs';
import Trending from './Trending';
import Groups from './Groups';
import NewProducts from './NewProducts';
const cx = classNames.bind(styles);

function Home() {
  const sidebarItems = [
    {
      title: 'SMART FITNESS TRACKER WATCH',
      subtitle: 'DIGITAL',
      price: 'From $299',
      image: 'https://cdn.mos.cms.futurecdn.net/FkGweMeB7hdPgaSFQdgsfj.jpg',
    },
    {
      title: 'RUNNING SHOES',
      subtitle: 'EQUIPMENT',
      price: 'From $149',
      image:
        'https://allaboutginger.com/wp-content/uploads/2023/02/Nike-ZoomX-Vaporfly-3-Prototype-01-1024x719.webp',
    },
    {
      title: 'GYM BAG',
      subtitle: 'ACCESSORIES',
      price: 'From $89',
      image:
        'https://tse1.mm.bing.net/th/id/OIP.gHfVH9A2_z7fcy87KXEMtgHaJQ?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3',
    },
  ];

  return (
    <div className={cx('page-wrapper')}>
      <main className={cx('main-content')}>
        {/* Hero Section */}
        <section className={cx('hero-section')}>
          <div className={cx('container')}>
            <div className={cx('hero-grid')}>
              {/* Main Banner (2 phần) */}
              <div className={cx('main-banner-1')}>
                <div className={cx('banner-content')}>
                  <div className={cx('banner-text')}>
                    <h1 className={cx('banner-title')}>BASKETBALL MONTH</h1>
                    <p className={cx('banner-subtitle')}>
                      Get ready for the new season with the latest basketball
                      gear
                    </p>
                    <button className={cx('cta-button')}>SHOP NOW</button>
                  </div>
                </div>
              </div>

              {/* Banner phụ (1 phần) */}
              <div className={cx('main-banner-2')}>
                <div className={cx('banner-content')}>
                  <p className={cx('banner-subtitle')}>Promo</p>
                  <h1 className={cx('banner-title')}>SMART WATCH</h1>
                  <button className={cx('shop-now-btn')}>Shop Now →</button>
                </div>
              </div>

              {/* Sidebar (1 phần) */}
              <div className={cx('sidebar-items')}>
                {sidebarItems.map((item, index) => (
                  <div key={index} className={cx('sidebar-card')}>
                    <div className={cx('sidebar-content')}>
                      <h3 className={cx('sidebar-title')}>{item.title}</h3>
                      <p className={cx('sidebar-price')}>{item.price}</p>
                    </div>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={cx('sidebar-image')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* New Products Section */}
        <section className={cx('new-products-section')}>
          <NewProducts />
        </section>

        {/* We Are Different Section */}
        <section className={cx('different-section')}>
          <div className={cx('container')}>
            <div className={cx('different-content')}>
              <h2 className={cx('different-title')}>WE ARE DIFFERENT</h2>
              <p className={cx('different-subtitle')}>
                Discover our world of sporting goods where quality meets
                performance, and passion drives every product we offer.
              </p>
              <button className={cx('shop-now-btn')}>More about us →</button>
            </div>

            {/* Box thứ 2 (features) */}
            <div className={cx('features-box')}>
              <div className={cx('features-grid')}>
                <div className={cx('feature-item')}>
                  <FontAwesomeIcon
                    icon={faTruck}
                    className={cx('feature-icon')}
                  />
                  <h3 className={cx('feature-title')}>Worldwide Shipping</h3>
                  <p className={cx('feature-description')}>
                    Free shipping on orders over $100
                  </p>
                </div>
                <div className={cx('feature-item')}>
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className={cx('feature-icon')}
                  />
                  <h3 className={cx('feature-title')}>Easy Payments</h3>
                  <p className={cx('feature-description')}>
                    Secure and fast payment processing
                  </p>
                </div>
                <div className={cx('feature-item')}>
                  <FontAwesomeIcon
                    icon={faShield}
                    className={cx('feature-icon')}
                  />
                  <h3 className={cx('feature-title')}>Secure Transaction</h3>
                  <p className={cx('feature-description')}>
                    Your data is safe and protected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Groups */}
        <section className={cx('team-section')}>
          <Groups />
        </section>

        {/* Trending Products */}
        <section className={cx('trending-section')}>
          <Trending />
        </section>

        {/* FAQ Section */}
        <section className={cx('faq-section')}>
          <Question />
        </section>

        {/* Latest Updates Blog */}
        <section className={cx('blog-section')}>
          <Blogs />
        </section>
      </main>
    </div>
  );
}

export default Home;
