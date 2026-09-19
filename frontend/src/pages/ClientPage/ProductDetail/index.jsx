import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faShareNodes,
  faMinus,
  faPlus,
  faStar,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import axios from '../../../setup/axios';
import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';
import { formatCurrency } from '../../../utils/formatCurrency';
import { UserContext } from '../../../context/UserContext';
import { toast } from 'react-toastify';
const cx = classNames.bind(styles);

/* Cùng "ngôn ngữ chuyển động" với Home: lao vào từ vạch xuất phát bên trái */
const EASE_BURST = [0.16, 1, 0.3, 1];

const stagger = (gap = 0.08) => ({
  visible: { transition: { staggerChildren: gap } },
});

// motion ở lớp ngoài, các phần tử skew (CSS) nằm ở lớp trong để không bị ghi đè
const dash = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: EASE_BURST },
  },
};

const PLACEHOLDER_IMG =
  'https://via.placeholder.com/500x500/f0f0f0/666?text=Product+Image';

// Trang nhập thông tin & thanh toán - đổi lại nếu route của bạn khác
const CHECKOUT_PATH = '/checkout';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'reviews', label: 'Reviews' },
];

function ProductDetail() {
  const { slugAndId } = useParams();
  const id = slugAndId.split('_').pop();
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 3,
    minutes: 40,
    seconds: 12,
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // size selection
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);

  // Helper function to get image URL
  const getImageUrl = (imageData) => {
    if (!imageData) return PLACEHOLDER_IMG;

    // If it's already a string URL
    if (typeof imageData === 'string') return imageData;

    // If it's an object with url property
    if (typeof imageData === 'object' && imageData.url) return imageData.url;

    // Fallback
    return PLACEHOLDER_IMG;
  };

  // Helper function to process product images
  const processProductImages = (productData) => {
    const images = [];

    // Add featured image first
    if (productData.featured_image) {
      images.push(getImageUrl(productData.featured_image));
    }

    // Process additional images
    if (productData.images) {
      let additionalImages = [];

      // If images is a string, try to parse it
      if (typeof productData.images === 'string') {
        try {
          additionalImages = JSON.parse(productData.images);
        } catch (err) {
          console.log('Could not parse images string:', err);
          additionalImages = [];
        }
      } else if (Array.isArray(productData.images)) {
        additionalImages = productData.images;
      }

      // Add each additional image
      if (Array.isArray(additionalImages)) {
        additionalImages.forEach((img) => {
          const imgUrl = getImageUrl(img);
          // Avoid duplicates
          if (!images.includes(imgUrl)) {
            images.push(imgUrl);
          }
        });
      }
    }

    // If no images at all, add placeholder
    if (images.length === 0) {
      images.push(PLACEHOLDER_IMG);
    }

    return images;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/products/${id}`);

        if (response.data && response.data.success) {
          const productData = response.data.data;
          setProduct(productData);
          // init sizes when product loads
          let parsedSizes = [];
          if (Array.isArray(productData.size)) parsedSizes = productData.size;
          else if (
            typeof productData.size === 'string' &&
            productData.size.trim() !== ''
          ) {
            try {
              const p = JSON.parse(productData.size);
              parsedSizes = Array.isArray(p) ? p : [String(p)];
            } catch {
              parsedSizes = productData.size
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            }
          }
          setSizes(parsedSizes);
          // Do not auto-select any size — require user to choose
          setSelectedSize(null);
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
    if (isAddingToCart || isBuyingNow) return;
    if (!user) return;
    // require size selection if sizes available
    if (sizes.length > 0 && !selectedSize) {
      toast.warn('Vui lòng chọn kích thước');
      return;
    }

    try {
      setIsAddingToCart(true);

      const response = await axios.post('/cart/add', {
        productId: id,
        quantity: quantity,
        size: selectedSize || null,
      });

      if (response.data.success) {
        window.dispatchEvent(
          new CustomEvent('cartUpdated', {
            detail: { action: 'add', quantity: quantity },
          }),
        );

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
            'Không thể thêm sản phẩm vào giỏ hàng',
        );
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Mua ngay: bắt buộc đăng nhập + chọn size, thêm vào giỏ rồi sang trang thanh toán
  const handleBuyNow = async () => {
    if (isAddingToCart || isBuyingNow) return;

    if (!user) {
      toast.info('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      toast.warn('Vui lòng chọn kích thước');
      return;
    }

    try {
      setIsBuyingNow(true);

      const response = await axios.post('/cart/add', {
        productId: id,
        quantity: quantity,
        size: selectedSize || null,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng');
      }

      window.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: { action: 'add', quantity: quantity },
        }),
      );

      navigate(CHECKOUT_PATH);
    } catch (error) {
      console.error('Error buying now:', error);

      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
      } else if (error.response?.status === 409) {
        // Sản phẩm đã có trong giỏ => đi thẳng tới thanh toán
        navigate(CHECKOUT_PATH);
      } else {
        toast.error(
          error.response?.data?.message || 'Không thể tiến hành mua hàng',
        );
      }
    } finally {
      setIsBuyingNow(false);
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
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={cx('back-btn')}
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={cx('not-found')}>
        <h2>Không tìm thấy sản phẩm</h2>
        <button
          type="button"
          onClick={() => navigate('/')}
          className={cx('home-btn')}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  // Process product images using the new helper function
  const productImages = processProductImages(product);

  // Correct display price: prefer sale_price when present (not null/undefined), otherwise use price
  const displayPrice =
    product.sale_price != null ? product.sale_price : product.price;
  const displayPriceFormatted = formatCurrency(displayPrice);

  // Hết hàng khi có số lượng tồn và nhỏ hơn 1 (cách viết cũ luôn false khi stock = 0)
  const outOfStock =
    product.stock_quantity != null && Number(product.stock_quantity) < 1;

  const countdownUnits = [
    { key: 'days', label: 'Days' },
    { key: 'hours', label: 'Hours' },
    { key: 'minutes', label: 'Minutes' },
    { key: 'seconds', label: 'Seconds' },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className={cx('product-detail')}>
        <div className={cx('product-shell')}>
          <div className={cx('product-container')}>
            {/* Product Images */}
            <motion.div
              className={cx('product-images')}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: EASE_BURST }}
            >
              <div className={cx('main-image')}>
                {discountPercent > 0 && (
                  <span className={cx('discount-badge')}>
                    -{discountPercent}%
                  </span>
                )}
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMG;
                  }}
                />
              </div>
              {productImages.length > 1 && (
                <div className={cx('thumbnail-list')}>
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`View image ${index + 1}`}
                      aria-pressed={selectedImage === index}
                      className={cx('thumbnail', {
                        active: selectedImage === index,
                      })}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image}
                        alt=""
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/80x80/f0f0f0/666?text=No+Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              className={cx('product-info')}
              initial="hidden"
              animate="visible"
              variants={stagger(0.08)}
            >
              <motion.div
                className={cx('product-category-slot')}
                variants={dash}
              >
                <div className={cx('product-category')}>
                  {product.category?.name || product.brand || 'PRODUCT'}
                </div>
              </motion.div>

              <motion.h1 className={cx('product-title')} variants={dash}>
                {product.name}
              </motion.h1>

              <motion.div className={cx('product-price')} variants={dash}>
                <span className={cx('current-price')}>
                  {displayPriceFormatted}
                </span>
                {discountPercent > 0 && (
                  <span className={cx('old-price')}>
                    {formatCurrency(product.price)}
                  </span>
                )}
              </motion.div>

              <motion.p className={cx('product-description')} variants={dash}>
                {product.description || 'No description available.'}
              </motion.p>

              {/* Countdown: show only when there is a sale */}
              {discountPercent > 0 && (
                <motion.div variants={dash}>
                  <div className={cx('countdown')}>
                    <div className={cx('countdown-inner')}>
                      <span className={cx('countdown-heading')}>
                        Sale ends in
                      </span>
                      <div className={cx('countdown-clock')}>
                        {countdownUnits.map(({ key, label }, i) => (
                          <React.Fragment key={key}>
                            {i > 0 && (
                              <span className={cx('separator')}>:</span>
                            )}
                            <div className={cx('countdown-item')}>
                              <span className={cx('countdown-number')}>
                                {String(countdown[key]).padStart(2, '0')}
                              </span>
                              <span className={cx('countdown-label')}>
                                {label}
                              </span>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Product Options */}
              <motion.div className={cx('product-options')} variants={dash}>
                <div className={cx('option-group')}>
                  <span className={cx('option-label')} id="size-label">
                    SIZE
                  </span>
                  <div
                    className={cx('size-options')}
                    role="group"
                    aria-labelledby="size-label"
                  >
                    {sizes.length === 0 ? (
                      <div className={cx('no-size')}>One size</div>
                    ) : (
                      sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={selectedSize === s}
                          className={cx('size-btn', {
                            selected: selectedSize === s,
                          })}
                          onClick={() => setSelectedSize(s)}
                        >
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {product.color && (
                  <div className={cx('option-group')}>
                    <span className={cx('option-label')}>COLOR</span>
                    <div className={cx('color-tag')}>{product.color}</div>
                  </div>
                )}
              </motion.div>

              {/* Quantity and Add to Cart */}
              <motion.div className={cx('quantity-section')} variants={dash}>
                <div className={cx('quantity-control')}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className={cx('quantity-btn')}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <input
                    type="number"
                    aria-label="Quantity"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className={cx('quantity-input')}
                    min="1"
                    max={product.stock_quantity || 999}
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className={cx('quantity-btn')}
                    onClick={() =>
                      setQuantity(
                        Math.min(product.stock_quantity || 999, quantity + 1),
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>

                <div className={cx('purchase-actions')}>
                  <button
                    type="button"
                    className={cx('add-to-cart-btn', {
                      adding: isAddingToCart,
                    })}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || isBuyingNow || outOfStock}
                  >
                    {isAddingToCart ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        ADDING...
                      </>
                    ) : outOfStock ? (
                      'OUT OF STOCK'
                    ) : (
                      'ADD TO CART'
                    )}
                  </button>

                  {!outOfStock && (
                    <button
                      type="button"
                      className={cx('buy-now-btn')}
                      onClick={handleBuyNow}
                      disabled={isAddingToCart || isBuyingNow}
                    >
                      {isBuyingNow ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          PROCESSING...
                        </>
                      ) : (
                        'BUY NOW'
                      )}
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Stock Info */}
              {product.stock_quantity !== undefined && (
                <motion.div className={cx('stock-info')} variants={dash}>
                  {product.stock_quantity > 0 ? (
                    <span className={cx('in-stock')}>
                      ✓ In stock ({product.stock_quantity} available)
                    </span>
                  ) : (
                    <span className={cx('out-of-stock')}>✗ Out of stock</span>
                  )}
                </motion.div>
              )}

              {/* Product Actions */}
              <motion.div className={cx('product-actions')} variants={dash}>
                <button
                  type="button"
                  className={cx('action-btn')}
                  title="Add to Wishlist"
                  aria-label="Add to wishlist"
                >
                  <FontAwesomeIcon icon={faHeart} />
                </button>
                <button
                  type="button"
                  className={cx('action-btn')}
                  title="Share"
                  aria-label="Share"
                >
                  <FontAwesomeIcon icon={faShareNodes} />
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Product Tabs */}
          <div className={cx('product-tabs')}>
            <div className={cx('tab-list')} role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={cx('tab-item', { active: activeTab === tab.id })}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={cx('tab-content')} role="tabpanel">
              {activeTab === 'description' && (
                <div>
                  <p>
                    {product.description ||
                      'No detailed description available.'}
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
                  {sizes.length > 0 && (
                    <div className={cx('spec-row')}>
                      <span>Size</span>
                      <span>{sizes.join(', ')}</span>
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
                    <span>{outOfStock ? 'Out of Stock' : 'In Stock'}</span>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div>
                  <p>
                    Free shipping on orders over $50. Standard delivery takes
                    3-5 business days.
                  </p>
                  <ul>
                    <li>Free standard shipping (3-5 business days)</li>
                    <li>
                      Express shipping available (1-2 business days) - $9.99
                    </li>
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
      </div>
    </MotionConfig>
  );
}

export default ProductDetail;
