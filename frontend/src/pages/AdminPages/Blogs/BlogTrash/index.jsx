import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../../setup/axios';
import styles from './BlogsTrash.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBroom,
  faTrashCan,
  faTrashRestore,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function BlogsTrash() {
  const [trashedBlogs, setTrashedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});

  const fetchTrashedBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/blogs/trash?${params.toString()}`);

      if (response.data.success) {
        setTrashedBlogs(response.data.data.blogs);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching trashed blogs:', error);
      toast.error('Không thể tải danh sách bài viết đã xóa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedBlogs();
  }, [filters]);

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

  const handleSelectBlog = (blogId) => {
    setSelectedBlogs((prev) => {
      if (prev.includes(blogId)) {
        return prev.filter((id) => id !== blogId);
      } else {
        return [...prev, blogId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(trashedBlogs.map((blog) => blog.id));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    setSelectAll(
      selectedBlogs.length === trashedBlogs.length && trashedBlogs.length > 0
    );
  }, [selectedBlogs, trashedBlogs]);

  const handleRestoreBlog = async (blogId) => {
    try {
      const response = await axios.post(`/blogs/${blogId}/restore`);

      if (response.data.success) {
        setTrashedBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog.id !== blogId)
        );
        setSelectedBlogs((prev) => prev.filter((id) => id !== blogId));
        toast.success('Khôi phục bài viết thành công!');
      }
    } catch (error) {
      console.error('Error restoring blog:', error);
      toast.error('Lỗi khôi phục bài viết');
    }
  };

  const handleForceDeleteBlog = async (blogId) => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này không thể hoàn tác!'
      )
    ) {
      try {
        const response = await axios.delete(`/blogs/${blogId}/force`);

        if (response.data.success) {
          setTrashedBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog.id !== blogId)
          );
          setSelectedBlogs((prev) => prev.filter((id) => id !== blogId));
          toast.success('Xóa vĩnh viễn bài viết thành công!');
        }
      } catch (error) {
        console.error('Error force deleting blog:', error);
        toast.error('Lỗi xóa vĩnh viễn bài viết');
      }
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedBlogs.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài viết');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn khôi phục ${selectedBlogs.length} bài viết đã chọn?`
      )
    ) {
      try {
        await Promise.all(
          selectedBlogs.map((blogId) => axios.post(`/blogs/${blogId}/restore`))
        );
        toast.success(`Khôi phục ${selectedBlogs.length} bài viết thành công!`);
        setTrashedBlogs((prev) =>
          prev.filter((blog) => !selectedBlogs.includes(blog.id))
        );
        setSelectedBlogs([]);
      } catch (error) {
        console.error('Error restoring selected blogs:', error);
        toast.error('Có lỗi xảy ra khi khôi phục bài viết');
      }
    }
  };

  const handleForceDeleteSelected = async () => {
    if (selectedBlogs.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bài viết');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedBlogs.length} bài viết đã chọn? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await Promise.all(
          selectedBlogs.map((blogId) => axios.delete(`/blogs/${blogId}/force`))
        );
        toast.success(
          `Xóa vĩnh viễn ${selectedBlogs.length} bài viết thành công!`
        );
        setTrashedBlogs((prev) =>
          prev.filter((blog) => !selectedBlogs.includes(blog.id))
        );
        setSelectedBlogs([]);
      } catch (error) {
        console.error('Error force deleting selected blogs:', error);
        toast.error('Có lỗi xảy ra khi xóa vĩnh viễn bài viết');
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (trashedBlogs.length === 0) {
      toast.warning('Thùng rác đã trống');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn tất cả ${trashedBlogs.length} bài viết trong thùng rác? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await Promise.all(
          trashedBlogs.map((blog) => axios.delete(`/blogs/${blog.id}/force`))
        );
        toast.success('Đã dọn sạch thùng rác!');
        setTrashedBlogs([]);
        setSelectedBlogs([]);
      } catch (error) {
        console.error('Error emptying trash:', error);
        toast.error('Có lỗi xảy ra khi dọn thùng rác');
      }
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
    <div className={cx('content-card', 'trash-card')}>
      <div className={cx('card-header')}>
        <div className={cx('header-left')}>
          <h2 className={cx('card-title')}>
            <Link to="/admin/blogs" className={cx('back')}>
              {'<'}
            </Link>
            Thùng rác bài viết
            <span className={cx('count')}>({trashedBlogs.length})</span>
          </h2>
          <p className={cx('subtitle')}>Quản lý các bài viết đã bị xóa mềm</p>
        </div>

        {trashedBlogs.length > 0 && (
          <div className={cx('header-actions')}>
            <button
              className={cx('action-btn', 'empty-trash-btn')}
              onClick={handleEmptyTrash}
              title="Dọn sạch thùng rác"
            >
              <FontAwesomeIcon icon={faBroom} />
              Dọn sạch thùng rác
            </button>
          </div>
        )}
      </div>

      {trashedBlogs.length === 0 ? (
        <div className={cx('empty-trash')}>
          <div className={cx('empty-icon')}>
            <FontAwesomeIcon icon={faTrashCan} />
          </div>
          <h3>Thùng rác trống</h3>
          <p>Không có bài viết nào trong thùng rác</p>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          <div className={cx('bulk-actions')}>
            <div className={cx('select-info')}>
              <label className={cx('checkbox-wrapper')}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <span className={cx('checkmark')}></span>
                Chọn tất cả ({selectedBlogs.length}/{trashedBlogs.length})
              </label>
            </div>

            {selectedBlogs.length > 0 && (
              <div className={cx('selected-actions')}>
                <button
                  className={cx('bulk-btn', 'restore-btn')}
                  onClick={handleRestoreSelected}
                >
                  <FontAwesomeIcon icon={faTrashRestore} /> Khôi phục (
                  {selectedBlogs.length})
                </button>
                <button
                  className={cx('bulk-btn', 'delete-btn')}
                  onClick={handleForceDeleteSelected}
                >
                  <FontAwesomeIcon icon={faXmark} /> Xóa vĩnh viễn (
                  {selectedBlogs.length})
                </button>
              </div>
            )}
          </div>

          {/* Blogs Table */}
          <div className={cx('blogs-table')}>
            <div className={cx('table-header')}>
              <span className={cx('select-col')}></span>
              <span>ID</span>
              <span>Tiêu đề</span>
              <span>Tác giả</span>
              <span>Danh mục</span>
              <span>Trạng thái</span>
              <span>Ngày xóa</span>
              <span>Thao tác</span>
            </div>

            {trashedBlogs.map((blog) => (
              <div
                key={blog.id}
                className={cx('table-row', {
                  selected: selectedBlogs.includes(blog.id),
                })}
              >
                <div className={cx('select-col')}>
                  <label className={cx('checkbox-wrapper')}>
                    <input
                      type="checkbox"
                      checked={selectedBlogs.includes(blog.id)}
                      onChange={() => handleSelectBlog(blog.id)}
                    />
                    <span className={cx('checkmark')}></span>
                  </label>
                </div>

                <span className={cx('blog-id')}>#{blog.id}</span>

                <div className={cx('blog-title')}>
                  <h4>{blog.title}</h4>
                  {blog.is_featured && (
                    <span className={cx('featured-badge')}>Nổi bật</span>
                  )}
                </div>

                <span className={cx('blog-author')}>
                  {blog.author?.name || 'N/A'}
                </span>

                <span className={cx('blog-category')}>
                  {blog.category?.name || 'Chưa phân loại'}
                </span>

                <div className={cx('blog-status')}>
                  {getStatusBadge(blog.status)}
                </div>

                <span className={cx('blog-deleted')}>
                  {formatDate(blog.deleted_at)}
                </span>

                <div className={cx('blog-actions')}>
                  <button
                    className={cx('action-btn', 'restore-btn')}
                    onClick={() => handleRestoreBlog(blog.id)}
                    title="Khôi phục bài viết"
                  >
                    <FontAwesomeIcon icon={faTrashRestore} />
                  </button>
                  <button
                    className={cx('action-btn', 'force-delete-btn')}
                    onClick={() => handleForceDeleteBlog(blog.id)}
                    title="Xóa vĩnh viễn"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>
            ))}
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
        </>
      )}
    </div>
  );
}

export default BlogsTrash;
