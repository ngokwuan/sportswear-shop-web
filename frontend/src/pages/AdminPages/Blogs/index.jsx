import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Blogs.module.scss';
import Pagination from '../../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import CreateBlogModal from './CreateBlogModal';
import EditBlogModal from './EditBlogModal';
import ViewBlogModal from './ViewBlogModal';

const cx = classNames.bind(styles);

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [viewingBlog, setViewingBlog] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    category_id: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(blogs.length / itemsPerPage);

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

  const handleBlogCreated = (newBlog) => {
    setBlogs((prevBlogs) => [newBlog, ...prevBlogs]);
  };

  const handleBlogUpdated = (updatedBlog) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))
    );
  };

  const handleDeleteBlog = async (blogId) => {
    if (
      window.confirm('Bạn có chắc chắn muốn chuyển bài viết này vào thùng rác?')
    ) {
      try {
        await axios.delete(`/blogs/${blogId}`);

        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogId));
        toast.success('Đã chuyển bài viết vào thùng rác!');

        // Adjust page if current page is empty after deletion
        const newTotalItems = blogs.length - 1;
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
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
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
      toast.error('Không thể tải chi tiết bài viết');
    }
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
          currentBlogs.map((blog) => (
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
                  onClick={() => setEditingBlog(blog)}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={blogs.length}
        onPageChange={setCurrentPage}
        itemName="bài viết"
      />

      {/* Create Blog Modal */}
      <CreateBlogModal
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBlogCreated={handleBlogCreated}
        categories={categories}
      />

      {/* Edit Blog Modal */}
      <EditBlogModal
        blog={editingBlog}
        onClose={() => setEditingBlog(null)}
        onBlogUpdated={handleBlogUpdated}
        categories={categories}
      />

      {/* View Blog Modal */}
      <ViewBlogModal
        blog={viewingBlog}
        onClose={() => setViewingBlog(null)}
        onEdit={setEditingBlog}
      />
    </div>
  );
}

export default Blogs;
