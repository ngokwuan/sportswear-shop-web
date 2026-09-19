import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCreditCard,
  faMoneyBillWave,
  faShoppingBag,
  faExclamationTriangle,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import { motion, MotionConfig } from 'framer-motion';
import styles from './Checkout.module.scss';
import { UserContext } from '../../../context/UserContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const cx = classNames.bind(styles);

// Cùng "ngôn ngữ chuyển động" với Home/OrderDetail: trượt lên nhẹ và hiện dần
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

const PLACEHOLDER = '/placeholder-image.jpg';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // '' | 'vnpay' | 'cod' - phương thức đang xử lý (chỉ nút được bấm hiện spinner)
  const [processing, setProcessing] = useState('');
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
  const notificationTimer = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // Dọn timer khi rời trang
  useEffect(() => () => clearTimeout(notificationTimer.current), []);

  const showNotification = (type, message, duration = 5000) => {
    // Huỷ timer cũ để thông báo mới không bị tắt sớm
    clearTimeout(notificationTimer.current);
    setNotification({ type, message });
    notificationTimer.current = setTimeout(() => {
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
          'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
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

    if (!orderInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    } else if (orderInfo.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!orderInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else {
      const cleanPhone = orderInfo.phone.replace(/\s/g, '');
      if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
        newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
      }
    }

    if (!orderInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

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

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

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

  const createOrder = async (paymentMethod = 'vnpay') => {
    try {
      if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const validItems = cartItems.filter(
        (item) =>
          item.product &&
          item.product.id &&
          item.quantity > 0 &&
          (item.product.price || item.product.sale_price),
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
          // include selected size (nullable)
          size: item.size || null,
        })),
        shipping_address: orderInfo.address.trim(),
        phone: orderInfo.phone.replace(/\s/g, ''),
        email: orderInfo.email.toLowerCase().trim(),
        name: orderInfo.fullName.trim(),
        payment_method: paymentMethod,
      };

      const response = await axios.post('/orders/create', orderData);

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
        throw new Error(
          errorData.message || `Lỗi server: ${error.response.status}`,
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

      setProcessing('vnpay');

      const total = calculateTotal();
      if (total <= 0) {
        showNotification('error', 'Số tiền thanh toán không hợp lệ');
        return;
      }

      // Bước 1: Tạo đơn hàng
      showNotification('info', 'Đang tạo đơn hàng...', 2000);

      let orderResult;
      try {
        orderResult = await createOrder('vnpay');
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

      showNotification('info', 'Đang tạo liên kết thanh toán...', 2000);

      const response = await axios.post(
        '/payment/vnpay/create-payment-url',
        paymentData,
      );

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
          }),
        );

        // Chuyển hướng đến VNPay
        window.location.href = response.data.data.paymentUrl;
      } else {
        const errorMessage =
          response.data?.message || 'VNPay không trả về URL thanh toán hợp lệ';
        console.error('VNPay payment creation failed:', response.data);
        showNotification(
          'error',
          `Lỗi tạo liên kết thanh toán: ${errorMessage}`,
        );
      }
    } catch (error) {
      console.error('Payment error:', error);

      let errorMessage = 'Có lỗi xảy ra khi tạo thanh toán';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

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
      setProcessing('');
    }
  };

  // Thanh toán tiền mặt khi nhận hàng (COD): chỉ tạo đơn, không qua VNPay
  const handleCashPayment = async () => {
    let redirected = false;
    try {
      if (!validateForm()) {
        showNotification('error', 'Vui lòng điền đầy đủ thông tin giao hàng');
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        showNotification('error', 'Giỏ hàng trống');
        return;
      }

      if (calculateTotal() <= 0) {
        showNotification('error', 'Số tiền thanh toán không hợp lệ');
        return;
      }

      setProcessing('cod');
      showNotification('info', 'Đang tạo đơn hàng...', 2000);

      let orderResult;
      try {
        orderResult = await createOrder('cod');
      } catch (orderError) {
        console.error('Failed to create order:', orderError);
        showNotification('error', `Lỗi tạo đơn hàng: ${orderError.message}`);
        return;
      }

      sessionStorage.removeItem('pending_order');
      showNotification(
        'success',
        'Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.',
        3000,
      );

      // Giữ nút bị khóa trong lúc chờ chuyển trang để tránh tạo trùng đơn
      redirected = true;
      setTimeout(() => navigate(`/orders/${orderResult.order_id}`), 1500);
    } catch (error) {
      console.error('Cash payment error:', error);
      showNotification('error', 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      if (!redirected) setProcessing('');
    }
  };

  const validateCartItems = () => {
    const invalidItems = cartItems.filter(
      (item) =>
        !item.product ||
        !item.product.id ||
        item.quantity <= 0 ||
        (!item.product.price && !item.product.sale_price),
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
    <MotionConfig reducedMotion="user">
      <div className={cx('checkout-page')}>
        <motion.div
          className={cx('checkout-container')}
          initial="hidden"
          animate="visible"
          variants={stagger(0.08)}
        >
          {/* Notification */}
          {notification.message && (
            <motion.div
              className={cx('notification', notification.type)}
              role="status"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE_BURST }}
            >
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
                aria-label="Đóng thông báo"
                onClick={() => setNotification({ type: '', message: '' })}
              >
                ×
              </button>
            </motion.div>
          )}

          <motion.div className={cx('checkout-header')} variants={rise}>
            <button
              className={cx('back-btn')}
              onClick={() => navigate('/cart')}
            >
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
          </motion.div>

          <div className={cx('checkout-content')}>
            <motion.div className={cx('order-form')} variants={rise}>
              <h2>Thông tin giao hàng</h2>

              <div className={cx('form-row')}>
                <div className={cx('form-group')}>
                  <label htmlFor="fullName">
                    Họ và tên <span className={cx('required')}>*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Nhập họ và tên"
                    autoComplete="name"
                    value={orderInfo.fullName}
                    onChange={(e) =>
                      handleInputChange('fullName', e.target.value)
                    }
                    className={errors.fullName ? cx('input-error') : ''}
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
                    autoComplete="tel"
                    value={orderInfo.phone}
                    onChange={(e) => {
                      // Only allow numbers and spaces
                      const value = e.target.value.replace(/[^\d\s]/g, '');
                      handleInputChange('phone', value);
                    }}
                    className={errors.phone ? cx('input-error') : ''}
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
                  autoComplete="email"
                  value={orderInfo.email}
                  onChange={(e) =>
                    handleInputChange('email', e.target.value.toLowerCase())
                  }
                  className={errors.email ? cx('input-error') : ''}
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
                  autoComplete="street-address"
                  value={orderInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={errors.address ? cx('input-error') : ''}
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
            </motion.div>

            <motion.div className={cx('order-summary')} variants={rise}>
              <div className={cx('summary-header')}>
                <h3>Đơn hàng ({cartItems.length} sản phẩm)</h3>
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
                        src={item.product?.featured_image || PLACEHOLDER}
                        alt={item.product?.name}
                        className={cx('item-image')}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null; // tránh lặp vô hạn
                          e.target.src = PLACEHOLDER;
                        }}
                      />
                      <div className={cx('item-details')}>
                        <div className={cx('item-name')}>
                          {item.product?.name}
                        </div>
                        <div className={cx('item-info')}>
                          <span className={cx('size')}>{item?.size}</span>
                          <span className={cx('quantity')}>
                            x{item.quantity}
                          </span>
                          <div className={cx('price-info')}>
                            {hasDiscount && (
                              <span className={cx('original-price')}>
                                {formatCurrency(originalPrice * item.quantity)}
                              </span>
                            )}
                            <span
                              className={cx(
                                'price',
                                hasDiscount ? 'sale-price' : '',
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
                  <button
                    className={cx('payment-btn', 'vnpay-btn')}
                    onClick={handleVnPayment}
                    disabled={Boolean(processing) || cartItems.length === 0}
                  >
                    {processing === 'vnpay' ? (
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

                  <div className={cx('method-divider')}>
                    <span>hoặc</span>
                  </div>

                  <button
                    className={cx('payment-btn', 'cash-btn')}
                    onClick={handleCashPayment}
                    disabled={Boolean(processing) || cartItems.length === 0}
                  >
                    {processing === 'cod' ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                        Thanh toán khi nhận hàng
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
                    Hỗ trợ ví VNPay, thẻ ngân hàng, QR Code hoặc tiền mặt khi
                    nhận hàng
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}

export default Checkout;
