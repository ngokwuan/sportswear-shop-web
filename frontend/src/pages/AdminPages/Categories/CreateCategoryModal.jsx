import classNames from 'classnames/bind';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Categories.module.scss';

const cx = classNames.bind(styles);

function CreateCategoryModal({ showModal, onClose, onCategoryCreated }) {
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.name || !newCategory.description) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const response = await axios.post('/categories', newCategory);

      if (response.data.newCategories) {
        toast.success('Thêm danh mục thành công!');
        setNewCategory({ name: '', description: '' });
        onCategoryCreated(response.data.newCategories);
        onClose();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Không thể thêm danh mục');
    }
  };

  const handleClose = () => {
    setNewCategory({ name: '', description: '' });
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal')}>
        <div className={cx('modal-header')}>
          <h3>Thêm danh mục mới</h3>
          <button className={cx('close-btn')} onClick={handleClose}>
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
              onClick={handleClose}
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
  );
}

export default CreateCategoryModal;
