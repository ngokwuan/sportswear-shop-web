import classNames from 'classnames/bind';
import styles from './AuthLayout.module.scss';
import run from '../../assets/images/run.jpg';

const cx = classNames.bind(styles);

function AuthLayout({ children }) {
  return (
    <div className={cx('wrapper')}>
      <div className={cx('container-left')}>{children}</div>
      <div className={cx('container-right')}>
        <div className={cx('image-container')}>
          <img className={cx('run-img')} src={run} alt="background" />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
