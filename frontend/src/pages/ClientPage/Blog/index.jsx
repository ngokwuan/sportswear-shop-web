import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, MotionConfig, useInView } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faCalendarAlt,
  faUser,
  faTag,
  faEye,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Blog.module.scss';
import axios from '../../../setup/axios';

const cx = classNames.bind(styles);

/* ------------------------------------------------------------------ */
/*  Motion vocabulary: giống Home, mọi thứ "lao" vào từ bên trái         */
/* ------------------------------------------------------------------ */
const EASE_BURST = [0.16, 1, 0.3, 1];

const stagger = (gap = 0.1) => ({
  visible: { transition: { staggerChildren: gap } },
});

const dash = {
  hidden: { opacity: 0, x: -60, skewX: 12 },
  visible: {
    opacity: 1,
    x: 0,
    skewX: 0,
    transition: { duration: 0.6, ease: EASE_BURST },
  },
};

// Từng dòng tiêu đề được "quét" ra như vạch về đích
const titleLine = {
  hidden: { x: -80, skewX: 14, clipPath: 'inset(-20% 120% -20% -20%)' },
  visible: {
    x: 0,
    skewX: 0,
    clipPath: 'inset(-20% -20% -20% -20%)',
    transition: { duration: 0.7, ease: EASE_BURST },
  },
};

const cardIn = {
  hidden: { opacity: 0, x: -40 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: EASE_BURST,
      delay: Math.min(i, 8) * 0.05, // chỉ stagger 8 card đầu để không bị chờ lâu
    },
  }),
};

// Tiêu đề section: vệt highlight neon quét qua khi cuộn tới (giống Home)
function SectionTitle({ children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  return (
    <div className={cx('section-header')}>
      <h2 ref={ref} className={cx('section-title', { 'in-view': inView })}>
        {children}
      </h2>
    </div>
  );
}

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const [featuredBlogs, setFeaturedBlogs] = useState([]);

  useEffect(() => {
    const page = searchParams.get('page') || 1;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    setSearchTerm(search);
    setSelectedCategory(category);
    setPagination((prev) => ({ ...prev, page: parseInt(page) }));

    fetchBlogs(page, search, category);
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedBlogs();
  }, []);

  const fetchBlogs = async (page = 1, search = '', category = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append('search', search);
      if (category) params.append('category_id', category);

      // Fixed API endpoint
      const response = await axios.get(`/blogs/published?${params}`);

      if (response.data.success) {
        setBlogs(response.data.data.blogs);
        setPagination((prev) => ({
          ...prev,
          ...response.data.data.pagination,
        }));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fixed API endpoint
      const response = await axios.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      // Fixed API endpoint
      const response = await axios.get('/blogs/published?limit=3');
      if (response.data.success) {
        setFeaturedBlogs(response.data.data.blogs.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchParams({ search: searchTerm, page: 1 });
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    updateSearchParams({ category: categoryId, page: 1 });
  };

  const updateSearchParams = (newParams) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    updateSearchParams({ page: newPage });
  };

  // TODO: chưa có API đăng ký nhận tin. Tạm thời chỉ chặn form reload trang.
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cx('blog-page')}>
        {/* Hero Section */}
        <section className={cx('hero-section')}>
          <div className={cx('hero-split-bg')} aria-hidden="true" />

          <div className={cx('container')}>
            <motion.div
              className={cx('hero-content')}
              initial="hidden"
              animate="visible"
              variants={stagger(0.1)}
            >
              <motion.h1 className={cx('hero-title')} variants={stagger(0.12)}>
                <motion.span className={cx('title-line')} variants={titleLine}>
                  SPORTS
                </motion.span>
                <motion.span
                  className={cx('title-line', 'accent')}
                  variants={titleLine}
                >
                  BLOG
                </motion.span>
              </motion.h1>

              <motion.p className={cx('hero-subtitle')} variants={dash}>
                Khám phá thế giới thể thao qua những câu chuyện, tips và tin tức
                mới nhất
              </motion.p>

              {/* motion ở lớp ngoài, skew (CSS) ở lớp trong để không bị ghi đè */}
              <motion.div className={cx('search-slot')} variants={dash}>
                <form
                  onSubmit={handleSearch}
                  className={cx('search-form')}
                  role="search"
                >
                  <div className={cx('search-input-wrapper')}>
                    <FontAwesomeIcon
                      icon={faSearch}
                      className={cx('search-icon')}
                    />
                    <input
                      type="text"
                      aria-label="Tìm kiếm bài viết"
                      placeholder="Tìm kiếm bài viết..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={cx('search-input')}
                    />
                    <button type="submit" className={cx('search-button')}>
                      Tìm kiếm
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className={cx('container')}>
          <div className={cx('blog-layout')}>
            {/* Main Content */}
            <main className={cx('main-content')}>
              {/* Featured Blogs */}
              {featuredBlogs.length > 0 && (
                <section className={cx('featured-section')}>
                  <SectionTitle>Bài Viết Nổi Bật</SectionTitle>
                  <div
                    className={cx(
                      'featured-grid',
                      `count-${Math.min(featuredBlogs.length, 3)}`,
                    )}
                  >
                    {featuredBlogs.map((blog) => (
                      <Link
                        to={`/blogs/${blog.id}`}
                        key={blog.id}
                        className={cx('featured-card')}
                      >
                        <div className={cx('featured-image')}>
                          <img
                            src={
                              blog.featured_image || '/default-blog-image.jpg'
                            }
                            alt={blog.title}
                          />
                          <div className={cx('featured-overlay')}>
                            <h3 className={cx('featured-title')}>
                              {blog.title}
                            </h3>
                            <p className={cx('featured-excerpt')}>
                              {truncateText(blog.excerpt || '', 120)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Category Filter */}
              <section className={cx('filter-section')}>
                <h3 className={cx('filter-title')}>Danh mục</h3>
                <div className={cx('category-filters')}>
                  <button
                    type="button"
                    aria-pressed={!selectedCategory}
                    onClick={() => handleCategoryFilter('')}
                    className={cx('category-btn', {
                      active: !selectedCategory,
                    })}
                  >
                    Tất cả
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={selectedCategory == category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={cx('category-btn', {
                        active: selectedCategory == category.id,
                      })}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Blog Grid */}
              <section className={cx('blog-grid-section')}>
                {loading ? (
                  <div className={cx('loading')}>
                    <div className={cx('loading-spinner')}></div>
                    <p>Đang tải...</p>
                  </div>
                ) : blogs.length > 0 ? (
                  <>
                    <div className={cx('blog-grid')}>
                      {blogs.map((blog, index) => (
                        <motion.div
                          key={blog.id}
                          className={cx('blog-slot')}
                          custom={index}
                          variants={cardIn}
                          initial="hidden"
                          animate="visible"
                        >
                          <article className={cx('blog-card')}>
                            <Link
                              to={`/blogs/${blog.id}`}
                              className={cx('blog-link')}
                            >
                              <div className={cx('blog-image')}>
                                <img
                                  src={
                                    blog.featured_image ||
                                    '/default-blog-image.jpg'
                                  }
                                  alt={blog.title}
                                />
                                {blog.category && (
                                  <span className={cx('blog-category')}>
                                    <FontAwesomeIcon icon={faTag} />
                                    {blog.category.name}
                                  </span>
                                )}
                              </div>

                              <div className={cx('blog-content')}>
                                <h3 className={cx('blog-title')}>
                                  {blog.title}
                                </h3>
                                <p className={cx('blog-excerpt')}>
                                  {truncateText(blog.excerpt || '', 150)}
                                </p>

                                <div className={cx('blog-meta')}>
                                  <span className={cx('blog-meta-item')}>
                                    <FontAwesomeIcon icon={faUser} />
                                    {blog.author?.name}
                                  </span>
                                  <span className={cx('blog-meta-item')}>
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                    {formatDate(blog.published_at)}
                                  </span>
                                  <span className={cx('blog-meta-item')}>
                                    <FontAwesomeIcon icon={faEye} />
                                    {blog.views || 0} lượt xem
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </article>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <nav className={cx('pagination')} aria-label="Phân trang">
                        <button
                          type="button"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className={cx('pagination-btn', 'prev-btn')}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                          Trước
                        </button>

                        <div className={cx('pagination-numbers')}>
                          {Array.from(
                            { length: pagination.totalPages },
                            (_, i) => i + 1,
                          )
                            .filter(
                              (page) =>
                                page === 1 ||
                                page === pagination.totalPages ||
                                Math.abs(page - pagination.page) <= 2,
                            )
                            .map((page, index, array) => (
                              <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className={cx('pagination-ellipsis')}>
                                    ...
                                  </span>
                                )}
                                <button
                                  type="button"
                                  aria-current={
                                    page === pagination.page
                                      ? 'page'
                                      : undefined
                                  }
                                  onClick={() => handlePageChange(page)}
                                  className={cx(
                                    'pagination-btn',
                                    'number-btn',
                                    {
                                      active: page === pagination.page,
                                    },
                                  )}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className={cx('pagination-btn', 'next-btn')}
                        >
                          Sau
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </nav>
                    )}
                  </>
                ) : (
                  <div className={cx('no-results')}>
                    <h3>Không tìm thấy bài viết nào</h3>
                    <p>
                      Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.
                    </p>
                  </div>
                )}
              </section>
            </main>

            {/* Sidebar */}
            <aside className={cx('sidebar')}>
              {/* Recent Posts */}
              <div className={cx('sidebar-widget')}>
                <h3 className={cx('widget-title')}>Bài Viết Mới Nhất</h3>
                <div className={cx('recent-posts')}>
                  {featuredBlogs.slice(0, 5).map((blog) => (
                    <Link
                      to={`/blogs/${blog.id}`}
                      key={blog.id}
                      className={cx('recent-post-item')}
                    >
                      <img
                        src={blog.featured_image || '/default-blog-image.jpg'}
                        alt={blog.title}
                        className={cx('recent-post-image')}
                      />
                      <div className={cx('recent-post-content')}>
                        <h4 className={cx('recent-post-title')}>
                          {truncateText(blog.title, 60)}
                        </h4>
                        <span className={cx('recent-post-date')}>
                          {formatDate(blog.published_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div className={cx('sidebar-widget')}>
                <h3 className={cx('widget-title')}>Danh Mục Phổ Biến</h3>
                <div className={cx('popular-categories')}>
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={selectedCategory == category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={cx('popular-category-item', {
                        active: selectedCategory == category.id,
                      })}
                    >
                      <FontAwesomeIcon icon={faTag} />
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className={cx('sidebar-widget', 'newsletter-widget')}>
                <h3 className={cx('widget-title')}>Đăng Ký Nhận Tin</h3>
                <p className={cx('newsletter-description')}>
                  Nhận thông tin về những bài viết mới nhất và ưu đãi độc quyền
                  từ cửa hàng
                </p>
                <form
                  className={cx('newsletter-form')}
                  onSubmit={handleNewsletterSubmit}
                >
                  <input
                    type="email"
                    aria-label="Email của bạn"
                    placeholder="Nhập email của bạn..."
                    className={cx('newsletter-input')}
                  />
                  <button type="submit" className={cx('newsletter-button')}>
                    Đăng Ký
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default Blog;
