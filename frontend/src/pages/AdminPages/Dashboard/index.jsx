import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../../setup/axios';
import styles from './Dashboard.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRefresh,
  faUsers,
  faBox,
  faShoppingCart,
  faDollarSign,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActiveUsers: 0,
    totalProducts: 0,
    totalActiveProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    monthlyStats: {
      usersThisMonth: 0,
      ordersThisMonth: 0,
      revenueThisMonth: 0,
      userGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0,
    },
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatusStats, setOrderStatusStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get image URL (same as Products component)
  const getImageUrl = (imageData) => {
    if (!imageData) return '/placeholder-image.jpg';

    // If it's already a string URL
    if (typeof imageData === 'string') return imageData;

    // If it's an object with url property
    if (typeof imageData === 'object' && imageData.url) return imageData.url;

    // Fallback
    return '/placeholder-image.jpg';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsResponse = await axios.get('/dashboard/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      const ordersResponse = await axios.get(
        '/dashboard/recent-orders?limit=4'
      );
      if (ordersResponse.data.success) {
        setRecentOrders(ordersResponse.data.data);
      }

      const productsResponse = await axios.get(
        '/dashboard/top-products?limit=4'
      );
      if (productsResponse.data.success) {
        setTopProducts(productsResponse.data.data);
      }

      const statusResponse = await axios.get('/dashboard/order-status');
      if (statusResponse.data.success) {
        setOrderStatusStats(statusResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    try {
      const numAmount = parseFloat(amount) || 0;
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(numAmount);
    } catch (error) {
      return '0 ₫';
    }
  };

  const formatNumber = (num) => {
    try {
      const numValue = parseInt(num) || 0;
      return new Intl.NumberFormat('vi-VN').format(numValue);
    } catch (error) {
      return '0';
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      completed: 'success',
      delivered: 'success',
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      cancelled: 'danger',
    };
    return statusColors[status] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
      completed: 'Hoàn thành',
    };
    return statusLabels[status] || status;
  };

  if (loading) {
    return (
      <div className={cx('dashboard')}>
        <div className={cx('loading')}>
          <div className={cx('spinner')}></div>
          <p>Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('dashboard')}>
      {/* Page Header */}
      <div className={cx('page-header')}>
        <h1 className={cx('page-title')}>Dashboard</h1>
        <p className={cx('page-subtitle')}>
          Tổng quan về cửa hàng thể thao của bạn
        </p>
        <div className={cx('refresh-btn')}>
          <button onClick={fetchDashboardData} className={cx('btn-refresh')}>
            <FontAwesomeIcon icon={faRefresh} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={cx('stats-grid')}>
        <div className={cx('stat-card', 'users')}>
          <div className={cx('stat-icon')}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {formatNumber(stats.totalUsers)}
            </h3>
            <p className={cx('stat-label')}>Tổng Users</p>
            <div className={cx('stat-details')}>
              <span className={cx('stat-sub')}>
                Hoạt động: {formatNumber(stats.totalActiveUsers)}
              </span>
            </div>
          </div>
        </div>

        <div className={cx('stat-card', 'products')}>
          <div className={cx('stat-icon')}>
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {formatNumber(stats.totalProducts)}
            </h3>
            <p className={cx('stat-label')}>Sản phẩm</p>
            <div className={cx('stat-details')}>
              <span className={cx('stat-sub')}>
                Hoạt động: {formatNumber(stats.totalActiveProducts)}
              </span>
            </div>
          </div>
        </div>

        <div className={cx('stat-card', 'orders')}>
          <div className={cx('stat-icon')}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {formatNumber(stats.totalOrders)}
            </h3>
            <p className={cx('stat-label')}>Đơn hàng</p>
            <div className={cx('stat-details')}>
              <span className={cx('stat-sub')}>
                Tháng này: {formatNumber(stats.monthlyStats.ordersThisMonth)}
              </span>
            </div>
          </div>
        </div>

        <div className={cx('stat-card', 'revenue')}>
          <div className={cx('stat-icon')}>
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className={cx('stat-label')}>Doanh thu</p>
            <div className={cx('stat-details')}>
              <span className={cx('stat-sub')}>
                Tháng này: {formatCurrency(stats.monthlyStats.revenueThisMonth)}
              </span>
            </div>
          </div>
        </div>

        <div className={cx('stat-card', 'blogs')}>
          <div className={cx('stat-icon')}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {formatNumber(stats.totalBlogs)}
            </h3>
            <p className={cx('stat-label')}>Bài viết</p>
            <div className={cx('stat-details')}>
              <span className={cx('stat-sub')}>
                Đã xuất bản: {formatNumber(stats.publishedBlogs)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={cx('content-grid')}>
        {/* Recent Orders */}
        <div className={cx('content-card', 'orders-card')}>
          <div className={cx('card-header')}>
            <h2 className={cx('card-title')}>Đơn hàng gần đây</h2>
            <Link to="/admin/orders" className={cx('view-all-btn')}>
              Xem tất cả
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className={cx('empty-state')}>
              <p>Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className={cx('orders-table')}>
              <div className={cx('table-header')}>
                <span>#</span>
                <span>Khách hàng</span>
                <span>Sản phẩm</span>
                <span>Giá trị</span>
                <span>Trạng thái</span>
              </div>
              {recentOrders.map((order, index) => (
                <div key={order.id} className={cx('table-row')}>
                  <span className={cx('order-id')}>#{index + 1}</span>

                  <span className={cx('customer')}>
                    {order.customer_name || order.user?.name}
                  </span>
                  <span className={cx('product')}>
                    {order.items && order.items.length > 0
                      ? `${
                          order.items[0]?.product?.name ||
                          'Sản phẩm không xác định'
                        }${
                          order.items.length > 1
                            ? ` +${order.items.length - 1} khác`
                            : ''
                        }`
                      : 'Không có sản phẩm'}
                  </span>
                  <span className={cx('amount')}>
                    {formatCurrency(order.total_amount || 0)}
                  </span>
                  <span className={cx('status', getStatusColor(order.status))}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className={cx('content-card', 'products-card')}>
          <div className={cx('card-header')}>
            <h2 className={cx('card-title')}>Sản phẩm bán chạy</h2>
            <Link to="/admin/products" className={cx('view-all-btn')}>
              Xem tất cả
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className={cx('empty-state')}>
              <p>Chưa có dữ liệu bán hàng</p>
            </div>
          ) : (
            <div className={cx('products-list')}>
              {topProducts.map((product, index) => (
                <div key={product.id} className={cx('product-item')}>
                  <div className={cx('product-rank')}>#{index + 1}</div>
                  <div className={cx('product-image')}>
                    <img
                      src={getImageUrl(product.featured_image)}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className={cx('product-info')}>
                    <h4 className={cx('product-name')}>{product.name}</h4>
                    <div className={cx('product-stats')}>
                      <span className={cx('sold')}>
                        Đã bán:{' '}
                        {formatNumber(product?.dataValues?.total_sold || 0)}
                      </span>
                      <span className={cx('revenue')}>
                        Doanh thu:{' '}
                        {formatCurrency(
                          product?.dataValues?.total_revenue || 0
                        )}
                      </span>
                    </div>
                    <div className={cx('product-price')}>
                      {product.sale_price ? (
                        <>
                          <span className={cx('sale-price')}>
                            {formatCurrency(product.sale_price)}
                          </span>
                          <span className={cx('original-price')}>
                            {formatCurrency(product.price || 0)}
                          </span>
                        </>
                      ) : (
                        <span className={cx('price')}>
                          {formatCurrency(product.price || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
