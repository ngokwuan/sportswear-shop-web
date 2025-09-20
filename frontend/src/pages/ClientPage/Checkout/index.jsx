import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCreditCard,
  faUser,
  faShoppingBag,
  faExclamationTriangle,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Checkout.module.scss';
import { UserContext } from '../../../context/UserContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const cx = classNames.bind(styles);

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [orderInfo, setOrderInfo] = useState({
    phone: '',
    email: '',
    address: '',
    fullName: '',
  });

  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [navigate]);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, duration);
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cart');

      if (response.data && Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        setCartItems([]);
        showNotification('error', 'Không thể tải giỏ hàng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      setCartItems([]);

      if (error.response?.status === 401) {
        showNotification(
          'error',
          'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại'
        );
        navigate('/login');
      } else {
        showNotification('error', 'Không thể tải giỏ hàng. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate full name
    if (!orderInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    } else if (orderInfo.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Validate phone
    if (!orderInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else {
      const cleanPhone = orderInfo.phone.replace(/\s/g, '');
      if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
        newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
      }
    }

    // Validate email
    if (!orderInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate address
    if (!orderInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    } else if (orderInfo.address.trim().length < 10) {
      newErrors.address = 'Địa chỉ phải chi tiết hơn (ít nhất 10 ký tự)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setOrderInfo((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Clear notification when user makes changes
    if (notification.message) {
      setNotification({ type: '', message: '' });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.sale_price || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const createOrder = async () => {
    try {
      if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const validItems = cartItems.filter(
        (item) =>
          item.product &&
          item.product.id &&
          item.quantity > 0 &&
          (item.product.price || item.product.sale_price)
      );

      if (validItems.length === 0) {
        throw new Error('Không có sản phẩm hợp lệ trong giỏ hàng');
      }

      const orderData = {
        user_id: user.id,
        items: validItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.sale_price || item.product?.price || 0,
        })),
        shipping_address: orderInfo.address.trim(),
        phone: orderInfo.phone.replace(/\s/g, ''),
        email: orderInfo.email.toLowerCase().trim(),
        name: orderInfo.fullName.trim(),
        payment_method: 'vnpay',
      };

      console.log('Sending order data:', orderData);

      const response = await axios.post('/orders/create', orderData);

      console.log('Create order response:', response.data);

      if (response.data && response.data.success && response.data.data) {
        return {
          order_id: response.data.data.order_id,
          order_number: response.data.data.order_number,
          total_amount: response.data.data.total_amount,
        };
      } else {
        throw new Error(response.data?.message || 'Tạo đơn hàng thất bại');
      }
    } catch (error) {
      console.error('Create order error:', error);

      if (error.response) {
        const errorData = error.response.data;
        console.log('Create order error response:', errorData);
        throw new Error(
          errorData.message || `Lỗi server: ${error.response.status}`
        );
      }

      throw error;
    }
  };
  const handleVnPayment = async () => {
    try {
      if (!validateForm()) {
        showNotification('error', 'Vui lòng điền đầy đủ thông tin giao hàng');
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        showNotification('error', 'Giỏ hàng trống');
        return;
      }

      setProcessing(true);

      const total = calculateTotal();
      if (total <= 0) {
        showNotification('error', 'Số tiền thanh toán không hợp lệ');
        return;
      }

      // Bước 1: Tạo đơn hàng
      showNotification('info', 'Đang tạo đơn hàng...', 2000);

      let orderResult;
      try {
        orderResult = await createOrder();
        console.log('Order created result:', orderResult);
      } catch (orderError) {
        console.error('Failed to create order:', orderError);
        showNotification('error', `Lỗi tạo đơn hàng: ${orderError.message}`);
        return;
      }

      // QUAN TRỌNG: Lấy order_number từ response
      const orderId = orderResult.order_id;
      const orderNumber = orderResult.order_number;

      if (!orderNumber) {
        showNotification('error', 'Không nhận được mã đơn hàng');
        return;
      }

      // Bước 2: Tạo URL thanh toán VNPay
      const paymentData = {
        amount: Math.round(total),
        orderInfo: `Thanh toan don hang #${orderNumber} - ${orderInfo.fullName}`,
        language: 'vn',
        bankCode: '',
        order_number: orderNumber, // TRUYỀN ORDER_NUMBER
      };

      console.log('Creating VNPay payment URL with data:', paymentData);
      showNotification('info', 'Đang tạo liên kết thanh toán...', 2000);

      const response = await axios.post(
        '/payment/vnpay/create-payment-url',
        paymentData
      );

      console.log('VNPay payment response:', response.data);

      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.paymentUrl
      ) {
        showNotification('success', 'Đang chuyển hướng đến VNPay...', 2000);

        // Store order info for return page
        sessionStorage.setItem(
          'pending_order',
          JSON.stringify({
            order_id: orderId,
            order_number: orderNumber,
            amount: total,
          })
        );

        // Chuyển hướng đến VNPay
        window.location.href = response.data.data.paymentUrl;
      } else {
        const errorMessage =
          response.data?.message || 'VNPay không trả về URL thanh toán hợp lệ';
        console.error('VNPay payment creation failed:', response.data);
        showNotification(
          'error',
          `Lỗi tạo liên kết thanh toán: ${errorMessage}`
        );
      }
    } catch (error) {
      console.error('Payment error:', error);

      let errorMessage = 'Có lỗi xảy ra khi tạo thanh toán';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        console.log('Error response:', data);

        if (status === 400) {
          errorMessage = data.message || 'Thông tin thanh toán không hợp lệ';
        } else if (status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn';
          setTimeout(() => navigate('/login'), 2000);
        } else if (status === 500) {
          errorMessage = 'Lỗi server, vui lòng thử lại sau';
        }
      }

      showNotification('error', errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const validateCartItems = () => {
    const invalidItems = cartItems.filter(
      (item) =>
        !item.product ||
        !item.product.id ||
        item.quantity <= 0 ||
        (!item.product.price && !item.product.sale_price)
    );

    return invalidItems.length === 0;
  };

  if (loading) {
    return (
      <div className={cx('checkout-page')}>
        <div className={cx('checkout-container')}>
          <div className={cx('loading')}>
            <FontAwesomeIcon icon={faSpinner} className={cx('spinner')} spin />
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={cx('checkout-page')}>
        <div className={cx('checkout-container')}>
          <div className={cx('empty-state')}>
            <FontAwesomeIcon
              icon={faShoppingBag}
              className={cx('empty-icon')}
            />
            <h2>Giỏ hàng trống</h2>
            <p>Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
            <button
              className={cx('shop-now-btn')}
              onClick={() => navigate('/products')}
            >
              Mua sắm ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!validateCartItems()) {
    return (
      <div className={cx('checkout-page')}>
        <div className={cx('checkout-container')}>
          <div className={cx('error-state')}>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className={cx('error-icon')}
            />
            <h2>Giỏ hàng có lỗi</h2>
            <p>
              Một số sản phẩm trong giỏ hàng không hợp lệ. Vui lòng kiểm tra
              lại.
            </p>
            <button
              className={cx('back-to-cart-btn')}
              onClick={() => navigate('/cart')}
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('checkout-page')}>
      <div className={cx('checkout-container')}>
        {/* Notification */}
        {notification.message && (
          <div className={cx('notification', notification.type)}>
            <FontAwesomeIcon
              icon={
                notification.type === 'success'
                  ? faCheckCircle
                  : notification.type === 'info'
                  ? faSpinner
                  : faTimesCircle
              }
              spin={notification.type === 'info'}
            />
            <span>{notification.message}</span>
            <button
              className={cx('close-notification')}
              onClick={() => setNotification({ type: '', message: '' })}
            >
              ×
            </button>
          </div>
        )}

        <div className={cx('checkout-header')}>
          <button className={cx('back-btn')} onClick={() => navigate('/cart')}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại giỏ hàng
          </button>
          <h1>
            <FontAwesomeIcon icon={faCreditCard} />
            Thanh toán
          </h1>
          <p className={cx('subtitle')}>
            Vui lòng điền thông tin để hoàn tất đơn hàng
          </p>
        </div>

        <div className={cx('checkout-content')}>
          <div className={cx('order-form')}>
            <h2>
              <FontAwesomeIcon icon={faUser} />
              Thông tin giao hàng
            </h2>

            <div className={cx('form-row')}>
              <div className={cx('form-group')}>
                <label htmlFor="fullName">
                  Họ và tên <span className={cx('required')}>*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Nhập họ và tên"
                  value={orderInfo.fullName}
                  onChange={(e) =>
                    handleInputChange('fullName', e.target.value)
                  }
                  className={errors.fullName ? cx('error') : ''}
                  maxLength={50}
                />
                {errors.fullName && (
                  <div className={cx('form-error')}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {errors.fullName}
                  </div>
                )}
              </div>

              <div className={cx('form-group')}>
                <label htmlFor="phone">
                  Số điện thoại <span className={cx('required')}>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Nhập số điện thoại (10-11 số)"
                  value={orderInfo.phone}
                  onChange={(e) => {
                    // Only allow numbers and spaces
                    const value = e.target.value.replace(/[^\d\s]/g, '');
                    handleInputChange('phone', value);
                  }}
                  className={errors.phone ? cx('error') : ''}
                  maxLength={15}
                />
                {errors.phone && (
                  <div className={cx('form-error')}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            <div className={cx('form-group')}>
              <label htmlFor="email">
                Email <span className={cx('required')}>*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="Nhập địa chỉ email"
                value={orderInfo.email}
                onChange={(e) =>
                  handleInputChange('email', e.target.value.toLowerCase())
                }
                className={errors.email ? cx('error') : ''}
                maxLength={100}
              />
              {errors.email && (
                <div className={cx('form-error')}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {errors.email}
                </div>
              )}
            </div>

            <div className={cx('form-group')}>
              <label htmlFor="address">
                Địa chỉ giao hàng <span className={cx('required')}>*</span>
              </label>
              <textarea
                id="address"
                placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành)"
                value={orderInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? cx('error') : ''}
                rows={3}
                maxLength={200}
              />
              {errors.address && (
                <div className={cx('form-error')}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {errors.address}
                </div>
              )}
            </div>
          </div>

          <div className={cx('order-summary')}>
            <div className={cx('summary-header')}>
              <h3>
                <FontAwesomeIcon icon={faShoppingBag} />
                Đơn hàng ({cartItems.length} sản phẩm)
              </h3>
            </div>

            <div className={cx('order-items')}>
              {cartItems.map((item) => {
                const currentPrice =
                  item.product?.sale_price || item.product?.price || 0;
                const originalPrice = item.product?.price || 0;
                const hasDiscount =
                  item.product?.sale_price &&
                  item.product.sale_price < originalPrice;

                return (
                  <div key={item.id} className={cx('order-item')}>
                    <img
                      src={item.product?.featured_image}
                      alt={item.product?.name}
                      className={cx('item-image')}
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/60x60/f0f0f0/666?text=Product';
                      }}
                    />
                    <div className={cx('item-details')}>
                      <div className={cx('item-name')}>
                        {item.product?.name}
                      </div>
                      <div className={cx('item-info')}>
                        <span className={cx('size')}>{item.product?.size}</span>
                        <span className={cx('quantity')}>x{item.quantity}</span>
                        <div className={cx('price-info')}>
                          {hasDiscount && (
                            <span className={cx('original-price')}>
                              {formatCurrency(originalPrice * item.quantity)}
                            </span>
                          )}
                          <span
                            className={cx(
                              'price',
                              hasDiscount ? 'sale-price' : ''
                            )}
                          >
                            {formatCurrency(currentPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={cx('summary-calculations')}>
              <div className={cx('summary-row')}>
                <span>Tạm tính:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              <div className={cx('summary-row')}>
                <span>Phí vận chuyển:</span>
                <span className={cx('shipping-free')}>Miễn phí</span>
              </div>
              <div className={cx('summary-row')}>
                <span>Thuế:</span>
                <span>0.00đ</span>
              </div>
              <div className={cx('summary-row', 'total-row')}>
                <span>Tổng cộng:</span>
                <span className={cx('total-amount')}>
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            <div className={cx('payment-section')}>
              <div className={cx('payment-methods')}>
                <div className={cx('payment-method')}>
                  <button
                    className={cx('payment-btn', 'vnpay-btn')}
                    onClick={handleVnPayment}
                    disabled={processing || cartItems.length === 0}
                  >
                    {processing ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCreditCard} />
                        Thanh toán qua VNPay
                      </>
                    )}
                  </button>
                </div>

                <div className={cx('payment-info')}>
                  <p className={cx('secure-info')}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Thanh toán an toàn và bảo mật
                  </p>
                  <p className={cx('support-info')}>
                    Hỗ trợ thanh toán qua ví VNPay, thẻ ngân hàng, QR Code
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
