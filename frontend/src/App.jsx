// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from 'react-router-dom';
// import DefaultLayout from './layouts/DefaultLayout';
// import AdminLayout from './layouts/AdminLayout';
// import { ClientRoutes, AdminRoutes } from './routes/';
// import { ToastContainer } from 'react-toastify';
// import { useContext } from 'react';
// import { UserContext } from './context/UserContext';

// function App() {
//   const { user } = useContext(UserContext);

//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           {/* Public routes */}
//           {ClientRoutes.map((route, index) => {
//             const Layout = route.layout || DefaultLayout;
//             const Page = route.component;
//             return (
//               <Route
//                 key={index}
//                 path={route.path}
//                 element={
//                   <Layout>
//                     <Page />
//                   </Layout>
//                 }
//               />
//             );
//           })}

//           {/* Private routes */}
//           {AdminRoutes.map((route, index) => {
//             const Layout = AdminLayout;
//             const Page = route.component;
//             return (
//               <Route
//                 key={`private-${index}`}
//                 path={route.path}
//                 element={
//                   // user && user.isAuthenticated ? (
//                   //   <Layout>
//                   //     <Page />
//                   //   </Layout>
//                   // ) : (
//                   //   <Navigate to="/admin/login" replace />
//                   // )

//                   <Layout>
//                     <Page />
//                   </Layout>
//                 }
//               />
//             );
//           })}
//         </Routes>
//       </div>
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick={false}
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
//     </Router>
//   );
// }

// export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import AdminLayout from './layouts/AdminLayout';
import { ClientRoutes, AdminRoutes } from './routes/';
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { UserContext } from './context/UserContext';

// Protected Route Component
function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useContext(UserContext);

  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific role required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    // Admin trying to access customer area - allow
    if (requiredRole === 'customer' && user.role === 'admin') {
      return children;
    }

    // Customer trying to access admin area - redirect to home
    if (requiredRole === 'admin' && user.role === 'customer') {
      return <Navigate to="/" replace />;
    }

    // Other cases - redirect to appropriate default
    const defaultPath = user.role === 'admin' ? '/admin/dashboard' : '/';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
}

function App() {
  const { user, loading } = useContext(UserContext);

  // Debug log
  if (import.meta.env.DEV) {
    console.log('🎯 App.js - Current user:', user);
    console.log('⏳ Loading:', loading);
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          {ClientRoutes.map((route, index) => {
            const Layout = route.layout || DefaultLayout;
            const Page = route.component;

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}

          {/* Protected Admin routes */}
          {AdminRoutes.map((route, index) => {
            const Layout = AdminLayout;
            const Page = route.component;
            const requiredRole = route.requiredRole || 'admin'; // Default to admin role

            return (
              <Route
                key={`admin-${index}`}
                path={route.path}
                element={
                  <ProtectedRoute requiredRole={requiredRole}>
                    <Layout>
                      <Page />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            );
          })}

          {/* Catch-all route for 404 */}
          <Route
            path="*"
            element={
              <DefaultLayout>
                <div>404 - Page Not Found</div>
              </DefaultLayout>
            }
          />
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
