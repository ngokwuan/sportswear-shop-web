import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import axios from '../../../setup/axios'; // Fixed import path

const cx = classNames.bind(styles);

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

  const navigate = useNavigate();
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className={cx('blog-page')}>
      {/* Hero Section */}
      <section className={cx('hero-section')}>
        <div className={cx('container')}>
          <div className={cx('hero-content')}>
            <h1 className={cx('hero-title')}>SPORTS BLOG</h1>
            <p className={cx('hero-subtitle')}>
              Khám phá thế giới thể thao qua những câu chuyện, tips và tin tức
              mới nhất
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className={cx('search-form')}>
              <div className={cx('search-input-wrapper')}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={cx('search-icon')}
                />
                <input
                  type="text"
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
          </div>
        </div>
      </section>

      <div className={cx('container')}>
        <div className={cx('blog-layout')}>
          {/* Main Content */}
          <main className={cx('main-content')}>
            {/* Featured Blogs */}
            {featuredBlogs.length > 0 && (
              <section className={cx('featured-section')}>
                <h2 className={cx('section-title')}>Bài Viết Nổi Bật</h2>
                <div className={cx('featured-grid')}>
                  {featuredBlogs.map((blog) => (
                    <Link
                      to={`/blogs/${blog.id}`}
                      key={blog.id}
                      className={cx('featured-card')}
                    >
                      <div className={cx('featured-image')}>
                        <img
                          src={blog.featured_image || '/default-blog-image.jpg'}
                          alt={blog.title}
                        />
                        <div className={cx('featured-overlay')}>
                          <h3 className={cx('featured-title')}>{blog.title}</h3>
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
                  onClick={() => handleCategoryFilter('')}
                  className={cx('category-btn', { active: !selectedCategory })}
                >
                  Tất cả
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
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
                    {blogs.map((blog) => (
                      <article key={blog.id} className={cx('blog-card')}>
                        <Link
                          to={`/blogs/${blog.id}`}
                          className={cx('blog-link')}
                        >
                          <div className={cx('blog-image')}>
                            <img
                              src={
                                blog.featured_image || '/default-blog-image.jpg'
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
                            <h3 className={cx('blog-title')}>{blog.title}</h3>
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
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className={cx('pagination')}>
                      <button
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
                          (_, i) => i + 1
                        )
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === pagination.totalPages ||
                              Math.abs(page - pagination.page) <= 2
                          )
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className={cx('pagination-ellipsis')}>
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={cx('pagination-btn', 'number-btn', {
                                  active: page === pagination.page,
                                })}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className={cx('pagination-btn', 'next-btn')}
                      >
                        Sau
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
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
                Nhận thông tin về những bài viết mới nhất và ưu đãi độc quyền từ
                cửa hàng
              </p>
              <form className={cx('newsletter-form')}>
                <input
                  type="email"
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
  );
}

export default Blog;
