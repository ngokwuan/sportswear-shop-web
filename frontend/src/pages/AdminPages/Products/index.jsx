import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Products.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
const cx = classNames.bind(styles);

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'N/A';
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'name',
      'description',
      'price',
      'categoryId',
      'stockQuantity',
      'brand',
      'size',
      'color',
      'images',
      'featuredImage',
    ];
    for (const field of requiredFields) {
      if (!newProduct[field]) {
        toast.error(`Trường ${field} là bắt buộc`);
        return;
      }
    }

    try {
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        salePrice: newProduct.salePrice ? Number(newProduct.salePrice) : null,
        stockQuantity: Number(newProduct.stockQuantity),
        categoryId: Number(newProduct.categoryId),
      };

      const response = await axios.post('/products', productData);

      if (response.data.newProducts) {
        setProducts((prevProducts) => [
          ...prevProducts,
          response.data.newProducts,
        ]);
        toast.success('Thêm sản phẩm thành công!');

        setNewProduct({
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
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
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
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: editingProduct.name,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        salePrice: editingProduct.salePrice
          ? Number(editingProduct.salePrice)
          : null,
        stockQuantity: Number(editingProduct.stockQuantity),
        brand: editingProduct.brand,
        size: editingProduct.size,
        color: editingProduct.color,
        images: editingProduct.images,
        featuredImage: editingProduct.featuredImage,
      };

      const response = await axios.patch(
        `/products/${editingProduct.id}`,
        updateData
      );

      if (response.data.product) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === editingProduct.id ? response.data.product : product
          )
        );

        toast.success('Cập nhật sản phẩm thành công!');
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này vào thùng rác?')
    ) {
      try {
        await axios.delete(`/products/${productId}`);

        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );
        toast.success('Đã chuyển sản phẩm vào thùng rác!');
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={cx('products')}>
        <div className={cx('loading')}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={cx('content-card', 'products-card')}>
      <div className={cx('card-header')}>
        <div className={cx('header-left')}>
          <h2 className={cx('card-title')}>Danh sách sản phẩm</h2>
          <p className={cx('subtitle')}>Quản lý sản phẩm trong hệ thống</p>
        </div>

        <div className={cx('header-actions')}>
          <Link
            to="/admin/products/trash"
            className={cx('trash-link')}
            title="Xem thùng rác"
          >
            🗑️ Thùng rác
          </Link>
          <button
            className={cx('create-btn')}
            onClick={() => setShowCreateModal(true)}
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className={cx('products-table')}>
        <div className={cx('table-header')}>
          <span>ID</span>
          <span>Hình ảnh</span>
          <span>Tên sản phẩm</span>
          <span>Danh mục</span>
          <span>Giá</span>
          <span>Giá KM</span>
          <span>Số lượng</span>
          <span>Thương hiệu</span>
          <span>Ngày tạo</span>
          <span>Thao tác</span>
        </div>

        {products.length === 0 ? (
          <div className={cx('no-data')}>
            <p>Không có sản phẩm nào</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className={cx('table-row')}>
              <span className={cx('product-id')}>#{product.id}</span>
              <div className={cx('product-image')}>
                <img
                  src={product.featured_image}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <span className={cx('product-name')} title={product.name}>
                {product.name?.length > 12
                  ? `${product.name.substring(0, 12)}...`
                  : product.name || 'Không có tên'}
              </span>
              <span className={cx('product-category')}>
                {getCategoryName(product.category_id).length > 10
                  ? `${getCategoryName(product.category_id).substring(
                      0,
                      10
                    )}...`
                  : getCategoryName(product.category_id)}
              </span>
              <span className={cx('product-price')}>
                {formatPrice(product.price)}
              </span>
              <span className={cx('product-sale-price')}>
                {product.sale_price ? formatPrice(product.sale_price) : '-'}
              </span>
              <span className={cx('product-stock')}>
                {product.stock_quantity}
              </span>
              <span className={cx('product-brand')}>{product.brand}</span>
              <span className={cx('product-created')}>
                {formatDate(product.created_at)}
              </span>
              <div className={cx('product-actions')}>
                <button
                  className={cx('action-btn', 'edit-btn')}
                  onClick={() => handleEditProduct(product)}
                  title="Chỉnh sửa"
                >
                  <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                </button>
                <button
                  className={cx('action-btn', 'delete-btn')}
                  onClick={() => handleDeleteProduct(product.id)}
                  title="Chuyển vào thùng rác"
                >
                  <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal')}>
            <div className={cx('modal-header')}>
              <h3>Thêm sản phẩm mới</h3>
              <button
                className={cx('close-btn')}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className={cx('modal-form')}>
              <div className={cx('form-row')}>
                <div className={cx('form-group')}>
                  <label>
                    Tên sản phẩm <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={cx('form-group')}>
                  <label>
                    Danh mục <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        categoryId: e.target.value,
                      })
                    }
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
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
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
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                    min="0"
                  />
                </div>
                <div className={cx('form-group')}>
                  <label>Giá khuyến mãi</label>
                  <input
                    type="number"
                    value={newProduct.salePrice}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        salePrice: e.target.value,
                      })
                    }
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
                    value={newProduct.stockQuantity}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stockQuantity: e.target.value,
                      })
                    }
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
                    value={newProduct.brand}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, brand: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className={cx('form-row')}>
                <div className={cx('form-group')}>
                  <select
                    value={newProduct.size}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        size: e.target.value,
                      })
                    }
                    required
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
                    value={newProduct.color}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, color: e.target.value })
                    }
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
                  value={newProduct.images}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, images: e.target.value })
                  }
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
                  value={newProduct.featuredImage}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      featuredImage: e.target.value,
                    })
                  }
                  required
                  placeholder="Nhập URL hình ảnh nổi bật"
                />
              </div>

              <div className={cx('modal-actions')}>
                <button
                  type="button"
                  className={cx('cancel-btn')}
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className={cx('submit-btn')}>
                  Thêm sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className={cx('modal-overlay')}>
          <div className={cx('modal')}>
            <div className={cx('modal-header')}>
              <h3>Chỉnh sửa sản phẩm</h3>
              <button
                className={cx('close-btn')}
                onClick={() => setEditingProduct(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className={cx('modal-form')}>
              <div className={cx('form-row')}>
                <div className={cx('form-group')}>
                  <label>
                    Tên sản phẩm <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className={cx('form-group')}>
                  <label>
                    Danh mục <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value,
                      })
                    }
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
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
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
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value,
                      })
                    }
                    required
                    min="0"
                  />
                </div>
                <div className={cx('form-group')}>
                  <label>Giá khuyến mãi</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: e.target.value,
                      })
                    }
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
                    value={editingProduct.stockQuantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockQuantity: e.target.value,
                      })
                    }
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
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: e.target.value,
                      })
                    }
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
                    value={editingProduct.size}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        size: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className={cx('form-group')}>
                  <label>
                    Màu sắc <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.color}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        color: e.target.value,
                      })
                    }
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
                  value={editingProduct.images}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      images: e.target.value,
                    })
                  }
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
                  value={editingProduct.featuredImage}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      featuredImage: e.target.value,
                    })
                  }
                  required
                  placeholder="Nhập URL hình ảnh nổi bật"
                />
              </div>

              <div className={cx('modal-actions')}>
                <button
                  type="button"
                  className={cx('cancel-btn')}
                  onClick={() => setEditingProduct(null)}
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
      )}
    </div>
  );
}

export default Products;
