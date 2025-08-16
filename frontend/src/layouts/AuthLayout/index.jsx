import classNames from 'classnames/bind';
import styles from './AuthLayout.module.scss';

const cx = classNames.bind(styles);
function AuthLayout({ children }) {
  return (
    <div className={cx('wrapper')}>
      <div className={cx('container-left')}>Left</div>
      <div className={cx('container-right')}> {children}</div>
    </div>
  );
}

export default AuthLayout;
