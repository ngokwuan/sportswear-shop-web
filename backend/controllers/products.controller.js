import slugify from 'slugify';
import Products from '../models/products.model.js';
import { filterFields } from '../utils/filterFields.js';

export const getProduct = async (req, res) => {
  try {
    const products = await Products.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};
export const getTrendingProduct = async (req, res) => {
  try {
    const products = await Products.findAll({ order: [['star', 'DESC']] });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};
export const getNewProduct = async (req, res) => {
  try {
    const products = await Products.findAll({
      order: [['created_at', 'DESC']],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      categoryId,
      stockQuantity,
      brand,
      size,
      color,
      images,
      featuredImage,
    } = req.body;
    const requiredFields = {
      name,
      description,
      price,
      categoryId,
      stockQuantity,
      brand,
      size,
      color,
      images,
      featuredImage,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `Trường ${key} là bắt buộc` });
      }
    }
    const newProducts = await Products.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      price,
      sale_price: salePrice || null,
      stock_quantity: stockQuantity,
      category_id: categoryId,
      brand,
      size,
      color,
      images,
      featured_image: featuredImage,
      status: true,
      isNew: true,
      star: 0,
    });
    res.status(201).json({
      message: 'Thêm sản phầm thành công!',
      newProducts,
    });
  } catch (error) {
    console.error('Lỗi thêm sản phẩm', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors.map((err) => err.message),
      });
    }
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      salePrice,
      stockQuantity,
      productId,
      brand,
      size,
      color,
      images,
      featuredImage,
    } = req.body;
    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
    }
    let updateFields = {
      name,
      slug: name ? slugify(name, { lower: true }) : undefined,
      description,
      price,
      sale_price: salePrice,
      stock_quantity: stockQuantity,
      product_id: productId,
      brand,
      size,
      color,
      images,
      featured_image: featuredImage,
    };

    updateFields = filterFields(updateFields);

    await product.update(updateFields);
    return res.status(200).json({
      message: 'Cập nhâp sản phẩm thành công ',
      product,
    });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật sản phẩm' });
  }
};

export const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
    }
    await product.destroy();
    res.json({ message: 'Xóa sản phẩm thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá mềm sản phẩm' });
  }
};

export const forceDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByPk(id, { paranoid: false });
    if (!product) {
      return res.status(404).json({
        error: 'Sản phẩm không tồn tại',
      });
    }
    await product.destroy({ force: true });
    res.json({ message: 'Xóa vĩnh viễn sản phẩm thành công ' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xoá vĩnh viễn sản phẩm' });
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Products.restore({ where: { id } });
    if (!restored) {
      return res
        .status(404)
        .json({ error: 'Không tìm thấy sản phẩm để khôi phục' });
    }
    res.json({ message: 'Khôi phục sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể khôi phục sản phẩm' });
  }
};
