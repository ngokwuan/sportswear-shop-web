import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Categories.module.scss';

const cx = classNames.bind(styles);

function EditCategoryModal({ category, onClose, onCategoryUpdated }) {
  const [editingCategory, setEditingCategory] = useState({
    id: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    if (category) {
      setEditingCategory({
        id: category.id,
        name: category.name || '',
        description: category.description || '',
      });
    }
  }, [category]);

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
        toast.success('Cập nhật danh mục thành công!');
        onCategoryUpdated(response.data.category);
        onClose();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Không thể cập nhật danh mục');
    }
  };

  if (!category) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal')}>
        <div className={cx('modal-header')}>
          <h3>Chỉnh sửa danh mục</h3>
          <button className={cx('close-btn')} onClick={onClose}>
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

export default EditCategoryModal;
