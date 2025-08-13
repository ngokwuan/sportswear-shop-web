// import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faShoppingCart,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Navigation.module.scss';

const cx = classNames.bind(styles);

function Nav() {
  //   const [cartCount, setCartCount] = useState(3);

  return (
    <div className={cx('wrapper')}>
      {/* Logo */}
      <div className={cx('logo')}>
        <span className={cx('logo-sport')}>SPORT</span>
        <span className={cx('logo-zy')}>ZY</span>
      </div>

      {/* Navigation  */}
      <div className={cx('nav-menu')}>
        <NavLink to="/" className={cx('nav-link')}>
          Home
        </NavLink>
        <NavLink to="/products" className={cx('nav-link')}>
          Products
        </NavLink>
        <NavLink to="/blogs" className={cx('nav-link')}>
          Blogs
        </NavLink>
        <NavLink to="/contact" className={cx('nav-link')}>
          Contact
        </NavLink>

        {/* Icons */}
        <div className={cx('nav-icons')}>
          <button className={cx('icon-btn')}>
            <FontAwesomeIcon icon={faSearch} />
          </button>

          <button className={cx('icon-btn')}>
            <FontAwesomeIcon icon={faUser} />
          </button>

          <button className={cx('icon-btn', 'cart-btn')}>
            <FontAwesomeIcon icon={faShoppingCart} />
            {/* {cartCount > 0 && (
                <span className={cx('cart-badge')}>{cartCount}</span>
              )} */}
          </button>

          <button className={cx('login-btn')}>LOGIN</button>
        </div>
      </div>
    </div>
  );
}

export default Nav;
