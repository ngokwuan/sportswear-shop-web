import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [backendStatus, setBackendStatus] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Test kết nối backend
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await axios.get('http://localhost:3000/test');
        setBackendStatus(response.data.message);
      } catch (error) {
        setBackendStatus('Backend không hoạt động: ' + error.message);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    testBackend();
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🏃‍♂️ Shop Quần Áo Thể Thao</h1>

      {/* Test Backend Status */}
      <div
        style={{
          padding: '10px',
          backgroundColor: backendStatus.includes('hoạt động')
            ? '#d4edda'
            : '#f8d7da',
          border: '1px solid #ccc',
          marginBottom: '20px',
          borderRadius: '5px',
        }}
      >
        <strong>Trạng thái Backend:</strong> {backendStatus}
      </div>

      {/* Hiển thị sản phẩm */}
      <h2>📦 Danh sách sản phẩm</h2>
      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h3>{product.name}</h3>
              <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                {product.price.toLocaleString('vi-VN')} VND
              </p>
              <button
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
