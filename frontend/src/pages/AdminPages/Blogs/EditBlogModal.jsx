import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Blogs.module.scss';

const cx = classNames.bind(styles);

function EditBlogModal({ blog, onClose, onBlogUpdated, categories }) {
  const [editingBlog, setEditingBlog] = useState({
    id: '',
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    if (blog) {
      setEditingBlog({
        id: blog.id,
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featured_image: blog.featured_image || '',
        category_id: blog.category_id || '',
        status: blog.status || 'draft',
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
      });
    }
  }, [blog]);

  const handleUpdateBlog = async (e) => {
    e.preventDefault();

    if (!editingBlog.title || !editingBlog.content) {
      toast.error('Vui lòng điền tiêu đề và nội dung bài viết');
      return;
    }

    try {
      const response = await axios.patch(
        `/blogs/${editingBlog.id}`,
        editingBlog
      );

      if (response.data.success) {
        toast.success('Cập nhật bài viết thành công!');
        onBlogUpdated(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Lỗi cập nhật bài viết');
    }
  };

  if (!blog) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal', 'blog-modal')}>
        <div className={cx('modal-header')}>
          <h3>Chỉnh sửa bài viết</h3>
          <button className={cx('close-btn')} onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleUpdateBlog} className={cx('modal-form')}>
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
              <label>Danh mục</label>
              <select
                value={editingBlog.category_id || ''}
                onChange={(e) =>
                  setEditingBlog({
                    ...editingBlog,
                    category_id: e.target.value,
                  })
                }
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={cx('form-group')}>
            <label>Tóm tắt</label>
            <textarea
              value={editingBlog.excerpt || ''}
              onChange={(e) =>
                setEditingBlog({ ...editingBlog, excerpt: e.target.value })
              }
              rows="3"
              placeholder="Nhập tóm tắt bài viết..."
            />
          </div>

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

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>Hình ảnh đại diện</label>
              <input
                type="url"
                value={editingBlog.featured_image || ''}
                onChange={(e) =>
                  setEditingBlog({
                    ...editingBlog,
                    featured_image: e.target.value,
                  })
                }
                placeholder="URL hình ảnh"
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

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>Meta Title</label>
              <input
                type="text"
                value={editingBlog.meta_title || ''}
                onChange={(e) =>
                  setEditingBlog({
                    ...editingBlog,
                    meta_title: e.target.value,
                  })
                }
                placeholder="SEO title"
              />
            </div>
          </div>

          <div className={cx('form-group')}>
            <label>Meta Description</label>
            <textarea
              value={editingBlog.meta_description || ''}
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
            >
              Hủy
            </button>
            <button type="submit" className={cx('submit-btn')}>
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBlogModal;
