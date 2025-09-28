import { useLocation, Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../../setup/axios';
import classNames from 'classnames/bind';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

function Breadcrumb() {
  const location = useLocation();
  const params = useParams();

  let pathnames = location.pathname.split('/').filter((x) => x);

  const formatPathname = (value) => {
    if (value.includes('_')) {
      value = value.split('_')[0];
    }

    return value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className={cx('breadcrumb')} aria-label="breadcrumb">
      <Link to="/" className={cx('link', 'home')}>
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = formatPathname(value);

        return (
          <span key={to} className={cx('breadcrumb-item')}>
            <span className={cx('separator')}> / </span>
            {isLast ? (
              <span className={cx('current')} aria-current="page">
                {displayName}
              </span>
            ) : (
              <Link to={to} className={cx('link')}>
                {displayName}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
