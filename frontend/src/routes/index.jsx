import AuthLayout from '../layouts/AuthLayout';

import Home from '../pages/Home';
import Products from '../pages/Products';
import Register from '../pages/Register';
import Login from '../pages/Login';
export const publicRoutes = [
  { path: '/', component: Home },
  { path: '/products', component: Products },
  { path: '/register', component: Register, layout: AuthLayout },
  { path: '/login', component: Login, layout: AuthLayout },
];
export const privateRoutes = [];
