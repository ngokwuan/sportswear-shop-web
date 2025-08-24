import classNames from 'classnames/bind';
import styles from './Blogs.module.scss';

const cx = classNames.bind(styles);

function Blogs() {
  return <div className={cx('wrapper')}>Blogs</div>;
}

export default Blogs;
