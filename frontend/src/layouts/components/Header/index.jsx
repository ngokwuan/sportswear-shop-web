import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import {
  faSearch,
  faShoppingCart,
  faUserAlt,
} from '@fortawesome/free-solid-svg-icons';
import Logo from '../../../components/Logo';

const cx = classNames.bind(styles);
function Header() {
  const [cartCount, setCartCount] = useState(3);
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Check if current route is Home
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));

      if (
        userData &&
        userData !== 'null' &&
        userData?.isAuthenticated === true
      ) {
        setUser(userData.account);
      } else {
        console.log('User not authenticated ');
        setUser(null);
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      setUser(null);
      localStorage.removeItem('user');
    }
  }, []);

  return (
    <div className={cx('wrapper', { 'home-layout': isHomePage })}>
      {!isHomePage && (
        <div className={cx('search')}>
          <button className={cx('icon-btn')}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              name="search"
              placeholder="Enter your search keywords"
            />
          </button>
        </div>
      )}

      <div className={cx('logo')}>
        <Logo />
      </div>

      {/* Icons */}
      <div className={cx('nav-icons')}>
        {user ? (
          <button className={cx('icon-btn', 'login-btn', 'user-info')}>
            <FontAwesomeIcon icon={faUserAlt} />
            <span className={cx('user-name')}>
              Hi {user.name?.split(' ').pop()}!
            </span>
          </button>
        ) : (
          <NavLink to="/login" className={cx('nav-link')}>
            <button className={cx('icon-btn', 'login-btn')}>
              <FontAwesomeIcon icon={faUserAlt} />
              SIGN IN
            </button>
          </NavLink>
        )}

        <button className={cx('icon-btn', 'cart-btn')}>
          <FontAwesomeIcon icon={faShoppingCart} />
          {cartCount > 0 && (
            <span className={cx('cart-badge')}>{cartCount}</span>
          )}
        </button>

        {isHomePage && (
          <button className={cx('icon-btn')}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
