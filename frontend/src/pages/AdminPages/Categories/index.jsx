import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Categories.module.scss';
import Pagination from '../../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import CreateCategoryModal from './CreateCategoryModal.jsx';
import EditCategoryModal from './EditCategoryModal.jsx';

const cx = classNames.bind(styles);

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleCategoryCreated = (newCategory) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);

    // Navigate to last page
    const newTotalPages = Math.ceil((categories.length + 1) / itemsPerPage);
    setCurrentPage(newTotalPages);
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
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

        // Adjust page if current page is empty after deletion
        const newTotalItems = categories.length - 1;
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Không thể xóa danh mục');
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
            Quản lý danh mục sản phẩm trong hệ thống ({categories.length} danh
            mục)
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
          currentCategories.map((category) => (
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
                  onClick={() => setEditingCategory(category)}
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

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={categories.length}
        onPageChange={setCurrentPage}
        itemName="danh mục"
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </div>
  );
}

export default Categories;
