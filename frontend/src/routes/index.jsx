import AuthLayout from '../layouts/AuthLayout';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Blogs from '../pages/Blogs';
import Checkout from '../pages/Checkout';
import Cart from '../pages/Cart';
import Contact from '../pages/Contact';
import Register from '../pages/Register';
import Login from '../pages/Login';
import ProductDetail from '../pages/ProductDetail';
import PaymentResult from '../pages/PaymentResult';

export const publicRoutes = [
  { path: '/register', component: Register, layout: AuthLayout },
  { path: '/login', component: Login, layout: AuthLayout },
  // { path: '/blogs', component: Blogs },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout },
  { path: '/contact', component: Contact },
  { path: '/product-detail', component: ProductDetail },
  { path: '/products', component: Products },
  { path: '/payment-result', component: PaymentResult },
  { path: '/', component: Home },
];

export const privateRoutes = [];
