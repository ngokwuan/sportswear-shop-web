import classNames from 'classnames/bind';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Products.module.scss';

const cx = classNames.bind(styles);

function CreateProductModal({ isOpen, onClose, categories, onProductCreated }) {
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
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [previewFeatured, setPreviewFeatured] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        e.target.value = '';
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        e.target.value = '';
        return;
      }

      setFeaturedImage(file);
      setPreviewFeatured(URL.createObjectURL(file));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      toast.error('Chỉ được chọn tối đa 3 ảnh');
      e.target.value = '';
      return;
    }

    const validFiles = [];
    const previews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá 5MB`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} không phải là hình ảnh`);
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setImages(validFiles);
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = {
      name: 'Tên sản phẩm',
      description: 'Mô tả',
      price: 'Giá',
      categoryId: 'Danh mục',
      stockQuantity: 'Số lượng',
      brand: 'Thương hiệu',
      size: 'Size',
      color: 'Màu sắc',
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        toast.error(`${label} là bắt buộc`);
        return;
      }
    }

    // Validate price
    if (Number(formData.price) <= 0) {
      toast.error('Giá phải lớn hơn 0');
      return;
    }

    // Validate sale price if provided
    if (
      formData.salePrice &&
      Number(formData.salePrice) >= Number(formData.price)
    ) {
      toast.error('Giá khuyến mãi phải nhỏ hơn giá gốc');
      return;
    }

    // Validate stock quantity
    if (Number(formData.stockQuantity) < 0) {
      toast.error('Số lượng không được âm');
      return;
    }

    // Validate images
    if (!featuredImage && images.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('stockQuantity', formData.stockQuantity);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('color', formData.color);

      // Append optional salePrice
      if (formData.salePrice) {
        formDataToSend.append('salePrice', formData.salePrice);
      }

      // Append featured image
      if (featuredImage) {
        console.log('Featured Image:', {
          name: featuredImage.name,
          type: featuredImage.type,
          size: featuredImage.size,
        });
        formDataToSend.append('featuredImage', featuredImage);
      }

      // Append multiple images
      images.forEach((image, index) => {
        console.log(`Image ${index + 1}:`, {
          name: image.name,
          type: image.type,
          size: image.size,
        });
        formDataToSend.append('images', image);
      });

      // Log FormData entries
      console.log('FormData entries:');
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], '→ File:', pair[1].name, pair[1].type);
        } else {
          console.log(pair[0], '→', pair[1]);
        }
      }

      // Không cần set Content-Type, axios sẽ tự động set với boundary
      const response = await axios.post('/products', formDataToSend);

      // Backend trả về { message, product }
      if (response.data.product) {
        toast.success(response.data.message || 'Thêm sản phẩm thành công!');

        // Gọi callback để cập nhật danh sách sản phẩm
        onProductCreated(response.data.product);

        // Reset form
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error creating product:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể thêm sản phẩm';

      toast.error(errorMessage);

      // Hiển thị chi tiết lỗi nếu có
      if (error.response?.data?.details) {
        console.error('Error details:', error.response.data.details);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      categoryId: '',
      stockQuantity: '',
      brand: '',
      size: '',
      color: '',
    });
    setFeaturedImage(null);
    setImages([]);
    setPreviewFeatured(null);
    setPreviewImages([]);
  };

  const removeFeaturedImage = () => {
    if (previewFeatured) {
      URL.revokeObjectURL(previewFeatured);
    }
    setFeaturedImage(null);
    setPreviewFeatured(null);
  };

  const removeImage = (index) => {
    const preview = previewImages[index];
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  const handleClose = () => {
    // Cleanup preview URLs
    if (previewFeatured) {
      URL.revokeObjectURL(previewFeatured);
    }
    previewImages.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={cx('modal-overlay')} onClick={handleClose}>
      <div
        className={cx('modal', 'modal-large')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cx('modal-header')}>
          <h3>Thêm sản phẩm mới</h3>
          <button
            className={cx('close-btn')}
            onClick={handleClose}
            disabled={isSubmitting}
          >
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                min="1"
                step="1000"
                disabled={isSubmitting}
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
                step="1000"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label>
                Size <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Chọn Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Featured Image Upload */}
          <div className={cx('form-group')}>
            <label>
              Hình ảnh nổi bật <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageChange}
              className={cx('file-input')}
              disabled={isSubmitting}
            />
            {previewFeatured && (
              <div className={cx('image-preview')}>
                <img src={previewFeatured} alt="Featured preview" />
                <button
                  type="button"
                  className={cx('remove-image-btn')}
                  onClick={removeFeaturedImage}
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </div>
            )}
            <small
              style={{ color: '#666', display: 'block', marginTop: '5px' }}
            >
              Ảnh này sẽ hiển thị đầu tiên. Kích thước tối đa: 5MB
            </small>
          </div>

          {/* Multiple Images Upload */}
          <div className={cx('form-group')}>
            <label>Hình ảnh khác (Tối đa 3 ảnh)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className={cx('file-input')}
              disabled={isSubmitting}
            />
            {previewImages.length > 0 && (
              <div className={cx('images-preview-grid')}>
                {previewImages.map((preview, index) => (
                  <div key={index} className={cx('image-preview')}>
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className={cx('remove-image-btn')}
                      onClick={() => removeImage(index)}
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <small
              style={{ color: '#666', display: 'block', marginTop: '5px' }}
            >
              Mỗi ảnh tối đa 5MB. Chọn tối đa 3 ảnh
            </small>
          </div>

          <div className={cx('modal-actions')}>
            <button
              type="button"
              className={cx('cancel-btn')}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={cx('submit-btn')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProductModal;
