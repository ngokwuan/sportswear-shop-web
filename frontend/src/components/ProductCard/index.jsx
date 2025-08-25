// src/components/ProductCard/ProductCard.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faStar,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './ProductCard.module.scss';

const cx = classNames.bind(styles);

function ProductCard({ product, viewMode }) {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={cx('star', { filled: i < rating })}
      />
    ));
  };
  return (
    <div className={cx('product-grid', viewMode)}>
      <div className={cx('product-card', viewMode)}>
        {product.isSale && <span className={cx('sale-badge')}>Sale</span>}
        {product.isNew && <span className={cx('new-badge')}>New</span>}

        <div className={cx('product-image')}>
          <img
            src={product.featured_image}
            alt={product.name}
            onError={(e) => {
              // Fallback nếu ảnh không load được
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
          <button className={cx('add-to-cart')}>ADD TO CART</button>
        </div>

        <div className={cx('product-info')}>
          <div className={cx('product-category')}>{product.category}</div>
          <h3 className={cx('product-name')}>{product.name}</h3>
          <div className={cx('product-rating')}>
            {renderStars(product.rating)}
          </div>
          <div className={cx('product-price')}>
            <span className={cx('current-price')}>${product.price}</span>
            {product.oldPrice && (
              <span className={cx('old-price')}>${product.oldPrice}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
