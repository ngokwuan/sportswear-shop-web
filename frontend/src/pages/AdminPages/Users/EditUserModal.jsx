import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Users.module.scss';

const cx = classNames.bind(styles);

function EditUserModal({ user, onClose, onUserUpdated }) {
  const [editingUser, setEditingUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
  });

  useEffect(() => {
    if (user) {
      setEditingUser({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'customer',
      });
    }
  }, [user]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editingUser.name) {
      toast.error('Tên người dùng không được để trống');
      return;
    }

    try {
      const updateData = {
        name: editingUser.name,
        phone: editingUser.phone,
        address: editingUser.address,
        role: editingUser.role,
      };

      const response = await axios.patch(
        `/users/${editingUser.id}`,
        updateData
      );

      if (response.data.user) {
        toast.success('Cập nhật người dùng thành công!');
        onUserUpdated(response.data.user);
        onClose();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(
        error.response?.data?.error || 'Không thể cập nhật người dùng'
      );
    }
  };

  if (!user) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal')}>
        <div className={cx('modal-header')}>
          <h3>Chỉnh sửa người dùng</h3>
          <button className={cx('close-btn')} onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleUpdateUser} className={cx('modal-form')}>
          <div className={cx('form-group')}>
            <label>
              Họ và tên <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
              required
            />
          </div>

          <div className={cx('form-group')}>
            <label>Email (không thể thay đổi)</label>
            <input
              type="email"
              value={editingUser.email}
              disabled
              className={cx('disabled-input')}
            />
          </div>

          <div className={cx('form-group')}>
            <label>
              Vai trò <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
              required
            >
              <option value="customer">Khách hàng (Customer)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          <div className={cx('form-group')}>
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={editingUser.phone}
              onChange={(e) =>
                setEditingUser({ ...editingUser, phone: e.target.value })
              }
            />
          </div>

          <div className={cx('form-group')}>
            <label>Địa chỉ</label>
            <textarea
              value={editingUser.address}
              onChange={(e) =>
                setEditingUser({ ...editingUser, address: e.target.value })
              }
              rows="3"
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

export default EditUserModal;
