import { productRoute } from './products.route.js';
export function mainRoute(app) {
  app.get('/test', (req, res) => {
    // res.send('Backend is running!');
    res.json({
      message: 'Backend đang hoạt động!',
      timestamp: new Date().toISOString(),
    });
  });
  app.get('/', (req, res) => {
    // res.send('Backend is running!');
    res.json({
      message: 'Backend đang hoạt động!',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/products', productRoute);
}
