import { productRoute } from './products.route.js';
import { userRoute } from './users.route.js';
import { authRoute } from './auth.route.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';

export function mainRoute(app) {
  app.all('/{*any}', checkUserJWT, checkUserPermission);

  app.use('/products', productRoute);
  app.use('/users', userRoute);
  app.use('/auth', authRoute);
}
