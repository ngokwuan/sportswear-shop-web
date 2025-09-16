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

function App() {
  const { user } = useContext(UserContext);

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

          {/* Private routes */}
          {AdminRoutes.map((route, index) => {
            const Layout = AdminLayout;
            const Page = route.component;
            return (
              <Route
                key={`private-${index}`}
                path={route.path}
                element={
                  // user && user.isAuthenticated ? (
                  //   <Layout>
                  //     <Page />
                  //   </Layout>
                  // ) : (
                  //   <Navigate to="/admin/login" replace />
                  // )

                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
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
