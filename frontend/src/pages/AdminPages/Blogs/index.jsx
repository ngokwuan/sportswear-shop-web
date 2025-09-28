import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Blogs.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBlog, setViewingBlog] = useState(null);
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
  const [filters, setFilters] = useState({
    status: '',
    category_id: '',
    search: '',

    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'draft', label: 'Bản nháp' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'archived', label: 'Lưu trữ' },
  ];

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/blogs?${params.toString()}`);

      if (response.data.success) {
        setBlogs(response.data.data.blogs);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

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
        setBlogs((prevBlogs) => [response.data.data, ...prevBlogs]);
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
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Lỗi tạo bài viết');
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog({
      ...blog,
    });
    setShowEditModal(true);
  };

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
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog.id === editingBlog.id ? response.data.data : blog
          )
        );

        toast.success('Cập nhật bài viết thành công!');
        setShowEditModal(false);
        setEditingBlog(null);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Lỗi cập nhật bài viết');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (
      window.confirm('Bạn có chắc chắn muốn chuyển bài viết này vào thùng rác?')
    ) {
      try {
        await axios.delete(`/blogs/${blogId}`);

        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogId));
        toast.success('Đã chuyển bài viết vào thùng rác!');
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Lỗi xóa bài viết');
      }
    }
  };

  const handleViewBlog = async (blogId) => {
    try {
      const response = await axios.get(`/blogs/${blogId}`);
      if (response.data.success) {
        setViewingBlog(response.data.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
      toast.error('Không thể tải chi tiết bài viết');
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className={cx('content-card')}>
        <div className={cx('loading')}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={cx('content-card', 'blogs-card')}>
      <div className={cx('card-header')}>
        <div className={cx('header-left')}>
          <h2 className={cx('card-title')}>Quản lý bài viết</h2>
          <p className={cx('subtitle')}>
            Quản lý tất cả bài viết blog trong hệ thống
          </p>
        </div>

        <div className={cx('header-actions')}>
          <Link
            to="/admin/blogs/trash"
            className={cx('trash-link')}
            title="Xem thùng rác"
          >
            <FontAwesomeIcon icon={faTrash} />
            Thùng rác
          </Link>
          <button
            className={cx('create-btn')}
            onClick={() => setShowCreateModal(true)}
          >
            + Thêm bài viết
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={cx('filters-section')}>
        <form onSubmit={handleSearch} className={cx('filters-form')}>
          <div className={cx('form-group')}>
            <label>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tiêu đề, nội dung..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className={cx('form-group')}>
            <label>Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={cx('form-group')}>
            <label>Danh mục</label>
            <select
              value={filters.category_id}
              onChange={(e) =>
                handleFilterChange('category_id', e.target.value)
              }
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={cx('form-group')}>
            <button type="submit" className={cx('search-btn')}>
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Blogs Table */}
      <div className={cx('blogs-table')}>
        <div className={cx('table-header')}>
          <span>Tiêu đề</span>
          <span>Tác giả</span>
          <span>Danh mục</span>
          <span>Trạng thái</span>

          <span>Ngày tạo</span>
          <span>Thao tác</span>
        </div>

        {blogs.length === 0 ? (
          <div className={cx('no-data')}>
            <p>Không có bài viết nào</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div key={blog.id} className={cx('table-row')}>
              <div className={cx('blog-title')}>
                <h4>{blog.title}</h4>
              </div>
              <span className={cx('blog-author')}>
                {blog.author?.name || 'N/A'}
              </span>
              <span className={cx('blog-category')}>
                {blog.category?.name || 'Chưa phân loại'}
              </span>
              <div className={cx('status-col')}>
                {getStatusBadge(blog.status)}
              </div>

              <span className={cx('created-date')}>
                {formatDate(blog.created_at)}
              </span>
              <div className={cx('blog-actions')}>
                <button
                  className={cx('action-btn', 'view-btn')}
                  onClick={() => handleViewBlog(blog.id)}
                  title="Xem chi tiết"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  className={cx('action-btn', 'edit-btn')}
                  onClick={() => handleEditBlog(blog)}
                  title="Chỉnh sửa"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className={cx('action-btn', 'delete-btn')}
                  onClick={() => handleDeleteBlog(blog.id)}
                  title="Chuyển vào thùng rác"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={cx('pagination')}>
          <button
            className={cx('page-btn')}
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            « Trước
          </button>

          <span className={cx('page-info')}>
            Trang {pagination.page} / {pagination.totalPages}
          </span>

          <button
            className={cx('page-btn')}
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Sau »
          </button>
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateModal && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal', 'blog-modal')}>
            <div className={cx('modal-header')}>
              <h3>Thêm bài viết mới</h3>
              <button
                className={cx('close-btn')}
                onClick={() => setShowCreateModal(false)}
              >
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
                  onClick={() => setShowCreateModal(false)}
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
      )}

      {/* Edit Blog Modal */}
      {showEditModal && editingBlog && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal', 'blog-modal')}>
            <div className={cx('modal-header')}>
              <h3>Chỉnh sửa bài viết</h3>
              <button
                className={cx('close-btn')}
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBlog(null);
                }}
              >
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
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBlog(null);
                  }}
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
      )}

      {/* View Blog Modal */}
      {showViewModal && viewingBlog && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal', 'view-modal')}>
            <div className={cx('modal-header')}>
              <h3>Chi tiết bài viết</h3>
              <button
                className={cx('close-btn')}
                onClick={() => {
                  setShowViewModal(false);
                  setViewingBlog(null);
                }}
              >
                ×
              </button>
            </div>

            <div className={cx('view-content')}>
              <div className={cx('view-section')}>
                <h4>Thông tin cơ bản</h4>
                <div className={cx('info-grid')}>
                  <div className={cx('info-item')}>
                    <label>Tiêu đề:</label>
                    <span>{viewingBlog.title}</span>
                  </div>
                  <div className={cx('info-item')}>
                    <label>Slug:</label>
                    <span>{viewingBlog.slug}</span>
                  </div>
                  <div className={cx('info-item')}>
                    <label>Tác giả:</label>
                    <span>{viewingBlog.author?.name}</span>
                  </div>
                  <div className={cx('info-item')}>
                    <label>Danh mục:</label>
                    <span>
                      {viewingBlog.category?.name || 'Chưa phân loại'}
                    </span>
                  </div>
                  <div className={cx('info-item')}>
                    <label>Trạng thái:</label>
                    {getStatusBadge(viewingBlog.status)}
                  </div>
                  <div className={cx('info-item')}>
                    <label>Lượt xem:</label>
                    <span>{viewingBlog.views}</span>
                  </div>

                  <div className={cx('info-item')}>
                    <label>Ngày tạo:</label>
                    <span>{formatDate(viewingBlog.created_at)}</span>
                  </div>
                </div>
              </div>

              {viewingBlog.featured_image && (
                <div className={cx('view-section')}>
                  <h4>Hình ảnh đại diện</h4>
                  <img
                    src={viewingBlog.featured_image}
                    alt={viewingBlog.title}
                    className={cx('featured-image')}
                  />
                </div>
              )}

              {viewingBlog.excerpt && (
                <div className={cx('view-section')}>
                  <h4>Tóm tắt</h4>
                  <p className={cx('excerpt-text')}>{viewingBlog.excerpt}</p>
                </div>
              )}

              <div className={cx('view-section')}>
                <h4>Nội dung</h4>
                <div
                  className={cx('content-preview')}
                  dangerouslySetInnerHTML={{ __html: viewingBlog.content }}
                />
              </div>

              {(viewingBlog.meta_title || viewingBlog.meta_description) && (
                <div className={cx('view-section')}>
                  <h4>SEO Meta</h4>
                  <div className={cx('info-grid')}>
                    {viewingBlog.meta_title && (
                      <div className={cx('info-item')}>
                        <label>Meta Title:</label>
                        <span>{viewingBlog.meta_title}</span>
                      </div>
                    )}
                    {viewingBlog.meta_description && (
                      <div className={cx('info-item')}>
                        <label>Meta Description:</label>
                        <span>{viewingBlog.meta_description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={cx('modal-actions')}>
              <button
                className={cx('cancel-btn')}
                onClick={() => {
                  setShowViewModal(false);
                  setViewingBlog(null);
                }}
              >
                Đóng
              </button>
              <button
                className={cx('submit-btn')}
                onClick={() => {
                  setShowViewModal(false);
                  setViewingBlog(null);
                  handleEditBlog(viewingBlog);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Blogs;
