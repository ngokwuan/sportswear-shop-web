import { productRoute } from './products.route.js';
import { userRoute } from './users.route.js';
import { authRoute } from './auth.route.js';
import { cartRoute } from './cart.route.js';
import { categoriesRoute } from './categories.route.js';
import { orderRoute } from './orders.route.js';
import { vnpayRoute } from './vnpay.route.js';
import { blogRoute } from './blogs.route.js';
import { dashboardRoute } from './dashboard.route.js';

import { checkUserJWT } from '../middleware/JWTActions.js';

export function mainRoute(app) {
  app.use('/auth', authRoute);
  app.use('/products', productRoute);
  app.use('/categories', categoriesRoute);
  app.use('/cart', cartRoute);
  app.use('/orders', checkUserJWT, orderRoute);
  app.use('/payment/vnpay', vnpayRoute);
  app.use('/users', checkUserJWT, userRoute);
  app.use('/blogs', blogRoute);
  app.use('/dashboard', dashboardRoute);
}
