import React, { useState, useEffect, useContext } from 'react';
import axios from '../../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faMinus,
  faPlus,
  faShoppingCart,
  faArrowLeft,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, MotionConfig } from 'framer-motion';
import { UserContext } from '../../../context/UserContext';
import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import { formatCurrency } from '../../../utils/formatCurrency';
const cx = classNames.bind(styles);

// Cùng "ngôn ngữ chuyển động" với Home/OrderDetail/Checkout: trượt lên nhẹ và hiện dần
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

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const { user, loading: userLoading } = useContext(UserContext);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    fetchCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading, navigate]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cart');
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      await axios.patch('/cart/update', {
        cartId: cartId,
        quantity: newQuantity,
      });

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item,
        ),
      );

      window.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: { action: 'update' },
        }),
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      toast.error('Không thể cập nhật số lượng sản phẩm');
    } finally {
      setUpdating(false);
    }
  };

  const removeFromCart = async (cartId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      return;
    }

    try {
      setUpdating(true);
      await axios.delete(`/cart/remove/${cartId}`);

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartId),
      );

      window.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: { action: 'remove' },
        }),
      );
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      toast.error('Không thể xóa sản phẩm khỏi giỏ hàng');
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      return;
    }

    try {
      setUpdating(true);
      const response = await axios.delete('/cart/clear');

      if (response.data.success) {
        setCartItems([]);
        window.dispatchEvent(
          new CustomEvent('cartUpdated', {
            detail: { action: 'clear' },
          }),
        );
        toast.success(response.data.message || 'Đã xóa toàn bộ giỏ hàng');
      }
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      toast.error('Không thể xóa giỏ hàng');
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.sale_price || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const calculateSubtotal = (item) => {
    const price = item.product?.sale_price || item.product?.price || 0;
    return price * item.quantity;
  };

  if (userLoading || loading) {
    return (
      <div className={cx('cart-page')}>
        <div className={cx('loading')}>
          <FontAwesomeIcon icon={faSpinner} className={cx('spinner')} spin />
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={cx('cart-page')}>
        <motion.div
          className={cx('cart-container')}
          initial="hidden"
          animate="visible"
          variants={stagger(0.08)}
        >
          <motion.div className={cx('cart-header')} variants={rise}>
            <div className={cx('header-main')}>
              <button
                className={cx('back-btn')}
                onClick={() => navigate('/products')}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Tiếp tục mua sắm
              </button>
              <h1>
                <FontAwesomeIcon icon={faShoppingCart} />
                Giỏ hàng của bạn ({cartItems.length})
              </h1>
            </div>

            {cartItems.length > 0 && (
              <button
                className={cx('clear-btn')}
                onClick={clearCart}
                disabled={updating}
              >
                <FontAwesomeIcon icon={faTrash} />
                Xóa toàn bộ
              </button>
            )}
          </motion.div>

          {cartItems.length === 0 ? (
            <motion.div className={cx('empty-cart')} variants={rise}>
              <FontAwesomeIcon
                icon={faShoppingCart}
                className={cx('empty-icon')}
              />
              <h2>Giỏ hàng của bạn đang trống</h2>
              <p>Hãy thêm một số sản phẩm để bắt đầu mua sắm!</p>
              <button
                className={cx('shop-now-btn')}
                onClick={() => navigate('/products')}
              >
                Mua sắm ngay
              </button>
            </motion.div>
          ) : (
            <div className={cx('cart-content')}>
              <motion.div className={cx('cart-items')} variants={rise}>
                <div className={cx('cart-table-header')}>
                  <div className={cx('col-product')}>Sản phẩm</div>
                  <div className={cx('col-price')}>Giá</div>
                  <div className={cx('col-quantity')}>Số lượng</div>
                  <div className={cx('col-total')}>Tổng</div>
                  <div className={cx('col-action')}>Thao tác</div>
                </div>

                {cartItems.map((item) => {
                  const currentPrice =
                    item.product?.sale_price || item.product?.price || 0;
                  const oldPrice = item.product?.sale_price
                    ? item.product?.price
                    : null;

                  return (
                    <div key={item.id} className={cx('cart-item-slot')}>
                      <div className={cx('cart-item')}>
                        <div className={cx('col-product')}>
                          <div className={cx('product-info')}>
                            <img
                              src={item.product?.featured_image || PLACEHOLDER}
                              alt={item.product?.name}
                              className={cx('product-image')}
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null; // tránh lặp vô hạn
                                e.target.src = PLACEHOLDER;
                              }}
                            />
                            <div className={cx('product-details')}>
                              <h3>{item.product?.name}</h3>
                              <div className={cx('product-type')}>
                                {/* show selected size (item.size) first; fallback to product.size list */}
                                {item.size ? (
                                  <span className={cx('size')}>
                                    Size {item.size}
                                  </span>
                                ) : item.product?.size ? (
                                  <span className={cx('size')}>
                                    {Array.isArray(item.product.size)
                                      ? item.product.size.join(', ')
                                      : item.product.size}
                                  </span>
                                ) : null}
                                {item.product?.brand && (
                                  <span className={cx('brand')}>
                                    {item.product.brand}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={cx('col-price')} data-label="Giá">
                          <div className={cx('price-info')}>
                            <span className={cx('current-price')}>
                              {formatCurrency(currentPrice)}
                            </span>
                            {oldPrice && (
                              <span className={cx('old-price')}>
                                {formatCurrency(oldPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className={cx('col-quantity')}
                          data-label="Số lượng"
                        >
                          <div className={cx('quantity-controls')}>
                            <button
                              className={cx('quantity-btn')}
                              aria-label="Giảm số lượng"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={updating || item.quantity <= 1}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <span className={cx('quantity')}>
                              {item.quantity}
                            </span>
                            <button
                              className={cx('quantity-btn')}
                              aria-label="Tăng số lượng"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={updating}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </div>
                        </div>

                        <div className={cx('col-total')} data-label="Tổng">
                          <span className={cx('subtotal')}>
                            {formatCurrency(calculateSubtotal(item))}
                          </span>
                        </div>

                        <div className={cx('col-action')} data-label="Xóa">
                          <button
                            className={cx('remove-btn')}
                            onClick={() => removeFromCart(item.id)}
                            disabled={updating}
                            title="Xóa sản phẩm"
                            aria-label="Xóa sản phẩm"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              <motion.div className={cx('cart-summary')} variants={rise}>
                <div className={cx('summary-card')}>
                  <h3>Tổng kết đơn hàng</h3>
                  <div className={cx('summary-row')}>
                    <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className={cx('summary-row')}>
                    <span>Phí vận chuyển:</span>
                    <span className={cx('shipping-free')}>Miễn phí</span>
                  </div>
                  <hr />
                  <div className={cx('summary-row', 'total-row')}>
                    <strong>Tổng cộng:</strong>
                    <strong>{formatCurrency(calculateTotal())}</strong>
                  </div>
                  {/* Link thật, không lồng <button> trong <Link> */}
                  <Link
                    to="/checkout"
                    className={cx('checkout-btn')}
                    aria-disabled={updating}
                    onClick={(e) => updating && e.preventDefault()}
                  >
                    Tiến hành thanh toán
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
}

export default Cart;
