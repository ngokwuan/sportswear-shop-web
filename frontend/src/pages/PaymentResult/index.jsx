import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faSpinner,
  faHome,
  faShoppingBag,
  faReceipt,
  faArrowLeft,
  faClock,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './PaymentResult.module.scss';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    status: '',
    message: '',
    vnpayOrderId: '',
    amount: 0,
    code: '',
  });

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Lấy thông tin từ URL params
        const status = searchParams.get('status');
        const vnpayOrderId = searchParams.get('vnpay_order_id');
        const amount = searchParams.get('amount');
        const code = searchParams.get('code');
        const message = searchParams.get('message');

        setPaymentInfo({
          status: status || 'unknown',
          vnpayOrderId: vnpayOrderId || '',
          amount: parseFloat(amount || 0),
          code: code || '',
          message: message || '',
        });

        // Lấy thông tin đơn hàng từ sessionStorage (nếu có)
        const pendingOrder = sessionStorage.getItem('pending_order');
        if (pendingOrder) {
          const orderInfo = JSON.parse(pendingOrder);
          setOrderDetails(orderInfo);
        }

        // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
        if (status === 'success' && pendingOrder) {
          await updateOrderStatus(JSON.parse(pendingOrder).order_id, 'paid');
          // Xóa giỏ hàng sau khi thanh toán thành công
          await clearCart();
          // Xóa thông tin đơn hàng tạm thời
          sessionStorage.removeItem('pending_order');

          toast.success('Thanh toán thành công! Đơn hàng đã được xác nhận.');
        } else if (status === 'failed' && pendingOrder) {
          await updateOrderStatus(
            JSON.parse(pendingOrder).order_id,
            'cancelled'
          );
          toast.error('Thanh toán thất bại! Đơn hàng đã bị hủy.');
        }
      } catch (error) {
        console.error('Error processing payment result:', error);
        toast.error('Có lỗi xảy ra khi xử lý kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [searchParams]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/cart/clear');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getStatusIcon = () => {
    switch (paymentInfo.status) {
      case 'success':
        return faCheckCircle;
      case 'failed':
        return faTimesCircle;
      case 'error':
        return faExclamationTriangle;
      default:
        return faInfoCircle;
    }
  };

  const getStatusMessage = () => {
    switch (paymentInfo.status) {
      case 'success':
        return {
          title: 'Thanh toán thành công!',
          subtitle:
            'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.',
          description:
            'Chúng tôi sẽ xử lý đơn hàng và giao hàng trong thời gian sớm nhất.',
        };
      case 'failed':
        return {
          title: 'Thanh toán thất bại!',
          subtitle: 'Giao dịch không thể hoàn tất.',
          description: 'Vui lòng kiểm tra thông tin thanh toán và thử lại.',
        };
      case 'error':
        return {
          title: 'Có lỗi xảy ra!',
          subtitle: 'Không thể xử lý thanh toán.',
          description:
            paymentInfo.message === 'invalid_signature'
              ? 'Chữ ký không hợp lệ. Vui lòng liên hệ hỗ trợ.'
              : 'Lỗi hệ thống. Vui lòng thử lại sau.',
        };
      default:
        return {
          title: 'Trạng thái không xác định',
          subtitle: 'Không thể xác định kết quả thanh toán.',
          description:
            'Vui lòng liên hệ hỗ trợ để kiểm tra trạng thái đơn hàng.',
        };
    }
  };

  const getVNPayErrorMessage = (code) => {
    const errorMessages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      10: 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      11: 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      12: 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      13: 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      24: 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      51: 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      65: 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      75: 'Ngân hàng thanh toán đang bảo trì.',
      79: 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      99: 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    };
    return errorMessages[code] || 'Lỗi không xác định';
  };

  if (loading) {
    return (
      <div className={cx('container')}>
        <div className={cx('loading-wrapper')}>
          <FontAwesomeIcon
            icon={faSpinner}
            className={cx('loading-spinner')}
            spin
          />
          <p className={cx('loading-text')}>Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <div className={cx('container')}>
      <div className={cx('result-wrapper')}>
        <div className={cx('result-card')}>
          <div className={cx('status-section')}>
            <div className={cx('status-icon', paymentInfo.status)}>
              <FontAwesomeIcon icon={getStatusIcon()} />
            </div>

            <h1 className={cx('status-title')}>{statusInfo.title}</h1>
            <p className={cx('status-subtitle')}>{statusInfo.subtitle}</p>
            <p className={cx('status-description')}>{statusInfo.description}</p>
          </div>

          {/* Thông tin giao dịch */}
          <div className={cx('transaction-info')}>
            <h3 className={cx('section-title')}>
              <FontAwesomeIcon icon={faReceipt} />
              Thông tin giao dịch
            </h3>

            <div className={cx('info-grid')}>
              {paymentInfo.vnpayOrderId && (
                <div className={cx('info-item')}>
                  <span className={cx('info-label')}>Mã giao dịch VNPay:</span>
                  <span className={cx('info-value', 'transaction-id')}>
                    {paymentInfo.vnpayOrderId}
                  </span>
                </div>
              )}

              {orderDetails && (
                <div className={cx('info-item')}>
                  <span className={cx('info-label')}>Mã đơn hàng:</span>
                  <span className={cx('info-value')}>
                    #{orderDetails.order_id}
                  </span>
                </div>
              )}

              {paymentInfo.amount > 0 && (
                <div className={cx('info-item')}>
                  <span className={cx('info-label')}>Số tiền:</span>
                  <span className={cx('info-value', 'amount')}>
                    {paymentInfo.amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}

              <div className={cx('info-item')}>
                <span className={cx('info-label')}>Thời gian:</span>
                <span className={cx('info-value')}>
                  <FontAwesomeIcon icon={faClock} />
                  {new Date().toLocaleString('vi-VN')}
                </span>
              </div>

              <div className={cx('info-item')}>
                <span className={cx('info-label')}>Trạng thái:</span>
                <span
                  className={cx('info-value', 'status', paymentInfo.status)}
                >
                  {paymentInfo.status === 'success' && 'Thành công'}
                  {paymentInfo.status === 'failed' && 'Thất bại'}
                  {paymentInfo.status === 'error' && 'Lỗi'}
                </span>
              </div>
            </div>

            {/* Hiển thị chi tiết lỗi nếu có */}
            {paymentInfo.status === 'failed' && paymentInfo.code && (
              <div className={cx('error-details')}>
                <h4 className={cx('error-title')}>Chi tiết lỗi:</h4>
                <p className={cx('error-message')}>
                  <strong>Mã lỗi:</strong> {paymentInfo.code}
                </p>
                <p className={cx('error-description')}>
                  {getVNPayErrorMessage(paymentInfo.code)}
                </p>
              </div>
            )}
          </div>

          {/* Thông tin đơn hàng (chỉ hiển thị khi thanh toán thành công) */}
          {paymentInfo.status === 'success' && orderDetails && (
            <div className={cx('order-info')}>
              <h3 className={cx('section-title')}>
                <FontAwesomeIcon icon={faShoppingBag} />
                Thông tin đơn hàng
              </h3>

              <div className={cx('success-message')}>
                <FontAwesomeIcon icon={faCheckCircle} />
                <p>
                  Đơn hàng #{orderDetails.order_id} đã được xác nhận và sẽ được
                  xử lý trong thời gian sớm nhất.
                </p>
              </div>

              <div className={cx('next-steps')}>
                <h4 className={cx('steps-title')}>Các bước tiếp theo:</h4>
                <ul className={cx('steps-list')}>
                  <li>✓ Đơn hàng đã được xác nhận thanh toán</li>
                  <li>📦 Chúng tôi sẽ chuẩn bị và đóng gói sản phẩm</li>
                  <li>🚚 Giao hàng trong vòng 2-3 ngày làm việc</li>
                  <li>📧 Thông tin chi tiết sẽ được gửi qua email</li>
                </ul>
              </div>
            </div>
          )}

          {/* Hành động */}
          <div className={cx('actions-section')}>
            {paymentInfo.status === 'success' ? (
              <>
                <button
                  className={cx('action-btn', 'primary')}
                  onClick={() => navigate(`/orders/${orderDetails.order_id}`)} // Sửa lại đường dẫn
                >
                  <FontAwesomeIcon icon={faReceipt} />
                  Xem đơn hàng của tôi
                </button>
                <button
                  className={cx('action-btn', 'secondary')}
                  onClick={() => navigate('/products')}
                >
                  <FontAwesomeIcon icon={faShoppingBag} />
                  Tiếp tục mua sắm
                </button>
              </>
            ) : (
              <>
                <button
                  className={cx('action-btn', 'primary')}
                  onClick={() => navigate('/cart')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Quay lại giỏ hàng
                </button>
                <button
                  className={cx('action-btn', 'secondary')}
                  onClick={() => navigate('/products')}
                >
                  <FontAwesomeIcon icon={faShoppingBag} />
                  Tiếp tục mua sắm
                </button>
              </>
            )}

            <button
              className={cx('action-btn', 'tertiary')}
              onClick={() => navigate('/')}
            >
              <FontAwesomeIcon icon={faHome} />
              Về trang chủ
            </button>
          </div>

          {/* Thông tin hỗ trợ */}
          <div className={cx('support-section')}>
            <p className={cx('support-text')}>
              Cần hỗ trợ? Liên hệ với chúng tôi qua:
            </p>
            <div className={cx('support-contacts')}>
              <span className={cx('support-item')}>📞 Hotline: 1900-xxxx</span>
              <span className={cx('support-item')}>
                ✉️ Email: support@example.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentResult;
