import { useLocation, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div className={cx('breadcrumb')}>
      <Link to="/" className={cx('link')}>
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <span key={to}>
            {' / '}
            {isLast ? (
              <span className={cx('current')}>{value}</span>
            ) : (
              <Link to={to}>{value}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumb;
