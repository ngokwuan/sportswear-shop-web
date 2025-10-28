import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/UserContext';
import axios from '../../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './OrderDetail.module.scss';
import { formatCurrency } from '../../../utils/formatCurrency';
const cx = classNames.bind(styles);

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);

  // Helper function to get image URL
  const getImageUrl = (imageData) => {
    if (!imageData) return '/placeholder-image.jpg';

    // If it's already a string URL
    if (typeof imageData === 'string') return imageData;

    // If it's an object with url property
    if (typeof imageData === 'object' && imageData.url) return imageData.url;

    // Fallback
    return '/placeholder-image.jpg';
  };

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
      <div className={cx('loading')}>
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx('error')}>
        <p>{error}</p>
        <button onClick={() => navigate('/orders')}>
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className={cx('order-detail')}>
      <h2>Chi tiết đơn hàng #{order?.id}</h2>

      <div className={cx('order-info')}>
        <div className={cx('info-section')}>
          <h3>Thông tin đơn hàng</h3>
          <p>
            <strong>Trạng thái: </strong>
            <span className={cx('status-badge')}>{order?.status}</span>
          </p>
          <p>
            <strong>Ngày đặt: </strong>
            {new Date(order?.created_at).toLocaleDateString('vi-VN')}
          </p>
          <p>
            <strong>Tổng tiền: </strong>
            <span className={cx('price-highlight')}>
              {formatCurrency(order?.total_amount)}
            </span>
          </p>
        </div>

        <div className={cx('shipping-info')}>
          <h3>Thông tin giao hàng</h3>
          <p>
            <strong>Người nhận:</strong> {order?.customer_name}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {order?.shipping_address}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {order?.customer_phone}
          </p>
          <p>
            <strong>Email:</strong> {order?.customer_email}
          </p>
        </div>

        <div className={cx('products-list')}>
          <h3>Sản phẩm</h3>
          {order?.items?.map((item) => (
            <div key={item.id} className={cx('product-item')}>
              <img
                src={getImageUrl(item.product?.featured_image)}
                alt={item.product?.name || 'Product'}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className={cx('product-info')}>
                <h4>{item.product?.name || item.product_name}</h4>
                {/* show size chosen for this order item */}
                {item.size && (
                  <p>
                    <strong>Size:</strong> {item.size}
                  </p>
                )}
                <p>
                  Số lượng: <strong>{item.quantity}</strong>
                </p>
                <p>
                  Đơn giá:{' '}
                  <span className={cx('price-highlight')}>
                    {formatCurrency(item.product_price)}
                  </span>
                </p>
                <p>
                  Thành tiền:{' '}
                  <span className={cx('price-highlight')}>
                    {formatCurrency(item.product_price * item.quantity)}
                  </span>
                </p>
              </div>
            </div>
          ))}

          {/* Tổng tiền footer */}
          <div className={cx('order-summary')}>
            <div className={cx('summary-row')}>
              <span>Tổng cộng:</span>
              <span className={cx('total-price')}>
                {formatCurrency(order?.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
