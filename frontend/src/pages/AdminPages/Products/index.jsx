import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from '../../../setup/axios';
import styles from './Products.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import CreateProductModal from './CreateProductModal.jsx';
import EditProductModal from './EditProductModal.jsx';
import Pagination from '../../../components/Pagination';

const cx = classNames.bind(styles);

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Helper function to get image URL
  const getImageUrl = (imageData) => {
    if (!imageData) return '/placeholder-image.jpg';

    // If it's already a string URL
    if (typeof imageData === 'string') return imageData;

    // If it's an object with url property
    if (typeof imageData === 'object' && imageData.url) return imageData.url;

    // Fallback
    return '/placeholder-image.jpg';
  };

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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Updated function to handle multiple categories
  const getCategoryNames = (categoryIds) => {
    if (
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      return 'N/A';
    }

    const names = categoryIds
      .map((id) => {
        const category = categories.find((cat) => cat.id === id);
        return category ? category.name : null;
      })
      .filter(Boolean);

    return names.length > 0 ? names.join(', ') : 'N/A';
  };

  const handleProductCreated = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
    // Navigate to last page
    const newTotalPages = Math.ceil((products.length + 1) / itemsPerPage);
    setCurrentPage(newTotalPages);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleDeleteProduct = async (productId) => {
    if (
      window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này vào thùng rác?')
    ) {
      try {
        await axios.delete(`/products/${productId}`);

        setProducts((prev) =>
          prev.filter((product) => product.id !== productId)
        );
        toast.success('Đã chuyển sản phẩm vào thùng rác!');

        // Adjust page if current page is empty after deletion
        const newTotalItems = products.length - 1;
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Không thể xóa sản phẩm');
      }
    }
  };

  if (loading) {
    return (
      <div className={cx('content-card')}>
        <div className={cx('loading')}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={cx('content-card', 'products-card')}>
      <div className={cx('card-header')}>
        <div className={cx('header-left')}>
          <h2 className={cx('card-title')}>Danh sách sản phẩm</h2>
          <p className={cx('subtitle')}>
            Quản lý sản phẩm trong hệ thống ({products.length} sản phẩm)
          </p>
        </div>

        <div className={cx('header-actions')}>
          <Link
            to="/admin/products/trash"
            className={cx('trash-link')}
            title="Xem thùng rác"
          >
            <FontAwesomeIcon icon={faTrash} />
            Thùng rác
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
          currentProducts.map((product) => {
            const categoryNames = getCategoryNames(product.category_ids);
            return (
              <div key={product.id} className={cx('table-row')}>
                <span className={cx('product-id')}>#{product.id}</span>
                <div className={cx('product-image')}>
                  <img
                    src={getImageUrl(product.featured_image)}
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
                <span className={cx('product-category')} title={categoryNames}>
                  {categoryNames.length > 15
                    ? `${categoryNames.substring(0, 15)}...`
                    : categoryNames}
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
                    onClick={() => setEditingProduct(product)}
                    title="Chỉnh sửa"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className={cx('action-btn', 'delete-btn')}
                    onClick={() => handleDeleteProduct(product.id)}
                    title="Chuyển vào thùng rác"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={products.length}
        onPageChange={setCurrentPage}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        categories={categories}
        onProductCreated={handleProductCreated}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        categories={categories}
        product={editingProduct}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
}

export default Products;
