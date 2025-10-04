import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Users.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../../components/Pagination';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';

const cx = classNames.bind(styles);

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleBadgeClass = (role) => {
    return role === 'admin' ? 'admin-badge' : 'customer-badge';
  };

  const handleUserCreated = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);

    // Navigate to last page
    const newTotalPages = Math.ceil((users.length + 1) / itemsPerPage);
    setCurrentPage(newTotalPages);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm('Bạn có chắc chắn muốn xóa người dùng này vào thùng rác?')
    ) {
      try {
        await axios.delete(`/users/${userId}`);

        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        toast.success('Đã chuyển người dùng vào thùng rác!');

        // Adjust page if current page is empty after deletion
        const newTotalItems = users.length - 1;
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Không thể xóa người dùng');
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
    <div className={cx('content-card', 'users-card')}>
      <div className={cx('card-header')}>
        <div className={cx('header-left')}>
          <h2 className={cx('card-title')}>Danh sách người dùng</h2>
          <p className={cx('subtitle')}>
            Quản lý tài khoản người dùng trong hệ thống ({users.length} người
            dùng)
          </p>
        </div>

        <div className={cx('header-actions')}>
          <Link
            to="/admin/users/trash"
            className={cx('trash-link')}
            title="Xem thùng rác"
          >
            <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
            Thùng rác
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
          currentUsers.map((user) => (
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
                  onClick={() => setEditingUser(user)}
                  title="Chỉnh sửa"
                >
                  <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                </button>
                <button
                  className={cx('action-btn', 'delete-btn')}
                  onClick={() => handleDeleteUser(user.id)}
                  title="Chuyển vào thùng rác"
                >
                  <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
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
        totalItems={users.length}
        onPageChange={setCurrentPage}
        itemName="người dùng"
      />

      {/* Create User Modal */}
      <CreateUserModal
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}

export default Users;
