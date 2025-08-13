import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './DefaultLayout.module.scss';
import Nav from '../../components/Navigation';

const cx = classNames.bind(styles);
function DefaultLayout({ children }) {
  return (
    <div className={cx('wrapper')}>
      <Nav /> {/* Nav nằm ngoài container */}
      {/* <Header /> */}
      <div className={cx('container')}>
        <div className={cx('content')}>{children}</div>
      </div>
      <Footer /> {/* Footer nằm ngoài container */}
    </div>
  );
}

DefaultLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
export default DefaultLayout;
