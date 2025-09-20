import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Blogs.module.scss';
import HeaderSection from '../../../../components/HeaderSection';

const cx = classNames.bind(styles);
function Blogs() {
  const blogPosts = [
    {
      title:
        'The Ultimate Guide to Choosing the Right Sportswear for Maximum Performance',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      date: 'March 15, 2024',
    },
    {
      title:
        'Enhancing Your Sports Nutrition Essential Tips for Optimal Athletic Performance',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      date: 'March 12, 2024',
    },
    {
      title:
        'Staying Motivated: Strategies to Overcome Challenges in Fitness Journey',
      image:
        'https://static.nike.com/a/images/w_1920,c_limit/52e409b4-9c3a-418c-ad86-e319498630f0/how-to-choose-running-shoes.jpg',
      date: 'March 10, 2024',
    },
  ];

  return (
    <div className={cx('container')}>
      <HeaderSection title="Latest Updates" viewAll=" See All Articles →" />
      <div className={cx('blog-grid')}>
        {blogPosts.map((post, index) => (
          <article key={index} className={cx('blog-card')}>
            <img
              src={post.image}
              alt={post.title}
              className={cx('blog-image')}
            />
            <div className={cx('blog-content')}>
              <div className={cx('blog-date')}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                {post.date}
              </div>
              <h3 className={cx('blog-title')}>{post.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Blogs;
