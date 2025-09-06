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
import UserMenu from '../../../components/UserMenu';

const cx = classNames.bind(styles);

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.log('Người dùng chưa được xác thực', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await axios.get('/cart/count');

      setCartCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

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
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // const handleLogout = async () => {
  //   try {
  //     await axios.post('/auth/logout'); // cookie sẽ bị xóa ở server
  //     localStorage.removeItem('user'); // nếu  còn lưu user ở localStorage
  //     window.location.href = '/'; //
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //   }
  // };
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
          <UserMenu user={user} />
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
