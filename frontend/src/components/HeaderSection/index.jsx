import classNames from 'classnames/bind';
import styles from './HeaderSection.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);
function HeaderSection({ title, viewAll }) {
  return (
    <div className={cx('section-header')}>
      <h2 className={cx('section-title')}>{title}</h2>
      <Link to="/products" className={cx('view-all-link')}>
        {viewAll}
      </Link>
    </div>
  );
}

export default HeaderSection;
