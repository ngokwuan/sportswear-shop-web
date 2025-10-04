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
        {/* Hero Section - Full width banner */}
        <section className={cx('hero-section')}>
          <div className={cx('hero-overlay')}>
            <div className={cx('hero-content')}>
              <p className={cx('hero-subtitle')}>NEW COLLECTION 2025</p>
              <h1 className={cx('hero-title')}>SPORTS EXCELLENCE</h1>
            </div>
          </div>
        </section>

        {/* Groups/Teams Section */}
        <section className={cx('team-section')}>
          <Groups />
        </section>

        {/* Best Seller Section with large product image */}
        <section className={cx('bestseller-section')}>
          <div className={cx('container')}>
            <div className={cx('bestseller-grid')}>
              {/* Left Content */}
              <div className={cx('bestseller-content')}>
                <h2 className={cx('section-title')}>Best Seller Collection</h2>
                <div className={cx('bestseller-text')}>
                  <h3 className={cx('bestseller-product-name')}>
                    Premium Sports Gear
                  </h3>
                  <p className={cx('bestseller-description')}>
                    Discover our world of sporting goods where quality meets
                    performance, and passion drives every product we offer. From
                    professional athletes to fitness enthusiasts, we provide the
                    best equipment for your journey.
                  </p>
                  <div className={cx('bestseller-badges')}>
                    <div className={cx('badge-item')}>
                      <FontAwesomeIcon
                        icon={faShield}
                        className={cx('badge-icon')}
                      />
                      <span>Quality</span>
                    </div>
                    <div className={cx('badge-item')}>
                      <FontAwesomeIcon
                        icon={faTruck}
                        className={cx('badge-icon')}
                      />
                      <span>Fast Ship</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Product Image */}
              <div className={cx('bestseller-product')}>
                <div className={cx('bestseller-product-wrapper')}>
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
                    alt="Best Seller"
                    className={cx('bestseller-product-image')}
                  />
                </div>
                <h3 className={cx('bestseller-label')}>Premium Edition</h3>
              </div>
            </div>
          </div>
        </section>

        {/* New Products Grid */}
        <section className={cx('new-products-section')}>
          <NewProducts />
        </section>

        {/* Trending Products Carousel */}
        <section className={cx('trending-section')}>
          <Trending />
        </section>

        {/* About/Story Section */}
        <section className={cx('about-section')}>
          <div className={cx('container')}>
            <h2 className={cx('section-title-center')}>A little about us</h2>
            <p className={cx('section-subtitle')}>
              Your trusted sports partner
            </p>

            <div className={cx('about-grid')}>
              <div className={cx('about-image')}>
                <img
                  src="https://i.pinimg.com/1200x/68/30/e0/6830e013fea39fbc0bc2c622e89c1651.jpg"
                  alt="Our Store"
                />
              </div>

              <div className={cx('about-content')}>
                <h3 className={cx('about-title')}>Our Story</h3>
                <p className={cx('about-text')}>
                  We are passionate about sports and committed to providing the
                  best equipment for athletes of all levels. From beginners to
                  professionals, we have everything you need to excel.
                </p>
                <p className={cx('about-text')}>
                  With years of experience and a dedicated team, we continue to
                  innovate and bring you the latest in sports technology and
                  design.
                </p>
                <button className={cx('read-more-btn')}>Learn More →</button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={cx('faq-section')}>
          <Question />
        </section>

        {/* CTA Section */}
        <section className={cx('cta-section')}>
          <div className={cx('cta-content')}>
            <h2 className={cx('cta-title')}>Ready to Start Your Journey?</h2>
            <p className={cx('cta-subtitle')}>
              Join thousands of athletes who trust us with their performance
            </p>
            <button className={cx('cta-btn')}>Shop Now</button>
          </div>
        </section>

        {/* Features Section */}
        <section className={cx('features-section')}>
          <div className={cx('container')}>
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
        </section>

        {/* Blog Section */}
        <section className={cx('blog-section')}>
          <Blogs />
        </section>
      </main>
    </div>
  );
}

export default Home;
