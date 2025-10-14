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
import ScrollToTop from './components/ScrollToTop';
function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    if (user.role === 'admin' && requiredRole === 'customer') {
      return children;
    }

    if (user.role === 'customer' && requiredRole === 'admin') {
      return <Navigate to="/" replace />;
    }

    if (user.role !== requiredRole) {
      const defaultPath = user.role === 'admin' ? '/admin/dashboard' : '/';
      return <Navigate to={defaultPath} replace />;
    }
  }

  return children;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
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
            const requiredRole = route.requiredRole || 'admin';

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
