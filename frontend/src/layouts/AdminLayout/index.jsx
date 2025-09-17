import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './AdminLayout.module.scss';
import Logo from '../../components/Logo';

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: '📊',
      path: '/admin',
      key: 'dashboard',
    },
    {
      title: 'Users',
      icon: '👥',
      path: '/admin/users',
      key: 'users',
    },
    {
      title: 'Products',
      icon: '🏃‍♂️',
      path: '/admin/products',
      key: 'products',
    },
    {
      title: 'Categories',
      icon: '📂',
      path: '/admin/categories',
      key: 'categories',
    },
    {
      title: 'Orders',
      icon: '📦',
      path: '/admin/orders',
      key: 'orders',
    },
    {
      title: 'Blog',
      icon: '📝',
      path: '/admin/blog',
      key: 'blog',
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={cx('wrapper')}>
      {/* Admin Header */}
      <div className={cx('header')}>
        <div className={cx('header-left')}>
          <button className={cx('toggle-btn')} onClick={toggleSidebar}>
            <span className={cx('hamburger')}></span>
          </button>
          <Logo />
        </div>
        <div className={cx('header-right')}>
          <div className={cx('user-info')}>
            <span className={cx('welcome')}>Welcome, Admin</span>
            <div className={cx('avatar')}>👤</div>
          </div>
        </div>
      </div>

      <div className={cx('main-container')}>
        {/* Sidebar */}
        <div className={cx('sidebar', { collapsed: isSidebarCollapsed })}>
          <nav className={cx('nav')}>
            <ul className={cx('nav-list')}>
              {menuItems.map((item) => (
                <li key={item.key} className={cx('nav-item')}>
                  <Link
                    to={item.path}
                    className={cx('nav-link', {
                      active: isActiveRoute(item.path),
                    })}
                  >
                    <span className={cx('nav-icon')}>{item.icon}</span>
                    <span className={cx('nav-text')}>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className={cx('content-area')}>
          <div className={cx('container')}>
            <div className={cx('content')}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;
