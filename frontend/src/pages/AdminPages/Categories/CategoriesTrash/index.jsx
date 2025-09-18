import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../../setup/axios';
import styles from './CategoriesTrash.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function CategoriesTrash() {
  const [trashedCategories, setTrashedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch trashed categories from API
  const fetchTrashedCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/categories/trash');
      setTrashedCategories(response.data);
    } catch (error) {
      console.error('Error fetching trashed categories:', error);
      toast.error('Không thể tải danh sách thùng rác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedCategories();
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

  // Handle single category selection
  const handleSelectCategory = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Handle select all categories
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(trashedCategories.map((category) => category.id));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll state when selectedCategories changes
  useEffect(() => {
    setSelectAll(
      selectedCategories.length === trashedCategories.length &&
        trashedCategories.length > 0
    );
  }, [selectedCategories, trashedCategories]);

  // Restore single category
  const handleRestoreCategory = async (categoryId) => {
    try {
      await axios.patch(`/categories/${categoryId}/restore`);
      toast.success('Khôi phục danh mục thành công!');
      // Remove restored category from trash list
      setTrashedCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    } catch (error) {
      console.error('Error restoring category:', error);
      toast.error('Không thể khôi phục danh mục');
    }
  };

  // Force delete single category
  const handleForceDeleteCategory = async (categoryId) => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn xóa vĩnh viễn danh mục này? Hành động này không thể hoàn tác!'
      )
    ) {
      try {
        await axios.delete(`/categories/${categoryId}/force`);
        toast.success('Xóa vĩnh viễn danh mục thành công!');
        // Remove deleted category from trash list
        setTrashedCategories((prev) =>
          prev.filter((category) => category.id !== categoryId)
        );
        setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
      } catch (error) {
        console.error('Error force deleting category:', error);
        toast.error('Không thể xóa vĩnh viễn danh mục');
      }
    }
  };

  // Restore multiple selected categories
  const handleRestoreSelected = async () => {
    if (selectedCategories.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một danh mục');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn khôi phục ${selectedCategories.length} danh mục đã chọn?`
      )
    ) {
      try {
        await Promise.all(
          selectedCategories.map((categoryId) =>
            axios.patch(`/categories/${categoryId}/restore`)
          )
        );
        toast.success(
          `Khôi phục ${selectedCategories.length} danh mục thành công!`
        );
        // Remove restored categories from trash list
        setTrashedCategories((prev) =>
          prev.filter((category) => !selectedCategories.includes(category.id))
        );
        setSelectedCategories([]);
      } catch (error) {
        console.error('Error restoring selected categories:', error);
        toast.error('Có lỗi xảy ra khi khôi phục danh mục');
      }
    }
  };

  // Force delete multiple selected categories
  const handleForceDeleteSelected = async () => {
    if (selectedCategories.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một danh mục');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedCategories.length} danh mục đã chọn? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await Promise.all(
          selectedCategories.map((categoryId) =>
            axios.delete(`/categories/${categoryId}/force`)
          )
        );
        toast.success(
          `Xóa vĩnh viễn ${selectedCategories.length} danh mục thành công!`
        );
        // Remove deleted categories from trash list
        setTrashedCategories((prev) =>
          prev.filter((category) => !selectedCategories.includes(category.id))
        );
        setSelectedCategories([]);
      } catch (error) {
        console.error('Error force deleting selected categories:', error);
        toast.error('Có lỗi xảy ra khi xóa vĩnh viễn danh mục');
      }
    }
  };

  // Empty entire trash
  const handleEmptyTrash = async () => {
    if (trashedCategories.length === 0) {
      toast.warning('Thùng rác đã trống');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn tất cả ${trashedCategories.length} danh mục trong thùng rác? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await Promise.all(
          trashedCategories.map((category) =>
            axios.delete(`/categories/${category.id}/force`)
          )
        );
        toast.success('Đã dọn sạch thùng rác!');
        setTrashedCategories([]);
        setSelectedCategories([]);
      } catch (error) {
        console.error('Error emptying trash:', error);
        toast.error('Có lỗi xảy ra khi dọn thùng rác');
      }
    }
  };

  if (loading) {
    return (
      <div className={cx('categories-trash')}>
        <div className={cx('loading')}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={cx('categories-trash')}>
      <div className={cx('content-grid')}>
        <div className={cx('content-card', 'trash-card')}>
          <div className={cx('card-header')}>
            <div className={cx('header-left')}>
              <h2 className={cx('card-title')}>
                <Link to="/admin/categories" className={cx('back')}>
                  {'<'}
                </Link>
                Thùng rác danh mục
                <span className={cx('count')}>
                  ({trashedCategories.length})
                </span>
              </h2>
              <p className={cx('subtitle')}>
                Quản lý các danh mục đã bị xóa mềm
              </p>
            </div>

            {trashedCategories.length > 0 && (
              <div className={cx('header-actions')}>
                <button
                  className={cx('action-btn', 'empty-trash-btn')}
                  onClick={handleEmptyTrash}
                  title="Dọn sạch thùng rác"
                >
                  🧹 Dọn sạch thùng rác
                </button>
              </div>
            )}
          </div>

          {trashedCategories.length === 0 ? (
            <div className={cx('empty-trash')}>
              <div className={cx('empty-icon')}>🗑️</div>
              <h3>Thùng rác trống</h3>
              <p>Không có danh mục nào trong thùng rác</p>
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
                    Chọn tất cả ({selectedCategories.length}/
                    {trashedCategories.length})
                  </label>
                </div>

                {selectedCategories.length > 0 && (
                  <div className={cx('selected-actions')}>
                    <button
                      className={cx('bulk-btn', 'restore-btn')}
                      onClick={handleRestoreSelected}
                    >
                      🔄 Khôi phục ({selectedCategories.length})
                    </button>
                    <button
                      className={cx('bulk-btn', 'delete-btn')}
                      onClick={handleForceDeleteSelected}
                    >
                      ❌ Xóa vĩnh viễn ({selectedCategories.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Categories Table */}
              <div className={cx('categories-table')}>
                <div className={cx('table-header')}>
                  <span className={cx('select-col')}></span>
                  <span>ID</span>
                  <span>Tên danh mục</span>
                  <span>Slug</span>
                  <span>Mô tả</span>
                  <span>Ngày xóa</span>
                  <span>Thao tác</span>
                </div>

                {trashedCategories.map((category) => (
                  <div
                    key={category.id}
                    className={cx('table-row', {
                      selected: selectedCategories.includes(category.id),
                    })}
                  >
                    <div className={cx('select-col')}>
                      <label className={cx('checkbox-wrapper')}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleSelectCategory(category.id)}
                        />
                        <span className={cx('checkmark')}></span>
                      </label>
                    </div>

                    <span className={cx('category-id')}>#{category.id}</span>
                    <span className={cx('category-name')}>{category.name}</span>
                    <span className={cx('category-slug')}>{category.slug}</span>
                    <span className={cx('category-description')}>
                      {category.description.length > 50
                        ? `${category.description.substring(0, 50)}...`
                        : category.description}
                    </span>
                    <span className={cx('category-deleted')}>
                      {formatDate(category.deleted_at)}
                    </span>

                    <div className={cx('category-actions')}>
                      <button
                        className={cx('action-btn', 'restore-btn')}
                        onClick={() => handleRestoreCategory(category.id)}
                        title="Khôi phục danh mục"
                      >
                        🔄
                      </button>
                      <button
                        className={cx('action-btn', 'force-delete-btn')}
                        onClick={() => handleForceDeleteCategory(category.id)}
                        title="Xóa vĩnh viễn"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoriesTrash;
