import { productRoute } from './products.route.js';
import { userRoute } from './users.route.js';
import { authRoute } from './auth.route.js';
import { checkUserJWT, checkUserPermission } from '../middleware/JWTActions.js';

const checkUserLogin = (req, res, next) => {
  const nonSecurePath = ['/', '/auth'];
  if (nonSecurePath.includes(req.path)) return next();
  next();
};
export function mainRoute(app) {
  app.use('/products', checkUserJWT, checkUserPermission, productRoute);
  app.use('/users', userRoute);
  app.use('/auth', authRoute);
}
