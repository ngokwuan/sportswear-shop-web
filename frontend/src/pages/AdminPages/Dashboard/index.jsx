import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import styles from './Dashboard.module.scss';

const cx = classNames.bind(styles);

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalProducts: 856,
    totalOrders: 2341,
    totalRevenue: 125680000,
  });

  const [recentOrders] = useState([
    {
      id: '#ORD-001',
      customer: 'Nguyễn Văn A',
      product: 'Giày Nike Air Max',
      amount: 2500000,
      status: 'completed',
    },
    {
      id: '#ORD-002',
      customer: 'Trần Thị B',
      product: 'Áo Adidas Running',
      amount: 890000,
      status: 'pending',
    },
    {
      id: '#ORD-003',
      customer: 'Lê Văn C',
      product: 'Quần thể thao Nike',
      amount: 1200000,
      status: 'processing',
    },
    {
      id: '#ORD-004',
      customer: 'Phạm Thị D',
      product: 'Balo thể thao Puma',
      amount: 650000,
      status: 'completed',
    },
    {
      id: '#ORD-005',
      customer: 'Hoàng Văn E',
      product: 'Giày bóng đá Adidas',
      amount: 1800000,
      status: 'cancelled',
    },
  ]);

  const [topProducts] = useState([
    {
      name: 'Giày Nike Air Max 270',
      sold: 145,
      revenue: 18125000,
      trend: 'up',
    },
    { name: 'Áo Adidas 3-Stripes', sold: 98, revenue: 8820000, trend: 'up' },
    { name: 'Quần jogger Nike', sold: 87, revenue: 10440000, trend: 'down' },
    { name: 'Giày Puma RS-X', sold: 76, revenue: 9120000, trend: 'up' },
    {
      name: 'Áo Polo Lacoste Sport',
      sold: 65,
      revenue: 9750000,
      trend: 'stable',
    },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      completed: 'success',
      pending: 'warning',
      processing: 'info',
      cancelled: 'danger',
    };
    return statusColors[status] || 'secondary';
  };

  const getTrendIcon = (trend) => {
    const trendIcons = {
      up: '📈',
      down: '📉',
      stable: '➡️',
    };
    return trendIcons[trend] || '➡️';
  };

  return (
    <div className={cx('dashboard')}>
      {/* Page Header */}
      <div className={cx('page-header')}>
        <h1 className={cx('page-title')}>Dashboard</h1>
        <p className={cx('page-subtitle')}>
          Tổng quan về cửa hàng thể thao của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className={cx('stats-grid')}>
        <div className={cx('stat-card', 'users')}>
          <div className={cx('stat-icon')}>👥</div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {stats.totalUsers.toLocaleString()}
            </h3>
            <p className={cx('stat-label')}>Tổng Users</p>
            <span className={cx('stat-change', 'positive')}>
              +12% tháng này
            </span>
          </div>
        </div>

        <div className={cx('stat-card', 'products')}>
          <div className={cx('stat-icon')}>🏃‍♂️</div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {stats.totalProducts.toLocaleString()}
            </h3>
            <p className={cx('stat-label')}>Sản phẩm</p>
            <span className={cx('stat-change', 'positive')}>+8% tháng này</span>
          </div>
        </div>

        <div className={cx('stat-card', 'orders')}>
          <div className={cx('stat-icon')}>📦</div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {stats.totalOrders.toLocaleString()}
            </h3>
            <p className={cx('stat-label')}>Đơn hàng</p>
            <span className={cx('stat-change', 'positive')}>
              +24% tháng này
            </span>
          </div>
        </div>

        <div className={cx('stat-card', 'revenue')}>
          <div className={cx('stat-icon')}>💰</div>
          <div className={cx('stat-content')}>
            <h3 className={cx('stat-number')}>
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className={cx('stat-label')}>Doanh thu</p>
            <span className={cx('stat-change', 'positive')}>
              +18% tháng này
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={cx('content-grid')}>
        {/* Recent Orders */}
        <div className={cx('content-card', 'orders-card')}>
          <div className={cx('card-header')}>
            <h2 className={cx('card-title')}>Đơn hàng gần đây</h2>
            <button className={cx('view-all-btn')}>Xem tất cả</button>
          </div>
          <div className={cx('orders-table')}>
            <div className={cx('table-header')}>
              <span>Mã đơn</span>
              <span>Khách hàng</span>
              <span>Sản phẩm</span>
              <span>Giá trị</span>
              <span>Trạng thái</span>
            </div>
            {recentOrders.map((order) => (
              <div key={order.id} className={cx('table-row')}>
                <span className={cx('order-id')}>{order.id}</span>
                <span className={cx('customer')}>{order.customer}</span>
                <span className={cx('product')}>{order.product}</span>
                <span className={cx('amount')}>
                  {formatCurrency(order.amount)}
                </span>
                <span className={cx('status', getStatusColor(order.status))}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className={cx('content-card', 'products-card')}>
          <div className={cx('card-header')}>
            <h2 className={cx('card-title')}>Sản phẩm bán chạy</h2>
            <button className={cx('view-all-btn')}>Xem tất cả</button>
          </div>
          <div className={cx('products-list')}>
            {topProducts.map((product, index) => (
              <div key={index} className={cx('product-item')}>
                <div className={cx('product-info')}>
                  <h4 className={cx('product-name')}>{product.name}</h4>
                  <p className={cx('product-stats')}>
                    Đã bán: {product.sold} | Doanh thu:{' '}
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
                <div className={cx('product-trend')}>
                  <span className={cx('trend-icon')}>
                    {getTrendIcon(product.trend)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cx('quick-actions')}>
        <h2 className={cx('section-title')}>Thao tác nhanh</h2>
        <div className={cx('actions-grid')}>
          <button className={cx('action-btn', 'add-product')}>
            <span className={cx('action-icon')}>➕</span>
            <span className={cx('action-text')}>Thêm sản phẩm mới</span>
          </button>
          <button className={cx('action-btn', 'view-orders')}>
            <span className={cx('action-icon')}>📋</span>
            <span className={cx('action-text')}>Quản lý đơn hàng</span>
          </button>
          <button className={cx('action-btn', 'manage-users')}>
            <span className={cx('action-icon')}>👤</span>
            <span className={cx('action-text')}>Quản lý khách hàng</span>
          </button>
          <button className={cx('action-btn', 'reports')}>
            <span className={cx('action-icon')}>📊</span>
            <span className={cx('action-text')}>Xem báo cáo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
