import slugify from 'slugify';
import Products from '../models/products.model.js';
import { filterFields } from '../utils/filterFields.js';
import { Sequelize, Op } from 'sequelize';

export const getProduct = async (req, res) => {
  try {
    const products = await Products.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};
export const getProductTrash = async (req, res) => {
  try {
    const products = await Products.findAll({
      where: {
        deleted_at: {
          [Op.ne]: null,
        },
      },
      paranoid: false,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm đã xóa ' });
  }
};
export const getTrendingProduct = async (req, res) => {
  try {
    const products = await Products.findAll({
      order: [['star', 'DESC']],
      limit: 18,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};
export const getBrandProduct = async (req, res) => {
  try {
    const brands = await Products.findAll({
      attributes: [
        'brand',

        [Sequelize.fn('GROUP_CONCAT', Sequelize.col('id')), 'product_ids'],
      ],
      group: ['brand'],
      order: [['brand', 'ASC']],
    });

    const result = brands.map((b) => ({
      brand: b.brand,
      product_ids: b
        .get('product_ids')
        .split(',')
        .map((id) => Number(id)),
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Không lấy được brand và danh sách sản phẩm' });
  }
};
export const getSizeProduct = async (req, res) => {
  try {
    const sizes = await Products.findAll({
      attributes: [
        'size',

        [Sequelize.fn('GROUP_CONCAT', Sequelize.col('id')), 'product_ids'],
      ],
      group: ['size'],
    });

    // convert chuỗi id thành mảng số
    const result = sizes.map((b) => ({
      size: b.size,
      product_ids: b
        .get('product_ids')
        .split(',')
        .map((id) => Number(id)),
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Không lấy được size và danh sách sản phẩm' });
  }
};

export const getPriceProduct = async (req, res) => {
  try {
    const { minPrice = 0, maxPrice = 999999 } = req.query;

    const allProducts = await Products.findAll();

    const actualPrices = allProducts.map((product) => {
      return product.sale_price || product.price || 0;
    });

    const minPriceFromDB = Math.min(...actualPrices);
    const maxPriceFromDB = Math.max(...actualPrices);

    const products = await Products.findAll({
      where: {
        [Sequelize.Op.or]: [
          {
            sale_price: {
              [Sequelize.Op.not]: null,
              [Sequelize.Op.between]: [Number(minPrice), Number(maxPrice)],
            },
          },
          {
            sale_price: null,
            price: {
              [Sequelize.Op.between]: [Number(minPrice), Number(maxPrice)],
            },
          },
        ],
      },
      order: [['created_at', 'DESC']],
    });

    res.json({
      products,
      count: products.length,
      priceRange: {
        min: Number(minPrice),
        max: Number(maxPrice),
      },
      actualPriceRange: {
        min_price: minPriceFromDB,
        max_price: maxPriceFromDB,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Không lấy được sản phẩm theo khoảng giá',
    });
  }
};

export const getNewProduct = async (req, res) => {
  try {
    const products = await Products.findAll({
      order: [['created_at', 'DESC']],
      limit: 8,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Không lấy được sản phẩm' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin sản phẩm',
    });
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
