import { productRoute } from './products.route.js';
import { userRoute } from './users.route.js';
import { authRoute } from './auth.route.js';
import { cartRoute } from './cart.route.js';
import { categoriesRoute } from './categories.route.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';

export function mainRoute(app) {
  app.use(checkUserJWT, checkUserPermission);

  app.use('/products', productRoute);
  app.use('/categories', categoriesRoute);
  app.use('/users', userRoute);
  app.use('/auth', authRoute);
  app.use('/cart', cartRoute);
}
