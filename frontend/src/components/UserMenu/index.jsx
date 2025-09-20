import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserAlt,
  faSignOutAlt,
  faBox,
  faIdCard,
} from '@fortawesome/free-solid-svg-icons';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import axios from '../../setup/axios';
import classNames from 'classnames/bind';
import styles from './UserMenu.module.scss';

const cx = classNames.bind(styles);

function UserMenu({ user }) {
  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderMenu = () => (
    <div className={cx('dropdown')}>
      <NavLink to="/profile" className={cx('dropdown-item')}>
        <FontAwesomeIcon icon={faIdCard} /> Thông tin của tôi
      </NavLink>
      <NavLink to="/orders" className={cx('dropdown-item')}>
        <FontAwesomeIcon icon={faBox} /> Đơn hàng của tôi
      </NavLink>
      <button onClick={handleLogout} className={cx('dropdown-item')}>
        <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
      </button>
    </div>
  );

  return (
    <Tippy
      content={renderMenu()}
      placement="bottom-end"
      theme="light"
      interactive //de co the clickclick
      delay={[0, 700]} //delay toc do hien thi
      appendTo={document.body}
    >
      <button className={cx('icon-btn', 'login-btn', 'user-info')}>
        <FontAwesomeIcon icon={faUserAlt} />
        <span className={cx('user-name')}>
          Hi {user.name?.split(' ').pop()}!
        </span>
      </button>
    </Tippy>
  );
}

export default UserMenu;
