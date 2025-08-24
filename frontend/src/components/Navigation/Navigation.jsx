import { NavLink, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Navigation.module.scss';
import Breadcrumb from '../Breadcrumb';

const cx = classNames.bind(styles);

function Nav() {
  const location = useLocation();

  // Check if current route is Home
  const isHomePage = location.pathname === '/';
  return (
    <div className={cx('wrapper', { 'home-layout': isHomePage })}>
      <div>
        <div className={cx('nav-menu')}>
          <NavLink to="/" className={cx('nav-link', 'categories')}>
            BROWSE CATEGORIES ▼
          </NavLink>
          <NavLink to="/products" className={cx('nav-link')}>
            Products ▼
          </NavLink>
          <NavLink to="/blogs" className={cx('nav-link')}>
            Blogs
          </NavLink>
          <NavLink to="/contact" className={cx('nav-link')}>
            Contact
          </NavLink>
        </div>
        {!isHomePage && <Breadcrumb />}
      </div>
    </div>
  );
}

export default Nav;
