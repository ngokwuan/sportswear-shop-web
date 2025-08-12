import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';

const cx = classNames.bind(styles);

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={cx('wrapper')}>
      {' '}
      {/* Custom wrapper với CSS Module */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
        <div className="container">
          {/* Logo - Kết hợp Bootstrap + Custom */}
          <a className={`navbar-brand ${cx('logo')}`} href="#">
            <span className={cx('logo-text')}>SPORT</span>
            <span className={`badge bg-danger ${cx('logo-badge')}`}>ZY</span>
          </a>

          {/* Toggle button - Pure Bootstrap */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation - Bootstrap structure + Custom styling */}
          <div
            className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}
          >
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className={`nav-link ${cx('nav-link', 'active')}`} href="/">
                  HOME
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${cx('nav-link')}`} href="/products">
                  PRODUCTS
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${cx('nav-link')}`} href="#">
                  BLOG
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${cx('nav-link')}`} href="#">
                  CONTACT
                </a>
              </li>
            </ul>

            {/* Action buttons - Bootstrap layout + Custom styling */}
            <div className="d-flex align-items-center gap-2">
              <button className={`btn ${cx('action-btn')}`} type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <button className={`btn ${cx('action-btn')}`} type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <button
                className={`btn position-relative ${cx(
                  'action-btn',
                  'cart-btn'
                )}`}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {/* Custom badge với conditional styling */}
                <span className={cx('cart-badge', { 'has-items': true })}>
                  2
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
