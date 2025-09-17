//Client
import AuthLayout from '../layouts/AuthLayout';
import Home from '../pages/ClientPage/Home';
import Products from '../pages/ClientPage/Products';
import Blogs from '../pages/ClientPage/Blogs';
import Checkout from '../pages/ClientPage/Checkout';
import Cart from '../pages/ClientPage/Cart';
import Contact from '../pages/ClientPage/Contact';
import Register from '../pages/ClientPage/Register';
import Login from '../pages/ClientPage/Login';
import ProductDetail from '../pages/ClientPage/ProductDetail';
import PaymentResult from '../pages/ClientPage/PaymentResult';
import OrderDetail from '../pages/ClientPage/OrderDetail';
import Orders from '../pages/ClientPage/Orders';
import Profile from '../pages/ClientPage/Profile';
//Admin
import Dashboard from '../pages/AdminPages/DashBoard';
import Users from '../pages/AdminPages/Users';
import UserTrash from '../pages/AdminPages/Users/UserTrash';

export const ClientRoutes = [
  { path: '/register', component: Register, layout: AuthLayout },
  { path: '/login', component: Login, layout: AuthLayout },
  // { path: '/blogs', component: Blogs },
  { path: '/cart', component: Cart },
  { path: '/profile', component: Profile },
  { path: '/orders/:orderId', component: OrderDetail },
  { path: '/orders', component: Orders },
  { path: '/checkout', component: Checkout },
  { path: '/contact', component: Contact },
  { path: '/products/:slugAndId', component: ProductDetail },
  { path: '/products', component: Products },
  { path: '/payment-result', component: PaymentResult },
  { path: '/', component: Home },
];

export const AdminRoutes = [
  { path: '/admin/dashboard', component: Dashboard },
  { path: '/admin/users', component: Users },
  { path: '/admin/users/trash', component: UserTrash },
];
