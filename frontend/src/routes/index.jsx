import Home from '../pages/Home';
import Products from '../pages/Products';
import Register from '../pages/Register';
export const publicRoutes = [
  { path: '/', component: Home },
  { path: '/products', component: Products },
  { path: '/register', component: Register },
];
export const privateRoutes = [];
