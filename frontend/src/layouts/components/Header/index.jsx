import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from '../../../setup/axios';

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
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Check if current route is Home
  const isHomePage = location.pathname === '/';

  // Load user data
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
        console.log('User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart count from API
  const fetchCartCount = async () => {
    try {
      // Kiểm tra token trong cookie hoặc localStorage
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('jwt='))
        ?.split('=')[1];
      if (!token) {
        setCartCount(0);
        return;
      }

      const response = await axios.get('/cart/count');

      if (response && response.data.count) {
        setCartCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  // Load cart count when component mounts and when user changes
  useEffect(() => {
    if (user && !loading) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user, loading]);

  // Listen for cart update events from ProductCard or ProductDetail
  useEffect(() => {
    const handleCartUpdate = (event) => {
      if (event.detail && event.detail.action === 'add') {
        setCartCount((prevCount) => prevCount + event.detail.quantity);
      } else {
        // For other actions (remove, update), refetch the cart
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Alternative method: Use setInterval to periodically update cart count
  // Uncomment if you want to auto-refresh cart count every 30 seconds
  /*
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchCartCount();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);
  */

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

        <NavLink to="/cart" className={cx('nav-link')}>
          <button className={cx('icon-btn', 'cart-btn')}>
            <FontAwesomeIcon icon={faShoppingCart} />
            {cartCount > 0 && (
              <span className={cx('cart-badge')}>{cartCount}</span>
            )}
          </button>
        </NavLink>

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
