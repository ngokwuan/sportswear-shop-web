import Products from '../models/products.model.js';

export const show = async (req, res) => {
  try {
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies);
    res.cookie('cookie', 'test cookie');
    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies);
    const products = await Products.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};
