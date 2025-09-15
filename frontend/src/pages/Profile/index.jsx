import React, { useContext, useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import { UserContext } from '../../context/UserContext';
import axios from '../../setup/axios';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

function Profile() {
  const { user, loading, updateUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      console.log('=== DEBUG INFO ===');
      console.log('User ID:', user.id);
      console.log('Form Data being sent:', formData);

      // Chỉ gửi dữ liệu cần thiết (không bao gồm email)
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar,
      };

      console.log('Update Data:', updateData);

      const response = await axios.patch(`/users/${user.id}`, updateData);

      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.status === 200 && response.data) {
        // Cập nhật UserContext với dữ liệu mới từ server
        if (updateUser && response.data.user) {
          console.log('Updating user context with:', response.data.user);
          updateUser(response.data.user);
        }

        // Cập nhật local formData với dữ liệu từ server
        setFormData({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          address: response.data.user.address || '',
          avatar: response.data.user.avatar || '',
        });

        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        throw new Error('Response không hợp lệ');
      }
    } catch (error) {
      console.error('=== UPDATE ERROR ===');
      console.error('Full Error:', error);

      if (error.response) {
        console.error('Error Response Status:', error.response.status);
        console.error('Error Response Data:', error.response.data);

        const errorMessage =
          error.response.data?.error || 'Có lỗi xảy ra khi cập nhật thông tin!';
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('Request Error:', error.request);
        toast.error('Không thể kết nối tới server!');
      } else {
        console.error('Other Error:', error.message);
        toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
      }
    } finally {
      setIsUpdating(false);
      console.log('=== UPDATE FINISHED ===');
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className={cx('profile-section')}>
        <div className={cx('loading')}>Đang tải thông tin...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cx('profile-section')}>
        <div className={cx('no-user')}>
          <h3 className={cx('profile-title')}>Bạn chưa đăng nhập</h3>
          <p>Vui lòng đăng nhập để xem thông tin cá nhân</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('profile-section')}>
      <div className={cx('profile-header')}>
        <h3 className={cx('profile-title')}>Thông tin cá nhân</h3>
        {!isEditing && (
          <button
            className={cx('edit-btn')}
            onClick={() => setIsEditing(true)}
            disabled={loading}
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className={cx('profile-form')}>
          <div className={cx('form-group')}>
            <label className={cx('form-label')}>Tên:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={cx('form-input')}
              required
            />
          </div>

          <div className={cx('form-group')}>
            <label className={cx('form-label')}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className={cx('form-input', 'form-input-disabled')}
              disabled
              readOnly
            />
            <small className={cx('form-note')}>Email không thể thay đổi</small>
          </div>

          <div className={cx('form-group')}>
            <label className={cx('form-label')}>Số điện thoại:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={cx('form-input')}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className={cx('form-group')}>
            <label className={cx('form-label')}>Địa chỉ:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={cx('form-textarea')}
              placeholder="Nhập địa chỉ"
              rows={3}
            />
          </div>

          <div className={cx('form-group')}>
            <label className={cx('form-label')}>Avatar URL:</label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleInputChange}
              className={cx('form-input')}
              placeholder="Nhập URL hình ảnh"
            />
          </div>

          <div className={cx('form-actions')}>
            <button
              type="submit"
              className={cx('save-btn')}
              disabled={isUpdating}
            >
              {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={cx('cancel-btn')}
              disabled={isUpdating}
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <div className={cx('profile-info')}>
          <div className={cx('profile-avatar')}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className={cx('avatar-image')}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className={cx('avatar-placeholder')}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className={cx('profile-details')}>
            <div className={cx('profile-item')}>
              <span className={cx('profile-label')}>Tên:</span>
              <span className={cx('profile-value')}>{user.name}</span>
            </div>

            <div className={cx('profile-item')}>
              <span className={cx('profile-label')}>Email:</span>
              <span className={cx('profile-value')}>{user.email}</span>
            </div>

            <div className={cx('profile-item')}>
              <span className={cx('profile-label')}>Vai trò:</span>
              <span className={cx('profile-value', user.role)}>
                {user.role}
              </span>
            </div>

            <div className={cx('profile-item')}>
              <span className={cx('profile-label')}>Số điện thoại:</span>
              <span className={cx('profile-value')}>
                {user.phone || 'Chưa cập nhật'}
              </span>
            </div>

            <div className={cx('profile-item')}>
              <span className={cx('profile-label')}>Địa chỉ:</span>
              <span className={cx('profile-value')}>
                {user.address || 'Chưa cập nhật'}
              </span>
            </div>

            {user.created_at && (
              <div className={cx('profile-item')}>
                <span className={cx('profile-label')}>Ngày tham gia:</span>
                <span className={cx('profile-value')}>
                  {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
