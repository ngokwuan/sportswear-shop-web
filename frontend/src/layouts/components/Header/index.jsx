import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from '../../../setup/axios';

import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import {
  faShoppingCart,
  faUserAlt,
} from '@fortawesome/free-solid-svg-icons';
import Logo from '../../../components/Logo';
import UserMenu from '../../../components/UserMenu';
import { UserContext } from '../../../context/UserContext';
import { motion } from 'framer-motion';

const cx = classNames.bind(styles);

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const { user, loading } = useContext(UserContext);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === '/';

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
    if (!loading && user) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user, loading]);

  useEffect(() => {
    const handleCartUpdate = (event) => {
      if (event.detail && event.detail.action === 'add') {
        setCartCount((prevCount) => prevCount + event.detail.quantity);
      } else {
        fetchCartCount();
      }
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={cx('header', { scrolled })}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={cx('logo')}>
        <Logo />
      </div>

      <nav className={cx('nav-menu')}>
        <NavLink to="/products" className={(nav) => cx('nav-link', { active: nav.isActive })}>
          COLLECTION
        </NavLink>
        <NavLink to="/blogs" className={(nav) => cx('nav-link', { active: nav.isActive })}>
          JOURNAL
        </NavLink>
        <NavLink to="/aboutus" className={(nav) => cx('nav-link', { active: nav.isActive })}>
          STUDIO
        </NavLink>
      </nav>

      <div className={cx('nav-icons')}>
        {!loading && user ? (
          <UserMenu user={user} />
        ) : (
          !loading && (
            <NavLink to="/login" className={cx('icon-btn')}>
              <FontAwesomeIcon icon={faUserAlt} />
            </NavLink>
          )
        )}

        <NavLink to="/cart" className={cx('icon-btn', 'cart-btn')}>
          <FontAwesomeIcon icon={faShoppingCart} />
          {cartCount > 0 && <span className={cx('cart-badge')}>{cartCount}</span>}
        </NavLink>
      </div>
    </motion.header>
  );
}

export default Header;
