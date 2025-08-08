// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Link } from 'react-router-dom';
// import axios from 'axios';
// import AddUserForm from './pages/add-user';
// // import './App.scss';
// // Component trang chủ (shop)
// function Home() {
//   const [backendStatus, setBackendStatus] = useState('');
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Test kết nối backend
//   useEffect(() => {
//     const testBackend = async () => {
//       try {
//         const response = await axios.get('http://localhost:3000/test');
//         setBackendStatus(response.data.message);
//       } catch (error) {
//         setBackendStatus('Backend không hoạt động: ' + error.message);
//       }
//     };

//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get('http://localhost:3000/products');
//         setProducts(response.data);
//       } catch (error) {
//         console.error('Lỗi khi lấy sản phẩm:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     testBackend();
//     fetchProducts();
//   }, []);

//   return (
//     <div>
//       <h1 className="mb-4">🏃‍♂️ Shop Quần Áo Thể Thao</h1>

//       {/* Test Backend Status */}
//       <div
//         className={`alert ${
//           backendStatus.includes('hoạt động') ? 'alert-success' : 'alert-danger'
//         } mb-4`}
//       >
//         <strong>Trạng thái Backend:</strong> {backendStatus}
//       </div>

//       {/* Hiển thị sản phẩm */}
//       <h2 className="mb-3">📦 Danh sách sản phẩm</h2>
//       {loading ? (
//         <div className="text-center">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Đang tải sản phẩm...</span>
//           </div>
//           <p className="mt-2">Đang tải sản phẩm...</p>
//         </div>
//       ) : (
//         <div className="row g-3">
//           {products.map((product) => (
//             <div key={product.id} className="col-md-4">
//               <div className="card h-100">
//                 <div className="card-body">
//                   <h5 className="card-title">{product.name}</h5>
//                   <p className="card-text text-danger fw-bold">
//                     {product.price.toLocaleString('vi-VN')} VND
//                   </p>
//                   <button className="btn btn-primary">🛒 Thêm vào giỏ</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // Navigation component
// function Navigation() {
//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
//       <div className="container">
//         <Link className="navbar-brand" to="/">
//           🏃‍♂️ Shop Thể Thao
//         </Link>
//         <div className="navbar-nav">
//           <Link className="nav-link" to="/">
//             🏠 Trang chủ
//           </Link>
//           <Link className="nav-link" to="/add-user">
//             👤 Thêm người dùng
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// }

// // App chính với routing
// function App() {
//   return (
//     <>
//       <Navigation />
//       <div className="container">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/add-user" element={<AddUserForm />} />
//         </Routes>
//       </div>
//     </>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from './routes';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {publicRoutes.map((route, index) => {
            const Page = route.component;
            return <Route key={index} path={route.path} element={<Page />} />;
          })}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
