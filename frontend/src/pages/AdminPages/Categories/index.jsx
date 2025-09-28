import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Categories.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.name || !newCategory.description) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const response = await axios.post('/categories', newCategory);

      if (response.data.newCategories) {
        setCategories((prevCategories) => [
          ...prevCategories,
          response.data.newCategories,
        ]);
        toast.success('Thêm danh mục thành công!');

        setNewCategory({ name: '', description: '' });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory({
      ...category,
      name: category.name || '',
      description: category.description || '',
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!editingCategory.name || !editingCategory.description) {
      toast.error('Tên và mô tả danh mục không được để trống');
      return;
    }

    try {
      const updateData = {
        name: editingCategory.name,
        description: editingCategory.description,
      };

      const response = await axios.patch(
        `/categories/${editingCategory.id}`,
        updateData
      );

      if (response.data.category) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.id === editingCategory.id
              ? response.data.category
              : category
          )
        );

        toast.success('Cập nhật danh mục thành công!');
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      window.confirm('Bạn có chắc chắn muốn xóa danh mục này vào thùng rác?')
    ) {
      try {
        await axios.delete(`/categories/${categoryId}`);

        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== categoryId)
        );
        toast.success('Đã chuyển danh mục vào thùng rác!');
      } catch (error) {
        console.error('Error deleting category:', error);
      }
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
    <div className={cx('content-card', 'categories-card')}>
      <div className={cx('card-header')}>
        <div className={cx('header-left')}>
          <h2 className={cx('card-title')}>Danh sách danh mục</h2>
          <p className={cx('subtitle')}>
            Quản lý danh mục sản phẩm trong hệ thống
          </p>
        </div>

        <div className={cx('header-actions')}>
          <Link
            to="/admin/categories/trash"
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
            + Thêm danh mục
          </button>
        </div>
      </div>

      <div className={cx('categories-table')}>
        <div className={cx('table-header')}>
          <span>ID</span>
          <span>Tên danh mục</span>
          <span>Slug</span>
          <span>Mô tả</span>
          <span>Ngày tạo</span>
          <span>Thao tác</span>
        </div>

        {categories.length === 0 ? (
          <div className={cx('no-data')}>
            <p>Không có danh mục nào</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className={cx('table-row')}>
              <span className={cx('category-id')}>#{category.id}</span>
              <span className={cx('category-name')}>{category.name}</span>
              <span className={cx('category-slug')}>{category.slug}</span>
              <span className={cx('category-description')}>
                {category.description.length > 50
                  ? `${category.description.substring(0, 50)}...`
                  : category.description}
              </span>
              <span className={cx('category-created')}>
                {formatDate(category.created_at)}
              </span>
              <div className={cx('category-actions')}>
                <button
                  className={cx('action-btn', 'edit-btn')}
                  onClick={() => handleEditCategory(category)}
                  title="Chỉnh sửa"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className={cx('action-btn', 'delete-btn')}
                  onClick={() => handleDeleteCategory(category.id)}
                  title="Chuyển vào thùng rác"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal')}>
            <div className={cx('modal-header')}>
              <h3>Thêm danh mục mới</h3>
              <button
                className={cx('close-btn')}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className={cx('modal-form')}>
              <div className={cx('form-group')}>
                <label>
                  Tên danh mục <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className={cx('form-group')}>
                <label>
                  Mô tả <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  required
                  rows="4"
                  placeholder="Nhập mô tả cho danh mục..."
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
                  Thêm danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal')}>
            <div className={cx('modal-header')}>
              <h3>Chỉnh sửa danh mục</h3>
              <button
                className={cx('close-btn')}
                onClick={() => setEditingCategory(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className={cx('modal-form')}>
              <div className={cx('form-group')}>
                <label>
                  Tên danh mục <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className={cx('form-group')}>
                <label>
                  Mô tả <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  required
                  rows="4"
                  placeholder="Nhập mô tả cho danh mục..."
                />
              </div>
              <div className={cx('modal-actions')}>
                <button
                  type="button"
                  className={cx('cancel-btn')}
                  onClick={() => setEditingCategory(null)}
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
    </div>
  );
}

export default Categories;
