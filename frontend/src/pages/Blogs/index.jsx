import classNames from 'classnames/bind';
import styles from './Blogs.module.scss';

const cx = classNames.bind(styles);

function Blogs() {
  const featuredPosts = [
    {
      id: 1,
      title: 'Top 10 Giày Chạy Bộ Tốt Nhất Năm 2024',
      excerpt:
        'Khám phá những đôi giày chạy bộ được đánh giá cao nhất từ các thương hiệu hàng đầu...',
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=250&fit=crop',
      category: 'Gear Review',
      author: 'Mai Anh',
      date: '25 Tháng 8, 2024',
      readTime: '5 phút đọc',
    },
    {
      id: 2,
      title: 'Cách Chọn Size Áo Thể Thao Phù Hợp',
      excerpt:
        'Hướng dẫn chi tiết để chọn được size áo thể thao vừa vặn và thoải mái nhất...',
      image:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      category: 'Style Guide',
      author: 'Tuấn Minh',
      date: '23 Tháng 8, 2024',
      readTime: '3 phút đọc',
    },
    {
      id: 3,
      title: 'Xu Hướng Thời Trang Thể Thao Mùa Thu 2024',
      excerpt:
        'Cập nhật những xu hướng thời trang thể thao hot nhất cho mùa thu này...',
      image:
        'https://images.unsplash.com/photo-1506629905607-0fce96d86cbd?w=400&h=250&fit=crop',
      category: 'Trends',
      author: 'Linh Chi',
      date: '20 Tháng 8, 2024',
      readTime: '4 phút đọc',
    },
  ];

  const recentPosts = [
    {
      id: 4,
      title: '5 Bài Tập Cardio Hiệu Quả Tại Nhà',
      excerpt:
        'Không cần đến phòng gym, bạn vẫn có thể duy trì thể lực tuyệt vời...',
      image:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      category: 'Fitness',
      date: '18 Tháng 8, 2024',
    },
    {
      id: 5,
      title: 'Review Giày Nike Air Max 270',
      excerpt: 'Đánh giá chi tiết về một trong những mẫu giày phổ biến nhất...',
      image:
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=200&fit=crop',
      category: 'Review',
      date: '15 Tháng 8, 2024',
    },
    {
      id: 6,
      title: 'Cách Bảo Quản Đồ Thể Thao Bền Đẹp',
      excerpt: 'Mẹo hay để giữ cho quần áo thể thao luôn như mới...',
      image:
        'https://images.unsplash.com/photo-1544966503-7cc4ac882d5d?w=300&h=200&fit=crop',
      category: 'Tips',
      date: '12 Tháng 8, 2024',
    },
    {
      id: 7,
      title: 'Lợi Ích Của Việc Mặc Đồ Compression',
      excerpt: 'Tại sao nhiều vận động viên chọn đồ compression...',
      image:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      category: 'Health',
      date: '10 Tháng 8, 2024',
    },
    {
      id: 8,
      title: 'Phối Đồ Thể Thao Cho Ngày Hè',
      excerpt: 'Gợi ý outfit thể thao năng động cho mùa hè...',
      image:
        'https://images.unsplash.com/photo-1506629905607-0fce96d86cbd?w=300&h=200&fit=crop',
      category: 'Style',
      date: '8 Tháng 8, 2024',
    },
  ];

  const categories = [
    { name: 'Tất cả', count: 24, active: true },
    { name: 'Gear Review', count: 8 },
    { name: 'Style Guide', count: 6 },
    { name: 'Fitness', count: 5 },
    { name: 'Trends', count: 3 },
    { name: 'Tips', count: 2 },
  ];

  return (
    <div className={cx('wrapper')}>
      {/* Hero Section */}
      <section className={cx('hero')}>
        <div className={cx('hero-content')}>
          <h1 className={cx('hero-title')}>
            SPORT<span className={cx('highlight')}>BLOG</span>
          </h1>
          <p className={cx('hero-subtitle')}>
            Khám phá thế giới thể thao qua những bài viết chuyên sâu và cập nhật
          </p>
          <div className={cx('hero-stats')}>
            <div className={cx('stat')}>
              <span className={cx('stat-number')}>50+</span>
              <span className={cx('stat-label')}>Bài viết</span>
            </div>
            <div className={cx('stat')}>
              <span className={cx('stat-number')}>10K+</span>
              <span className={cx('stat-label')}>Lượt đọc</span>
            </div>
            <div className={cx('stat')}>
              <span className={cx('stat-number')}>24/7</span>
              <span className={cx('stat-label')}>Cập nhật</span>
            </div>
          </div>
        </div>
        <div className={cx('hero-bg')}></div>
      </section>

      <div className={cx('container')}>
        {/* Categories Filter */}
        <section className={cx('categories-section')}>
          <div className={cx('categories')}>
            {categories.map((category, index) => (
              <button
                key={index}
                className={cx('category-btn', { active: category.active })}
              >
                {category.name}
                <span className={cx('count')}>({category.count})</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Posts */}
        <section className={cx('featured-section')}>
          <div className={cx('section-header')}>
            <h2 className={cx('section-title')}>Bài viết nổi bật</h2>
            <div className={cx('title-underline')}></div>
          </div>

          <div className={cx('featured-grid')}>
            {featuredPosts.map((post) => (
              <article key={post.id} className={cx('featured-card')}>
                <div className={cx('card-image')}>
                  <img src={post.image} alt={post.title} />
                  <div className={cx('category-badge')}>{post.category}</div>
                  <div className={cx('overlay')}></div>
                </div>
                <div className={cx('card-content')}>
                  <h3 className={cx('card-title')}>{post.title}</h3>
                  <p className={cx('card-excerpt')}>{post.excerpt}</p>
                  <div className={cx('card-meta')}>
                    <div className={cx('author-info')}>
                      <div className={cx('author-avatar')}></div>
                      <span className={cx('author-name')}>{post.author}</span>
                    </div>
                    <div className={cx('post-info')}>
                      <span className={cx('date')}>{post.date}</span>
                      <span className={cx('read-time')}>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Recent Posts */}
        <section className={cx('recent-section')}>
          <div className={cx('section-header')}>
            <h2 className={cx('section-title')}>Bài viết gần đây</h2>
            <div className={cx('title-underline')}></div>
          </div>

          <div className={cx('recent-grid')}>
            {recentPosts.map((post) => (
              <article key={post.id} className={cx('recent-card')}>
                <div className={cx('card-image')}>
                  <img src={post.image} alt={post.title} />
                  <div className={cx('category-badge')}>{post.category}</div>
                </div>
                <div className={cx('card-content')}>
                  <h3 className={cx('card-title')}>{post.title}</h3>
                  <p className={cx('card-excerpt')}>{post.excerpt}</p>
                  <div className={cx('card-meta')}>
                    <span className={cx('date')}>{post.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className={cx('newsletter-section')}>
          <div className={cx('newsletter-content')}>
            <h2 className={cx('newsletter-title')}>Đăng ký nhận tin tức</h2>
            <p className={cx('newsletter-subtitle')}>
              Nhận thông báo về những bài viết mới nhất và ưu đãi đặc biệt
            </p>
            <form className={cx('newsletter-form')}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className={cx('newsletter-input')}
              />
              <button type="submit" className={cx('newsletter-btn')}>
                Đăng ký
              </button>
            </form>
          </div>
        </section>

        {/* Load More */}
        <div className={cx('load-more-section')}>
          <button className={cx('load-more-btn')}>
            Xem thêm bài viết
            <span className={cx('btn-icon')}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Blogs;
