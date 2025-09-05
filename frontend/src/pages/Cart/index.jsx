import React, { useState, useEffect } from 'react';
import axios from '../../setup/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faMinus,
  faPlus,
  faShoppingCart,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Cart.module.scss';

const cx = classNames.bind(styles);

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const user = localStorage.getItem('user');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      await axios.put('/cart/update', {
        cart_id: cartId,
        quantity: newQuantity,
      });

      // Update local state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      alert('Không thể cập nhật số lượng sản phẩm');
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

      // Update local state
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartId)
      );
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      alert('Không thể xóa sản phẩm khỏi giỏ hàng');
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
        // Hiển thị thông báo thành công
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
      alert('Không thể xóa giỏ hàng');
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

  if (loading) {
    return (
      <div className={cx('loading')}>
        <div className={cx('spinner')}></div>
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className={cx('cart-page')}>
      <div className={cx('cart-container')}>
        <div className={cx('cart-header')}>
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
        </div>

        {cartItems.length === 0 ? (
          <div className={cx('empty-cart')}>
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
          </div>
        ) : (
          <div className={cx('cart-content')}>
            <div className={cx('cart-items')}>
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
                  <div key={item.id} className={cx('cart-item')}>
                    <div className={cx('col-product')}>
                      <div className={cx('product-info')}>
                        <img
                          src={item.product?.featured_image}
                          alt={item.product?.name}
                          className={cx('product-image')}
                          onError={(e) => {
                            e.target.src =
                              'https://via.placeholder.com/80x80/f0f0f0/666?text=Product';
                          }}
                        />
                        <div className={cx('product-details')}>
                          <h3>{item.product?.name}</h3>
                          <div className={cx('product-type')}>
                            {item.product?.size && (
                              <span className={cx('size')}>
                                {item.product.size}
                              </span>
                            )}
                            {item.product?.brand && (
                              <span className={cx('brand')}>
                                {item.product.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={cx('col-price')}>
                      <div className={cx('price-info')}>
                        <span className={cx('current-price')}>
                          {currentPrice}đ
                        </span>
                        {oldPrice && (
                          <span className={cx('old-price')}>{oldPrice}đ</span>
                        )}
                      </div>
                    </div>

                    <div className={cx('col-quantity')}>
                      <div className={cx('quantity-controls')}>
                        <button
                          className={cx('quantity-btn')}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={updating || item.quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className={cx('quantity')}>{item.quantity}</span>
                        <button
                          className={cx('quantity-btn')}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={updating}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>

                    <div className={cx('col-total')}>
                      <span className={cx('subtotal')}>
                        {calculateSubtotal(item).toFixed(2)}đ
                      </span>
                    </div>

                    <div className={cx('col-action')}>
                      <button
                        className={cx('remove-btn')}
                        onClick={() => removeFromCart(item.id)}
                        disabled={updating}
                        title="Xóa sản phẩm"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={cx('cart-summary')}>
              <div className={cx('summary-card')}>
                <h3>Tổng kết đơn hàng</h3>
                <div className={cx('summary-row')}>
                  <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                  <span>{calculateTotal().toFixed(2)}đ</span>
                </div>
                <div className={cx('summary-row')}>
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <hr />
                <div className={cx('summary-row', 'total-row')}>
                  <strong>Tổng cộng:</strong>
                  <strong>{calculateTotal().toFixed(2)}đ</strong>
                </div>
                <Link to="/checkout">
                  <button className={cx('checkout-btn')} disabled={updating}>
                    Tiến hành thanh toán
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
