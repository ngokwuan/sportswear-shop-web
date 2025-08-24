import AuthLayout from '../layouts/AuthLayout';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Blogs from '../pages/Blogs';
import Contact from '../pages/Contact';
import Register from '../pages/Register';
import Login from '../pages/Login';

export const publicRoutes = [
  { path: '/register', component: Register, layout: AuthLayout },
  { path: '/login', component: Login, layout: AuthLayout },
  { path: '/blogs', component: Blogs },
  { path: '/contact', component: Contact },
  { path: '/', component: Home },
];

export const privateRoutes = [{ path: '/products', component: Products }];
