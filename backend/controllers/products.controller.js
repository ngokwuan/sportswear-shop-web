import Product from '../models/products.model.js';

export const show = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};
