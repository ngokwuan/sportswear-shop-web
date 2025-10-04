import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Products.module.scss';

const cx = classNames.bind(styles);

function EditProductModal({
  isOpen,
  onClose,
  categories,
  product,
  onProductUpdated,
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    categoryId: '',
    stockQuantity: '',
    brand: '',
    size: '',
    color: '',
    images: '',
    featuredImage: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        salePrice: product.sale_price || '',
        categoryId: product.category_id || '',
        stockQuantity: product.stock_quantity || '',
        brand: product.brand || '',
        size: product.size || '',
        color: product.color || '',
        images: product.images || '',
        featuredImage: product.featured_image || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        stockQuantity: Number(formData.stockQuantity),
        brand: formData.brand,
        size: formData.size,
        color: formData.color,
        images: formData.images,
        featuredImage: formData.featuredImage,
      };

      const response = await axios.patch(`/products/${product.id}`, updateData);

      if (response.data.product) {
        toast.success('Cập nhật sản phẩm thành công!');
        onProductUpdated(response.data.product);
        onClose();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Không thể cập nhật sản phẩm');
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className={cx('modal-overlay')}>
      <div className={cx('modal')}>
        <div className={cx('modal-header')}>
          <h3>Chỉnh sửa sản phẩm</h3>
          <button className={cx('close-btn')} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={cx('modal-form')}>
          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>
                Tên sản phẩm <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={cx('form-group')}>
              <label>
                Danh mục <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={cx('form-group')}>
            <label>
              Mô tả <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>
                Giá <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className={cx('form-group')}>
              <label>Giá khuyến mãi</label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>
                Số lượng <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className={cx('form-group')}>
              <label>
                Thương hiệu <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>
                Kích cỡ <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
              />
            </div>
            <div className={cx('form-group')}>
              <label>
                Màu sắc <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={cx('form-group')}>
            <label>
              Hình ảnh <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="images"
              value={formData.images}
              onChange={handleChange}
              required
              placeholder="Nhập URL hình ảnh"
            />
          </div>

          <div className={cx('form-group')}>
            <label>
              Hình ảnh nổi bật <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleChange}
              required
              placeholder="Nhập URL hình ảnh nổi bật"
            />
          </div>

          <div className={cx('modal-actions')}>
            <button
              type="button"
              className={cx('cancel-btn')}
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className={cx('submit-btn')}>
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
