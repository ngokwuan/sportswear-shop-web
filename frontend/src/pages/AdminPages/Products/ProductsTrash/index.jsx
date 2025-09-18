import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../../../setup/axios';
import styles from './ProductTrash.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function ProductTrash() {
  const [trashedProducts, setTrashedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch trashed products from API
  //   const fetchTrashedProducts = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await axios.get('/products/trash');
  //       setTrashedProducts(response.data);
  //     } catch (error) {
  //       console.error('Error fetching trashed products:', error);
  //       toast.error('Không thể tải danh sách thùng rác');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  const fetchTrashedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products/trash');
      console.log('Trashed products data:', response.data); // Debug này
      setTrashedProducts(response.data);
    } catch (error) {
      console.error('Error fetching trashed products:', error);
      toast.error('Không thể tải danh sách thùng rác');
    } finally {
      setLoading(false);
    }
  };
  // Fetch categories for display
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchTrashedProducts();
    fetchCategories();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  // Handle single product selection
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all products
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(trashedProducts.map((product) => product.id));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll state when selectedProducts changes
  useEffect(() => {
    setSelectAll(
      selectedProducts.length === trashedProducts.length &&
        trashedProducts.length > 0
    );
  }, [selectedProducts, trashedProducts]);

  // Restore single product
  const handleRestoreProduct = async (productId) => {
    try {
      await axios.patch(`/products/${productId}/restore`);
      toast.success('Khôi phục sản phẩm thành công!');
      // Remove restored product from trash list
      setTrashedProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error('Error restoring product:', error);
      toast.error('Không thể khôi phục sản phẩm');
    }
  };

  // Force delete single product
  const handleForceDeleteProduct = async (productId) => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này? Hành động này không thể hoàn tác!'
      )
    ) {
      try {
        await axios.delete(`/products/${productId}/force`);
        toast.success('Xóa vĩnh viễn sản phẩm thành công!');
        // Remove deleted product from trash list
        setTrashedProducts((prev) =>
          prev.filter((product) => product.id !== productId)
        );
        setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      } catch (error) {
        console.error('Error force deleting product:', error);
        toast.error('Không thể xóa vĩnh viễn sản phẩm');
      }
    }
  };

  // Restore multiple selected products
  const handleRestoreSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn khôi phục ${selectedProducts.length} sản phẩm đã chọn?`
      )
    ) {
      try {
        await Promise.all(
          selectedProducts.map((productId) =>
            axios.patch(`/products/${productId}/restore`)
          )
        );
        toast.success(
          `Khôi phục ${selectedProducts.length} sản phẩm thành công!`
        );
        // Remove restored products from trash list
        setTrashedProducts((prev) =>
          prev.filter((product) => !selectedProducts.includes(product.id))
        );
        setSelectedProducts([]);
      } catch (error) {
        console.error('Error restoring selected products:', error);
        toast.error('Có lỗi xảy ra khi khôi phục sản phẩm');
      }
    }
  };

  // Force delete multiple selected products
  const handleForceDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedProducts.length} sản phẩm đã chọn? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await Promise.all(
          selectedProducts.map((productId) =>
            axios.delete(`/products/${productId}/force`)
          )
        );
        toast.success(
          `Xóa vĩnh viễn ${selectedProducts.length} sản phẩm thành công!`
        );
        // Remove deleted products from trash list
        setTrashedProducts((prev) =>
          prev.filter((product) => !selectedProducts.includes(product.id))
        );
        setSelectedProducts([]);
      } catch (error) {
        console.error('Error force deleting selected products:', error);
        toast.error('Có lỗi xảy ra khi xóa vĩnh viễn sản phẩm');
      }
    }
  };

  // Empty entire trash
  const handleEmptyTrash = async () => {
    if (trashedProducts.length === 0) {
      toast.warning('Thùng rác đã trống');
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn tất cả ${trashedProducts.length} sản phẩm trong thùng rác? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await Promise.all(
          trashedProducts.map((product) =>
            axios.delete(`/products/${product.id}/force`)
          )
        );
        toast.success('Đã dọn sạch thùng rác!');
        setTrashedProducts([]);
        setSelectedProducts([]);
      } catch (error) {
        console.error('Error emptying trash:', error);
        toast.error('Có lỗi xảy ra khi dọn thùng rác');
      }
    }
  };

  if (loading) {
    return (
      <div className={cx('products-trash')}>
        <div className={cx('loading')}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={cx('products-trash')}>
      <div className={cx('content-grid')}>
        <div className={cx('content-card', 'trash-card')}>
          <div className={cx('card-header')}>
            <div className={cx('header-left')}>
              <h2 className={cx('card-title')}>
                <Link to="/admin/products" className={cx('back')}>
                  {'<'}
                </Link>
                Thùng rác sản phẩm
                <span className={cx('count')}>({trashedProducts.length})</span>
              </h2>
              <p className={cx('subtitle')}>
                Quản lý các sản phẩm đã bị xóa mềm
              </p>
            </div>

            {trashedProducts.length > 0 && (
              <div className={cx('header-actions')}>
                <button
                  className={cx('action-btn', 'empty-trash-btn')}
                  onClick={handleEmptyTrash}
                  title="Dọn sạch thùng rác"
                >
                  🧹 Dọn sạch thùng rác
                </button>
              </div>
            )}
          </div>

          {trashedProducts.length === 0 ? (
            <div className={cx('empty-trash')}>
              <div className={cx('empty-icon')}>🗑️</div>
              <h3>Thùng rác trống</h3>
              <p>Không có sản phẩm nào trong thùng rác</p>
            </div>
          ) : (
            <>
              {/* Bulk Actions */}
              <div className={cx('bulk-actions')}>
                <div className={cx('select-info')}>
                  <label className={cx('checkbox-wrapper')}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <span className={cx('checkmark')}></span>
                    Chọn tất cả ({selectedProducts.length}/
                    {trashedProducts.length})
                  </label>
                </div>

                {selectedProducts.length > 0 && (
                  <div className={cx('selected-actions')}>
                    <button
                      className={cx('bulk-btn', 'restore-btn')}
                      onClick={handleRestoreSelected}
                    >
                      🔄 Khôi phục ({selectedProducts.length})
                    </button>
                    <button
                      className={cx('bulk-btn', 'delete-btn')}
                      onClick={handleForceDeleteSelected}
                    >
                      ❌ Xóa vĩnh viễn ({selectedProducts.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Products Table */}
              <div className={cx('products-table')}>
                <div className={cx('table-header')}>
                  <span className={cx('select-col')}>#</span>
                  <span>ID</span>
                  <span>Hình ảnh</span>
                  <span>Tên sản phẩm</span>
                  <span>Danh mục</span>
                  <span>Giá</span>
                  <span>Giá KM</span>
                  <span>Số lượng</span>
                  <span>Thương hiệu</span>
                  <span>Ngày xóa</span>
                  <span>Thao tác</span>
                </div>

                {trashedProducts.map((product) => (
                  <div
                    key={product.id}
                    className={cx('table-row', {
                      selected: selectedProducts.includes(product.id),
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                    />
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
                      {product.name?.length > 10
                        ? `${product.name.substring(0, 10)}...`
                        : product.name}
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
                      {product.sale_price
                        ? formatPrice(product.sale_price)
                        : '-'}
                    </span>

                    <span className={cx('product-stock')}>
                      {product.stock_quantity}
                    </span>

                    <span className={cx('product-brand')}>{product.brand}</span>

                    <span className={cx('product-deleted')}>
                      {formatDate(product.deleted_at)}
                    </span>

                    <div className={cx('product-actions')}>
                      <button
                        className={cx('action-btn', 'restore-btn')}
                        onClick={() => handleRestoreProduct(product.id)}
                        title="Khôi phục sản phẩm"
                      >
                        🔄
                      </button>
                      <button
                        className={cx('action-btn', 'force-delete-btn')}
                        onClick={() => handleForceDeleteProduct(product.id)}
                        title="Xóa vĩnh viễn"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductTrash;
