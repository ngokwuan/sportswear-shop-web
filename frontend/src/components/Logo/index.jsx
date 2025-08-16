import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import styles from './Logo.module.scss';
const cx = classNames.bind(styles);

function Logo() {
  return (
    <NavLink to="/" className={cx('nav-link')}>
      <div className={cx('logo')}>
        <span className={cx('logo-s')}>S</span>
        <span className={cx('logo-w')}>W</span>
        <span className={cx('logo-s')}>S</span>
      </div>
    </NavLink>
  );
}

export default Logo;
