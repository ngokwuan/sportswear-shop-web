import classNames from 'classnames/bind';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Blogs.module.scss';

const cx = classNames.bind(styles);

function CreateBlogModal({ showModal, onClose, onBlogCreated, categories }) {
  const [newBlog, setNewBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
  });

  const handleCreateBlog = async (e) => {
    e.preventDefault();

    if (!newBlog.title || !newBlog.content) {
      toast.error('Vui lòng điền tiêu đề và nội dung bài viết');
      return;
    }

    try {
      const userId = 1;

      const blogData = {
        ...newBlog,
        author_id: userId,
      };

      const response = await axios.post('/blogs', blogData);

      if (response.data.success) {
        toast.success('Thêm bài viết thành công!');
        setNewBlog({
          title: '',
          excerpt: '',
          content: '',
          featured_image: '',
          category_id: '',
          status: 'draft',
          meta_title: '',
          meta_description: '',
        });
        onBlogCreated(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Lỗi tạo bài viết');
    }
  };

  const handleClose = () => {
    setNewBlog({
      title: '',
      excerpt: '',
      content: '',
      featured_image: '',
      category_id: '',
      status: 'draft',
      meta_title: '',
      meta_description: '',
    });
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal', 'blog-modal')}>
        <div className={cx('modal-header')}>
          <h3>Thêm bài viết mới</h3>
          <button className={cx('close-btn')} onClick={handleClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleCreateBlog} className={cx('modal-form')}>
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
              <label>Danh mục</label>
              <select
                value={newBlog.category_id}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, category_id: e.target.value })
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
              value={newBlog.excerpt}
              onChange={(e) =>
                setNewBlog({ ...newBlog, excerpt: e.target.value })
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
              value={newBlog.content}
              onChange={(e) =>
                setNewBlog({ ...newBlog, content: e.target.value })
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
                value={newBlog.featured_image}
                onChange={(e) =>
                  setNewBlog({ ...newBlog, featured_image: e.target.value })
                }
                placeholder="URL hình ảnh"
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
            >
              Hủy
            </button>
            <button type="submit" className={cx('submit-btn')}>
              Thêm bài viết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBlogModal;
