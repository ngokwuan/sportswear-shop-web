import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import {
  faSearch,
  faShoppingCart,
  faUserAlt,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Nav() {
  const [cartCount, setCartCount] = useState(3);

  return (
    <div className={cx('wrapper')}>
      {/* Logo */}
      <div className={cx('logo')}>
        <span className={cx('logo-s')}>S</span>
        <span className={cx('logo-w')}>W</span>
        <span className={cx('logo-s')}>S</span>
      </div>

      {/* Icons */}
      <div className={cx('nav-icons')}>
        <button className={cx('icon-btn', 'login-btn')}>
          <FontAwesomeIcon icon={faUserAlt} />
          SIGN IN
        </button>

        <button className={cx('icon-btn')}>
          <FontAwesomeIcon icon={faShoppingCart} />
          {cartCount > 0 && (
            <span className={cx('cart-badge')}>{cartCount}</span>
          )}
        </button>
        <button className={cx('icon-btn')}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
    </div>
  );
}

export default Nav;
