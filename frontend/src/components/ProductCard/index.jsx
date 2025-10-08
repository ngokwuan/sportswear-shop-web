import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faStar,
  faShareNodes,
  faShoppingCart,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import axios from '../../setup/axios';
import classNames from 'classnames/bind';
import styles from './ProductCard.module.scss';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

const cx = classNames.bind(styles);

function ProductCard({ product, viewMode }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();

  // Helper function to get image URL
  const getImageUrl = (imageData) => {
    if (!imageData) {
      return 'https://via.placeholder.com/400x400/f0f0f0/666?text=Product+Image';
    }

    // If it's a string, try to parse JSON first
    if (typeof imageData === 'string') {
      try {
        const parsed = JSON.parse(imageData);
        if (parsed && parsed.url) return parsed.url;
      } catch (error) {
        // Not JSON, check if it's a direct URL
        if (imageData.startsWith('http')) return imageData;
      }
    }

    // If it's an object with url property
    if (typeof imageData === 'object' && imageData.url) {
      return imageData.url;
    }

    // Fallback
    return 'https://via.placeholder.com/400x400/f0f0f0/666?text=Product+Image';
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

  const handleClick = () => {
    navigate(`/products/${product.slug}_${product.id}`);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || isAdded) return;

    try {
      setIsAddingToCart(true);

      const response = await axios.post('/cart/add', {
        productId: product.id,
        quantity: 1,
      });

      if (response.data.success) {
        setIsAdded(true);

        setTimeout(() => {
          setIsAdded(false);
        }, 2000);

        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const currentPrice = product.sale_price || product.price;
  const oldPrice = product.sale_price ? product.price : null;
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const imageUrl = getImageUrl(product.featured_image);

  return (
    <div className={cx('product-grid', viewMode)} onClick={handleClick}>
      <div className={cx('product-card', viewMode)}>
        {isOnSale && discountPercent > 0 && (
          <span className={cx('sale-badge')}>-{discountPercent}%</span>
        )}
        {product.isNew && <span className={cx('new-badge')}>New</span>}

        <div className={cx('product-image')}>
          <img
            src={imageUrl}
            alt={product.name}
            onError={(e) => {
              e.target.src =
                'https://via.placeholder.com/400x400/f0f0f0/666?text=Product+Image';
            }}
          />
          <div className={cx('product-overlay')}>
            <button className={cx('overlay-btn')} title="Add to Wishlist">
              <FontAwesomeIcon icon={faHeart} />
            </button>
            <button className={cx('overlay-btn')} title="Quick View">
              <FontAwesomeIcon icon={faShareNodes} />
            </button>
          </div>

          <button
            className={cx('add-to-cart', {
              adding: isAddingToCart,
              added: isAdded,
            })}
            onClick={handleAddToCart}
            disabled={isAddingToCart || isAdded}
          >
            {isAddingToCart ? (
              <>
                <div className={cx('spinner')}></div>
                ĐANG THÊM...
              </>
            ) : isAdded ? (
              <>
                <FontAwesomeIcon icon={faCheck} />
                ĐÃ THÊM
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faShoppingCart} />
                THÊM VÀO GIỎ
              </>
            )}
          </button>
        </div>

        <div className={cx('product-info')}>
          <div className={cx('product-category')}>{product.category}</div>
          <h5 className={cx('product-name')} title={product.name}>
            {product.name?.length > 18
              ? `${product.name.substring(0, 18)}...`
              : product.name || 'Không có tên'}
          </h5>
          <div className={cx('product-rating-size')}>
            <div className={cx('product-rating')}>
              {renderStars(product.star || product.rating || 0)}
            </div>
            {product.size && (
              <span className={cx('size-tag')}>{product.size}</span>
            )}
          </div>
          <div className={cx('product-price')}>
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
      </div>
    </div>
  );
}

export default ProductCard;
