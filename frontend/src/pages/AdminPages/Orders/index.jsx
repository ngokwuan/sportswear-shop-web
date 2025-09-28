import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Orders.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
const cx = classNames.bind(styles);

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đã giao' },
    { value: 'delivered', label: 'Đã nhận' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const paymentStatusOptions = [
    { value: '', label: 'Tất cả thanh toán' },
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'failed', label: 'Thất bại' },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/orders?${params.toString()}`);

      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };

    const statusLabels = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã giao',
      delivered: 'Đã nhận',
      cancelled: 'Đã hủy',
    };

    return (
      <span className={cx('status-badge', statusClasses[status])}>
        {statusLabels[status]}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      pending: 'payment-pending',
      paid: 'payment-paid',
      failed: 'payment-failed',
    };

    const statusLabels = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thất bại',
    };

    return (
      <span className={cx('payment-badge', statusClasses[status])}>
        {statusLabels[status]}
      </span>
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleEditStatus = (order) => {
    setEditingOrder({
      ...order,
      newStatus: order.status,
      notes: order.notes || '',
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!editingOrder.newStatus) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }

    try {
      const response = await axios.patch(`/orders/${editingOrder.id}/status`, {
        status: editingOrder.newStatus,
        notes: editingOrder.notes,
      });

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === editingOrder.id
              ? {
                  ...order,
                  status: editingOrder.newStatus,
                  notes: editingOrder.notes,
                }
              : order
          )
        );

        toast.success('Cập nhật trạng thái đơn hàng thành công!');
        setShowStatusModal(false);
        setEditingOrder(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Lỗi cập nhật trạng thái đơn hàng');
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await axios.get(`/orders/${orderId}`);
      if (response.data.success) {
        setShowOrderDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className={cx('orders')}>
        <div className={cx('loading')}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={cx('orders')}>
      <div className={cx('content-grid')}>
        <div className={cx('content-card', 'orders-card')}>
          <div className={cx('card-header')}>
            <div className={cx('header-left')}>
              <h2 className={cx('card-title')}>Quản lý đơn hàng</h2>
              <p className={cx('subtitle')}>
                Quản lý tất cả đơn hàng trong hệ thống
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className={cx('filters-section')}>
            <form onSubmit={handleSearch} className={cx('filters-form')}>
              <div className={cx('form-group')}>
                <label>Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Mã đơn hàng, tên khách hàng, email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className={cx('form-group')}>
                <label>Trạng thái đơn hàng</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={cx('form-group')}>
                <label>Trạng thái thanh toán</label>
                <select
                  value={filters.payment_status}
                  onChange={(e) =>
                    handleFilterChange('payment_status', e.target.value)
                  }
                >
                  {paymentStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={cx('form-group')}>
                <button type="submit" className={cx('search-btn')}>
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>

          {/* Orders Table */}
          <div className={cx('orders-table')}>
            <div className={cx('table-header')}>
              <span>Mã đơn hàng</span>
              <span>Khách hàng</span>
              <span>Sản phẩm</span>
              <span>Tổng tiền</span>
              <span>Trạng thái</span>
              <span>Thanh toán</span>
              <span>Ngày tạo</span>
              <span>Thao tác</span>
            </div>

            {orders.length === 0 ? (
              <div className={cx('no-data')}>
                <p>Không có đơn hàng nào</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className={cx('table-row')}>
                  <span className={cx('order-number')}>
                    {order.order_number.length > 5
                      ? `${order.order_number.substring(
                          0,
                          2
                        )}...${order.order_number.slice(-3)}`
                      : order.order_number}
                  </span>
                  <div className={cx('customer-info')}>
                    <span className={cx('customer-name')}>
                      {order.customer_name.length > 22
                        ? `${order.customer_name.substring(0, 22)}...`
                        : order.customer_name}
                    </span>
                    <span className={cx('customer-email')}>
                      {order.customer_email}
                    </span>
                  </div>
                  <span className={cx('items-count')}>
                    {order.items?.length || 0} sản phẩm
                  </span>
                  <span className={cx('total-amount')}>
                    {formatPrice(order.total_amount)}
                  </span>
                  <div className={cx('status-col')}>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className={cx('payment-col')}>
                    {getPaymentStatusBadge(order.payment_status)}
                  </div>
                  <span className={cx('created-date')}>
                    {formatDate(order.created_at)}
                  </span>
                  <div className={cx('order-actions')}>
                    <button
                      className={cx('action-btn', 'view-btn')}
                      onClick={() => handleViewDetails(order.id)}
                      title="Xem chi tiết"
                    >
                      <FontAwesomeIcon icon={faEye}></FontAwesomeIcon>
                    </button>
                    <button
                      className={cx('action-btn', 'edit-btn')}
                      onClick={() => handleEditStatus(order)}
                      title="Cập nhật trạng thái"
                    >
                      <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={cx('pagination')}>
              <button
                className={cx('page-btn')}
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                « Trước
              </button>

              <span className={cx('page-info')}>
                Trang {pagination.page} / {pagination.totalPages}
              </span>

              <button
                className={cx('page-btn')}
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Sau »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && editingOrder && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal')}>
            <div className={cx('modal-header')}>
              <h3>Cập nhật trạng thái đơn hàng</h3>
              <button
                className={cx('close-btn')}
                onClick={() => {
                  setShowStatusModal(false);
                  setEditingOrder(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className={cx('modal-form')}>
              <div className={cx('form-group')}>
                <label>Mã đơn hàng</label>
                <input
                  type="text"
                  value={editingOrder.order_number}
                  disabled
                  className={cx('disabled-input')}
                />
              </div>

              <div className={cx('form-group')}>
                <label>
                  Trạng thái mới <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={editingOrder.newStatus}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      newStatus: e.target.value,
                    })
                  }
                  required
                >
                  {statusOptions.slice(1).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={cx('form-group')}>
                <label>Ghi chú</label>
                <textarea
                  value={editingOrder.notes}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      notes: e.target.value,
                    })
                  }
                  rows="4"
                  placeholder="Nhập ghi chú cho đơn hàng..."
                />
              </div>

              <div className={cx('modal-actions')}>
                <button
                  type="button"
                  className={cx('cancel-btn')}
                  onClick={() => {
                    setShowStatusModal(false);
                    setEditingOrder(null);
                  }}
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

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal', 'details-modal')}>
            <div className={cx('modal-header')}>
              <h3>Chi tiết đơn hàng #{showOrderDetails.order_number}</h3>
              <button
                className={cx('close-btn')}
                onClick={() => setShowOrderDetails(null)}
              >
                ×
              </button>
            </div>

            <div className={cx('details-content')}>
              {/* Customer Info */}
              <div className={cx('details-section')}>
                <h4>Thông tin khách hàng</h4>
                <div className={cx('info-grid')}>
                  <div className={cx('info-item')}>
                    <label>Tên:</label>
                    <span>{showOrderDetails.customer_name}</span>
                  </div>
                  <div className={cx('info-item')}>
                    <label>Email:</label>
                    <span>{showOrderDetails.customer_email}</span>
                  </div>
                  <div className={cx('info-item')}>
                    <label>Điện thoại:</label>
                    <span>{showOrderDetails.customer_phone}</span>
                  </div>
                  <div className={cx('info-item')}>
                    <label>Địa chỉ giao hàng:</label>
                    <span>{showOrderDetails.shipping_address}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className={cx('details-section')}>
                <h4>Thông tin đơn hàng</h4>
                <div className={cx('info-grid')}>
                  <div className={cx('info-item')}>
                    <label>Trạng thái:</label>
                    {getStatusBadge(showOrderDetails.status)}
                  </div>
                  <div className={cx('info-item')}>
                    <label>Thanh toán:</label>
                    {getPaymentStatusBadge(showOrderDetails.payment_status)}
                  </div>
                  <div className={cx('info-item')}>
                    <label>Phương thức thanh toán:</label>
                    <span>
                      {showOrderDetails.payment_method?.toUpperCase()}
                    </span>
                  </div>
                  <div className={cx('info-item')}>
                    <label>Ngày tạo:</label>
                    <span>{formatDate(showOrderDetails.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className={cx('details-section')}>
                <h4>Sản phẩm</h4>
                <div className={cx('items-list')}>
                  {showOrderDetails.items?.map((item) => (
                    <div key={item.id} className={cx('item-row')}>
                      <div className={cx('item-info')}>
                        <img
                          src={item.product?.featured_image}
                          alt={item.product_name}
                          className={cx('item-image')}
                        />
                        <div className={cx('item-details')}>
                          <h5>{item.product_name}</h5>
                          <span>Số lượng: {item.quantity}</span>
                        </div>
                      </div>
                      <div className={cx('item-price')}>
                        <span className={cx('unit-price')}>
                          {formatPrice(item.product_price)}
                        </span>
                        <span className={cx('total-price')}>
                          {formatPrice(item.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className={cx('details-section')}>
                <h4>Tổng kết</h4>
                <div className={cx('summary-grid')}>
                  <div className={cx('summary-item')}>
                    <label>Tạm tính:</label>
                    <span>{formatPrice(showOrderDetails.subtotal)}</span>
                  </div>
                  <div className={cx('summary-item')}>
                    <label>Phí vận chuyển:</label>
                    <span>{formatPrice(showOrderDetails.shipping_fee)}</span>
                  </div>
                  <div className={cx('summary-item', 'total-row')}>
                    <label>Tổng cộng:</label>
                    <span>{formatPrice(showOrderDetails.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {showOrderDetails.notes && (
                <div className={cx('details-section')}>
                  <h4>Ghi chú</h4>
                  <p className={cx('notes-text')}>{showOrderDetails.notes}</p>
                </div>
              )}
            </div>

            <div className={cx('modal-actions')}>
              <button
                className={cx('cancel-btn')}
                onClick={() => setShowOrderDetails(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
