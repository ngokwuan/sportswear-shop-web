import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faUser,
  faTag,
  faEye,
  faArrowLeft,
  faShare,
  faClock,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faTwitter,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import classNames from 'classnames/bind';
import styles from './BlogDetail.module.scss';
import axios from '../../../../setup/axios';

const cx = classNames.bind(styles);

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBlogDetail();
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    if (blog && blog.category_id) {
      fetchRelatedBlogs();
    }
  }, [blog]);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      // Fixed API endpoint - removed /api prefix and used correct endpoint
      const response = await axios.get(
        `/blogs/${id}/public?increment_view=true`
      );

      if (response.data.success) {
        setBlog(response.data.data);
      } else {
        setError('Không tìm thấy bài viết');
      }
    } catch (error) {
      console.error('Error fetching blog detail:', error);
      setError('Có lỗi xảy ra khi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      // Fixed API endpoint
      const response = await axios.get(
        `/blogs/published?category_id=${blog.category_id}&limit=4`
      );

      if (response.data.success) {
        // Loại bỏ bài viết hiện tại khỏi danh sách related
        const filtered = response.data.data.blogs.filter(
          (relatedBlog) => relatedBlog.id !== parseInt(id)
        );
        setRelatedBlogs(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title || '';

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className={cx('blog-detail-page')}>
        <div className={cx('container')}>
          <div className={cx('loading')}>
            <div className={cx('loading-spinner')}></div>
            <p>Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={cx('blog-detail-page')}>
        <div className={cx('container')}>
          <div className={cx('error-message')}>
            <h2>Oops! {error || 'Không tìm thấy bài viết'}</h2>
            <p>Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <button
              onClick={() => navigate('/blogs')}
              className={cx('back-button')}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Về trang Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('blog-detail-page')}>
      {/* Breadcrumb */}
      <section className={cx('breadcrumb-section')}>
        <div className={cx('container')}>
          <nav className={cx('breadcrumb')}>
            <Link to="/" className={cx('breadcrumb-item')}>
              Trang chủ
            </Link>
            <FontAwesomeIcon
              icon={faChevronRight}
              className={cx('breadcrumb-separator')}
            />
            <Link to="/blogs" className={cx('breadcrumb-item')}>
              Blog
            </Link>
            <FontAwesomeIcon
              icon={faChevronRight}
              className={cx('breadcrumb-separator')}
            />
            {blog.category && (
              <>
                <Link
                  to={`/blogs?category=${blog.category.id}`}
                  className={cx('breadcrumb-item')}
                >
                  {blog.category.name}
                </Link>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className={cx('breadcrumb-separator')}
                />
              </>
            )}
            <span className={cx('breadcrumb-item', 'current')}>
              {blog.title}
            </span>
          </nav>
        </div>
      </section>

      <div className={cx('container')}>
        <div className={cx('blog-detail-layout')}>
          {/* Main Content */}
          <main className={cx('main-content')}>
            <article className={cx('blog-article')}>
              {/* Article Header */}
              <header className={cx('article-header')}>
                <button
                  onClick={() => navigate('/blog')}
                  className={cx('back-button')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Về trang Blog
                </button>

                {blog.category && (
                  <Link
                    to={`/blogs?category=${blog.category.id}`}
                    className={cx('article-category')}
                  >
                    <FontAwesomeIcon icon={faTag} />
                    {blog.category.name}
                  </Link>
                )}

                <h1 className={cx('article-title')}>{blog.title}</h1>

                <div className={cx('article-meta')}>
                  <div className={cx('meta-left')}>
                    <span className={cx('meta-item')}>
                      <FontAwesomeIcon icon={faUser} />
                      {blog.author?.name}
                    </span>
                    <span className={cx('meta-item')}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(blog.published_at)}
                    </span>
                    <span className={cx('meta-item')}>
                      <FontAwesomeIcon icon={faClock} />
                      {calculateReadTime(blog.content)} phút đọc
                    </span>
                    <span className={cx('meta-item')}>
                      <FontAwesomeIcon icon={faEye} />
                      {blog.views || 0} lượt xem
                    </span>
                  </div>

                  <div className={cx('meta-right')}>
                    <div className={cx('share-buttons')}>
                      <span className={cx('share-label')}>
                        <FontAwesomeIcon icon={faShare} />
                        Chia sẻ:
                      </span>
                      <button
                        onClick={() => handleShare('facebook')}
                        className={cx('share-button', 'facebook')}
                      >
                        <FontAwesomeIcon icon={faFacebook} />
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className={cx('share-button', 'twitter')}
                      >
                        <FontAwesomeIcon icon={faTwitter} />
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className={cx('share-button', 'linkedin')}
                      >
                        <FontAwesomeIcon icon={faLinkedin} />
                      </button>
                    </div>
                  </div>
                </div>

                {blog.excerpt && (
                  <div className={cx('article-excerpt')}>
                    <p>{blog.excerpt}</p>
                  </div>
                )}
              </header>

              {/* Featured Image */}
              {blog.featured_image && (
                <div className={cx('article-image')}>
                  <img src={blog.featured_image} alt={blog.title} />
                </div>
              )}

              {/* Article Content */}
              <div className={cx('article-content')}>
                <div
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                  className={cx('content-body')}
                />
              </div>

              {/* Article Footer */}
              <footer className={cx('article-footer')}>
                <div className={cx('article-tags')}>
                  {blog.category && (
                    <Link
                      to={`/blogs?category=${blog.category.id}`}
                      className={cx('tag')}
                    >
                      #{blog.category.name}
                    </Link>
                  )}
                </div>

                <div className={cx('article-actions')}>
                  <div className={cx('share-section')}>
                    <h4>Chia sẻ bài viết này:</h4>
                    <div className={cx('share-buttons', 'large')}>
                      <button
                        onClick={() => handleShare('facebook')}
                        className={cx('share-button', 'facebook')}
                      >
                        <FontAwesomeIcon icon={faFacebook} />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className={cx('share-button', 'twitter')}
                      >
                        <FontAwesomeIcon icon={faTwitter} />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className={cx('share-button', 'linkedin')}
                      >
                        <FontAwesomeIcon icon={faLinkedin} />
                        LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              </footer>
            </article>

            {/* Related Posts */}
            {relatedBlogs.length > 0 && (
              <section className={cx('related-posts')}>
                <h2 className={cx('related-title')}>Bài viết liên quan</h2>
                <div className={cx('related-grid')}>
                  {relatedBlogs.map((relatedBlog) => (
                    <Link
                      to={`/blogs/${relatedBlog.id}`}
                      key={relatedBlog.id}
                      className={cx('related-card')}
                    >
                      <div className={cx('related-image')}>
                        <img
                          src={
                            relatedBlog.featured_image ||
                            '/default-blog-image.jpg'
                          }
                          alt={relatedBlog.title}
                        />
                      </div>
                      <div className={cx('related-content')}>
                        <h3 className={cx('related-card-title')}>
                          {relatedBlog.title}
                        </h3>
                        <p className={cx('related-excerpt')}>
                          {relatedBlog.excerpt?.substring(0, 120)}...
                        </p>
                        <div className={cx('related-meta')}>
                          <span className={cx('related-date')}>
                            {formatDate(relatedBlog.published_at)}
                          </span>
                          <span className={cx('related-views')}>
                            <FontAwesomeIcon icon={faEye} />
                            {relatedBlog.views || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className={cx('sidebar')}>
            {/* Author Info */}
            {blog.author && (
              <div className={cx('sidebar-widget', 'author-widget')}>
                <h3 className={cx('widget-title')}>Tác giả</h3>
                <div className={cx('author-info')}>
                  <div className={cx('author-avatar')}>
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className={cx('author-details')}>
                    <h4 className={cx('author-name')}>{blog.author.name}</h4>
                    <p className={cx('author-bio')}>
                      Tác giả chuyên viết về các chủ đề thể thao, sức khỏe và
                      lối sống năng động.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Table of Contents */}
            <div className={cx('sidebar-widget')}>
              <h3 className={cx('widget-title')}>Mục lục</h3>
              <div className={cx('toc')}>
                <p className={cx('toc-note')}>
                  Nội dung bài viết được chia thành các phần để bạn dễ dàng theo
                  dõi.
                </p>
              </div>
            </div>

            {/* Newsletter */}
            <div className={cx('sidebar-widget', 'newsletter-widget')}>
              <h3 className={cx('widget-title')}>Đăng ký nhận tin</h3>
              <p className={cx('newsletter-description')}>
                Nhận thông báo về những bài viết mới nhất và ưu đãi đặc biệt
              </p>
              <form className={cx('newsletter-form')}>
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className={cx('newsletter-input')}
                />
                <button type="submit" className={cx('newsletter-button')}>
                  Đăng ký
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;
