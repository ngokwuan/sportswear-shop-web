import AuthLayout from '../layouts/AuthLayout';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Blogs from '../pages/Blogs';
import Cart from '../pages/Cart';
import Contact from '../pages/Contact';
import Register from '../pages/Register';
import Login from '../pages/Login';
import ProductDetail from '../pages/ProductDetail';

export const publicRoutes = [
  { path: '/register', component: Register, layout: AuthLayout },
  { path: '/login', component: Login, layout: AuthLayout },
  // { path: '/blogs', component: Blogs },
  { path: '/cart', component: Cart },
  { path: '/contact', component: Contact },
  { path: '/product-detail', component: ProductDetail },
  { path: '/', component: Home },
];

export const privateRoutes = [{ path: '/products', component: Products }];
