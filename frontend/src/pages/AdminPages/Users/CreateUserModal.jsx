import classNames from 'classnames/bind';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Users.module.scss';

const cx = classNames.bind(styles);

function CreateUserModal({ showModal, onClose, onUserCreated }) {
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUser.fullName || !newUser.email || !newUser.password) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const response = await axios.post('/users', newUser);

      if (response.data.user) {
        toast.success('Thêm người dùng thành công!');
        setNewUser({ fullName: '', email: '', password: '', phone: '' });
        onUserCreated(response.data.user);
        onClose();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Không thể thêm người dùng');
    }
  };

  const handleClose = () => {
    setNewUser({ fullName: '', email: '', password: '', phone: '' });
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal')}>
        <div className={cx('modal-header')}>
          <h3>Thêm người dùng mới</h3>
          <button className={cx('close-btn')} onClick={handleClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleCreateUser} className={cx('modal-form')}>
          <div className={cx('form-group')}>
            <label>
              Họ và tên <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={newUser.fullName}
              onChange={(e) =>
                setNewUser({ ...newUser, fullName: e.target.value })
              }
              required
            />
          </div>
          <div className={cx('form-group')}>
            <label>
              Email <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
          </div>
          <div className={cx('form-group')}>
            <label>
              Mật khẩu <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
              minLength="6"
            />
          </div>
          <div className={cx('form-group')}>
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
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
              Thêm người dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;
