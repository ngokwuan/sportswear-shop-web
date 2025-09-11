import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faShareNodes,
  faMinus,
  faPlus,
  faStar,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import axios from '../../setup/axios';
import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';
import { formatCurrency } from '../../utils/formatCurrency';
import { UserContext } from '../../context/UserContext';
import { toast } from 'react-toastify';
const cx = classNames.bind(styles);

function ProductDetail() {
  const { slugAndId } = useParams();
  const id = slugAndId.split('_').pop();
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 3,
    minutes: 40,
    seconds: 12,
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/products/${id}`);

        if (response.data && response.data.success) {
          const productData = response.data.data;
          setProduct(productData);

          // Set default selections
          if (productData.size) {
            setSelectedSize(productData.size);
          }
          if (productData.color) {
            setSelectedColor(productData.color);
          }

          if (typeof productData.images === 'string') {
            try {
              productData.images = JSON.parse(productData.images);
            } catch (err) {
              console.log(err);
              productData.images = [productData.featured_image];
            }
          }
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    if (!user) return;

    try {
      setIsAddingToCart(true);

      const response = await axios.post('/cart/add', {
        product_id: product.id,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
      });

      if (response.data.success) {
        // Dispatch event to update cart counter in header
        window.dispatchEvent(
          new CustomEvent('cartUpdated', {
            detail: { action: 'add', quantity: quantity },
          })
        );

        // Show success message
        toast.success('Đã thêm sản phẩm vào giỏ hàng!');
      } else {
        throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);

      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
      } else if (error.response?.status === 409) {
        toast.error('Sản phẩm đã có trong giỏ hàng!');
      } else {
        toast.error(
          error.response?.data?.message ||
            'Không thể thêm sản phẩm vào giỏ hàng'
        );
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={cx('star', { filled: i < rating })}
      />
    ));
  };

  if (loading) {
    return (
      <div className={cx('loading')}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx('error')}>
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className={cx('back-btn')}>
          Quay lại
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={cx('not-found')}>
        <h2>Không tìm thấy sản phẩm</h2>
        <button onClick={() => navigate('/')} className={cx('home-btn')}>
          Về trang chủ
        </button>
      </div>
    );
  }

  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  // Ensure images is an array
  const productImages = Array.isArray(product.images)
    ? product.images
    : product.featured_image
    ? [product.featured_image]
    : [];

  // Available sizes and colors (you might want to fetch these from a separate endpoint)
  const availableSizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const availableColors = product.colors || ['Black', 'White', 'Gray'];

  return (
    <div className={cx('product-detail')}>
      <div className={cx('product-container')}>
        {/* Product Images */}
        <div className={cx('product-images')}>
          <div className={cx('main-image')}>
            {discountPercent > 0 && (
              <span className={cx('discount-badge')}>-{discountPercent}%</span>
            )}
            <img
              src={
                productImages[selectedImage] ||
                product.featured_image ||
                '/placeholder-image.jpg'
              }
              alt={product.name}
              onError={(e) => {
                e.target.src =
                  'https://via.placeholder.com/500x500/f0f0f0/666?text=Product+Image';
              }}
            />
          </div>
          {productImages.length > 1 && (
            <div className={cx('thumbnail-list')}>
              {productImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={cx('thumbnail', {
                    active: selectedImage === index,
                  })}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/80x80/f0f0f0/666?text=No+Image';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={cx('product-info')}>
          <div className={cx('product-category')}>
            {product.category?.name || product.brand || 'PRODUCT'}
          </div>
          <h1 className={cx('product-title')}>{product.name}</h1>

          <div className={cx('product-price')}>
            <span className={cx('current-price')}>
              {formatCurrency(product.sale_price) ||
                formatCurrency(product.price)}
            </span>
            {product.sale_price && (
              <span className={cx('old-price')}>
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <p className={cx('product-description')}>
            {product.description || 'No description available.'}
          </p>

          {/* Countdown */}
          <div className={cx('countdown')}>
            <div className={cx('countdown-item')}>
              <span className={cx('countdown-number')}>
                {String(countdown.days).padStart(2, '0')}
              </span>
              <span className={cx('countdown-label')}>Days</span>
            </div>
            <span className={cx('separator')}>:</span>
            <div className={cx('countdown-item')}>
              <span className={cx('countdown-number')}>
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className={cx('countdown-label')}>Hours</span>
            </div>
            <span className={cx('separator')}>:</span>
            <div className={cx('countdown-item')}>
              <span className={cx('countdown-number')}>
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className={cx('countdown-label')}>Minutes</span>
            </div>
            <span className={cx('separator')}>:</span>
            <div className={cx('countdown-item')}>
              <span className={cx('countdown-number')}>
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className={cx('countdown-label')}>Seconds</span>
            </div>
          </div>

          {/* Product Options */}
          <div className={cx('product-options')}>
            {availableSizes.length > 0 && (
              <div className={cx('option-group')}>
                <label className={cx('option-label')}>SIZE</label>
                <div className={cx('size-options')}>
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      className={cx('size-option', {
                        active: selectedSize === size,
                      })}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableColors.length > 0 && (
              <div className={cx('option-group')}>
                <label className={cx('option-label')}>COLOR</label>
                <div className={cx('color-options')}>
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      className={cx('color-option', {
                        active: selectedColor === color,
                      })}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className={cx('quantity-section')}>
            <div className={cx('quantity-control')}>
              <button
                className={cx('quantity-btn')}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className={cx('quantity-input')}
                min="1"
                max={product.stock_quantity || 999}
              />
              <button
                className={cx('quantity-btn')}
                onClick={() =>
                  setQuantity(
                    Math.min(product.stock_quantity || 999, quantity + 1)
                  )
                }
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            <button
              className={cx('add-to-cart-btn', { adding: isAddingToCart })}
              onClick={handleAddToCart}
              disabled={
                isAddingToCart ||
                (product.stock_quantity && product.stock_quantity < 1)
              }
            >
              {isAddingToCart ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  ADDING...
                </>
              ) : product.stock_quantity && product.stock_quantity < 1 ? (
                'OUT OF STOCK'
              ) : (
                'ADD TO CART'
              )}
            </button>
          </div>

          {/* Stock Info */}
          {product.stock_quantity !== undefined && (
            <div className={cx('stock-info')}>
              {product.stock_quantity > 0 ? (
                <span className={cx('in-stock')}>
                  ✓ In stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className={cx('out-of-stock')}>✗ Out of stock</span>
              )}
            </div>
          )}

          {/* Product Actions */}
          <div className={cx('product-actions')}>
            <button className={cx('action-btn')} title="Add to Wishlist">
              <FontAwesomeIcon icon={faHeart} />
            </button>
            <button className={cx('action-btn')} title="Share">
              <FontAwesomeIcon icon={faShareNodes} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className={cx('product-tabs')}>
        <div className={cx('tab-list')}>
          <button
            className={cx('tab-item', { active: activeTab === 'description' })}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={cx('tab-item', {
              active: activeTab === 'specifications',
            })}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button
            className={cx('tab-item', { active: activeTab === 'shipping' })}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping
          </button>
          <button
            className={cx('tab-item', { active: activeTab === 'reviews' })}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        <div className={cx('tab-content')}>
          {activeTab === 'description' && (
            <div>
              <p>
                {product.description || 'No detailed description available.'}
              </p>

              {(product.brand || product.material || product.style) && (
                <div className={cx('product-specs')}>
                  {product.brand && (
                    <div className={cx('spec-row')}>
                      <span>Brand</span>
                      <span>{product.brand}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className={cx('spec-row')}>
                      <span>Material</span>
                      <span>{product.material}</span>
                    </div>
                  )}
                  {product.style && (
                    <div className={cx('spec-row')}>
                      <span>Style</span>
                      <span>{product.style}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className={cx('product-specs')}>
              {product.size && (
                <div className={cx('spec-row')}>
                  <span>Size</span>
                  <span>{product.size}</span>
                </div>
              )}
              {product.color && (
                <div className={cx('spec-row')}>
                  <span>Color</span>
                  <span>{product.color}</span>
                </div>
              )}
              {product.brand && (
                <div className={cx('spec-row')}>
                  <span>Brand</span>
                  <span>{product.brand}</span>
                </div>
              )}
              <div className={cx('spec-row')}>
                <span>Availability</span>
                <span>
                  {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div>
              <p>
                Free shipping on orders over $50. Standard delivery takes 3-5
                business days.
              </p>
              <ul>
                <li>Free standard shipping (3-5 business days)</li>
                <li>Express shipping available (1-2 business days) - $9.99</li>
                <li>International shipping available</li>
                <li>30-day return policy</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className={cx('reviews-summary')}>
                <div className={cx('rating-summary')}>
                  <span className={cx('average-rating')}>
                    {product.star || 0}/5
                  </span>
                  <div className={cx('stars')}>
                    {renderStars(product.star || 0)}
                  </div>
                </div>
              </div>
              <p>Customer reviews will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
