import AuthLayout from '../layouts/AuthLayout';
import { UserContext } from '../context/UserContext';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Register from '../pages/Register';
import Login from '../pages/Login';

export const publicRoutes = [
  { path: '/register', component: Register, layout: AuthLayout },
  { path: '/login', component: Login, layout: AuthLayout },
  { path: '/', component: Home },
];

export const privateRoutes = [{ path: '/products', component: Products }];
