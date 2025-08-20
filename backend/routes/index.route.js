import { productRoute } from './products.route.js';
import { userRoute } from './users.route.js';
import { authRoute } from './auth.route.js';

export function mainRoute(app) {
  app.get('/test', (req, res) => {
    res.json({
      message: 'Backend đang hoạt động!',
      timestamp: new Date().toISOString(),
    });
  });
  app.get('/', (req, res) => {
    res.json({
      message: 'Backend đang hoạt động!',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/products', productRoute);
  app.use('/users', userRoute);
  app.use('/auth', authRoute);
}
