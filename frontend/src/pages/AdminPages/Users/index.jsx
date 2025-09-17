import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Users.module.scss';

const cx = classNames.bind(styles);

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleBadgeClass = (role) => {
    return role === 'admin' ? 'admin-badge' : 'customer-badge';
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUser.fullName || !newUser.email || !newUser.password) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const response = await axios.post('/users', newUser);

      if (response.data.user) {
        // Add new user to the list
        setUsers((prevUsers) => [...prevUsers, response.data.user]);
        toast.success('Thêm người dùng thành công!');

        // Reset form and close modal
        setNewUser({ fullName: '', email: '', password: '', phone: '' });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      // Error đã được handle trong axios interceptor
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      name: user.name || '', // Ensure name field exists
      phone: user.phone || '',
      address: user.address || '',
    });
  };

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
      };

      const response = await axios.patch(
        `/users/${editingUser.id}`,
        updateData
      );

      if (response.data.user) {
        // Update user in the list
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editingUser.id ? response.data.user : user
          )
        );

        toast.success('Cập nhật người dùng thành công!');
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      // Error đã được handle trong axios interceptor
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm('Bạn có chắc chắn muốn xóa người dùng này vào thùng rác?')
    ) {
      try {
        await axios.delete(`/users/${userId}`);

        // Remove user from the list
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        toast.success('Đã chuyển người dùng vào thùng rác!');
      } catch (error) {
        console.error('Error deleting user:', error);
        // Error đã được handle trong axios interceptor
      }
    }
  };

  if (loading) {
    return (
      <div className={cx('users')}>
        <div className={cx('loading')}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={cx('users')}>
      {/* Users Management */}
      <div className={cx('content-grid')}>
        <div className={cx('content-card', 'users-card')}>
          <div className={cx('card-header')}>
            <div className={cx('header-left')}>
              <h2 className={cx('card-title')}>Danh sách người dùng</h2>
              <p className={cx('subtitle')}>
                Quản lý tài khoản người dùng trong hệ thống
              </p>
            </div>

            <div className={cx('header-actions')}>
              <Link
                to="/admin/users/trash"
                className={cx('trash-link')}
                title="Xem thùng rác"
              >
                🗑️ Thùng rác
              </Link>
              <button
                className={cx('create-btn')}
                onClick={() => setShowCreateModal(true)}
              >
                + Thêm người dùng
              </button>
            </div>
          </div>

          <div className={cx('users-table')}>
            <div className={cx('table-header')}>
              <span>ID</span>
              <span>Tên</span>
              <span>Email</span>
              <span>Điện thoại</span>
              <span>Vai trò</span>
              <span>Ngày tạo</span>
              <span>Thao tác</span>
            </div>

            {users.length === 0 ? (
              <div className={cx('no-data')}>
                <p>Không có người dùng nào</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className={cx('table-row')}>
                  <span className={cx('user-id')}>#{user.id}</span>
                  <span className={cx('user-name')}>{user.name}</span>
                  <span className={cx('user-email')}>{user.email}</span>
                  <span className={cx('user-phone')}>
                    {user.phone || 'Chưa có'}
                  </span>
                  <span className={cx('user-role')}>
                    <span
                      className={cx('role-badge', getRoleBadgeClass(user.role))}
                    >
                      {user.role}
                    </span>
                  </span>
                  <span className={cx('user-created')}>
                    {formatDate(user.created_at)}
                  </span>
                  <div className={cx('user-actions')}>
                    <button
                      className={cx('action-btn', 'edit-btn')}
                      onClick={() => handleEditUser(user)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className={cx('action-btn', 'delete-btn')}
                      onClick={() => handleDeleteUser(user.id)}
                      title="Chuyển vào thùng rác"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal')}>
            <div className={cx('modal-header')}>
              <h3>Thêm người dùng mới</h3>
              <button
                className={cx('close-btn')}
                onClick={() => setShowCreateModal(false)}
              >
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
                  onClick={() => setShowCreateModal(false)}
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
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal')}>
            <div className={cx('modal-header')}>
              <h3>Chỉnh sửa người dùng</h3>
              <button
                className={cx('close-btn')}
                onClick={() => setEditingUser(null)}
              >
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
                  onClick={() => setEditingUser(null)}
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

export default Users;
