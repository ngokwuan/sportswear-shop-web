import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import { motion, MotionConfig } from 'framer-motion';
import styles from './OrderDetail.module.scss';
import { formatCurrency } from '../../../utils/formatCurrency';
const cx = classNames.bind(styles);

// Cùng "ngôn ngữ chuyển động" với Home/Orders nhưng nhẹ hơn: chỉ trượt lên và hiện dần
const EASE_BURST = [0.16, 1, 0.3, 1];

const stagger = (gap = 0.08) => ({
  visible: { transition: { staggerChildren: gap } },
});

const rise = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_BURST },
  },
};

const STATUS_MAP = {
  pending: { text: 'Chờ xử lý', color: '#f59e0b' },
  processing: { text: 'Đang xử lý', color: '#3b82f6' },
  completed: { text: 'Hoàn thành', color: '#10b981' },
  shipped: { text: 'Đã gửi hàng', color: '#06b6d4' },
  delivered: { text: 'Đã giao hàng', color: '#22c55e' },
  cancelled: { text: 'Đã hủy', color: '#ef4444' },
};

const getStatusInfo = (status) =>
  STATUS_MAP[status] || { text: status || 'Không rõ', color: '#6b7280' };

const PLACEHOLDER = '/placeholder-image.jpg';

// Helper function to get image URL
const getImageUrl = (imageData) => {
  if (!imageData) return PLACEHOLDER;

  // If it's already a string URL
  if (typeof imageData === 'string') return imageData;

  // If it's an object with url property
  if (typeof imageData === 'object' && imageData.url) return imageData.url;

  // Fallback
  return PLACEHOLDER;
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          setError('Không thể tải thông tin đơn hàng');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className={cx('order-detail')}>
        <div className={cx('loading')}>
          <FontAwesomeIcon icon={faSpinner} spin />
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx('order-detail')}>
        <div className={cx('error')}>
          <p>{error}</p>
          <button onClick={() => navigate('/orders')}>
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order?.status);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={cx('order-detail')}
        initial="hidden"
        animate="visible"
        variants={stagger(0.08)}
      >
        <motion.div className={cx('page-header')} variants={rise}>
          <button
            type="button"
            className={cx('back-link')}
            onClick={() => navigate('/orders')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại đơn hàng
          </button>
          <h1 className={cx('title')}>Chi tiết đơn hàng #{order?.id}</h1>
        </motion.div>

        <div className={cx('order-info')}>
          <motion.section className={cx('info-section')} variants={rise}>
            <h3 className={cx('section-title')}>Thông tin đơn hàng</h3>
            <div className={cx('detail-row')}>
              <span className={cx('detail-label')}>Trạng thái</span>
              <span className={cx('detail-value')}>
                <span
                  className={cx('status-badge')}
                  style={{ '--status-color': statusInfo.color }}
                >
                  {statusInfo.text}
                </span>
              </span>
            </div>
            <div className={cx('detail-row')}>
              <span className={cx('detail-label')}>Ngày đặt</span>
              <span className={cx('detail-value')}>
                {formatDate(order?.created_at)}
              </span>
            </div>
            <div className={cx('detail-row')}>
              <span className={cx('detail-label')}>Tổng tiền</span>
              <span className={cx('detail-value', 'price-highlight')}>
                {formatCurrency(order?.total_amount)}
              </span>
            </div>
          </motion.section>

          <motion.section className={cx('shipping-info')} variants={rise}>
            <h3 className={cx('section-title')}>Thông tin giao hàng</h3>
            <div className={cx('detail-row')}>
              <span className={cx('detail-label')}>Người nhận</span>
              <span className={cx('detail-value')}>{order?.customer_name}</span>
            </div>
            <div className={cx('detail-row')}>
              <span className={cx('detail-label')}>Địa chỉ</span>
              <span className={cx('detail-value')}>
                {order?.shipping_address}
              </span>
            </div>
            <div className={cx('detail-row')}>
              <span className={cx('detail-label')}>Số điện thoại</span>
              <span className={cx('detail-value')}>
                {order?.customer_phone}
              </span>
            </div>
            <div className={cx('detail-row')}>
              <span className={cx('detail-label')}>Email</span>
              <span className={cx('detail-value')}>
                {order?.customer_email}
              </span>
            </div>
          </motion.section>

          <motion.section className={cx('products-list')} variants={rise}>
            <h3 className={cx('section-title')}>Sản phẩm</h3>

            <div className={cx('product-list')}>
              {order?.items?.map((item) => (
                <div key={item.id} className={cx('product-item')}>
                  <img
                    src={getImageUrl(item.product?.featured_image)}
                    alt={item.product?.name || 'Product'}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null; // tránh lặp vô hạn nếu placeholder cũng lỗi
                      e.target.src = PLACEHOLDER;
                    }}
                  />
                  <div className={cx('product-info')}>
                    <h4>{item.product?.name || item.product_name}</h4>
                    <div className={cx('product-meta')}>
                      {/* show size chosen for this order item */}
                      {item.size && (
                        <span className={cx('chip')}>
                          Size <strong>{item.size}</strong>
                        </span>
                      )}
                      <span className={cx('chip')}>
                        Số lượng <strong>{item.quantity}</strong>
                      </span>
                      <span className={cx('chip')}>
                        Đơn giá{' '}
                        <strong>{formatCurrency(item.product_price)}</strong>
                      </span>
                    </div>
                  </div>
                  <div className={cx('product-total')}>
                    <span className={cx('product-total-label')}>
                      Thành tiền
                    </span>
                    <span className={cx('product-total-value')}>
                      {formatCurrency(item.product_price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tiền footer */}
            <div className={cx('order-summary')}>
              <div className={cx('summary-row')}>
                <span>Tổng cộng</span>
                <span className={cx('total-price')}>
                  {formatCurrency(order?.total_amount)}
                </span>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

export default OrderDetail;
