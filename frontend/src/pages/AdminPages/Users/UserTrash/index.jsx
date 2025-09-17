import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../../setup/axios';
import styles from './UserTrash.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function UserTrash() {
  const [trashedUsers, setTrashedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch trashed users from API
  const fetchTrashedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users/trash');
      setTrashedUsers(response.data);
    } catch (error) {
      console.error('Error fetching trashed users:', error);
      toast.error('Không thể tải danh sách thùng rác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedUsers();
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

  const getRoleBadgeClass = (role) => {
    return role === 'admin' ? 'admin-badge' : 'customer-badge';
  };

  // Handle single user selection
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle select all users
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(trashedUsers.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll state when selectedUsers changes
  useEffect(() => {
    setSelectAll(
      selectedUsers.length === trashedUsers.length && trashedUsers.length > 0
    );
  }, [selectedUsers, trashedUsers]);

  // Restore single user
  const handleRestoreUser = async (userId) => {
    try {
      await axios.patch(`/users/${userId}/restore`);
      toast.success('Khôi phục người dùng thành công!');
      // Remove restored user from trash list
      setTrashedUsers((prev) => prev.filter((user) => user.id !== userId));
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } catch (error) {
      console.error('Error restoring user:', error);
      toast.error('Không thể khôi phục người dùng');
    }
  };

  // Force delete single user
  const handleForceDeleteUser = async (userId) => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Hành động này không thể hoàn tác!'
      )
    ) {
      try {
        await axios.delete(`/users/${userId}/force`);
        toast.success('Xóa vĩnh viễn người dùng thành công!');
        // Remove deleted user from trash list
        setTrashedUsers((prev) => prev.filter((user) => user.id !== userId));
        setSelectedUsers((prev) => prev.filter((id) => id !== userId));
      } catch (error) {
        console.error('Error force deleting user:', error);
        toast.error('Không thể xóa vĩnh viễn người dùng');
      }
    }
  };

  // Restore multiple selected users
  const handleRestoreSelected = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một người dùng');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn khôi phục ${selectedUsers.length} người dùng đã chọn?`
      )
    ) {
      try {
        await Promise.all(
          selectedUsers.map((userId) => axios.patch(`/users/${userId}/restore`))
        );
        toast.success(
          `Khôi phục ${selectedUsers.length} người dùng thành công!`
        );
        // Remove restored users from trash list
        setTrashedUsers((prev) =>
          prev.filter((user) => !selectedUsers.includes(user.id))
        );
        setSelectedUsers([]);
      } catch (error) {
        console.error('Error restoring selected users:', error);
        toast.error('Có lỗi xảy ra khi khôi phục người dùng');
      }
    }
  };

  // Force delete multiple selected users
  const handleForceDeleteSelected = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một người dùng');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedUsers.length} người dùng đã chọn? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await Promise.all(
          selectedUsers.map((userId) => axios.delete(`/users/${userId}/force`))
        );
        toast.success(
          `Xóa vĩnh viễn ${selectedUsers.length} người dùng thành công!`
        );
        // Remove deleted users from trash list
        setTrashedUsers((prev) =>
          prev.filter((user) => !selectedUsers.includes(user.id))
        );
        setSelectedUsers([]);
      } catch (error) {
        console.error('Error force deleting selected users:', error);
        toast.error('Có lỗi xảy ra khi xóa vĩnh viễn người dùng');
      }
    }
  };

  // Empty entire trash
  const handleEmptyTrash = async () => {
    if (trashedUsers.length === 0) {
      toast.warning('Thùng rác đã trống');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn tất cả ${trashedUsers.length} người dùng trong thùng rác? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await Promise.all(
          trashedUsers.map((user) => axios.delete(`/users/${user.id}/force`))
        );
        toast.success('Đã dọn sạch thùng rác!');
        setTrashedUsers([]);
        setSelectedUsers([]);
      } catch (error) {
        console.error('Error emptying trash:', error);
        toast.error('Có lỗi xảy ra khi dọn thùng rác');
      }
    }
  };

  if (loading) {
    return (
      <div className={cx('user-trash')}>
        <div className={cx('loading')}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={cx('user-trash')}>
      <div className={cx('content-grid')}>
        <div className={cx('content-card', 'trash-card')}>
          <div className={cx('card-header')}>
            <div className={cx('header-left')}>
              <h2 className={cx('card-title')}>
                <Link to="/admin/users" className={cx('back')}>
                  {'<'}
                </Link>
                Thùng rác người dùng
                <span className={cx('count')}>({trashedUsers.length})</span>
              </h2>
              <p className={cx('subtitle')}>
                Quản lý các người dùng đã bị xóa mềm
              </p>
            </div>

            {trashedUsers.length > 0 && (
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

          {trashedUsers.length === 0 ? (
            <div className={cx('empty-trash')}>
              <div className={cx('empty-icon')}>🗑️</div>
              <h3>Thùng rác trống</h3>
              <p>Không có người dùng nào trong thùng rác</p>
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
                    Chọn tất cả ({selectedUsers.length}/{trashedUsers.length})
                  </label>
                </div>

                {selectedUsers.length > 0 && (
                  <div className={cx('selected-actions')}>
                    <button
                      className={cx('bulk-btn', 'restore-btn')}
                      onClick={handleRestoreSelected}
                    >
                      🔄 Khôi phục ({selectedUsers.length})
                    </button>
                    <button
                      className={cx('bulk-btn', 'delete-btn')}
                      onClick={handleForceDeleteSelected}
                    >
                      ❌ Xóa vĩnh viễn ({selectedUsers.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Users Table */}
              <div className={cx('users-table')}>
                <div className={cx('table-header')}>
                  <span className={cx('select-col')}></span>
                  <span>ID</span>
                  <span>Tên</span>
                  <span>Email</span>
                  <span>Điện thoại</span>
                  <span>Vai trò</span>
                  <span>Ngày xóa</span>
                  <span>Thao tác</span>
                </div>

                {trashedUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cx('table-row', {
                      selected: selectedUsers.includes(user.id),
                    })}
                  >
                    <div className={cx('select-col')}>
                      <label className={cx('checkbox-wrapper')}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                        <span className={cx('checkmark')}></span>
                      </label>
                    </div>

                    <span className={cx('user-id')}>#{user.id}</span>
                    <span className={cx('user-name')}>{user.name}</span>
                    <span className={cx('user-email')}>{user.email}</span>
                    <span className={cx('user-phone')}>
                      {user.phone || 'Chưa có'}
                    </span>
                    <span className={cx('user-role')}>
                      <span
                        className={cx(
                          'role-badge',
                          getRoleBadgeClass(user.role)
                        )}
                      >
                        {user.role}
                      </span>
                    </span>
                    <span className={cx('user-deleted')}>
                      {formatDate(user.deleted_at)}
                    </span>

                    <div className={cx('user-actions')}>
                      <button
                        className={cx('action-btn', 'restore-btn')}
                        onClick={() => handleRestoreUser(user.id)}
                        title="Khôi phục người dùng"
                      >
                        🔄
                      </button>
                      <button
                        className={cx('action-btn', 'force-delete-btn')}
                        onClick={() => handleForceDeleteUser(user.id)}
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

export default UserTrash;
