import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faCheckCircle,
  faUsers,
  faShoppingBag,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';

import classNames from 'classnames/bind';
import styles from './AboutUs.module.scss';

const cx = classNames.bind(styles);

function AboutUs() {
  const stats = [
    { icon: faUsers, number: 'New', label: 'Fresh Start' },
    { icon: faShoppingBag, number: '200+', label: 'Products' },
    { icon: faHeart, number: '100%', label: 'Quality' },
    { icon: faCheckCircle, number: '24/7', label: 'Support' },
  ];

  const values = [
    {
      icon: faCheckCircle,
      title: 'Quality Products',
      description:
        'We carefully select every item in our collection to ensure the highest quality and style for our customers.',
    },
    {
      icon: faUsers,
      title: 'Customer First',
      description:
        'Your satisfaction is our top priority. We provide personalized service and styling advice to help you look your best.',
    },
    {
      icon: faHeart,
      title: 'Passion for Fashion',
      description:
        'We are passionate about bringing the latest fashion trends and timeless classics to our community.',
    },
    {
      icon: faShoppingBag,
      title: 'Affordable Style',
      description:
        'Great fashion should be accessible to everyone. We offer competitive prices without compromising on quality.',
    },
  ];

  const contactInfo = [
    {
      icon: faPhone,
      title: 'Phone Number',
      details: '+1 (555) 123-4567',
      description: 'Call us for immediate support',
    },
    {
      icon: faEnvelope,
      title: 'Email Address',
      details: 'support@fashionstore.com',
      description: 'Send us your questions anytime',
    },
    {
      icon: faMapMarkerAlt,
      title: 'Store Location',
      details: '123 Fashion Street, NY 10001',
      description: 'Visit our flagship store',
    },
    {
      icon: faClock,
      title: 'Business Hours',
      details: 'Mon-Sat: 9AM - 9PM',
      description: 'We are open to serve you',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className={cx('page-wrapper')}>
      <main className={cx('main-content')}>
        {/* Hero Section */}
        <section className={cx('hero-section')}>
          <div className={cx('container')}>
            <div className={cx('hero-content')}>
              <h1 className={cx('hero-title')}>ABOUT US</h1>
              <p className={cx('hero-subtitle')}>
                Your New Destination for Fashion Excellence
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className={cx('story-section')}>
          <div className={cx('container')}>
            <div className={cx('story-grid')}>
              <div className={cx('story-image')}>
                <div className={cx('image-placeholder')}>
                  <FontAwesomeIcon
                    icon={faHeart}
                    className={cx('placeholder-icon')}
                  />
                </div>
              </div>
              <div className={cx('story-content')}>
                <h2 className={cx('section-title')}>Our Story</h2>
                <p className={cx('story-text')}>
                  Welcome to our newly launched fashion store! We're excited to
                  bring you a fresh approach to fashion retail with a carefully
                  curated collection of stylish, high-quality clothing and
                  accessories.
                </p>
                <p className={cx('story-text')}>
                  As a new business, we're building our brand on the foundation
                  of excellent customer service, quality products, and
                  affordable prices. We believe that everyone deserves to look
                  and feel their best, and we're here to make that happen.
                </p>
                <p className={cx('story-text')}>
                  Our team is dedicated to creating an exceptional shopping
                  experience, whether you're browsing online or visiting our
                  store. We're just getting started, and we can't wait to grow
                  with you!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={cx('stats-section')}>
          <div className={cx('container')}>
            <div className={cx('stats-grid')}>
              {stats.map((stat, index) => (
                <div key={index} className={cx('stat-card')}>
                  <FontAwesomeIcon
                    icon={stat.icon}
                    className={cx('stat-icon')}
                  />
                  <h3 className={cx('stat-number')}>{stat.number}</h3>
                  <p className={cx('stat-label')}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={cx('values-section')}>
          <div className={cx('container')}>
            <div className={cx('section-header')}>
              <h2 className={cx('section-title')}>Why Choose Us</h2>
              <p className={cx('section-subtitle')}>
                What sets us apart from the rest
              </p>
            </div>
            <div className={cx('values-grid')}>
              {values.map((value, index) => (
                <div key={index} className={cx('value-card')}>
                  <div className={cx('value-icon-wrapper')}>
                    <FontAwesomeIcon
                      icon={value.icon}
                      className={cx('value-icon')}
                    />
                  </div>
                  <h3 className={cx('value-title')}>{value.title}</h3>
                  <p className={cx('value-description')}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className={cx('contact-section')}>
          <div className={cx('container')}>
            <div className={cx('section-header')}>
              <h2 className={cx('section-title')}>Get In Touch</h2>
              <p className={cx('section-subtitle')}>
                We'd love to hear from you
              </p>
            </div>

            <div className={cx('contact-wrapper')}>
              {/* Contact Form */}
              <div className={cx('contact-form-container')}>
                <h3 className={cx('form-heading')}>Send Us A Message</h3>
                <form className={cx('contact-form')} onSubmit={handleSubmit}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>Full Name *</label>
                    <input
                      type="text"
                      className={cx('form-input')}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>Email Address *</label>
                    <input
                      type="email"
                      className={cx('form-input')}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>Subject</label>
                    <select className={cx('form-select')}>
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="order-support">Order Support</option>
                      <option value="returns-exchanges">
                        Returns & Exchanges
                      </option>
                      <option value="size-guide">Size Guide Help</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>Message *</label>
                    <textarea
                      className={cx('form-textarea')}
                      placeholder="Tell us how we can help you..."
                      rows="5"
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className={cx('submit-button')}>
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className={cx('contact-info-container')}>
                <h3 className={cx('form-heading')}>Contact Information</h3>
                <div className={cx('contact-info-list')}>
                  {contactInfo.map((info, index) => (
                    <div key={index} className={cx('contact-info-item')}>
                      <div className={cx('info-icon-wrapper')}>
                        <FontAwesomeIcon
                          icon={info.icon}
                          className={cx('info-icon')}
                        />
                      </div>
                      <div className={cx('info-content')}>
                        <h4 className={cx('info-title')}>{info.title}</h4>
                        <p className={cx('info-detail')}>{info.details}</p>
                        <p className={cx('info-description')}>
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className={cx('map-section')}>
          <div className={cx('container')}>
            <div className={cx('map-container')}>
              <div className={cx('map-placeholder')}>
                <div className={cx('map-content')}>
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className={cx('map-icon')}
                  />
                  <h3 className={cx('map-title')}>Visit Our Store</h3>
                  <p className={cx('map-address')}>
                    123 Fashion Street
                    <br />
                    New York, NY 10001
                    <br />
                    United States
                  </p>
                  <button className={cx('map-button')}>Get Directions</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutUs;
