import Products from '../models/products.model.js';

export const show = async (req, res) => {
  try {
    const products = await Products.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};
