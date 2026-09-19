import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../context/UserContext';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import classNames from 'classnames/bind';
import { motion, MotionConfig } from 'framer-motion';
import styles from './Orders.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faShoppingBag,
  faCalendarAlt,
  faMapMarkerAlt,
  faEye,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../../../utils/formatCurrency';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

// Cùng "ngôn ngữ chuyển động" với Home/Login/Register/PaymentResult
const EASE_BURST = [0.16, 1, 0.3, 1];

const stagger = (gap = 0.08) => ({
  visible: { transition: { staggerChildren: gap } },
});

// Mỗi đơn hàng "lao" vào từ vạch xuất phát bên trái
const dash = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: EASE_BURST },
  },
};

const getStatusInfo = (status) => {
  const statusMap = {
    pending: { text: 'Chờ xử lý', class: 'pending', color: '#f59e0b' },
    processing: { text: 'Đang xử lý', class: 'processing', color: '#3b82f6' },
    completed: { text: 'Hoàn thành', class: 'completed', color: '#10b981' },
    shipped: { text: 'Đã gửi hàng', class: 'shipped', color: '#06b6d4' },
    delivered: { text: 'Đã giao hàng', class: 'delivered', color: '#22c55e' },
    cancelled: { text: 'Đã hủy', class: 'cancelled', color: '#ef4444' },
  };

  return (
    statusMap[status] || {
      text: status,
      class: 'pending',
      color: '#6b7280',
    }
  );
};

const PROGRESS_BY_STATUS = {
  pending: '25%',
  processing: '50%',
  shipped: '75%',
  delivered: '100%',
  completed: '100%',
  cancelled: '0%',
};

function Orders() {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/orders/user/${user.id}`);
        if (response.data.success) {
          setOrders(response.data.data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((order) => order.status === filter);

  const availableStatuses = [...new Set(orders.map((order) => order.status))];

  if (loading) {
    return (
      <div className={cx('orders-container')}>
        <div className={cx('loading')}>
          <div className={cx('spinner-container')}>
            <FontAwesomeIcon icon={faSpinner} spin />
          </div>
          <p>Đang tải đơn hàng của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={cx('orders-container')}>
        <div className={cx('header-section')}>
          <div className={cx('title-container')}>
            <FontAwesomeIcon
              icon={faClipboardList}
              className={cx('title-icon')}
            />
            <h1 className={cx('title')}>Đơn hàng của tôi</h1>
          </div>

          {orders.length > 0 && (
            <div className={cx('order-stats')}>
              <div className={cx('stat-item')}>
                <span className={cx('stat-number')}>{orders.length}</span>
                <span className={cx('stat-label')}>Tổng đơn hàng</span>
              </div>
              <div className={cx('stat-item')}>
                <span className={cx('stat-number')}>
                  {formatCurrency(
                    orders.reduce(
                      (sum, order) => sum + Number(order.total_amount || 0),
                      0,
                    ),
                  )}
                </span>
                <span className={cx('stat-label')}>Tổng giá trị</span>
              </div>
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <motion.div
            className={cx('no-orders')}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_BURST }}
          >
            <div className={cx('empty-icon')}>
              <FontAwesomeIcon icon={faShoppingBag} />
            </div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Hãy khám phá các sản phẩm thể thao tuyệt vời của chúng tôi!</p>
            <Link to="/products" className={cx('shop-link')}>
              <FontAwesomeIcon icon={faShoppingBag} />
              Khám phá sản phẩm
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className={cx('filter-tabs')}>
              <button
                className={cx('filter-tab', { active: filter === 'all' })}
                onClick={() => setFilter('all')}
              >
                Tất cả ({orders.length})
              </button>
              {availableStatuses.map((status) => {
                const statusInfo = getStatusInfo(status);
                const count = orders.filter(
                  (order) => order.status === status,
                ).length;
                return (
                  <button
                    key={status}
                    className={cx('filter-tab', { active: filter === status })}
                    onClick={() => setFilter(status)}
                  >
                    {statusInfo.text} ({count})
                  </button>
                );
              })}
            </div>

            {/* key theo filter để danh sách chạy lại hiệu ứng khi đổi tab */}
            <motion.div
              className={cx('orders-list')}
              key={filter}
              initial="hidden"
              animate="visible"
              variants={stagger(0.08)}
            >
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <motion.div
                    key={order.id}
                    className={cx('order-slot')}
                    variants={dash}
                  >
                    <div className={cx('order-card')}>
                      <div className={cx('order-header')}>
                        <div className={cx('order-meta')}>
                          <span className={cx('order-id')}>
                            <FontAwesomeIcon icon={faShoppingBag} />
                            Đơn hàng #{order.id}
                          </span>
                          <span className={cx('order-date')}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {new Date(order.created_at).toLocaleDateString(
                              'vi-VN',
                            )}
                          </span>
                        </div>

                        <span
                          className={cx('status-badge', statusInfo.class)}
                          style={{ '--status-color': statusInfo.color }}
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      <div className={cx('order-content')}>
                        <div className={cx('order-details')}>
                          <div className={cx('detail-item')}>
                            <span className={cx('detail-label')}>
                              Tổng tiền:
                            </span>
                            <span className={cx('detail-value', 'price')}>
                              {formatCurrency(order.total_amount)}
                            </span>
                          </div>

                          <div className={cx('detail-item')}>
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className={cx('detail-icon')}
                            />
                            <span className={cx('detail-label')}>Địa chỉ:</span>
                            {order.shipping_address}
                          </div>
                        </div>

                        <div className={cx('order-actions')}>
                          <Link
                            to={`/orders/${order.id}`}
                            className={cx('action-btn', 'primary')}
                          >
                            <FontAwesomeIcon icon={faEye} />
                            Xem chi tiết
                          </Link>

                          {order.status === 'pending' && (
                            <button className={cx('action-btn', 'secondary')}>
                              Hủy đơn hàng
                            </button>
                          )}

                          {order.status === 'delivered' && (
                            <button className={cx('action-btn', 'secondary')}>
                              Đánh giá
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress indicator */}
                      <div className={cx('progress-indicator')}>
                        <div
                          className={cx('progress-bar')}
                          style={{
                            '--progress':
                              PROGRESS_BY_STATUS[order.status] || '0%',
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {filteredOrders.length === 0 && (
              <div className={cx('no-results')}>
                <p>Không tìm thấy đơn hàng nào với trạng thái này</p>
              </div>
            )}
          </>
        )}
      </div>
    </MotionConfig>
  );
}

export default Orders;
