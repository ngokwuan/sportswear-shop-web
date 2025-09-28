import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faEye,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Blogs.module.scss';
import HeaderSection from '../../../../components/HeaderSection';
import axios from '../../../../setup/axios';

const cx = classNames.bind(styles);

function Blogs() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/blogs/published?limit=3');

      if (response.data.success) {
        setBlogPosts(response.data.data.blogs);
      } else {
        setError('Không thể tải bài viết');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Có lỗi xảy ra khi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={cx('container')}>
        <HeaderSection title="Latest Updates" viewAll=" See All Articles →" />
        <div className={cx('blog-grid')}>
          {[1, 2, 3].map((index) => (
            <article key={index} className={cx('blog-card', 'loading')}>
              <div className={cx('blog-image-skeleton')}></div>
              <div className={cx('blog-content')}>
                <div className={cx('blog-date-skeleton')}></div>
                <div className={cx('blog-title-skeleton')}></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx('container')}>
        <HeaderSection title="Latest Updates" viewAll=" See All Articles →" />
        <div className={cx('error-message')}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('container')}>
      <HeaderSection title="Latest Updates" viewAll=" See All Articles →" />
      <div className={cx('blog-grid')}>
        {blogPosts.map((post) => (
          <Link
            to={`/blogs/${post.id}`}
            key={post.id}
            className={cx('blog-card')}
          >
            <img
              src={post.featured_image || '/default-blog-image.jpg'}
              alt={post.title}
              className={cx('blog-image')}
              onError={(e) => {
                e.target.src = '/default-blog-image.jpg';
              }}
            />
            <div className={cx('blog-content')}>
              <div className={cx('blog-meta')}>
                <div className={cx('blog-date')}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {formatDate(post.published_at)}
                </div>
                {post.views && (
                  <div className={cx('blog-views')}>
                    <FontAwesomeIcon icon={faEye} />
                    {post.views}
                  </div>
                )}
              </div>

              {post.category && (
                <div className={cx('blog-category')}>{post.category.name}</div>
              )}

              <h3 className={cx('blog-title')}>{post.title}</h3>

              {post.excerpt && (
                <p className={cx('blog-excerpt')}>
                  {post.excerpt.length > 120
                    ? `${post.excerpt.substring(0, 120)}...`
                    : post.excerpt}
                </p>
              )}

              {post.author && (
                <div className={cx('blog-author')}>
                  <FontAwesomeIcon icon={faUser} />
                  <span>{post.author.name}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {blogPosts.length === 0 && (
        <div className={cx('no-posts')}>
          <p>Chưa có bài viết nào được xuất bản</p>
        </div>
      )}
    </div>
  );
}

export default Blogs;
