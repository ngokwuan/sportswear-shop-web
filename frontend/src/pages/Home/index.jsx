import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faShoppingCart,
  faEye,
  faStar,
  faChevronLeft,
  faChevronRight,
  faTruck,
  faCreditCard,
  faShield,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import Question from './Question';
const cx = classNames.bind(styles);

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const newProducts = [
    {
      id: 1,
      name: 'LUFEI Crop Hoodie',
      price: 89.0,
      originalPrice: 120.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      isNew: true,
      isSale: true,
    },
    {
      id: 2,
      name: 'Women Running Shoes',
      price: 149.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
    },
  ];

  const trendingProducts = [
    {
      id: 1,
      name: 'La Rogue Tracking Jacket',
      price: 89.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      rating: 5,
      isNew: true,
    },
    {
      id: 2,
      name: 'Power 15 Casual Dumbbell',
      price: 45.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      rating: 4,
    },
    {
      id: 3,
      name: 'Kiddos Outdoor Hoodie',
      price: 65.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      rating: 5,
    },
    {
      id: 4,
      name: 'HIGHEST PEAK Winter Jacket',
      price: 159.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      rating: 4,
    },
    {
      id: 5,
      name: 'Hezuk Elite Sneakers',
      price: 129.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      rating: 5,
    },
    {
      id: 6,
      name: 'Smash Sports Bag',
      price: 89.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      rating: 4,
    },
    {
      id: 7,
      name: 'Sportz Nordic Bag',
      price: 119.0,
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      rating: 5,
    },
  ];

  const blogPosts = [
    {
      title:
        'The Ultimate Guide to Choosing the Right Sportswear for Maximum Performance',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      date: 'March 15, 2024',
    },
    {
      title:
        'Enhancing Your Sports Nutrition Essential Tips for Optimal Athletic Performance',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      date: 'March 12, 2024',
    },
    {
      title:
        'Staying Motivated: Strategies to Overcome Challenges in Fitness Journey',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      date: 'March 10, 2024',
    },
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={cx('star', { filled: i < rating })}
      />
    ));
  };

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
          <div className={cx('container')}>
            <div className={cx('section-header')}>
              <h2 className={cx('section-title')}>New Products</h2>
              <a href="#" className={cx('view-all-link')}>
                View All →
              </a>
            </div>

            <div className={cx('new-products-grid')}>
              {/* Yoga Section */}
              <div className={cx('yoga-section')}>
                <div className={cx('yoga-content')}>
                  <h3 className={cx('yoga-title')}>FOR YOUR MIND AND BODY</h3>
                  <p className={cx('yoga-subtitle')}>
                    Find your perfect yoga gear
                  </p>
                  <button className={cx('shop-now-btn')}>Shop Now →</button>
                </div>
              </div>

              {/* Products Grid */}
              <div className={cx('products-grid')}>
                {newProducts.map((product) => (
                  <div key={product.id} className={cx('product-card')}>
                    <div className={cx('product-image-wrapper')}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={cx('product-image')}
                      />
                      {product.isNew && (
                        <span className={cx('badge', 'badge-new')}>NEW</span>
                      )}
                      {product.isSale && (
                        <span className={cx('badge', 'badge-sale')}>SALE</span>
                      )}
                      <div className={cx('product-overlay')}>
                        <div className={cx('product-actions')}>
                          <button className={cx('action-btn')}>
                            <FontAwesomeIcon icon={faHeart} />
                          </button>
                          <button className={cx('action-btn')}>
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className={cx('action-btn', 'primary')}>
                            <FontAwesomeIcon icon={faShoppingCart} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={cx('product-info')}>
                      <h3 className={cx('product-name')}>{product.name}</h3>
                      <div className={cx('product-price')}>
                        <span className={cx('price-current')}>
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className={cx('price-original')}>
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

        {/* Team Photos */}
        <section className={cx('team-section')}>
          <div className={cx('container')}>
            <div className={cx('team-grid')}>
              <div className={cx('team-card')}>
                <img
                  src="https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg"
                  alt="Men Category"
                  className={cx('team-image')}
                />
                <div className={cx('team-overlay')}>
                  <h3 className={cx('team-title')}>MEN</h3>
                  <p className={cx('team-subtitle')}>Athletic Wear</p>
                </div>
              </div>
              <div className={cx('team-card')}>
                <img
                  src="https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg"
                  alt="Kids Category"
                  className={cx('team-image')}
                />
                <div className={cx('team-overlay')}>
                  <h3 className={cx('team-title')}>KIDS</h3>
                  <p className={cx('team-subtitle')}>Sports Equipment</p>
                </div>
              </div>
              <div className={cx('team-card')}>
                <img
                  src="https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg"
                  alt="Women Category"
                  className={cx('team-image')}
                />
                <div className={cx('team-overlay')}>
                  <h3 className={cx('team-title')}>WOMEN</h3>
                  <p className={cx('team-subtitle')}>Fitness Gear</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className={cx('trending-section')}>
          <div className={cx('container')}>
            <div className={cx('section-header')}>
              <h2 className={cx('section-title')}>Trending Products</h2>
              <a href="#" className={cx('view-all-link')}>
                All Products →
              </a>
            </div>

            <div className={cx('trending-grid')}>
              {trendingProducts.map((product) => (
                <div key={product.id} className={cx('product-card')}>
                  <div className={cx('product-image-wrapper')}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={cx('product-image')}
                    />
                    {product.isNew && (
                      <span className={cx('badge', 'badge-new')}>NEW</span>
                    )}
                    <div className={cx('product-overlay')}>
                      <div className={cx('product-actions')}>
                        <button className={cx('action-btn')}>
                          <FontAwesomeIcon icon={faHeart} />
                        </button>
                        <button className={cx('action-btn')}>
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className={cx('action-btn', 'primary')}>
                          <FontAwesomeIcon icon={faShoppingCart} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={cx('product-info')}>
                    <div className={cx('product-rating')}>
                      {renderStars(product.rating)}
                    </div>
                    <h3 className={cx('product-name')}>{product.name}</h3>
                    <p className={cx('price-current')}>${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={cx('faq-section')}>
          <Question />
        </section>

        {/* Latest Updates Blog */}
        <section className={cx('blog-section')}>
          <div className={cx('container')}>
            <div className={cx('section-header')}>
              <h2 className={cx('section-title')}>Latest Updates</h2>
              <a href="#" className={cx('view-all-link')}>
                See All Articles →
              </a>
            </div>

            <div className={cx('blog-grid')}>
              {blogPosts.map((post, index) => (
                <article key={index} className={cx('blog-card')}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className={cx('blog-image')}
                  />
                  <div className={cx('blog-content')}>
                    <div className={cx('blog-date')}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {post.date}
                    </div>
                    <h3 className={cx('blog-title')}>{post.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
