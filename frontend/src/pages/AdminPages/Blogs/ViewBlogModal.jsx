import classNames from 'classnames/bind';
import styles from './Blogs.module.scss';

const cx = classNames.bind(styles);

function ViewBlogModal({ blog, onClose, onEdit }) {
  if (!blog) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'status-draft',
      published: 'status-published',
      archived: 'status-archived',
    };

    const statusLabels = {
      draft: 'Bản nháp',
      published: 'Đã xuất bản',
      archived: 'Lưu trữ',
    };

    return (
      <span className={cx('status-badge', statusClasses[status])}>
        {statusLabels[status]}
      </span>
    );
  };

  const handleEdit = () => {
    onClose();
    onEdit(blog);
  };

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal', 'view-modal')}>
        <div className={cx('modal-header')}>
          <h3>Chi tiết bài viết</h3>
          <button className={cx('close-btn')} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={cx('view-content')}>
          <div className={cx('view-section')}>
            <h4>Thông tin cơ bản</h4>
            <div className={cx('info-grid')}>
              <div className={cx('info-item')}>
                <label>Tiêu đề:</label>
                <span>{blog.title}</span>
              </div>
              <div className={cx('info-item')}>
                <label>Slug:</label>
                <span>{blog.slug}</span>
              </div>
              <div className={cx('info-item')}>
                <label>Tác giả:</label>
                <span>{blog.author?.name}</span>
              </div>
              <div className={cx('info-item')}>
                <label>Danh mục:</label>
                <span>{blog.category?.name || 'Chưa phân loại'}</span>
              </div>
              <div className={cx('info-item')}>
                <label>Trạng thái:</label>
                {getStatusBadge(blog.status)}
              </div>
              <div className={cx('info-item')}>
                <label>Lượt xem:</label>
                <span>{blog.views}</span>
              </div>
              <div className={cx('info-item')}>
                <label>Ngày tạo:</label>
                <span>{formatDate(blog.created_at)}</span>
              </div>
            </div>
          </div>

          {blog.featured_image && (
            <div className={cx('view-section')}>
              <h4>Hình ảnh đại diện</h4>
              <img
                src={blog.featured_image}
                alt={blog.title}
                className={cx('featured-image')}
              />
            </div>
          )}

          {blog.excerpt && (
            <div className={cx('view-section')}>
              <h4>Tóm tắt</h4>
              <p className={cx('excerpt-text')}>{blog.excerpt}</p>
            </div>
          )}

          <div className={cx('view-section')}>
            <h4>Nội dung</h4>
            <div
              className={cx('content-preview')}
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {(blog.meta_title || blog.meta_description) && (
            <div className={cx('view-section')}>
              <h4>SEO Meta</h4>
              <div className={cx('info-grid')}>
                {blog.meta_title && (
                  <div className={cx('info-item')}>
                    <label>Meta Title:</label>
                    <span>{blog.meta_title}</span>
                  </div>
                )}
                {blog.meta_description && (
                  <div className={cx('info-item')}>
                    <label>Meta Description:</label>
                    <span>{blog.meta_description}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={cx('modal-actions')}>
          <button className={cx('cancel-btn')} onClick={onClose}>
            Đóng
          </button>
          <button className={cx('submit-btn')} onClick={handleEdit}>
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewBlogModal;
