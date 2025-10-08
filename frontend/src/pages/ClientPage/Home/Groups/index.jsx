import classNames from 'classnames/bind';
import styles from './Groups.module.scss';
const cx = classNames.bind(styles);
function Groups() {
  return (
    <div className={cx('container')}>
      <div className={cx('team-grid')}>
        <div className={cx('team-card')}>
          <img
            src="https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg"
            alt="Men Category"
            className={cx('team-image')}
          />
          <div className={cx('team-overlay')}>
            <h3 className={cx('team-title')}>RUNNING</h3>
            <p className={cx('team-subtitle')}>Athletic Wear</p>
          </div>
        </div>
        <div className={cx('team-card')}>
          <img
            src="https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg"
            alt="Kids Category"
            className={cx('team-image')}
          />
          <div className={cx('team-overlay')}>
            <h3 className={cx('team-title')}>YOGA</h3>
            <p className={cx('team-subtitle')}>Sports Equipment</p>
          </div>
        </div>
        <div className={cx('team-card')}>
          <img
            src="https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg"
            alt="Women Category"
            className={cx('team-image')}
          />
          <div className={cx('team-overlay')}>
            <h3 className={cx('team-title')}>GYM</h3>
            <p className={cx('team-subtitle')}>Fitness Gear</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;
