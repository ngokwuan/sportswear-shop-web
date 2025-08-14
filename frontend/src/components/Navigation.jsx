import { NavLink } from 'react-router-dom';

import classNames from 'classnames/bind';
import styles from './Navigation.module.scss';

const cx = classNames.bind(styles);

function Nav() {
  return (
    <div className={cx('wrapper')}>
      <div>
        <div className={cx('nav-menu')}>
          <NavLink to="/" className={cx('nav-link', 'categories')}>
            BROWSE CATEGORIES
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
        </div>
        {/* Breadcrumb */}
        <div className={cx('breadcrumb')}>
          <span>Home</span> / <span className={cx('current')}>Products</span>
        </div>
      </div>
    </div>
  );
}

export default Nav;
