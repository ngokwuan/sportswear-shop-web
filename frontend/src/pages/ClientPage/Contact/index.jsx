import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

import classNames from 'classnames/bind';
import styles from './Contact.module.scss';

const cx = classNames.bind(styles);

function Contact() {
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
            <div className={cx('hero-grid')}>
              {/* Main Banner */}
              <div className={cx('main-banner-1')}>
                <div className={cx('banner-content')}>
                  <div className={cx('banner-text')}>
                    <h1 className={cx('banner-title')}>CONTACT US</h1>
                    <p className={cx('banner-subtitle')}>
                      Get in touch with our fashion experts. We're here to help
                      you find your perfect style.
                    </p>
                    <button className={cx('cta-button')}>CALL NOW</button>
                  </div>
                </div>
              </div>

              {/* Contact Info Banner */}
              <div className={cx('main-banner-2')}>
                <div className={cx('banner-content')}>
                  <p className={cx('banner-subtitle')}>Customer Service</p>
                  <h1 className={cx('banner-title')}>24/7 SUPPORT</h1>
                  <button className={cx('shop-now-btn')}>Live Chat →</button>
                </div>
              </div>

              {/* Quick Contact Sidebar */}
              <div className={cx('sidebar-items')}>
                <div className={cx('sidebar-card')}>
                  <div className={cx('sidebar-content')}>
                    <h3 className={cx('sidebar-title')}>QUICK SUPPORT</h3>
                    <p className={cx('sidebar-price')}>Call Now</p>
                  </div>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className={cx('sidebar-icon')}
                  />
                </div>

                <div className={cx('sidebar-card')}>
                  <div className={cx('sidebar-content')}>
                    <h3 className={cx('sidebar-title')}>EMAIL US</h3>
                    <p className={cx('sidebar-price')}>24h Response</p>
                  </div>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className={cx('sidebar-icon')}
                  />
                </div>

                <div className={cx('sidebar-card')}>
                  <div className={cx('sidebar-content')}>
                    <h3 className={cx('sidebar-title')}>VISIT STORE</h3>
                    <p className={cx('sidebar-price')}>NYC Location</p>
                  </div>
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className={cx('sidebar-icon')}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className={cx('contact-form-section')}>
          <div className={cx('container')}>
            <div className={cx('section-header')}>
              <h2 className={cx('section-title')}>Send Us A Message</h2>
              <p className={cx('section-subtitle')}>
                Have a question about our fashion collection? We'd love to hear
                from you.
              </p>
            </div>

            <div className={cx('form-container')}>
              <form className={cx('contact-form')} onSubmit={handleSubmit}>
                <div className={cx('form-row')}>
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
          </div>
        </section>

        {/* Contact Info Section */}
        <section className={cx('contact-info-section')}>
          <div className={cx('container')}>
            <div className={cx('section-header')}>
              <h2 className={cx('section-title')}>Get In Touch</h2>
              <p className={cx('section-subtitle')}>
                Multiple ways to reach us for all your fashion needs
              </p>
            </div>

            <div className={cx('contact-info-grid')}>
              {contactInfo.map((info, index) => (
                <div key={index} className={cx('contact-info-card')}>
                  <div className={cx('info-icon-wrapper')}>
                    <FontAwesomeIcon
                      icon={info.icon}
                      className={cx('info-icon')}
                    />
                  </div>
                  <div className={cx('info-content')}>
                    <h3 className={cx('info-title')}>{info.title}</h3>
                    <p className={cx('info-detail')}>{info.details}</p>
                    <p className={cx('info-description')}>{info.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className={cx('map-section')}>
          <div className={cx('container')}>
            <div className={cx('section-header')}>
              <h2 className={cx('section-title')}>Visit Our Store</h2>
              <p className={cx('section-subtitle')}>
                Experience fashion in person at our flagship location
              </p>
            </div>

            <div className={cx('map-container')}>
              <div className={cx('map-placeholder')}>
                <div className={cx('map-content')}>
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className={cx('map-icon')}
                  />
                  <h3 className={cx('map-title')}>Fashion Store NYC</h3>
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

export default Contact;
