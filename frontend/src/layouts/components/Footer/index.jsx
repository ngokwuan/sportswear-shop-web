import classNames from 'classnames/bind';
import styles from './Footer.module.scss';

const cx = classNames.bind(styles);

function Footer() {
  return (
    <footer className={cx('wrapper')}>
      {/* Main Footer Content */}
      <div className={cx('footer-main')}>
        <div className={cx('row')}>
          {/* Logo & Description Column */}
          <div className={cx('col-lg-4', 'col-md-6', 'mb-4')}>
            <div className={cx('footer-brand')}>
              <div className={cx('logo')}>
                <span className={cx('logo-s')}>S</span>
                <span className={cx('logo-w')}>W</span>
                <span className={cx('logo-s')}>S</span>
              </div>
            </div>
            <p className={cx('footer-description')}>
              Discover our curated selection of premium sports equipment and
              apparel. From professional gear to everyday fitness essentials,
              we've got everything you need to elevate your performance.
            </p>
            <div className={cx('social-links')}>
              <a href="#" className={cx('social-link')}>
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className={cx('social-link')}>
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className={cx('social-link')}>
                <i className="fab fa-pinterest-p"></i>
              </a>
              <a href="#" className={cx('social-link')}>
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className={cx('col-lg-2', 'col-md-6', 'col-6', 'mb-4')}>
            <h6 className={cx('footer-title')}>Company</h6>
            <ul className={cx('footer-links')}>
              <li>
                <a href="#" className={cx('footer-link')}>
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Press
                </a>
              </li>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className={cx('col-lg-2', 'col-md-6', 'col-6', 'mb-4')}>
            <h6 className={cx('footer-title')}>Support</h6>
            <ul className={cx('footer-links')}>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className={cx('footer-link')}>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={cx('col-lg-4', 'col-md-6', 'mb-4')}>
            <h6 className={cx('footer-title')}>Get Our Updates</h6>
            <p className={cx('newsletter-text')}>
              Subscribe to get special offers, free giveaways, and exclusive
              deals.
            </p>
            <form className={cx('newsletter-form')}>
              <div className={cx('input-group')}>
                <input
                  type="email"
                  className={cx('newsletter-input')}
                  placeholder="Enter your email"
                  aria-label="Email address"
                />
                <button className={cx('newsletter-btn')} type="submit">
                  Subscribe
                </button>
              </div>
            </form>
            <div className={cx('payment-methods')}>
              <h6 className={cx('payment-title')}>We Accept</h6>
              <div className={cx('payment-icons')}>
                <div className={cx('payment-icon')}>
                  <i className="fab fa-cc-visa"></i>
                </div>
                <div className={cx('payment-icon')}>
                  <i className="fab fa-cc-mastercard"></i>
                </div>
                <div className={cx('payment-icon')}>
                  <i className="fab fa-cc-amex"></i>
                </div>
                <div className={cx('payment-icon')}>
                  <i className="fab fa-cc-paypal"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className={cx('footer-bottom')}>
        <div className={cx('container')}>
          <div className={cx('row', 'align-items-center')}>
            <div className={cx('col-md-6')}>
              <p className={cx('copyright')}>
                &copy; 2025 SWS. All rights reserved.
              </p>
            </div>
            <div className={cx('col-md-6')}>
              <div className={cx('footer-bottom-links')}>
                <a href="#" className={cx('footer-bottom-link')}>
                  Privacy Policy
                </a>
                <a href="#" className={cx('footer-bottom-link')}>
                  Terms of Service
                </a>
                <a href="#" className={cx('footer-bottom-link')}>
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
