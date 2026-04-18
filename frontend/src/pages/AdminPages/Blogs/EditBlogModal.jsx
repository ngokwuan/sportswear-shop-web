import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Blogs.module.scss';

const cx = classNames.bind(styles);

function EditBlogModal({ blog, onClose, onBlogUpdated, categories }) {
  const [editingBlog, setEditingBlog] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (blog) {
      // ✅ Normalize category_ids từ mọi format có thể có
      let categoryIds = [];
      if (Array.isArray(blog.category_ids) && blog.category_ids.length > 0) {
        categoryIds = blog.category_ids.map((id) => parseInt(id));
      } else if (Array.isArray(blog.categories) && blog.categories.length > 0) {
        categoryIds = blog.categories.map((c) => parseInt(c.id));
      }

      setEditingBlog({
        id: blog.id,
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featured_image: blog.featured_image || '',
        category_ids: categoryIds,
        status: blog.status || 'draft',
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
      });
    }
  }, [blog]);

  const handleCategoryChange = (categoryId) => {
    const id = parseInt(categoryId);
    setEditingBlog((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();

    if (!editingBlog.title?.trim() || !editingBlog.content?.trim()) {
      toast.error('Vui lòng điền tiêu đề và nội dung bài viết');
      return;
    }

    if (!editingBlog.category_ids || editingBlog.category_ids.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 danh mục');
      return;
    }

    if (!editingBlog.id) {
      toast.error('Không tìm thấy ID bài viết');
      return;
    }

    try {
      setSubmitting(true);

      // const payload = {
      //   title: editingBlog.title,
      //   excerpt: editingBlog.excerpt,
      //   content: editingBlog.content,
      //   featured_image: editingBlog.featured_image,
      //   category_ids: editingBlog.category_ids,
      //   status: editingBlog.status,
      //   meta_title: editingBlog.meta_title,
      //   meta_description: editingBlog.meta_description,
      // };
      const payload = {
        title: editingBlog.title,
        excerpt: editingBlog.excerpt,
        content: editingBlog.content,
        featured_image: editingBlog.featured_image,
        category_ids: editingBlog.category_ids.map(Number), // ✅ đảm bảo integer
        status: editingBlog.status,
        meta_title: editingBlog.meta_title,
        meta_description: editingBlog.meta_description,
      };

      const response = await axios.patch(`/blogs/${editingBlog.id}`, payload);

      if (response.data.success) {
        toast.success('Cập nhật bài viết thành công!');
        onBlogUpdated(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      // ✅ axios interceptor đã toast lỗi rồi, không cần toast lại
    } finally {
      setSubmitting(false);
    }
  };

  if (!blog || !editingBlog) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal', 'blog-modal')}>
        <div className={cx('modal-header')}>
          <h3>Chỉnh sửa bài viết</h3>
          <button className={cx('close-btn')} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleUpdateBlog} className={cx('modal-form')}>
          {/* Tiêu đề + Trạng thái */}
          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>
                Tiêu đề <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={editingBlog.title}
                onChange={(e) =>
                  setEditingBlog({ ...editingBlog, title: e.target.value })
                }
                required
              />
            </div>
            <div className={cx('form-group')}>
              <label>Trạng thái</label>
              <select
                value={editingBlog.status}
                onChange={(e) =>
                  setEditingBlog({ ...editingBlog, status: e.target.value })
                }
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          </div>

          {/* Danh mục — checkbox multi-select */}
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
                      checked={editingBlog.category_ids.includes(
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
              value={editingBlog.excerpt}
              onChange={(e) =>
                setEditingBlog({ ...editingBlog, excerpt: e.target.value })
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
              value={editingBlog.content}
              onChange={(e) =>
                setEditingBlog({ ...editingBlog, content: e.target.value })
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
              value={editingBlog.featured_image}
              onChange={(e) =>
                setEditingBlog({
                  ...editingBlog,
                  featured_image: e.target.value,
                })
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
                value={editingBlog.meta_title}
                onChange={(e) =>
                  setEditingBlog({ ...editingBlog, meta_title: e.target.value })
                }
                placeholder="SEO title"
              />
            </div>
          </div>

          <div className={cx('form-group')}>
            <label>Meta Description</label>
            <textarea
              value={editingBlog.meta_description}
              onChange={(e) =>
                setEditingBlog({
                  ...editingBlog,
                  meta_description: e.target.value,
                })
              }
              rows="3"
              placeholder="SEO description"
            />
          </div>

          <div className={cx('modal-actions')}>
            <button
              type="button"
              className={cx('cancel-btn')}
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={cx('submit-btn')}
              disabled={submitting}
            >
              {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBlogModal;
