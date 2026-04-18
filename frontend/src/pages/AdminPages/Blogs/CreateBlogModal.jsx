import classNames from 'classnames/bind';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Blogs.module.scss';

const cx = classNames.bind(styles);

const initialState = {
  title: '',
  excerpt: '',
  content: '',
  featured_image: '',
  category_ids: [],
  status: 'draft',
  meta_title: '',
  meta_description: '',
};

function CreateBlogModal({ showModal, onClose, onBlogCreated, categories }) {
  const [newBlog, setNewBlog] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const handleCategoryChange = (categoryId) => {
    const id = parseInt(categoryId);
    setNewBlog((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();

    if (!newBlog.title?.trim() || !newBlog.content?.trim()) {
      toast.error('Vui lòng điền tiêu đề và nội dung bài viết');
      return;
    }

    if (newBlog.category_ids.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 danh mục');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: newBlog.title,
        excerpt: newBlog.excerpt,
        content: newBlog.content,
        featured_image: newBlog.featured_image,
        category_ids: newBlog.category_ids.map(Number),
        status: newBlog.status,
        meta_title: newBlog.meta_title,
        meta_description: newBlog.meta_description,
      };

      const response = await axios.post('/blogs', payload);

      if (response.data.success) {
        toast.success('Thêm bài viết thành công!');
        setNewBlog(initialState);
        onBlogCreated(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      console.error('Response data:', error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewBlog(initialState);
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal', 'blog-modal')}>
        <div className={cx('modal-header')}>
          <h3>Thêm bài viết mới</h3>
          <button
            className={cx('close-btn')}
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleCreateBlog} className={cx('modal-form')}>
          {/* Tiêu đề + Trạng thái */}
          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>
                Tiêu đề <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={newBlog.title}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, title: e.target.value })
                }
                required
              />
            </div>
            <div className={cx('form-group')}>
              <label>Trạng thái</label>
              <select
                value={newBlog.status}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, status: e.target.value })
                }
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          </div>

          {/* Danh mục checkbox */}
          <div className={cx('form-group')}>
            <label>
              Danh mục <span style={{ color: 'red' }}>*</span>
            </label>
            {categories.length === 0 ? (
              <p style={{ color: '#999', fontSize: '13px' }}>
                Không có danh mục nào
              </p>
            ) : (
              <div className={cx('checkbox-group')}>
                {categories.map((category) => (
                  <label key={category.id} className={cx('checkbox-label')}>
                    <input
                      type="checkbox"
                      value={category.id}
                      checked={newBlog.category_ids.includes(
                        parseInt(category.id),
                      )}
                      onChange={() => handleCategoryChange(category.id)}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tóm tắt */}
          <div className={cx('form-group')}>
            <label>Tóm tắt</label>
            <textarea
              value={newBlog.excerpt}
              onChange={(e) =>
                setNewBlog({ ...newBlog, excerpt: e.target.value })
              }
              rows="3"
              placeholder="Nhập tóm tắt bài viết..."
            />
          </div>

          {/* Nội dung */}
          <div className={cx('form-group')}>
            <label>
              Nội dung <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={newBlog.content}
              onChange={(e) =>
                setNewBlog({ ...newBlog, content: e.target.value })
              }
              required
              rows="8"
              placeholder="Nhập nội dung bài viết..."
            />
          </div>

          {/* Hình ảnh */}
          <div className={cx('form-group')}>
            <label>Hình ảnh đại diện</label>
            <input
              type="url"
              value={newBlog.featured_image}
              onChange={(e) =>
                setNewBlog({ ...newBlog, featured_image: e.target.value })
              }
              placeholder="URL hình ảnh"
            />
          </div>

          {/* SEO */}
          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>Meta Title</label>
              <input
                type="text"
                value={newBlog.meta_title}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, meta_title: e.target.value })
                }
                placeholder="SEO title"
              />
            </div>
          </div>

          <div className={cx('form-group')}>
            <label>Meta Description</label>
            <textarea
              value={newBlog.meta_description}
              onChange={(e) =>
                setNewBlog({ ...newBlog, meta_description: e.target.value })
              }
              rows="3"
              placeholder="SEO description"
            />
          </div>

          <div className={cx('modal-actions')}>
            <button
              type="button"
              className={cx('cancel-btn')}
              onClick={handleClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={cx('submit-btn')}
              disabled={submitting}
            >
              {submitting ? 'Đang thêm...' : 'Thêm bài viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBlogModal;
